"use client";

import React, { useState, useEffect } from 'react';
import ChatSuite from '@/components/chat/ChatSuite';
import DigitalIDCard from '@/components/DigitalIDCard';
import AuthModal from '@/components/AuthModal';
import { User, RFQ, Listing } from '@/types';
import { getAccountDisplayName } from '@/lib/display-name';
import Link from 'next/link';
import { CheckCircle2, IdCard, X, PackagePlus, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHAT' | 'RFQS' | 'LISTINGS'>('OVERVIEW');
  const [showIdModal, setShowIdModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [rfqLoadError, setRfqLoadError] = useState(false);
  const [listingsLoadError, setListingsLoadError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    setShowWelcome(new URLSearchParams(window.location.search).get('welcome') === '1');

    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          setSessionError(true);
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);
        if (!userData.user) return;

        setRfqLoadError(false);
        setListingsLoadError(false);
        const [rfqRes, listRes] = await Promise.all([
          fetch('/api/rfq'),
          fetch('/api/listings'),
        ]);
        if (rfqRes.ok) {
          const rfqData = await rfqRes.json();
          setRfqs(rfqData.rfqs || []);
        } else {
          setRfqs([]);
          setRfqLoadError(true);
        }
        if (listRes.ok) {
          const listData = await listRes.json();
          const accountListings = listData.listings || [];
          setListings(userData.user.role === 'SELLER'
            ? accountListings.filter((listing: Listing) => listing.sellerId === userData.user.id)
            : accountListings);
        } else {
          setListings([]);
          setListingsLoadError(true);
        }
      } catch (err) {
        console.error(err);
        setRfqLoadError(true);
        setListingsLoadError(true);
        setSessionError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reloadCount]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-3xl animate-pulse space-y-4">
          <div className="h-40 rounded-3xl bg-line/50" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 rounded-2xl bg-line/40" />
            <div className="h-28 rounded-2xl bg-line/40" />
          </div>
          <span className="sr-only">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="max-w-md rounded-3xl border border-line bg-card p-8 shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-accent">
              <IdCard className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-black text-ink">
              {sessionError ? 'We couldn’t load your workspace' : 'Your business workspace is waiting'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {sessionError
                ? 'Your session could not be checked just now. Try again before signing in so we can keep your account secure.'
                : 'Sign in to see your requirements, messages, and supplier activity.'}
            </p>
            {sessionError ? (
              <button
                type="button"
                onClick={() => {
                  setSessionError(false);
                  setLoading(true);
                  setReloadCount((count) => count + 1);
                }}
                className="mt-5 w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c2410a]"
              >
                Try again
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowAuth(true)}
                  className="mt-5 w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c2410a]"
                >
                  Sign in
                </button>
                <p className="mt-4 text-xs text-muted">
                  New to Trishulan?{' '}
                  <Link href="/register" className="font-bold text-accent hover:underline">Create an account</Link>
                </p>
              </>
            )}
          </div>
        </div>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => window.location.reload()}
        />
      </>
    );
  }

  const isSeller = user.role === 'SELLER';
  const displayName = getAccountDisplayName(user.name, user.email);
  const firstName = displayName.split(' ')[0];
  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const tabs = ['OVERVIEW', 'CHAT', 'RFQS', 'LISTINGS'] as const;
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab);
    document.getElementById(`dashboard-tab-${nextTab.toLowerCase()}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1440px] space-y-5 sm:space-y-6">
        
        {/* Workspace summary and primary actions */}
        <div className="relative overflow-hidden rounded-[24px] border border-line bg-card p-5 text-ink shadow-lg sm:p-7 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="absolute right-0 top-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider sm:text-xs">
              <span>{isSeller ? 'SELLER PORTAL' : 'BUYER PROCUREMENT'}</span>
              <span className="rounded-full bg-accent px-2.5 py-1 text-[9px] text-white sm:text-[10px]">{user.subscriptionTier} TIER</span>
              {isSeller && (
                <span className={`border px-2 py-0.5 rounded text-[10px] font-bold ${
                  user.verifiedSeller
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {user.verifiedSeller ? 'VERIFIED SELLER' : 'VERIFICATION IN PROGRESS'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black leading-tight text-ink sm:text-[32px]">
              {showWelcome
                ? `Welcome to Trishulan${firstName ? `, ${firstName}` : ''}`
                : firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {showWelcome
                ? isSeller
                  ? 'Your supplier workspace is ready. Add your business details and start building your catalog.'
                  : 'Your buyer workspace is ready. Find suppliers, save your business details, and post your first requirement.'
                : [user.companyName, user.gstNumber ? `GSTIN ${user.gstNumber}` : null].filter(Boolean).join(' · ') || (isSeller ? 'Manage your listings, verification, and buyer enquiries.' : 'Track your requirements, messages, and supplier activity.')}
            </p>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 lg:mt-0 lg:max-w-[520px] lg:justify-end">
            <button
              type="button"
              onClick={() => setShowIdModal(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-center text-xs font-bold text-orange-900 shadow-2xs transition-colors hover:bg-orange-100 sm:px-4 sm:text-[13px]"
            >
              <IdCard className="w-4 h-4 text-orange-600" />
              <span>Digital ID</span>
            </button>

            <Link
              href="/market-analyzer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-center text-xs font-bold text-sky-800 shadow-2xs transition-colors hover:bg-sky-100 sm:px-4 sm:text-[13px]"
            >
              Market insights
            </Link>

            <Link
              href={isSeller ? '/sell' : '/rfq'}
              className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-center text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#c2410a] sm:col-span-1 sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-[13px]"
            >
              {isSeller ? <><PackagePlus className="h-4 w-4" /> Create listing</> : <><ClipboardList className="h-4 w-4" /> Post a requirement</>}
            </Link>
          </div>
        </div>

        {showWelcome && (
          <section className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5 md:p-6">
            <button
              type="button"
              aria-label="Dismiss welcome guide"
              onClick={() => {
                setShowWelcome(false);
                window.history.replaceState({}, '', window.location.pathname);
              }}
              className="absolute right-3 top-3 rounded-lg p-2 text-muted transition-colors hover:bg-orange-100 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold text-ink">Your next best step</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {isSeller
                    ? 'Set up your business profile, then publish your first listing so buyers can find you.'
                    : 'Tell suppliers about your business, then explore the catalog or post a requirement.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/profile"
                    className="rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink transition-colors hover:border-accent"
                  >
                    Complete business profile
                  </Link>
                  <Link
                    href={isSeller ? '/sell' : '/platform-a'}
                    className="rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#c2410a]"
                  >
                    {isSeller ? 'Create your first listing' : 'Explore suppliers'}
                  </Link>
                  {!isSeller && (
                    <Link
                      href="/rfq"
                      className="rounded-lg border border-orange-200 bg-orange-100/70 px-3.5 py-2 text-xs font-bold text-orange-900 transition-colors hover:bg-orange-100"
                    >
                      Post a requirement
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Navigation Tabs */}
        <div role="tablist" aria-label="Dashboard sections" className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 pb-1 sm:mx-0 sm:gap-2 sm:px-0">
          <button
            type="button"
            role="tab"
            id="dashboard-tab-overview"
            aria-controls="dashboard-panel"
            aria-selected={activeTab === 'OVERVIEW'}
            tabIndex={activeTab === 'OVERVIEW' ? 0 : -1}
            onClick={() => setActiveTab('OVERVIEW')}
            onKeyDown={handleTabKeyDown}
            className={`shrink-0 whitespace-nowrap rounded-t-xl border-b-2 px-3 py-3 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
              activeTab === 'OVERVIEW'
                ? 'border-[#EA580C] text-accent bg-card'
                : 'border-transparent text-muted hover:text-gray-900'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            role="tab"
            id="dashboard-tab-chat"
            aria-controls="dashboard-panel"
            aria-selected={activeTab === 'CHAT'}
            tabIndex={activeTab === 'CHAT' ? 0 : -1}
            onClick={() => setActiveTab('CHAT')}
            onKeyDown={handleTabKeyDown}
            className={`shrink-0 whitespace-nowrap rounded-t-xl border-b-2 px-3 py-3 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
              activeTab === 'CHAT'
                ? 'border-[#EA580C] text-accent bg-card'
                : 'border-transparent text-muted hover:text-gray-900'
            }`}
          >
            Messages
          </button>

          <button
            type="button"
            role="tab"
            id="dashboard-tab-rfqs"
            aria-controls="dashboard-panel"
            aria-selected={activeTab === 'RFQS'}
            tabIndex={activeTab === 'RFQS' ? 0 : -1}
            onClick={() => setActiveTab('RFQS')}
            onKeyDown={handleTabKeyDown}
            className={`shrink-0 whitespace-nowrap rounded-t-xl border-b-2 px-3 py-3 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
              activeTab === 'RFQS'
                ? 'border-[#EA580C] text-accent bg-card'
                : 'border-transparent text-muted hover:text-gray-900'
            }`}
          >
            {isSeller ? 'Buyer requests' : 'My requirements'} <span className="ml-1 rounded-full bg-line/60 px-1.5 py-0.5 text-[10px]">{rfqs.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            id="dashboard-tab-listings"
            aria-controls="dashboard-panel"
            aria-selected={activeTab === 'LISTINGS'}
            tabIndex={activeTab === 'LISTINGS' ? 0 : -1}
            onClick={() => setActiveTab('LISTINGS')}
            onKeyDown={handleTabKeyDown}
            className={`shrink-0 whitespace-nowrap rounded-t-xl border-b-2 px-3 py-3 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
              activeTab === 'LISTINGS'
                ? 'border-[#EA580C] text-accent bg-card'
                : 'border-transparent text-muted hover:text-gray-900'
            }`}
          >
            {isSeller ? 'My listings' : 'Marketplace'} <span className="ml-1 rounded-full bg-line/60 px-1.5 py-0.5 text-[10px]">{listings.length}</span>
          </button>
        </div>

        {/* Dynamic Tab Views */}
        <div
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby={`dashboard-tab-${activeTab.toLowerCase()}`}
          tabIndex={0}
          className="min-w-0 outline-none"
        >
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            
            <div className={`grid grid-cols-2 ${isSeller ? 'lg:grid-cols-3' : ''} gap-3 sm:gap-4`}>
              <div className="min-w-0 rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/50 via-card to-card p-4 shadow-2xs sm:p-6">
                <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700 sm:text-[11px]">{isSeller ? 'Open buyer requests' : 'Your requirements'}</div>
                <div className="mt-1 text-3xl font-black text-ink sm:text-[32px]">{rfqLoadError ? '—' : rfqs.length}</div>
                <div className="mt-1 text-[11px] font-bold text-orange-600 sm:text-xs">{isSeller ? 'Available to review' : 'Posted by you'}</div>
              </div>

              <div className="min-w-0 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/50 via-card to-card p-4 shadow-2xs sm:p-6">
                <div className="text-[10px] font-bold uppercase tracking-wide text-sky-700 sm:text-[11px]">{isSeller ? 'Your listings' : 'Marketplace listings'}</div>
                <div className="mt-1 text-3xl font-black text-ink sm:text-[32px]">{listingsLoadError ? '—' : listings.length}</div>
                <div className="mt-1 text-[11px] font-bold text-blue-600 sm:text-xs">{isSeller ? 'Published by you' : 'Available to explore'}</div>
              </div>

              {isSeller && (
                <div className="col-span-2 rounded-2xl border border-line bg-card p-4 shadow-2xs sm:p-6 lg:col-span-1">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-muted sm:text-[11px]">Seller verification</div>
                  <div className={`mt-2 text-lg font-black ${user.verifiedSeller ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {user.verifiedSeller ? 'Verified' : 'In progress'}
                  </div>
                  <Link href="/profile" className="mt-1 block text-xs font-bold text-accent hover:underline">
                    {user.verifiedSeller ? 'View seller profile' : 'Review verification status'} →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Links Dual Banners (Light Orange & Light Blue Themes) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Light Orange Theme Banner: Spot Market Prices */}
              <div className="p-6 md:p-7 rounded-[22px] bg-gradient-to-br from-orange-50 via-amber-50/60 to-white border border-orange-200/90 shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">MARKET DATA</span>
                  <h3 className="text-[19px] font-black text-ink">Industrial market prices</h3>
                  <p className="text-xs text-muted font-medium leading-relaxed">
                    Check state-wise &amp; international benchmark prices for steel, copper, polymer, and machinery with live FX updates.
                  </p>
                </div>
                <div>
                  <Link
                    href="/market-prices"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    View Market Prices →
                  </Link>
                </div>
              </div>

              {/* Light Blue Theme Banner: Customer Tasks & Consent */}
              <div className="p-6 md:p-7 rounded-[22px] bg-gradient-to-br from-sky-50 via-blue-50/60 to-white border border-blue-200/90 shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">ACCOUNT TOOLS</span>
                  <h3 className="text-[19px] font-black text-ink">Business workspace</h3>
                  <p className="text-xs text-muted font-medium leading-relaxed">
                    Manage your business details, contact preferences, and support requests.
                  </p>
                </div>
                <div>
                  <Link
                    href="/customer-workspace"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    Customer Workspace →
                  </Link>
                </div>
              </div>

            </div>

            {/* Recent RFQs List */}
            <div className="bg-card p-6 md:p-7 rounded-[22px] border border-line shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-[18px] text-ink">{isSeller ? 'Open buyer requests' : 'Your recent requirements'}</h3>
                {!isSeller && <Link href="/rfq" className="text-xs font-bold text-accent hover:underline">Post requirement →</Link>}
              </div>
              <div className="space-y-3">
                {rfqLoadError ? (
                  <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
                    <p className="text-sm font-bold text-rose-800">Requirements couldn’t load</p>
                    <button type="button" onClick={() => setReloadCount((count) => count + 1)} className="mt-2 text-xs font-bold text-accent hover:underline">Try again</button>
                  </div>
                ) : rfqs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line bg-bg/50 px-5 py-8 text-center">
                    <p className="text-sm font-bold text-ink">No requirements yet</p>
                    <p className="mt-1 text-xs text-muted">
                      {isSeller ? 'Buyer requests will appear here when they match your catalog.' : 'Post a requirement to start receiving quotes from suppliers.'}
                    </p>
                    <Link href={isSeller ? '/platform-b' : '/rfq'} className="mt-3 inline-block text-xs font-bold text-accent hover:underline">
                      {isSeller ? 'Explore buyer requests →' : 'Post your first requirement →'}
                    </Link>
                  </div>
                  ) : rfqs.map(rfq => (
                    <div key={rfq.id} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-orange-200 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-bold text-[14px] text-ink">{rfq.title}</div>
                        <div className="text-xs text-muted">{rfq.buyerName} • {rfq.category} • Quantity: {rfq.quantity}</div>
                      </div>
                      <span className="w-fit rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-900">
                      Target: ₹{rfq.targetPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'CHAT' && (
          <div className="max-w-4xl mx-auto">
            <ChatSuite currentUser={user} />
          </div>
        )}

        {activeTab === 'RFQS' && (
          <div className="rounded-[20px] border border-line bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black text-ink">{isSeller ? 'Open buyer requests' : 'My requirements'}</h2>
              {!isSeller && <Link href="/rfq" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white">Post requirement +</Link>}
            </div>
            {rfqLoadError ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">Requirements couldn’t load. <button type="button" onClick={() => setReloadCount((count) => count + 1)} className="font-bold underline">Try again</button></div>
            ) : rfqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-bg/50 px-5 py-10 text-center">
                <p className="text-sm font-bold text-ink">{isSeller ? 'No open buyer requests right now' : 'You haven’t posted a requirement yet'}</p>
                <p className="mt-1 text-xs text-muted">{isSeller ? 'New requests will appear here when buyers post them.' : 'Post a request to start receiving supplier quotes.'}</p>
                <Link href={isSeller ? '/platform-b' : '/rfq'} className="mt-3 inline-block text-xs font-bold text-accent hover:underline">{isSeller ? 'Browse buyer opportunities →' : 'Post your first requirement →'}</Link>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rfqs.map(rfq => (
                <div key={rfq.id} className="p-5 rounded-2xl border border-line bg-card/50">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded uppercase">{rfq.category}</span>
                  <h4 className="font-extrabold text-[16px] text-ink mt-2">{rfq.title}</h4>
                  <p className="text-xs text-muted my-2">{rfq.details}</p>
                  <div className="flex justify-between items-center text-xs font-bold pt-3 border-t border-line">
                    <span>Buyer: {rfq.buyerName}</span>
                    <span className="text-accent">Target: ₹{rfq.targetPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {activeTab === 'LISTINGS' && (
          <div className="rounded-[20px] border border-line bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black text-ink">{isSeller ? 'My listings' : 'Marketplace listings'}</h2>
              {isSeller && <Link href="/sell" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-orange-700">Create listing +</Link>}
            </div>
            {listingsLoadError ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">Listings couldn’t load. <button type="button" onClick={() => setReloadCount((count) => count + 1)} className="font-bold underline">Try again</button></div>
            ) : listings.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-line bg-bg/50 px-5 py-10 text-center">
                <p className="text-sm font-bold text-ink">{isSeller ? 'Your catalog is ready for its first listing' : 'No marketplace listings available yet'}</p>
                <p className="mt-1 text-xs text-muted">{isSeller ? 'Add products or equipment to help buyers discover your business.' : 'Check back soon or post a requirement to let suppliers know what you need.'}</p>
                <Link href={isSeller ? '/sell' : '/rfq'} className="mt-3 inline-block text-xs font-bold text-accent hover:underline">{isSeller ? 'Create your first listing →' : 'Post a requirement →'}</Link>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {listings.map(item => (
                <div key={item.id} className="p-5 rounded-2xl border border-line bg-card">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded uppercase">{item.category}</span>
                  <h4 className="font-extrabold text-[16px] text-ink mt-2">{item.title}</h4>
                  <p className="text-xs text-muted my-2 line-clamp-2">{item.description}</p>
                  <div className="text-[15px] font-black text-accent mt-2">₹{item.price.toLocaleString('en-IN')} / {item.unit}</div>
                  <div className="text-xs text-muted/70 mt-1">{item.sellerName} • {item.location}</div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}
        </div>

      </div>

      {/* Digital ID Card Modal */}
      {showIdModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowIdModal(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-card text-gray-800 font-bold shadow-xl flex items-center justify-center text-sm"
            >
              ✕
            </button>
            <DigitalIDCard
              name={user.name}
              role={user.role}
              companyName={user.companyName || ''}
              companyId={user.id}
              isVerified={user.verifiedSeller === true}
              gstNumber={user.gstNumber}
              email={user.email}
            />
          </div>
        </div>
      )}

    </div>
  );
}
