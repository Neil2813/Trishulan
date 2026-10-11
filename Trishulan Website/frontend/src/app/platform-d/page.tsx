"use client";

import React from 'react';
import Link from 'next/link';
import PlatformDOverview from '@/components/platform-d/PlatformDOverview';
import TradeIntelligenceSampleAnalysis from '@/components/platform-d/TradeIntelligenceSampleAnalysis';
import PlatformDActivityDashboard from '@/components/platform-d/PlatformDActivityDashboard';

export default function PlatformDPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Light Navigation & Guide Banner */}
        <div className="bg-card text-ink rounded-[24px] p-6 md:p-8 shadow relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-cyan-800 uppercase tracking-wider">
                TRISHULAN TRADE INTELLIGENCE
              </span>
              <span className="text-muted/70">•</span>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                PLATFORM D GUIDE
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-ink">
              Platform D Customs & Export Intelligence
            </h1>
            <p className="text-xs md:text-sm text-muted font-medium mt-1 max-w-2xl">
              HS Code benchmark pricing, customs manifest analysis, competitor export insights, and shipment volume metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/market-analyzer"
              className="px-4 py-2.5 bg-card hover:bg-card text-ink font-bold text-xs rounded-xl border border-line transition-colors shadow-sm"
            >
              ← Back to Report Matrix
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Open Live Dashboard →
            </Link>
          </div>
        </div>

        {/* Section 1: Overview */}
        <PlatformDOverview />

        {/* Section 2: Trade Intelligence Sample Analysis */}
        <TradeIntelligenceSampleAnalysis />

        {/* Section 3: Activity Dashboard */}
        <PlatformDActivityDashboard />

      </div>
    </div>
  );
}
