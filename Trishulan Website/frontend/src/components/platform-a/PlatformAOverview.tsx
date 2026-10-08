"use client";

import React from 'react';

export default function PlatformAOverview() {
  const steps = [
    { num: 1, title: 'Search', desc: 'Item, supplier or location' },
    { num: 2, title: 'Compare profiles', desc: 'MOQ, price & certs' },
    { num: 3, title: 'Send inquiry', desc: 'Direct to 1 or multi-sellers' },
    { num: 4, title: 'Shortlist', desc: 'Evaluate responses' },
    { num: 5, title: 'Verify before order', desc: 'GST & doc verification' },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      {/* Platform Title & Description */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#0A1629]">
          PLATFORM A | Indian supplier discovery marketplace
        </h1>
        <p className="text-xs md:text-sm text-[#475569] font-medium mt-2 leading-relaxed max-w-4xl">
          Search supplier listings, inspect business profiles and product catalogues, send inquiries, or post a buying requirement.
          Suppliers can create a company listing, upload products, manage inquiries and purchase optional visibility services.
        </p>
      </div>

      {/* Options and features checklist */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-extrabold text-[#0A1629]">Options and features</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm text-[#334155]">
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Search by item, supplier or location</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Compare descriptions, price indications, MOQ and contact options</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Send an inquiry to one or more suppliers</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Post buyer requirement and receive responses</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Seller profile, photos, product range and inquiry management</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Optional enhanced visibility or verification services may be offered</span>
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
