"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import MegaMenu from './MegaMenu';
import SearchToolsModal from './SearchToolsModal';
import ServicePointsModal from './ServicePointsModal';
import { User } from '@/types';
import { MapPin, Search, Bell } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchToolsOpen, setIsSearchToolsOpen] = useState(false);
  const [searchToolsTab, setSearchToolsTab] = useState<'barcode' | 'image' | 'voice' | 'hsn'>('barcode');
  const [isServicePointsOpen, setIsServicePointsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Price Alert: Steel Rebar 12mm', text: 'Spot prices dropped by 1.2% in Maharashtra mandi.', time: '10m ago', unread: true },
    { id: 2, title: 'RFQ Quote Received', text: 'Rajesh Steel Works quoted ₹52,400/MT for your inquiry.', time: '1h ago', unread: true },
    { id: 3, title: 'KYC Document Verified', text: 'Your GST & PAN documents have been approved.', time: '1d ago', unread: false },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.reload();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/listings?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.listings || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const openTools = (tab: 'barcode' | 'image' | 'voice' | 'hsn') => {
    setSearchToolsTab(tab);
    setIsSearchToolsOpen(true);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <header suppressHydrationWarning className="bg-card/80 backdrop-blur-xl border-b border-line sticky top-0 z-[100] transition-colors">
        <div className="w-full px-4 lg:px-8 max-w-[1600px] mx-auto flex items-center justify-between h-[66px]">
          
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link className="flex items-center gap-[12px] shrink-0" href="/">
              <div className="relative w-[45px] h-[45px]">
                <Image src="/TrishulanLogo.jpeg" alt="Trishulan Logo" fill sizes="45px" className="object-contain" />
              </div>
              <div className="font-alata font-extrabold text-[22px] md:text-[24px] text-ink tracking-[.02em]">
                Trishulan
              </div>
            </Link>

            {/* Mega Menu Toggle */}
            {!isLandingPage && (
              <button
                suppressHydrationWarning
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-line/50 hover:bg-line text-[13px] font-bold text-ink transition-all"
              >
                <span>Categories</span>
                <span className="text-xs">{isMegaMenuOpen ? '▲' : '▼'}</span>
              </button>
            )}

            {/* Trishulan Service Points Button */}
            <button
              suppressHydrationWarning
              onClick={() => setIsServicePointsOpen(true)}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-[12px] font-bold border border-accent/20 transition-all"
              title="View physical Trishulan Service Point Locations"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Service Points</span>
            </button>

            {/* Customer Tasks & Contact Preferences Workspace Link */}
            <Link
              href="/customer-workspace"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-line/30 hover:bg-line/50 text-ink text-[12px] font-bold border border-line transition-all"
              title="Customer Tasks Dashboard & Buyer Contact Preferences"
            >
              <span>📋</span>
              <span>Workspace</span>
            </Link>

            {/* NEW: Health Insurance Access */}
            <Link
              href="/insurance"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] font-bold border border-rose-200 transition-all"
              title="Health Insurance Access for Industrial Workers"
            >
              <span>🛡️</span>
              <span>Insurance</span>
            </Link>

            {/* NEW: Billing & Operations */}
            <Link
              href="/operations"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[12px] font-bold border border-emerald-200 transition-all"
              title="Billing, Inventory & Business Accounts"
            >
              <span>📑</span>
              <span>Operations</span>
            </Link>
          </div>


          {/* Search Bar */}
          {!isLandingPage && (
            <div className="flex-1 max-w-[560px] mx-[16px] relative hidden md:block">
              <div className="flex border-[1.5px] border-line bg-bg rounded-[9px] overflow-hidden transition focus-within:border-ink">
                <input
                  suppressHydrationWarning
                  id="hdSearch"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name, company, HSN code or barcode…"
                  className="flex-1 border-none outline-none px-[14px] min-w-0 bg-transparent text-[13.5px] text-ink"
                  autoComplete="off"
                />
                
                {/* Search Tools Trigger Button */}
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => openTools('barcode')}
                  className="px-3 text-[12px] font-bold text-body hover:text-ink bg-line/50 border-l border-line flex items-center gap-1.5 transition-colors"
                  title="Search via Barcode scanner, Image dropzone or Voice"
                >
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  <span>Tools</span>
                </button>

                <button
                  suppressHydrationWarning
                  onClick={() => handleSearch(searchQuery)}
                  className="bg-ink text-bg px-[18px] text-[12.5px] font-semibold hover:bg-opacity-90"
                  aria-label="Search"
                >
                  Search
                </button>
              </div>

              {/* Search Auto-complete Dropdown */}
              {searchQuery.trim() && (
                <div className="absolute top-[48px] left-0 right-0 bg-card rounded-2xl border border-line shadow-2xl p-4 z-50 animate-[fadeIn_0.15s_ease]">
                  <div className="text-[11px] font-bold text-muted uppercase mb-2">Instant Search Results</div>
                  {isSearching ? (
                    <div className="text-xs text-muted py-2">Searching live listings...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((item) => (
                        <Link 
                          key={item.id} 
                          href={`/listings/${item.id}`}
                          onClick={() => setSearchQuery('')}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-line/50 transition-colors"
                        >
                          <div>
                            <div className="text-[13.5px] font-bold text-ink">{item.title}</div>
                            <div className="text-[11px] text-muted">{item.category} • {item.location}</div>
                          </div>
                          <span className="text-xs font-bold text-accent">₹{item.price.toLocaleString('en-IN')} / {item.unit}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted py-2">No matching listings found.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-[8px] shrink-0">

            {/* Mobile Search Tool Trigger */}
            <button
              suppressHydrationWarning
              onClick={() => openTools('barcode')}
              className="relative w-[36px] h-[36px] rounded-[9px] bg-transparent border border-line flex items-center justify-center text-ink transition hover:bg-line md:hidden"
              title="Search Tools"
            >
              <Search className="w-4 h-4 text-ink" />
            </button>

            {/* Notifications Icon Button & Drawer */}
            <div className="relative">
              <button
                suppressHydrationWarning
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative w-[36px] h-[36px] rounded-[9px] bg-transparent border border-line flex items-center justify-center text-ink transition hover:bg-line"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-ink" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full bg-accent text-bg font-bold text-[10px] flex items-center justify-center px-1 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-[46px] w-[320px] sm:w-[360px] bg-card rounded-2xl border border-line shadow-2xl z-50 p-4 animate-[fadeIn_0.15s_ease]">
                  <div className="flex items-center justify-between pb-3 border-b border-line mb-2">
                    <h4 className="font-extrabold text-[14px] text-ink">Notifications</h4>
                    <button
                      suppressHydrationWarning
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-[11px] font-bold text-accent hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          item.unread
                            ? 'bg-accent/10 border-accent/20 text-ink'
                            : 'bg-bg border-line text-body'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-[12px]">{item.title}</span>
                          <span className="text-[10px] text-muted font-normal">{item.time}</span>
                        </div>
                        <p className="text-[11px] leading-snug">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-line text-center">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[11px] font-bold text-ink hover:underline"
                    >
                      View All Alerts in Dashboard →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Authentication Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link className="btn btn-sm btn-ghost font-bold" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="btn btn-sm btn-ghost font-bold" href="/profile">
                  Profile
                </Link>
                <button suppressHydrationWarning onClick={handleLogout} className="btn btn-sm bg-down-bg text-down hover:bg-down/20 font-bold">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button suppressHydrationWarning onClick={() => setIsAuthOpen(true)} className="btn btn-ghost btn-sm">
                  LogIn
                </button>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Collapsible Mega Menu */}
        {!isLandingPage && (
          <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* Multi-modal Search Tools Modal */}
      <SearchToolsModal
        isOpen={isSearchToolsOpen}
        onClose={() => setIsSearchToolsOpen(false)}
        activeTabDefault={searchToolsTab}
        onSearchSelect={(q) => handleSearch(q)}
      />

      {/* Trishulan Service Points Modal */}
      <ServicePointsModal
        isOpen={isServicePointsOpen}
        onClose={() => setIsServicePointsOpen(false)}
      />
    </>
  );
}

