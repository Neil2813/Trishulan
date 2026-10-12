"use client";

import React from 'react';
import SupplierSearchMockup from '@/components/platform-a/SupplierSearchMockup';
import ActivityDashboard from '@/components/platform-a/ActivityDashboard';

export default function PlatformAPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Section 1: Interactive Supplier Search Screen Mockup */}
        <SupplierSearchMockup />

        {/* Section 2: Activity Dashboard */}
        <ActivityDashboard />
      </div>
    </div>
  );
}
