"use client";

import React from 'react';

export default function PlatformEOverview() {
  const steps = [
    { num: 1, title: 'Build profile', desc: 'Company details & business card' },
    { num: 2, title: 'Structure catalogue', desc: 'Dimensions, materials & certs' },
    { num: 3, title: 'Publish storefront', desc: 'Hosted link & marketplace listing' },
    { num: 4, title: 'Receive inquiry/RFQ', desc: 'Structured buyer procurement' },
    { num: 5, title: 'Respond and track', desc: 'Quote submission & order tracking' },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#0A1629]">
          PLATFORM E | SME digital-presence and sourcing network
        </h1>
        <p className="text-xs md:text-sm text-[#475569] font-medium mt-2 leading-relaxed max-w-4xl">
          A business profile and structured catalogue can be paired with a website/storefront, buyer inquiries, RFQs, supplier discovery, and sometimes managed procurement support.
        </p>
      </div>

      {/* Options and features list */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-extrabold text-[#0A1629]">Options and features</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm text-[#334155]">
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Create company profile and digital business card</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Build product catalogue with specs, MOQ and certifications</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Share a hosted business website or storefront</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Appear in a supplier marketplace or partner ecosystem</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Receive and respond to buyer inquiries and RFQs</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Buyer tools may include supplier search, quote comparison and assisted sourcing</span>
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
