"use client";

import React from 'react';
import TradeIntelligenceSampleAnalysis from '@/components/platform-d/TradeIntelligenceSampleAnalysis';
import PlatformDActivityDashboard from '@/components/platform-d/PlatformDActivityDashboard';

export default function PlatformDPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Section 1: Trade Intelligence Sample Analysis */}
        <TradeIntelligenceSampleAnalysis />

        {/* Section 2: Activity Dashboard */}
        <PlatformDActivityDashboard />
      </div>
    </div>
  );
}
