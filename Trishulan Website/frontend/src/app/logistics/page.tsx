'use client';

import React from 'react';
import TransportOptionsScreen from '@/components/logistics-workspace/TransportOptionsScreen';
import ShipmentControlTower from '@/components/logistics-workspace/ShipmentControlTower';
import PackagingRequirementsSupport from '@/components/logistics-workspace/PackagingRequirementsSupport';

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 px-4 sm:px-6 font-sans">
      <main className="max-w-7xl w-full mx-auto space-y-8">
        {/* Light Theme Banner */}
        <div className="bg-gradient-to-r from-sky-50/90 via-white to-blue-50/80 p-8 rounded-2xl border-2 border-sky-200/80 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-sky-100 text-sky-800 border border-sky-300 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              Logistics & Control Tower Portal
            </span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 rounded-full text-xs font-mono font-medium">
              Express Backend Connected
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0A1629] tracking-tight">
            Expanded Transport Management, Control Tower & Packaging Support
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-2xl">
            Compare carrier quotes, monitor live shipment control tower timelines, manage shared document folders, track POD milestones, and evaluate packaging supplier requirements.
          </p>
        </div>

        {/* Section 1: Transport Options Matrix */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-[#0A1629] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500"></span>
            1. Transport Options & Rate Quotation Matrix
          </h2>
          <TransportOptionsScreen />
        </section>

        {/* Section 2: Shipment Control Tower & Lifecycle */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-[#0A1629] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            2. Shipment Control Tower & Lifecycle Workspace
          </h2>
          <ShipmentControlTower />
        </section>

        {/* Section 3: Packing & Packaging Support */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-[#0A1629] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            3. Packing and Packaging Requirements Support
          </h2>
          <PackagingRequirementsSupport />
        </section>
      </main>
    </div>
  );
}
