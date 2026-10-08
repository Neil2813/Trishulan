"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import UnifiedSearchAIDiscovery from '@/components/feature-expansion/UnifiedSearchAIDiscovery';
import BuyerRFQMatchingCompareView from '@/components/feature-expansion/BuyerRFQMatchingCompareView';
import BuyerLeadSharingWhatsapp from '@/components/feature-expansion/BuyerLeadSharingWhatsapp';

export default function FeatureExpansionPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'search' | 'match' | 'whatsapp'>('all');

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Light Navigation & Guide Banner */}
        <div className="bg-gradient-to-r from-orange-50/90 via-white to-amber-50/80 text-[#0A1629] rounded-[24px] p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-orange-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-[#EA580C] uppercase tracking-wider">
                TRISHULAN FEATURE EXPANSION
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                ADVANCED AI & DISCOVERY
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#0A1629]">
              Unified Search, AI RFQ Matching & WhatsApp Lead Sharing
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-medium mt-1 max-w-2xl">
              Unified cross-platform search, AI-powered quote comparison matrix, and instant lead routing to WhatsApp with Express backend integration.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'all' ? 'bg-[#EA580C] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Features
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'search' ? 'bg-[#EA580C] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              AI Search
            </button>
            <button
              onClick={() => setActiveTab('match')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'match' ? 'bg-[#EA580C] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              RFQ Matching
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'whatsapp' ? 'bg-[#EA580C] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              WhatsApp Share
            </button>
          </div>
        </div>

        {/* Section 1: Unified Search & AI Discovery */}
        {(activeTab === 'all' || activeTab === 'search') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#0A1629] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EA580C]"></span>
                1. Unified Cross-Platform Search & AI Discovery
              </h2>
            </div>
            <UnifiedSearchAIDiscovery />
          </section>
        )}

        {/* Section 2: Buyer RFQ Matching & Compare View */}
        {(activeTab === 'all' || activeTab === 'match') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#0A1629] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                2. AI RFQ Supplier Matching & Side-by-Side Comparison
              </h2>
            </div>
            <BuyerRFQMatchingCompareView />
          </section>
        )}

        {/* Section 3: Buyer Lead Sharing via WhatsApp */}
        {(activeTab === 'all' || activeTab === 'whatsapp') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#0A1629] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                3. Consent-Aware WhatsApp Lead Sharing
              </h2>
            </div>
            <BuyerLeadSharingWhatsapp />
          </section>
        )}

      </div>
    </div>
  );
}
