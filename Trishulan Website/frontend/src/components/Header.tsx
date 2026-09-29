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
      <header className="bg-white border-b border-line sticky top-0 z-[100]">
        <div className="w-full px-4 lg:px-8 max-w-[1600px] mx-auto flex items-center justify-between h-[66px]">
          
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link className="flex items-center gap-[12px] shrink-0" href="/">
              <div className="relative w-[45px] h-[45px]">
                <Image src="/TrishulanLogo.jpeg" alt="Trishulan Logo" fill sizes="45px" className="object-contain" />
              </div>
              <div className="font-alata font-extrabold text-[22px] md:text-[24px] text-[#0A1629] tracking-[.02em]">
                Trishulan
              </div>
            </Link>

            {/* Mega Menu Toggle */}
            {!isLandingPage && (
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[13px] font-bold text-[#0A1629] transition-all"
              >
                <span>Categories</span>
                <span className="text-xs">{isMegaMenuOpen ? '▲' : '▼'}</span>
              </button>
            )}

            {/* Trishulan Service Points Button */}
            <button
              onClick={() => setIsServicePointsOpen(true)}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#EA580C] text-[12px] font-bold border border-orange-200 transition-all"
              title="View physical Trishulan Service Point Locations"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Service Points</span>
            </button>
          </div>

          {/* Search Bar */}
          {!isLandingPage && (
            <div className="flex-1 max-w-[560px] mx-[16px] relative hidden md:block">
              <div className="flex border-[1.5px] border-line rounded-[9px] overflow-hidden transition focus-within:border-ink">
                <input
                  id="hdSearch"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name, company, HSN code or barcode…"
                  className="flex-1 border-none outline-none px-[14px] min-w-0 bg-transparent text-[13.5px] text-ink"
                  autoComplete="off"
                />
                
                {/* Search Tools Trigger Button */}
                <button
                  type="button"
                  onClick={() => openTools('barcode')}
                  className="px-3 text-[12px] font-bold text-gray-700 hover:text-[#EA580C] bg-gray-100 border-l border-gray-200 flex items-center gap-1.5 transition-colors"
                  title="Search via Barcode scanner, Image dropzone or Voice"
                >
                  <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
                  <span>Tools</span>
                </button>

                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="bg-ink text-white px-[18px] text-[12.5px] font-semibold hover:bg-opacity-90"
                  aria-label="Search"
                >
                  Search
                </button>
              </div>

              {/* Search Auto-complete Dropdown */}
              {searchQuery.trim() && (
                <div className="absolute top-[48px] left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-2xl p-4 z-50 animate-[fadeIn_0.15s_ease]">
                  <div className="text-[11px] font-bold text-gray-400 uppercase mb-2">Instant Search Results</div>
                  {isSearching ? (
                    <div className="text-xs text-gray-500 py-2">Searching live listings...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((item) => (
                        <Link 
                          key={item.id} 
                          href={`/listings/${item.id}`}
                          onClick={() => setSearchQuery('')}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <div className="text-[13.5px] font-bold text-[#0A1629]">{item.title}</div>
                            <div className="text-[11px] text-[#64748B]">{item.category} • {item.location}</div>
                          </div>
                          <span className="text-xs font-bold text-[#EA580C]">₹{item.price.toLocaleString('en-IN')} / {item.unit}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 py-2">No matching listings found.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-[8px] shrink-0">

            {/* Mobile Search Tool Trigger */}
            <button
              onClick={() => openTools('barcode')}
              className="relative w-[36px] h-[36px] rounded-[9px] bg-bg border border-line flex items-center justify-center text-ink transition hover:bg-navy-bg hover:border-line-2 md:hidden"
              title="Search Tools"
            >
              <Search className="w-4 h-4 text-ink" />
            </button>

            {/* Notifications Icon Button & Drawer */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative w-[36px] h-[36px] rounded-[9px] bg-bg border border-line flex items-center justify-center text-ink transition hover:bg-navy-bg hover:border-line-2"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-ink" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full bg-[#EA580C] text-white font-bold text-[10px] flex items-center justify-center px-1 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-[46px] w-[320px] sm:w-[360px] bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 p-4 animate-[fadeIn_0.15s_ease]">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-2">
                    <h4 className="font-extrabold text-[14px] text-[#0A1629]">Notifications</h4>
                    <button
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-[11px] font-bold text-[#EA580C] hover:underline"
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
                            ? 'bg-amber-50/70 border-amber-200 text-[#0A1629]'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-[12px]">{item.title}</span>
                          <span className="text-[10px] text-gray-400 font-normal">{item.time}</span>
                        </div>
                        <p className="text-[11px] leading-snug">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-200 text-center">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[11px] font-bold text-[#0A1629] hover:underline"
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
                <Link className="btn btn-primary btn-sm bg-gray-200 text-ink border-none hover:bg-gray-300 font-bold" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="btn btn-primary btn-sm bg-amber-100 text-amber-900 border-none hover:bg-amber-200 font-bold" href="/profile">
                  Profile
                </Link>
                <button onClick={handleLogout} className="btn btn-primary btn-sm bg-red-100 text-red-700 border-none hover:bg-red-200 font-bold">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsAuthOpen(true)} className="btn btn-primary btn-sm">
                  LogIn
                </button>
                <Link href="/register" className="btn btn-primary btn-sm bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold">
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

