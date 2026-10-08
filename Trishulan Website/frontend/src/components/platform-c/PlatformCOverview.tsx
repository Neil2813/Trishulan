"use client";

import React from 'react';

export default function PlatformCOverview() {
  const steps = [
    { num: 1, title: 'Post requirement', desc: 'Size, material & destination' },
    { num: 2, title: 'Receive supplier leads', desc: 'Direct responses from sellers' },
    { num: 3, title: 'Ask clarifying questions', desc: 'Food-contact & print specs' },
    { num: 4, title: 'Compare landed quotes', desc: 'Freight & quantity pricing' },
    { num: 5, title: 'Choose supplier', desc: 'Finalize order agreement' },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#0A1629]">
          PLATFORM C | Indian B2B marketplace and trade-lead portal
        </h1>
        <p className="text-xs md:text-sm text-[#475569] font-medium mt-2 leading-relaxed max-w-4xl">
          A marketplace for supplier and product search in India, with buyer requirement posting, supplier inquiries, online product catalogues, trade leads and business services.
        </p>
      </div>

      {/* Options and features checklist */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-extrabold text-[#0A1629]">Options and features</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm text-[#334155]">
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Search products, services and Indian suppliers</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Post a buy requirement and receive supplier responses</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Contact multiple sellers before making a decision</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Supplier registration, company profile and product showroom</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Manage buyer inquiries in seller account</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#EA580C] font-bold">•</span>
            <span>Trade leads, distributor discovery, trade shows and add-on services</span>
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
