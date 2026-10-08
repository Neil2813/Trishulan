"use client";

import React from 'react';

export default function PlatformDOverview() {
  const steps = [
    { num: 1, title: 'Set product/HS code', desc: 'Specify item or tariff code' },
    { num: 2, title: 'Filter destination and era', desc: 'Target country & date range' },
    { num: 3, title: 'Review shipment pattern', desc: 'Analyze volume & frequency' },
    { num: 4, title: 'Build prospect list', desc: 'Identify active buyers/sellers' },
    { num: 5, title: 'Verify and contact', desc: 'Validate prospect details' },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#0A1629]">
          PLATFORM D | Import-export intelligence and trade-data platform
        </h1>
        <p className="text-xs md:text-sm text-[#475569] font-medium mt-2 leading-relaxed max-w-4xl">
          A research workspace rather than a product marketplace. Users query shipment records, analyze buyer/supplier relationships, compare markets and create alerts. Access to detailed records and contacts is often subscription-gated.
        </p>
      </div>

      {/* Options and features list */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-extrabold text-[#0A1629]">Options and features</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm text-[#334155]">
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Search by product, HS code, buyer, supplier or country</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Filter by time, shipment frequency, geography and trade role</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Inspect company profile and shipment history</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Analyze products, buyers, suppliers and competitor activity</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>View trends in charts, dashboards and reports</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Set alerts and export selected research results</span>
          </li>
        </ul>
      </div>

      {/* Typical user journey stepper */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <h3 className="text-sm font-extrabold text-[#0A1629] uppercase tracking-wider">
          Typical user journey
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {steps.map((st) => (
            <div key={st.num} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-[#EA580C] transition-colors">
              <span className="w-7 h-7 rounded-full bg-[#0F172A] text-white text-xs font-black flex items-center justify-center shadow-xs">
                {st.num}
              </span>
              <span className="text-xs font-extrabold text-[#0A1629] mt-1">{st.title}</span>
              <span className="text-[10px] text-gray-500 font-medium leading-tight">{st.desc}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
