"use client";

import React from 'react';
import TradeLeadPortalMockup from '@/components/platform-c/TradeLeadPortalMockup';
import PlatformCActivityDashboard from '@/components/platform-c/PlatformCActivityDashboard';

export default function PlatformCPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Section 1: Trade Lead Portal */}
        <TradeLeadPortalMockup />

        {/* Section 2: Activity Dashboard */}
        <PlatformCActivityDashboard />
      </div>
    </div>
  );
}
