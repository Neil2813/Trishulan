"use client";

import React from 'react';
import Link from 'next/link';
import PlatformAOverview from '@/components/platform-a/PlatformAOverview';
import SupplierSearchMockup from '@/components/platform-a/SupplierSearchMockup';
import ActivityDashboard from '@/components/platform-a/ActivityDashboard';

export default function PlatformAPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Light Navigation & Guide Banner */}
        <div className="bg-gradient-to-r from-orange-50/90 via-white to-amber-50/80 text-[#0A1629] rounded-[24px] p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-orange-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-[#EA580C] uppercase tracking-wider">
                TRISHULAN INDUSTRIAL CONNECT
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                PLATFORM FEATURES GUIDE
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#0A1629]">
              Platform A Specifications & Express Integration
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-medium mt-1 max-w-2xl">
              Indian supplier discovery marketplace with live Express backend connectivity, multi-supplier inquiry broadcasting, and real-time activity metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/market-analyzer"
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0A1629] font-bold text-xs rounded-xl border border-slate-300 transition-colors shadow-sm"
            >
              ← Back to Report Matrix
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Open Live Dashboard →
            </Link>
          </div>
        </div>

        {/* Section 1: Overview, Features & User Journey */}
        <PlatformAOverview />

        {/* Section 2: Interactive Supplier Search Screen Mockup */}
        <SupplierSearchMockup />

        {/* Section 3: Illustrative Activity Dashboard */}
        <ActivityDashboard />

      </div>
    </div>
  );
}
