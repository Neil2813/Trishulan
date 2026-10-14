"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatConversation,
  ChatListingCard,
  ChatMessage,
  ChatPartner,
  User,
} from '@/types';
import { Lock, Search, MessageSquare, Paperclip, MapPin, Tag, Send, ShieldCheck, Building2, ArrowLeft, AlertCircle } from 'lucide-react';
import {
  DecryptedBody,
  decryptMessage,
  encryptMessage,
  getOrCreateIdentity,
  isE2EESupported,
  keyFingerprint,
} from '@/lib/crypto';

interface ChatSuiteProps {
  /** Logged-in user (fetched from /api/auth/me if omitted). */
  currentUser?: User | null;
  onAuthenticationRequired: () => void;
  /** Open a thread with this partner on load. */
  initialPartnerId?: string;
  /** Attach this listing as a context card to the next message sent. */
  listingId?: string;
  rfqId?: string;
}

type Identity = Awaited<ReturnType<typeof getOrCreateIdentity>>;
type Decrypted = DecryptedBody | null; // null = cannot decrypt on this device

const THREAD_POLL_MS = 3000;
const INBOX_POLL_MS = 6000;

const displayName = (p?: Pick<ChatPartner, 'name' | 'companyName'> | null) =>
  p ? p.companyName || p.name : '';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function ChatSuite({ currentUser, onAuthenticationRequired, initialPartnerId, listingId, rfqId }: ChatSuiteProps) {
  const [me, setMe] = useState<User | null>(currentUser ?? null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [setupAttempt, setSetupAttempt] = useState(0);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [previews, setPreviews] = useState<Record<string, Decrypted>>({});
  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialPartnerId ?? null);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [decrypted, setDecrypted] = useState<Record<string, Decrypted>>({});
  const [listings, setListings] = useState<Record<string, ChatListingCard>>({});

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState('');
  const [pendingListingId, setPendingListingId] = useState<string | undefined>(listingId);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [showNewChat, setShowNewChat] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [fingerprints, setFingerprints] = useState<{ mine: string; theirs: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);

  // ── 1. Resolve the current user ────────────────────────────────────────────
  useEffect(() => {
    if (currentUser) { setMe(currentUser); return; }
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d.user ?? null))
      .catch(() => setMe(null));
  }, [currentUser]);

  // ── 2. Load / create this browser's E2EE identity and publish the public key ─
  useEffect(() => {
    if (!me?.id) return;
    if (!isE2EESupported()) {
      setSetupError('Your browser does not support the Web Crypto API required for end-to-end encryption.');
      return;
    }
    let cancelled = false;
    setSetupError(null);
    setRequiresSignIn(false);
    (async () => {
      try {
        const id = await getOrCreateIdentity(me.id);
        if (me.chatPublicKey !== id.publicJwk) {
          const res = await fetch('/api/chat/keys', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicKey: id.publicJwk }),
          });
          if (res.status === 401) {
            if (!cancelled) setRequiresSignIn(true);
            throw new Error('Your sign-in session has expired. Sign in again to set up encrypted messages.');
          }
          if (!res.ok) {
            throw new Error(res.status >= 500
              ? 'Secure messaging is temporarily unavailable. Please try again.'
              : 'We couldn’t validate this browser’s encryption key. Please try again.');
          }
        }
        if (!cancelled) setIdentity(id);
      } catch (e: any) {
        if (!cancelled) setSetupError(e.message || 'Failed to initialise encryption');
      }
    })();
    return () => { cancelled = true; };
  }, [me?.id, me?.chatPublicKey, setupAttempt]);

  // ── 3. Inbox ───────────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch { /* transient network error — next poll retries */ }
  }, []);

  useEffect(() => {
    if (!identity) return;
    loadConversations();
    const t = setInterval(loadConversations, INBOX_POLL_MS);
    return () => clearInterval(t);
  }, [identity, loadConversations]);

  // Decrypt last-message previews
  useEffect(() => {
    if (!identity) return;
    let cancelled = false;
    (async () => {
      const next: Record<string, Decrypted> = {};
      for (const c of conversations) {
        const m = c.lastMessage;
        next[m.id] = previews[m.id] !== undefined
          ? previews[m.id]
          : await decryptMessage(m.text, identity, m.senderKey, m.receiverKey);
      }
      if (!cancelled) setPreviews(next);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, identity]);

  // ── 4. Active thread (incremental polling) ─────────────────────────────────
  const loadThread = useCallback(async (partnerId: string, incremental: boolean) => {
    const after = incremental ? lastTimestampRef.current : null;
    const qs = new URLSearchParams({ partnerId, ...(after ? { after } : {}) });
    const res = await fetch(`/api/chat?${qs}`);
    if (!res.ok) {
      if (!incremental) { setActivePartner(null); setMessages([]); }
      return;
    }
    const data: { partner: ChatPartner; chats: ChatMessage[]; listings: ChatListingCard[] } = await res.json();
    setActivePartner(data.partner);
    if (data.listings?.length)
      setListings((prev) => ({ ...prev, ...Object.fromEntries(data.listings.map((l) => [l.id, l])) }));

    setMessages((prev) => {
      const merged = incremental ? [...prev] : [];
      const seen = new Set(merged.map((m) => m.id));
      for (const m of data.chats) if (!seen.has(m.id)) merged.push(m);
      if (merged.length) lastTimestampRef.current = merged[merged.length - 1].timestamp;
      return merged;
    });

    if (data.chats.some((m) => m.senderId === partnerId && !m.read)) {
      fetch('/api/chat/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      }).then(loadConversations).catch(() => {});
    }
  }, [loadConversations]);

  useEffect(() => {
    if (!identity || !activePartnerId) return;
    lastTimestampRef.current = null;
    setMessages([]);
    setDecrypted({});
    setSendError(null);
    setShowVerify(false);
    loadThread(activePartnerId, false);
    const t = setInterval(() => loadThread(activePartnerId, true), THREAD_POLL_MS);
    return () => clearInterval(t);
  }, [identity, activePartnerId, loadThread]);

  // Decrypt new messages
  useEffect(() => {
    if (!identity) return;
    const pending = messages.filter((m) => decrypted[m.id] === undefined);
    if (!pending.length) return;
    let cancelled = false;
    (async () => {
      const out: Record<string, Decrypted> = {};
      for (const m of pending) out[m.id] = await decryptMessage(m.text, identity, m.senderKey, m.receiverKey);
      if (!cancelled) setDecrypted((prev) => ({ ...prev, ...out }));
    })();
    return () => { cancelled = true; };
  }, [messages, identity, decrypted]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, decrypted]);

  // Safety-number fingerprints for manual verification
  useEffect(() => {
    if (!showVerify || !identity || !activePartner?.chatPublicKey) { setFingerprints(null); return; }
    Promise.all([keyFingerprint(identity.publicJwk), keyFingerprint(activePartner.chatPublicKey)])
      .then(([mine, theirs]) => setFingerprints({ mine, theirs }));
  }, [showVerify, identity, activePartner?.chatPublicKey]);

  // ── 5. Send ────────────────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !activePartnerId || (!text.trim() && !attachment) || sending) return;
    setSending(true);
    setSendError(null);

    const attempt = async (partner: ChatPartner) => {
      if (!partner.chatPublicKey) throw new Error(`${displayName(partner)} hasn't opened secure chat yet. They need to visit Messages once before you can send.`);
      const payload = await encryptMessage({ text: text.trim(), attachmentUrl: attachment || undefined }, identity, partner.chatPublicKey);
      return fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: partner.id,
          text: payload,
          senderKey: identity.publicJwk,
          receiverKey: partner.chatPublicKey,
          listingId: pendingListingId,
          rfqId,
        }),
      });
    };

    try {
      if (!activePartner) throw new Error('Conversation not loaded yet');
      let res = await attempt(activePartner);
      if (res.status === 409) {
        // Partner rotated keys (new device) — refresh their key and retry once.
        const fresh = await fetch(`/api/chat?${new URLSearchParams({ partnerId: activePartnerId, after: new Date().toISOString() })}`).then((r) => r.json());
        setActivePartner(fresh.partner);
        res = await attempt(fresh.partner);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');

      setDecrypted((prev) => ({ ...prev, [data.message.id]: { text: text.trim(), attachmentUrl: attachment || undefined } }));
      setText('');
      setAttachment('');
      setPendingListingId(undefined);
      await loadThread(activePartnerId, true);
      loadConversations();
    } catch (err: any) {
      setSendError(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const startChat = (partner: ChatPartner) => {
    setShowNewChat(false);
    setActivePartner(partner);
    setActivePartnerId(partner.id);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const visibleConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === 'Unread' && c.unread === 0) return false;
      if (!q) return true;
      return [c.partner.name, c.partner.companyName, c.partner.city].some((v) => v?.toLowerCase().includes(q));
    });
  }, [conversations, search, filter]);

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (me === null && !currentUser) {
    return (
      <div className="bg-card rounded-[24px] border border-line shadow-xl p-10 text-center text-sm text-muted">
        Please log in to access your secure messages.
      </div>
    );
  }

  return (
    <div className="relative flex h-[min(620px,calc(100dvh-460px))] min-h-[360px] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-lg md:h-[min(740px,calc(100dvh-250px))] md:min-h-[520px] md:flex-row md:rounded-[24px]">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`w-full md:w-[320px] bg-card border-r border-line flex-col shrink-0 ${activePartnerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center justify-between gap-3 border-b border-line bg-gradient-to-br from-teal-50 via-white to-white p-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-ink">
              Messages
              {totalUnread > 0 && (
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-black text-teal-900">{totalUnread}</span>
              )}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-[10.5px] font-medium text-teal-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              End-to-end encrypted
            </p>
          </div>
          <button
            id="chat-new-conversation"
            onClick={() => setShowNewChat(true)}
            disabled={!identity}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 px-3.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            title={!identity ? 'Sign in and finish secure chat setup to start a conversation' : undefined}
          >
            + New chat
          </button>
        </div>

        <div className="space-y-3 border-b border-line bg-card p-3">
          <label htmlFor="chat-search" className="flex min-h-10 items-center gap-2 rounded-xl border border-line bg-bg px-3 transition-colors focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
            <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              id="chat-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted"
            />
          </label>
          <div role="group" aria-label="Filter conversations" className="flex gap-1">
            {(['All', 'Unread'] as const).map((f) => (
              <button
                key={f}
                id={`chat-filter-${f.toLowerCase()}`}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`min-h-8 rounded-lg px-3 text-[11px] font-bold transition-colors ${
                  filter === f ? 'bg-teal-700 text-white' : 'text-muted hover:bg-line/40 hover:text-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-line/70">
          {!identity && !setupError && (
            <div role="status" className="space-y-3 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-line/70" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-line/70" />
                  <div className="h-2.5 w-full animate-pulse rounded bg-line/50" />
                </div>
              </div>
              <p className="text-center text-[11px] text-muted">Preparing your secure inbox…</p>
            </div>
          )}
          {setupError && (
            <div className="m-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-amber-950">
                    {requiresSignIn ? 'Sign in to unlock messages' : 'Secure chat needs attention'}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-amber-900">
                    {requiresSignIn
                      ? 'Your session has expired. Sign in to finish setting up encrypted messaging.'
                      : 'Your secure inbox could not be prepared. You can safely try again.'}
                  </p>
                  {requiresSignIn ? (
                    <button type="button" onClick={onAuthenticationRequired} className="mt-3 text-xs font-bold text-teal-800 underline underline-offset-2 hover:text-teal-950">
                      Sign in again
                    </button>
                  ) : (
                    <button type="button" onClick={() => setSetupAttempt((attempt) => attempt + 1)} className="mt-3 text-xs font-bold text-teal-800 underline underline-offset-2 hover:text-teal-950">
                      Try again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {identity && visibleConversations.length === 0 && (
            <div className="space-y-3 p-6 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                {conversations.length === 0 ? <MessageSquare className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-ink">
                  {conversations.length === 0 ? 'Start a business conversation' : 'No conversations found'}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {conversations.length === 0
                    ? `Connect with a ${me?.role === 'SELLER' ? 'buyer' : 'seller'} to discuss products and requirements.`
                    : 'Try another name or switch your filter.'}
                </p>
              </div>
              {conversations.length === 0 && (
                <button type="button" onClick={() => setShowNewChat(true)} className="min-h-10 rounded-xl bg-teal-700 px-4 text-xs font-bold text-white transition-colors hover:bg-teal-800">
                  Find {me?.role === 'SELLER' ? 'a buyer' : 'a seller'}
                </button>
              )}
            </div>
          )}
          {visibleConversations.map((c) => {
            const preview = previews[c.lastMessage.id];
            const mine = c.lastMessage.senderId === me?.id;
            const active = c.partner.id === activePartnerId;
            return (
              <button
                key={c.partner.id}
                id={`chat-conversation-${c.partner.id}`}
                onClick={() => setActivePartnerId(c.partner.id)}
                aria-current={active ? 'true' : undefined}
                className={`w-full border-l-[3px] p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${
                  active ? 'border-teal-700 bg-teal-50' : 'border-transparent hover:bg-bg'
                }`}
              >
                <span className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-teal-700 text-xs font-bold text-white">
                    {displayName(c.partner).charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-[12.5px] text-ink ${c.unread ? 'font-black' : 'font-bold'}`}>{displayName(c.partner)}</span>
                      <span className="shrink-0 text-[10px] text-muted">{formatTime(c.lastMessage.timestamp)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={`truncate text-[11px] ${c.unread ? 'font-semibold text-ink' : 'text-muted'}`}>
                        {mine && 'You: '}
                        {preview === undefined ? 'Loading preview…' : preview === null ? 'Encrypted message' : preview.text || 'Attachment'}
                      </span>
                      {c.unread > 0 && (
                        <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-teal-700 px-1 text-[9.5px] font-bold text-white" aria-label={`${c.unread} unread`}>
                          {c.unread}
                        </span>
                      )}
                    </span>
                    {c.partner.companyName && c.partner.name !== c.partner.companyName && (
                      <span className="mt-1 block truncate text-[10px] text-muted">{c.partner.name}</span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Thread ──────────────────────────────────────────────────────── */}
      <section className={`min-w-0 flex-1 flex-col bg-slate-50/70 ${activePartnerId ? 'flex' : 'hidden md:flex'}`}>
        {setupError ? (
          <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
            <div role="alert" className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                {requiresSignIn ? <Lock className="h-6 w-6" aria-hidden="true" /> : <AlertCircle className="h-6 w-6" aria-hidden="true" />}
              </div>
              <h4 className="mt-4 text-base font-extrabold text-ink">
                {requiresSignIn ? 'Your secure inbox is locked' : 'We couldn’t prepare secure messaging'}
              </h4>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">{setupError}</p>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-teal-800">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Your messages stay encrypted
              </p>
              {requiresSignIn ? (
                <button
                  type="button"
                  onClick={onAuthenticationRequired}
                  className="mt-5 min-h-11 rounded-xl bg-teal-700 px-5 text-xs font-bold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                >
                  Sign in again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSetupAttempt((attempt) => attempt + 1)}
                  className="mt-5 min-h-11 rounded-xl bg-teal-700 px-5 text-xs font-bold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        ) : !activePartnerId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-white text-teal-800 shadow-sm">
              <MessageSquare className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="max-w-sm">
              <h4 className="text-base font-extrabold text-ink">Your business conversations, in one place</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Select a conversation to continue, or start a new one with a {me?.role === 'SELLER' ? 'buyer' : 'seller'}.
              </p>
            </div>
            <p className="flex items-center gap-1.5 rounded-full border border-teal-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-teal-800">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Only you and your contact can read messages
            </p>
            {identity && conversations.length === 0 && (
              <button type="button" onClick={() => setShowNewChat(true)} className="mt-1 min-h-11 rounded-xl bg-teal-700 px-5 text-xs font-bold text-white transition-colors hover:bg-teal-800">
                Find {me?.role === 'SELLER' ? 'a buyer' : 'a seller'}
              </button>
            )}
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setActivePartnerId(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-ink md:hidden" aria-label="Back to conversations">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-teal-700 text-sm font-bold text-white">
                  {displayName(activePartner).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-extrabold text-ink">{displayName(activePartner) || 'Loading conversation…'}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted">
                    {activePartner && <span className="rounded bg-bg px-1.5 py-0.5 font-bold uppercase tracking-wide text-ink">{activePartner.role}</span>}
                    {(activePartner?.city || activePartner?.state) && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {[activePartner.city, activePartner.state].filter(Boolean).join(', ')}</span>
                    )}
                    {activePartner?.verifiedSeller && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 font-bold text-amber-800">✓ Verified seller</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                id="chat-verify-encryption"
                onClick={() => setShowVerify((v) => !v)}
                aria-expanded={showVerify}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50 px-2.5 text-[10px] font-bold text-teal-800 transition-colors hover:bg-teal-100 sm:px-3 sm:text-[11px]"
                title="Verify encryption keys"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Encrypted</span>
              </button>
            </header>

            {showVerify && (
              <div className="mx-4 mt-3 space-y-2 rounded-2xl border border-teal-200 bg-white p-4 text-xs shadow-sm animate-[fadeIn_0.15s_ease]">
                <p className="font-bold text-ink">Verify end-to-end encryption</p>
                <p className="text-muted">Compare these codes with {displayName(activePartner)} over a call or in person. If they match on both screens, nobody is intercepting your messages.</p>
                {fingerprints ? (
                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-card border"><div className="text-muted/70 font-sans text-[10px] mb-1">Your key</div>{fingerprints.mine}</div>
                    <div className="p-2 rounded-lg bg-card border"><div className="text-muted/70 font-sans text-[10px] mb-1">Their key</div>{fingerprints.theirs}</div>
                  </div>
                ) : (
                  <p className="text-amber-700">{activePartner?.chatPublicKey ? 'Computing…' : 'This contact has not set up secure chat yet.'}</p>
                )}
              </div>
            )}

            <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6">
              <div className="flex items-center gap-1.5 self-center rounded-full border border-teal-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-teal-800 shadow-xs">
                <Lock className="w-3 h-3" />
                <span>End-to-end encrypted · only you and your contact can read these messages</span>
              </div>

              {messages.length === 0 && (
                <div className="flex flex-1 items-center justify-center py-8 text-center">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink">A good conversation starts here</p>
                    <p className="mt-1 text-xs text-muted">Say hello to {displayName(activePartner)} about a product, quote, or requirement.</p>
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const mine = m.senderId === me?.id;
                const body = decrypted[m.id];
                const listing = m.listingId ? listings[m.listingId] : undefined;
                return (
                  <div key={m.id} className={`flex max-w-[88%] flex-col gap-1 sm:max-w-[75%] ${mine ? 'self-end items-end' : 'self-start items-start'}`}>
                    {listing && (
                      <div className="w-64 bg-card border border-teal-200 rounded-2xl p-3 shadow-sm">
                        <div className="text-[9.5px] font-bold text-teal-700 uppercase tracking-wide">{listing.category.replace('_', ' ')}</div>
                        <div className="font-extrabold text-[13px] text-ink mt-0.5">{listing.title}</div>
                        <div className="text-[12px] font-black text-accent mt-1">₹{listing.price.toLocaleString('en-IN')} / {listing.unit}</div>
                        <div className="text-[10.5px] text-muted flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.location}</div>
                      </div>
                    )}
                    <div
                      className={`break-words whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                        mine ? 'rounded-tr-sm bg-teal-700 text-white' : 'rounded-tl-sm border border-line bg-white text-ink'
                      }`}
                    >
                      {body === undefined ? (
                        <span className="opacity-60">Decrypting…</span>
                      ) : body === null ? (
                        <span className="italic opacity-70">This message was encrypted for a different device and can&apos;t be read here.</span>
                      ) : (
                        <>
                          {body.text}
                          {body.attachmentUrl && (
                            <a
                              href={body.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 mt-1 text-[12px] underline ${mine ? 'text-teal-100' : 'text-teal-700'}`}
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{body.attachmentUrl}</span>
                            </a>
                          )}
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-muted/70 px-1">
                      {formatTime(m.timestamp)} {mine && (m.read ? '✓✓' : '✓')}
                    </span>
                  </div>
                );
              })}
            </div>

            {sendError && <div role="alert" className="mx-3 mb-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{sendError}</div>}
            {(attachment || pendingListingId) && (
              <div className="mx-3 mb-1 flex flex-wrap gap-2 text-[11px]">
                {attachment && (
                  <span className="px-2 py-1 rounded-full bg-line/30 border flex items-center gap-1 max-w-full">
                    <Paperclip className="w-3 h-3" />
                    <span className="truncate max-w-[220px]">{attachment}</span>
                    <button onClick={() => setAttachment('')} className="font-bold text-muted hover:text-gray-800">✕</button>
                  </span>
                )}
                {pendingListingId && (
                  <span className="px-2 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Listing attached</span>
                    <button onClick={() => setPendingListingId(undefined)} className="font-bold hover:text-teal-950">✕</button>
                  </span>
                )}
              </div>
            )}

            <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-line bg-white p-3 sm:px-4">
              <input
                id="chat-message-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Message"
                placeholder={activePartner && !activePartner.chatPublicKey ? 'Waiting for contact to enable secure chat…' : 'Write a message…'}
                disabled={!activePartner?.chatPublicKey}
                maxLength={4000}
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-4 py-3 text-xs text-ink outline-none transition-colors placeholder:text-muted focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-70"
              />
              <button
                id="chat-attach"
                type="button"
                onClick={() => {
                  const url = prompt('Paste a document / spec sheet URL (it will be encrypted):');
                  if (url && /^https?:\/\//i.test(url.trim())) setAttachment(url.trim());
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:bg-bg hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                title="Attach document link"
                aria-label="Attach document link"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                id="chat-send"
                type="submit"
                disabled={sending || !activePartner?.chatPublicKey || (!text.trim() && !attachment)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 font-bold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                title="Send"
                aria-label="Send message"
              >
                {sending ? '…' : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </section>

      {showNewChat && <NewChatModal role={me?.role} onClose={() => setShowNewChat(false)} onSelect={startChat} />}
    </div>
  );
}

// ── New chat picker ──────────────────────────────────────────────────────────
function NewChatModal({
  role,
  onClose,
  onSelect,
}: {
  role?: User['role'];
  onClose: () => void;
  onSelect: (p: ChatPartner) => void;
}) {
  const [q, setQ] = useState('');
  const [contacts, setContacts] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chat/contacts${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
        const data = await res.json();
        setContacts(data.contacts ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const target = role === 'SELLER' ? 'buyers' : 'sellers';

  return (
    <div className="absolute inset-0 z-20 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]" onClick={onClose}>
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="font-extrabold text-ink">New conversation</h4>
          <button onClick={onClose} className="text-muted/70 hover:text-gray-800 font-bold" aria-label="Close">✕</button>
        </div>
        <div className="p-3 border-b">
          <input
            id="chat-contact-search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${target} by name, company or city`}
            className="w-full px-4 py-2.5 rounded-full border border-gray-300 text-xs focus:outline-none focus:border-teal-600"
          />
        </div>
        <div className="max-h-[360px] overflow-y-auto divide-y">
          {loading && <div className="p-6 text-center text-xs text-muted/70 animate-pulse">Searching…</div>}
          {!loading && contacts.length === 0 && <div className="p-6 text-center text-xs text-muted">No {target} found.</div>}
          {!loading &&
            contacts.map((c) => (
              <button
                key={c.id}
                id={`chat-contact-${c.id}`}
                onClick={() => onSelect(c)}
                className="w-full text-left p-3 flex items-center gap-3 hover:bg-teal-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A1629] to-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {displayName(c).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[12.5px] text-ink truncate flex items-center gap-1.5">
                    {displayName(c)}
                    {c.verifiedSeller && <span className="text-[9px] px-1 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">✓ Verified</span>}
                  </div>
                  <div className="text-[10.5px] text-muted truncate">
                    {c.companyName && c.name !== c.companyName ? `${c.name} · ` : ''}
                    {[c.city, c.state].filter(Boolean).join(', ') || c.role}
                  </div>
                </div>
                {!c.chatPublicKey && <span className="text-[9.5px] text-muted/70 shrink-0">Not on secure chat yet</span>}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
