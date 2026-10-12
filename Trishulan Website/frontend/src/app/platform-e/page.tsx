"use client";

import React from 'react';
import SMEDigitalPresenceMockup from '@/components/platform-e/SMEDigitalPresenceMockup';
import PlatformEActivityDashboard from '@/components/platform-e/PlatformEActivityDashboard';

export default function PlatformEPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Section 1: SME Digital Presence Mockup */}
        <SMEDigitalPresenceMockup />

        {/* Section 2: Activity Dashboard */}
        <PlatformEActivityDashboard />
      </div>
    </div>
  );
}
