"use client";

import React, { useState, useEffect } from 'react';
import ChatSuite from '@/components/chat/ChatSuite';
import AIAssistantBot from '@/components/AIAssistantBot';
import DigitalIDCard from '@/components/DigitalIDCard';
import { User, RFQ, Listing } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_BOT' | 'CHAT' | 'RFQS' | 'LISTINGS'>('OVERVIEW');
  const [showIdModal, setShowIdModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        setUser(userData.user);

        const rfqRes = await fetch('/api/rfq');
        const rfqData = await rfqRes.json();
        setRfqs(rfqData.rfqs || []);

        const listRes = await fetch('/api/listings');
        const listData = await listRes.json();
        setListings(listData.listings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 font-medium">
        Loading Trishulan B2B Control Dashboard...
      </div>
    );
  }

  const role = user ? user.role : 'BUYER';
  const isSeller = role === 'SELLER';

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Top Notification Header Bar */}
        <div className="bg-[#0A1629] text-white p-6 rounded-[24px] border border-slate-700 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#EA580C] uppercase tracking-wider mb-1">
              <span>{isSeller ? 'VERIFIED SELLER PORTAL' : 'VERIFIED BUYER PROCUREMENT'}</span>
              <span className="bg-[#EA580C] text-white px-2.5 py-0.5 rounded-full text-[10px]">{user ? user.subscriptionTier : 'GROWTH'} TIER</span>
              <span className="bg-green-500/20 text-green-400 border border-green-500/40 px-2 py-0.5 rounded text-[10px]">✓ KYC APPROVED</span>
            </div>
            <h1 className="text-[26px] md:text-[32px] font-black text-white">
              Welcome back, {user ? user.name : 'Industrial Member'}
            </h1>
            <p className="text-[13px] text-slate-300 mt-1">
              {user?.companyName || 'Trishulan Partner Firm'} • GSTIN Verified • ID: TRISH-2026-94820
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowIdModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[13px] transition-all flex items-center gap-2"
            >
              <span>🪪</span>
              <span>View B2B Digital ID</span>
            </button>

            <Link
              href="/market-analyzer"
              className="px-4 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 font-bold text-[13px] transition-all"
            >
              Industrial Analyzer →
            </Link>

            <Link
              href="/rfq"
              className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-extrabold text-[13px] shadow-lg transition-all"
            >
              Post Requirement +
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-5 py-2.5 rounded-t-xl font-bold text-[14px] border-b-2 transition-all ${
              activeTab === 'OVERVIEW'
                ? 'border-[#EA580C] text-[#EA580C] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Dashboard Overview
          </button>

          <button
            onClick={() => setActiveTab('AI_BOT')}
            className={`px-5 py-2.5 rounded-t-xl font-bold text-[14px] border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'AI_BOT'
                ? 'border-[#EA580C] text-[#EA580C] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🤖</span>
            <span>AI Industrial Bot</span>
          </button>

          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-5 py-2.5 rounded-t-xl font-bold text-[14px] border-b-2 transition-all ${
              activeTab === 'CHAT'
                ? 'border-[#EA580C] text-[#EA580C] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Messages & Communication ({rfqs.length})
          </button>

          <button
            onClick={() => setActiveTab('RFQS')}
            className={`px-5 py-2.5 rounded-t-xl font-bold text-[14px] border-b-2 transition-all ${
              activeTab === 'RFQS'
                ? 'border-[#EA580C] text-[#EA580C] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Active Requirements ({rfqs.length})
          </button>

          <button
            onClick={() => setActiveTab('LISTINGS')}
            className={`px-5 py-2.5 rounded-t-xl font-bold text-[14px] border-b-2 transition-all ${
              activeTab === 'LISTINGS'
                ? 'border-[#EA580C] text-[#EA580C] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Catalog Listings ({listings.length})
          </button>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Stats Column */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-[20px] border border-gray-200 shadow-sm">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Active Requirement RFQs</div>
                  <div className="text-[32px] font-black text-[#0A1629] mt-1">{rfqs.length}</div>
                  <div className="text-[12px] text-green-600 font-bold mt-1">Ready for Quotes</div>
                </div>

                <div className="bg-white p-6 rounded-[20px] border border-gray-200 shadow-sm">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Catalog Listings</div>
                  <div className="text-[32px] font-black text-[#0A1629] mt-1">{listings.length}</div>
                  <div className="text-[12px] text-blue-600 font-bold mt-1">Live in Directory</div>
                </div>

                <div className="bg-white p-6 rounded-[20px] border border-gray-200 shadow-sm">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">KYC Verification</div>
                  <div className="text-[20px] font-black text-green-600 mt-2">100% VERIFIED</div>
                  <Link href="/profile" className="text-[12px] font-bold text-[#EA580C] hover:underline mt-1 block">
                    View Verified Badges →
                  </Link>
                </div>
              </div>

              {/* Quick Links Banner */}
              <div className="p-6 rounded-[20px] bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#EA580C] uppercase tracking-wider block">SPOT MARKET PRICES</span>
                  <h3 className="text-[18px] font-extrabold mt-0.5">Live Commodity Price Intelligence</h3>
                  <p className="text-xs text-slate-300 mt-1">Check state-wise & international steel, polymer, and machinery prices.</p>
                </div>
                <Link
                  href="/market-prices"
                  className="px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-extrabold text-xs shadow-md shrink-0"
                >
                  View Market Prices →
                </Link>
              </div>

              {/* Recent RFQs List */}
              <div className="bg-white p-6 rounded-[20px] border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-[18px] text-[#0A1629]">Recent Requirement Queries</h3>
                  <Link href="/rfq" className="text-xs font-bold text-[#EA580C] hover:underline">Post New RFQ →</Link>
                </div>
                <div className="space-y-3">
                  {rfqs.map(rfq => (
                    <div key={rfq.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[14px] text-[#0A1629]">{rfq.title}</div>
                        <div className="text-xs text-gray-500">{rfq.buyerName} • {rfq.category} • Quantity: {rfq.quantity}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                        Target: ₹{rfq.targetPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* AI Assistant Column */}
            <div className="space-y-6">
              <div className="text-xs font-black text-[#EA580C] uppercase tracking-wider">
                AI INDUSTRIAL BOT ASSISTANT (PAGE 3 SPEC)
              </div>
              <AIAssistantBot embedded={true} />
            </div>

          </div>
        )}

        {activeTab === 'AI_BOT' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <h2 className="text-[22px] font-black text-[#0A1629]">Trishulan AI Bot Assistance</h2>
              <p className="text-xs text-gray-500">Ask any questions regarding technical specifications, KYC status, prices, or suppliers.</p>
            </div>
            <AIAssistantBot embedded={true} />
          </div>
        )}

        {activeTab === 'CHAT' && (
          <div className="max-w-4xl mx-auto">
            <ChatSuite partnerName="Sreegopalakrishnacollections Prop J..." />
          </div>
        )}

        {activeTab === 'RFQS' && (
          <div className="bg-white p-6 rounded-[20px] border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-black text-[#0A1629]">Active Requirements & RFQs</h2>
              <Link href="/rfq" className="px-4 py-2 bg-[#EA580C] text-white text-xs font-bold rounded-xl">Post Requirement +</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rfqs.map(rfq => (
                <div key={rfq.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded uppercase">{rfq.category}</span>
                  <h4 className="font-extrabold text-[16px] text-[#0A1629] mt-2">{rfq.title}</h4>
                  <p className="text-xs text-gray-600 my-2">{rfq.details}</p>
                  <div className="flex justify-between items-center text-xs font-bold pt-3 border-t border-gray-200">
                    <span>Buyer: {rfq.buyerName}</span>
                    <span className="text-[#EA580C]">Target: ₹{rfq.targetPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'LISTINGS' && (
          <div className="bg-white p-6 rounded-[20px] border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-black text-[#0A1629]">Product & Machinery Catalog</h2>
              <Link href="/sell" className="px-4 py-2 bg-[#0A1629] text-white text-xs font-bold rounded-xl">List Product +</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {listings.map(item => (
                <div key={item.id} className="p-5 rounded-2xl border border-gray-200 bg-white">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded uppercase">{item.category}</span>
                  <h4 className="font-extrabold text-[16px] text-[#0A1629] mt-2">{item.title}</h4>
                  <p className="text-xs text-gray-600 my-2 line-clamp-2">{item.description}</p>
                  <div className="text-[15px] font-black text-[#EA580C] mt-2">₹{item.price.toLocaleString('en-IN')} / {item.unit}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.sellerName} • {item.location}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Digital ID Card Modal */}
      {showIdModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowIdModal(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white text-gray-800 font-bold shadow-xl flex items-center justify-center text-sm"
            >
              ✕
            </button>
            <DigitalIDCard
              name={user?.name || 'Industrial Member'}
              role={role === 'SELLER' ? 'SELLER' : 'BUYER'}
              companyName={user?.companyName || 'Trishulan Enterprise'}
              gstNumber={user?.gstNumber || '27AAAAA0000A1Z5'}
              email={user?.email || 'member@trishulan.com'}
            />
          </div>
        </div>
      )}

    </div>
  );
}
