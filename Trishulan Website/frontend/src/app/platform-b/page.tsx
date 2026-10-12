"use client";

import React from 'react';
import Link from 'next/link';
import BuyRequirementFormMockup from '@/components/platform-b/BuyRequirementFormMockup';
import PlatformBActivityDashboard from '@/components/platform-b/PlatformBActivityDashboard';

export default function PlatformBPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Light Navigation & Guide Banner */}
        <div className="bg-card text-ink rounded-[24px] p-6 md:p-8 shadow relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider">
                TRISHULAN WHOLESALE MATRIX
              </span>
              <span className="text-muted/70">•</span>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                PLATFORM INTERACTION
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-ink">
              Platform B Wholesale RFQ Broadcasting
            </h1>
            <p className="text-xs md:text-sm text-muted font-medium mt-1 max-w-2xl">
              Wholesale buyer requirement broadcasting, bulk RFQ forms, and live manufacturer response tracking powered by Express backend.
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
              className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Open Live Dashboard →
            </Link>
          </div>
        </div>

        {/* Section 1: Buy Requirement Form */}
        <BuyRequirementFormMockup />

        {/* Section 2: Activity Dashboard */}
        <PlatformBActivityDashboard />

      </div>
    </div>
  );
}
