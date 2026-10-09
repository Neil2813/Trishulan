"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatConversation,
  ChatListingCard,
  ChatMessage,
  ChatPartner,
  User,
} from '@/types';
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

export default function ChatSuite({ currentUser, initialPartnerId, listingId, rfqId }: ChatSuiteProps) {
  const [me, setMe] = useState<User | null>(currentUser ?? null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

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
    (async () => {
      try {
        const id = await getOrCreateIdentity(me.id);
        if (me.chatPublicKey !== id.publicJwk) {
          const res = await fetch('/api/chat/keys', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicKey: id.publicJwk }),
          });
          if (!res.ok) throw new Error('Could not register encryption key');
        }
        if (!cancelled) setIdentity(id);
      } catch (e: any) {
        if (!cancelled) setSetupError(e.message || 'Failed to initialise encryption');
      }
    })();
    return () => { cancelled = true; };
  }, [me?.id, me?.chatPublicKey]);

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
      <div className="bg-white rounded-[24px] border border-gray-200 shadow-xl p-10 text-center text-sm text-gray-600">
        Please log in to access your secure messages.
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-[24px] border border-gray-200 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[680px]">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`w-full md:w-[320px] bg-gray-50 border-r border-gray-200 flex-col shrink-0 ${activePartnerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-gradient-to-r from-teal-800 to-teal-700 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[16px] flex items-center gap-2">
              Messages
              {totalUnread > 0 && (
                <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black">{totalUnread}</span>
              )}
            </h3>
            <p className="text-[10.5px] text-teal-100 flex items-center gap-1 mt-0.5">🔒 End-to-end encrypted</p>
          </div>
          <button
            id="chat-new-conversation"
            onClick={() => setShowNewChat(true)}
            disabled={!identity}
            className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-50 text-xs font-bold transition-colors"
          >
            + New chat
          </button>
        </div>

        <div className="p-3 border-b border-gray-200 bg-white space-y-2">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 focus-within:border-teal-600 transition-colors">
            <span className="text-gray-400 text-xs">🔍</span>
            <input
              id="chat-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              className="bg-transparent text-xs outline-none w-full"
            />
          </div>
          <div className="flex gap-1">
            {(['All', 'Unread'] as const).map((f) => (
              <button
                key={f}
                id={`chat-filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  filter === f ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {!identity && !setupError && (
            <div className="p-6 text-center text-xs text-gray-500 animate-pulse">Setting up secure keys…</div>
          )}
          {identity && visibleConversations.length === 0 && (
            <div className="p-8 text-center space-y-3">
              <div className="text-3xl">💬</div>
              <p className="text-xs text-gray-500">
                {conversations.length === 0
                  ? `No conversations yet. Start one with a ${me?.role === 'SELLER' ? 'buyer' : 'seller'}.`
                  : 'No chats match your filter.'}
              </p>
              {conversations.length === 0 && (
                <button onClick={() => setShowNewChat(true)} className="px-4 py-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold">
                  Start a chat
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
                className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                  active ? 'bg-teal-50 border-l-4 border-teal-700' : 'hover:bg-gray-100 border-l-4 border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A1629] to-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {displayName(c.partner).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-[12.5px] text-[#0A1629] truncate ${c.unread ? 'font-black' : 'font-bold'}`}>{displayName(c.partner)}</h4>
                    <span className="text-[10px] text-gray-400 font-mono shrink-0">{formatTime(c.lastMessage.timestamp)}</span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${c.unread ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                    {mine && 'You: '}
                    {preview === undefined ? '…' : preview === null ? '🔒 Encrypted message' : preview.text || '📎 Attachment'}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-teal-600 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Thread ──────────────────────────────────────────────────────── */}
      <section className={`flex-1 flex-col bg-slate-50/60 min-w-0 ${activePartnerId ? 'flex' : 'hidden md:flex'}`}>
        {setupError ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-red-600">{setupError}</div>
        ) : !activePartnerId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-3xl">🔒</div>
            <h4 className="font-extrabold text-[#0A1629]">Private buyer–seller messaging</h4>
            <p className="text-xs text-gray-500 max-w-xs">
              Messages are encrypted in your browser before they are sent. Only you and the person you are chatting with can read them — not even Trishulan.
            </p>
          </div>
        ) : (
          <>
            <header className="p-4 bg-gradient-to-r from-teal-800 to-teal-700 text-white flex items-center justify-between gap-3 border-b border-teal-900">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setActivePartnerId(null)} className="md:hidden text-lg" aria-label="Back to conversations">←</button>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-[15px] truncate">{displayName(activePartner) || 'Loading…'}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-teal-100 mt-0.5 flex-wrap">
                    {activePartner && <span className="uppercase font-bold tracking-wide text-[9.5px] px-1.5 py-0.5 bg-teal-900/60 rounded">{activePartner.role}</span>}
                    {(activePartner?.city || activePartner?.state) && (
                      <span>📍 {[activePartner.city, activePartner.state].filter(Boolean).join(', ')}</span>
                    )}
                    {activePartner?.verifiedSeller && (
                      <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 rounded font-bold text-[9.5px]">✓ Verified Seller</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                id="chat-verify-encryption"
                onClick={() => setShowVerify((v) => !v)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-bold transition-colors"
                title="Verify encryption keys"
              >
                🔒 Encrypted
              </button>
            </header>

            {showVerify && (
              <div className="mx-4 mt-3 p-4 rounded-2xl bg-white border border-teal-200 shadow-md text-xs space-y-2 animate-[fadeIn_0.15s_ease]">
                <p className="font-bold text-[#0A1629]">Verify end-to-end encryption</p>
                <p className="text-gray-500">Compare these codes with {displayName(activePartner)} over a call or in person. If they match on both screens, nobody is intercepting your messages.</p>
                {fingerprints ? (
                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-400 font-sans text-[10px] mb-1">Your key</div>{fingerprints.mine}</div>
                    <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-400 font-sans text-[10px] mb-1">Their key</div>{fingerprints.theirs}</div>
                  </div>
                ) : (
                  <p className="text-amber-700">{activePartner?.chatPublicKey ? 'Computing…' : 'This contact has not set up secure chat yet.'}</p>
                )}
              </div>
            )}

            <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto flex flex-col gap-3">
              <div className="self-center text-[10.5px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                🔒 Messages are end-to-end encrypted
              </div>

              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                  Say hello to {displayName(activePartner)} 👋
                </div>
              )}

              {messages.map((m) => {
                const mine = m.senderId === me?.id;
                const body = decrypted[m.id];
                const listing = m.listingId ? listings[m.listingId] : undefined;
                return (
                  <div key={m.id} className={`flex flex-col max-w-[78%] gap-1 ${mine ? 'self-end items-end' : 'self-start items-start'}`}>
                    {listing && (
                      <div className="w-64 bg-white border border-teal-200 rounded-2xl p-3 shadow-sm">
                        <div className="text-[9.5px] font-bold text-teal-700 uppercase tracking-wide">{listing.category.replace('_', ' ')}</div>
                        <div className="font-extrabold text-[13px] text-[#0A1629] mt-0.5">{listing.title}</div>
                        <div className="text-[12px] font-black text-[#EA580C] mt-1">₹{listing.price.toLocaleString('en-IN')} / {listing.unit}</div>
                        <div className="text-[10.5px] text-gray-500">📍 {listing.location}</div>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                        mine ? 'bg-teal-700 text-white rounded-tr-sm' : 'bg-white text-[#0A1629] border border-gray-200 rounded-tl-sm'
                      }`}
                    >
                      {body === undefined ? (
                        <span className="opacity-60">Decrypting…</span>
                      ) : body === null ? (
                        <span className="italic opacity-70">🔒 This message was encrypted for a different device and can&apos;t be read here.</span>
                      ) : (
                        <>
                          {body.text}
                          {body.attachmentUrl && (
                            <a
                              href={body.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block mt-1 text-[12px] underline ${mine ? 'text-teal-100' : 'text-teal-700'}`}
                            >
                              📎 {body.attachmentUrl}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">
                      {formatTime(m.timestamp)} {mine && (m.read ? '✓✓' : '✓')}
                    </span>
                  </div>
                );
              })}
            </div>

            {sendError && <div className="mx-3 mb-1 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11.5px]">{sendError}</div>}
            {(attachment || pendingListingId) && (
              <div className="mx-3 mb-1 flex flex-wrap gap-2 text-[11px]">
                {attachment && (
                  <span className="px-2 py-1 rounded-full bg-gray-100 border flex items-center gap-1 max-w-full">
                    📎 <span className="truncate max-w-[220px]">{attachment}</span>
                    <button onClick={() => setAttachment('')} className="font-bold text-gray-500 hover:text-gray-800">✕</button>
                  </span>
                )}
                {pendingListingId && (
                  <span className="px-2 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center gap-1">
                    🏷️ Listing attached
                    <button onClick={() => setPendingListingId(undefined)} className="font-bold hover:text-teal-950">✕</button>
                  </span>
                )}
              </div>
            )}

            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
              <input
                id="chat-message-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={activePartner && !activePartner.chatPublicKey ? 'Waiting for contact to enable secure chat…' : 'Type an encrypted message'}
                disabled={!activePartner?.chatPublicKey}
                maxLength={4000}
                className="flex-1 px-4 py-3 rounded-full border border-gray-300 text-xs focus:outline-none focus:border-teal-600 disabled:bg-gray-50"
              />
              <button
                id="chat-attach"
                type="button"
                onClick={() => {
                  const url = prompt('Paste a document / spec sheet URL (it will be encrypted):');
                  if (url && /^https?:\/\//i.test(url.trim())) setAttachment(url.trim());
                }}
                className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-600 text-base transition-colors"
                title="Attach document link"
              >
                📎
              </button>
              <button
                id="chat-send"
                type="submit"
                disabled={sending || !activePartner?.chatPublicKey || (!text.trim() && !attachment)}
                className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold flex items-center justify-center text-base shadow-md transition-all hover:scale-105"
                title="Send"
              >
                {sending ? '…' : '➤'}
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="font-extrabold text-[#0A1629]">New conversation</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 font-bold" aria-label="Close">✕</button>
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
          {loading && <div className="p-6 text-center text-xs text-gray-400 animate-pulse">Searching…</div>}
          {!loading && contacts.length === 0 && <div className="p-6 text-center text-xs text-gray-500">No {target} found.</div>}
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
                  <div className="font-bold text-[12.5px] text-[#0A1629] truncate flex items-center gap-1.5">
                    {displayName(c)}
                    {c.verifiedSeller && <span className="text-[9px] px-1 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">✓ Verified</span>}
                  </div>
                  <div className="text-[10.5px] text-gray-500 truncate">
                    {c.companyName && c.name !== c.companyName ? `${c.name} · ` : ''}
                    {[c.city, c.state].filter(Boolean).join(', ') || c.role}
                  </div>
                </div>
                {!c.chatPublicKey && <span className="text-[9.5px] text-gray-400 shrink-0">Not on secure chat yet</span>}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
