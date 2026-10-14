'use client';

import React from 'react';
import TransportOptionsScreen from '@/components/logistics-workspace/TransportOptionsScreen';
import ShipmentControlTower from '@/components/logistics-workspace/ShipmentControlTower';
import PackagingRequirementsSupport from '@/components/logistics-workspace/PackagingRequirementsSupport';

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 font-sans">
      <main className="max-w-7xl w-full mx-auto space-y-8">

        {/* Section 1: Transport Options Matrix */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500"></span>
            1. Transport Options & Rate Quotation Matrix
          </h2>
          <TransportOptionsScreen />
        </section>

        {/* Section 2: Shipment Control Tower & Lifecycle */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            2. Shipment Control Tower & Lifecycle Workspace
          </h2>
          <ShipmentControlTower />
        </section>

        {/* Section 3: Packing & Packaging Support */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            3. Packing and Packaging Requirements Support
          </h2>
          <PackagingRequirementsSupport />
        </section>
      </main>
    </div>
  );
}
