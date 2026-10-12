'use client';

import React from 'react';
import TransportOptionsScreen from '@/components/logistics-workspace/TransportOptionsScreen';
import ShipmentControlTower from '@/components/logistics-workspace/ShipmentControlTower';
import PackagingRequirementsSupport from '@/components/logistics-workspace/PackagingRequirementsSupport';

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 font-sans">
      <main className="max-w-7xl w-full mx-auto space-y-8">
        {/* Light Theme Banner */}
        <div className="bg-card p-8 rounded-2xl border border-line/80 shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-sky-100 text-sky-800 border border-sky-300 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              Logistics & Control Tower Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">
            Expanded Transport Management, Control Tower & Packaging Support
          </h1>
          <p className="text-muted text-sm mt-2 max-w-2xl">
            Compare carrier quotes, monitor live shipment control tower timelines, manage shared document folders, track POD milestones, and evaluate packaging supplier requirements.
          </p>
        </div>

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
