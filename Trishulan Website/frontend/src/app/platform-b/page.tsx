"use client";

import React from 'react';
import BuyRequirementFormMockup from '@/components/platform-b/BuyRequirementFormMockup';
import PlatformBActivityDashboard from '@/components/platform-b/PlatformBActivityDashboard';

export default function PlatformBPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Section 1: Buy Requirement Form */}
        <BuyRequirementFormMockup />

        {/* Section 2: Activity Dashboard */}
        <PlatformBActivityDashboard />
      </div>
    </div>
  );
}
