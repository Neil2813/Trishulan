"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { getAccountDisplayName } from '@/lib/display-name';
import AuthModal from './AuthModal';
import MegaMenu from './MegaMenu';
import SearchToolsModal from './SearchToolsModal';
import ServicePointsModal from './ServicePointsModal';
import { User } from '@/types';
import {
  MapPin,
  Search,
  Bell,
  ClipboardList,
  Shield,
  FileText,
  QrCode,
  X,
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  LayoutGrid,
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isRegisterPage = pathname === "/register" || pathname?.startsWith("/register");

  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchToolsOpen, setIsSearchToolsOpen] = useState(false);
  const [searchToolsTab, setSearchToolsTab] = useState<'barcode' | 'image' | 'voice' | 'hsn'>('barcode');
  const [isServicePointsOpen, setIsServicePointsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
  }>>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          try {
            localStorage.removeItem('trishulan_user');
          } catch (_) {}
        }
        return;
      }
      if (data.user) {
        setUser(data.user);
        try {
          localStorage.setItem('trishulan_user', JSON.stringify(data.user));
        } catch (_) {}
      } else {
        setUser(null);
        try {
          localStorage.removeItem('trishulan_user');
        } catch (_) {}
      }
    } catch (err) {
      // Keep cached state if offline
    }
  };

  useEffect(() => {
    // 1. Instant hydration from localStorage
    try {
      const cached = localStorage.getItem('trishulan_user');
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (_) {}

    // 2. Fetch active session from backend
    fetchSession();

    // 3. Keep in sync with Firebase auth
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (fbUser) {
        fetchSession();
      }
    });

    // 4. Click outside listener for profile menu
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await firebaseAuth.signOut();
    } catch (_) {}
    try {
      localStorage.removeItem('trishulan_user');
    } catch (_) {}
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

  const accountName = user ? getAccountDisplayName(user.name, user.email) : '';

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

            {/* Internal Utility & Secondary Links (Hidden on Landing Page & Register Page for clean focused experience) */}
            {!isLandingPage && !isRegisterPage && (
              <>
                {/* All Pages Mega Menu Toggle */}
                <button
                  suppressHydrationWarning
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-line/50 hover:bg-line text-[13px] font-bold text-ink transition-all cursor-pointer"
                  title="Browse all platform pages and modules"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-accent" />
                  <span>Pages</span>
                  <span className="text-xs">{isMegaMenuOpen ? '▲' : '▼'}</span>
                </button>
              </>
            )}
          </div>


          {/* Inline Search Bar */}
          <div className="flex-1 max-w-[540px] mx-[16px] relative hidden md:block">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/platform-a?query=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="flex items-center border-[1.5px] border-line bg-bg hover:border-ink/40 focus-within:border-ink rounded-[10px] overflow-hidden transition-all shadow-sm"
            >
              <div className="pl-3.5 pr-1 text-muted">
                <Search className="w-4 h-4 shrink-0" />
              </div>
              <input
                suppressHydrationWarning
                id="hdSearch"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products, HSN codes, suppliers…"
                className="flex-1 border-none outline-none py-2 px-2 min-w-0 bg-transparent text-[13.5px] text-ink placeholder:text-muted"
                autoComplete="off"
              />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-1 text-muted hover:text-ink transition-colors mr-1"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Search Tools Trigger Button */}
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => openTools('barcode')}
                className="px-3 py-2 text-[12px] font-bold text-body hover:text-ink bg-line/40 hover:bg-line/70 border-l border-line flex items-center gap-1.5 transition-colors shrink-0"
                title="Search via Barcode scanner, Image dropzone, Voice or HSN"
              >
                <span>Tools</span>
              </button>

              <button
                suppressHydrationWarning
                type="submit"
                className="bg-ink text-bg px-[16px] py-2 text-[12.5px] font-semibold hover:bg-opacity-90 shrink-0 transition-opacity"
                aria-label="Search"
              >
                Search
              </button>
            </form>

            {/* Instant Search Auto-complete Dropdown */}
            {searchQuery.trim() && (
              <div className="absolute top-[46px] left-0 right-0 bg-card rounded-2xl border border-line shadow-2xl p-3 z-50 animate-[fadeIn_0.15s_ease]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-line text-[11px] font-bold text-muted uppercase">
                  <span>Instant Matches</span>
                  <span className="text-[10px] text-accent">Press Enter to search all</span>
                </div>
                {isSearching ? (
                  <div className="text-xs text-muted py-2 px-1">Searching live listings...</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {searchResults.map((item) => (
                      <Link 
                        key={item.id} 
                        href={`/listings/${item.id}`}
                        onClick={() => setSearchQuery('')}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-line/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <div className="text-[13.5px] font-bold text-ink truncate">{item.title}</div>
                          <div className="text-[11px] text-muted truncate">{item.category} • {item.location}</div>
                        </div>
                        <span className="text-xs font-bold text-accent shrink-0">₹{item.price?.toLocaleString('en-IN')} / {item.unit}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted py-2 px-1">
                    No direct listing matches found.
                  </div>
                )}
                
                <div className="pt-2 mt-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery.trim()) {
                        router.push(`/platform-a?query=${encodeURIComponent(searchQuery.trim())}`);
                        setSearchQuery('');
                      }
                    }}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1 w-full text-left"
                  >
                    <span>View all supplier quotes &amp; results for &quot;{searchQuery}&quot; →</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-[8px] shrink-0">

            {/* Mobile Search Tools Trigger */}
            <button
              suppressHydrationWarning
              onClick={() => openTools('barcode')}
              className="relative w-[36px] h-[36px] rounded-[9px] bg-transparent border border-line flex items-center justify-center text-ink transition hover:bg-line md:hidden"
              title="Search Tools"
            >
              <QrCode className="w-4 h-4 text-accent" />
            </button>

            {/* Mobile Inline Search Toggle */}
            <button
              suppressHydrationWarning
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="relative w-[36px] h-[36px] rounded-[9px] bg-transparent border border-line flex items-center justify-center text-ink transition hover:bg-line md:hidden"
              title="Search"
            >
              <Search className="w-4 h-4 text-ink" />
            </button>

            {/* Notifications Icon Button & Drawer (Hidden on Landing Page unless authenticated) */}
            {(!isLandingPage || user) && (
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
                      {notifications.length === 0 && (
                        <p className="py-6 text-center text-xs text-muted">No notifications available.</p>
                      )}
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
            )}

            {/* Authentication Buttons: If signed in show Profile, otherwise show LogIn & Register */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1.5 rounded-full border border-line bg-card hover:border-ink/40 transition-all text-ink font-bold text-[13px] shadow-2xs cursor-pointer"
                  title="View Profile & Account"
                >
                  <div className="w-7 h-7 rounded-full bg-accent/15 text-accent font-black text-[12px] flex items-center justify-center border border-accent/20">
                    {accountName ? accountName[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="hidden max-w-[120px] truncate text-[13px] font-bold sm:inline">
                    {user.companyName || accountName || 'Profile'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-[44px] w-[220px] bg-card rounded-2xl border border-line shadow-2xl p-2 z-50 animate-[fadeIn_0.15s_ease]">
                    <div className="px-3 py-2.5 border-b border-line mb-1">
                      <div className="font-extrabold text-[13px] text-ink truncate">{accountName || 'Your account'}</div>
                      <div className="text-[11px] text-muted truncate">{user.email}</div>
                      {user.role && (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 uppercase">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-ink hover:bg-line/50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-accent" />
                      <span>Profile &amp; Digital ID</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-ink hover:bg-line/50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted" />
                      <span>Dashboard</span>
                    </Link>
                    <div className="my-1 border-t border-line" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
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

        {/* Mobile Inline Search Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 py-2.5 bg-card border-t border-line animate-[fadeIn_0.15s_ease]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/platform-a?query=${encodeURIComponent(searchQuery.trim())}`);
                  setIsMobileSearchOpen(false);
                }
              }}
              className="flex items-center border border-line bg-bg rounded-lg overflow-hidden"
            >
              <input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products, HSN codes…"
                className="flex-1 px-3 py-2 text-xs bg-transparent text-ink outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  openTools('barcode');
                  setIsMobileSearchOpen(false);
                }}
                className="px-2.5 py-2 text-[11px] font-bold text-body border-l border-line bg-line/40"
              >
                Tools
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-ink text-bg font-semibold text-xs"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Collapsible Mega Menu */}
        <MegaMenu 
          isOpen={isMegaMenuOpen} 
          onClose={() => setIsMegaMenuOpen(false)} 
          onOpenServicePoints={() => setIsServicePointsOpen(true)}
        />
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
