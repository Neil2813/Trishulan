"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MarketAnalyzerPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('Steel Manufacturing Industry');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalyzer() {
      try {
        const res = await fetch('/api/market');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalyzer();
  }, []);

  const verifiedSellers = [
    { id: 1, product: 'Steel Making Machine', seller: 'Alpha Machinery Pvt Ltd', location: 'Mumbai, MH', status: 'VERIFIED' },
    { id: 2, product: 'Raw Material (Iron Ore)', seller: 'Global Minerals Ltd', location: 'Nagpur, MH', status: 'VERIFIED' },
    { id: 3, product: 'Induction Furnace', seller: 'Shree Tech Equipments', location: 'Ahmedabad, GJ', status: 'VERIFIED' },
    { id: 4, product: 'Rolling Mill', seller: 'Precision Engineers', location: 'Jamshedpur, JH', status: 'VERIFIED' },
    { id: 5, product: 'Packaging Material', seller: 'PackTech Solutions', location: 'Pune, MH', status: 'VERIFIED' },
  ];

  const machineCombinations = [
    { name: 'Raw Material Handling', capacity: '50-500 TPH', price: '₹45 - 80 Lakhs' },
    { name: 'Sinter Plant / Crusher', capacity: '100-300 TPH', price: '₹1.2 - 2.5 Cr' },
    { name: 'Blast Furnace / EAF', capacity: '50-200 TPD', price: '₹3.5 - 8.0 Cr' },
    { name: 'Continuous Casting Machine', capacity: '50-150 TPD', price: '₹2.8 - 5.5 Cr' },
    { name: 'Cold Rolling Mill', capacity: '50-200 TPD', price: '₹4.0 - 9.0 Cr' },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 px-4 sm:px-6">
      <div className="max-w-[1500px] mx-auto space-y-8">
        
        {/* Title Header */}
        {/* Title Header */}
        <div className="bg-gradient-to-r from-orange-50/90 via-white to-amber-50/80 text-[#0A1629] rounded-[24px] p-6 md:p-8 border-2 border-orange-200 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#EA580C]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-[.16em]">PAGE 3 REFERENCE SPECIFICATION</span>
              <h1 className="text-[28px] md:text-[36px] font-black text-[#0A1629] mt-1">Industrial Analyzer & Setup Feasibility</h1>
              <p className="text-[13.5px] text-[#64748B] font-medium mt-1 max-w-2xl">
                Comprehensive setup insights for new factories, machinery combinations, production workflows, investment tiers, and fraud risk alerts.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-300 shadow-sm">
              <span className="text-xs text-gray-600 font-bold">Industry Sector:</span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-gray-50 text-[#0A1629] font-extrabold text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none"
              >
                <option value="Steel Manufacturing Industry">Steel Manufacturing Industry</option>
                <option value="Textile & Garment Machinery">Textile & Garment Machinery</option>
                <option value="Chemical & Polymer Processing">Chemical & Polymer Processing</option>
                <option value="Hydraulic & Heavy Spares">Hydraulic & Heavy Spares</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 1: MARKET LEVEL & FUTURE SCOPE */}
        <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-7 h-7 rounded-lg bg-[#EA580C] text-white flex items-center justify-center font-black text-xs">1</span>
            <h2 className="text-[20px] font-black text-[#0A1629]">Market Level & Future Scope</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Trend chart visual */}
            <div className="md:col-span-2 bg-slate-50 text-[#0A1629] rounded-2xl p-6 border border-gray-200 space-y-4 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span>Market Size & Growth Trend (USD Billion)</span>
                <span className="text-green-600 font-bold">CAGR: +6.9% (2025-2030)</span>
              </div>

              <div className="h-36 flex items-end gap-4 pt-6 border-b border-gray-200 pb-2">
                {[
                  { year: '2021', val: 130 },
                  { year: '2022', val: 142 },
                  { year: '2023', val: 151 },
                  { year: '2024', val: 158 },
                  { year: '2025', val: 165 },
                  { year: '2027', val: 190 },
                  { year: '2030', val: 230 },
                ].map((pt, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      style={{ height: `${(pt.val / 250) * 100}%` }}
                      className="w-full bg-[#EA580C] rounded-t transition-all hover:bg-[#c2410a]"
                    ></div>
                    <span className="text-[10px] text-gray-500 font-mono font-semibold">{pt.year}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-[10px] text-gray-500 block font-semibold">Current Market Level (2025)</span>
                  <span className="text-[20px] font-black text-[#0A1629]">USD 165 Billion</span>
                  <span className="text-[10px] text-green-600 block font-bold">+6.8% vs 2024</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-[10px] text-gray-500 block font-semibold">Future Scope (2030 Forecast)</span>
                  <span className="text-[20px] font-black text-[#EA580C]">USD 230 Billion</span>
                  <span className="text-[10px] text-green-600 block font-bold">+6.9% CAGR (2025-2030)</span>
                </div>
              </div>
            </div>

            {/* Key Market Indicators */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-[#0A1629] uppercase tracking-wider">Key Market Indicators</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-600 font-bold">Market Growth (CAGR)</span>
                  <span className="text-xs font-black text-green-600">6.9% (2025-2030)</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-600 font-bold">Demand Trend</span>
                  <span className="text-xs font-black text-[#EA580C]">Increasing</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-600 font-bold">Market Size (2025)</span>
                  <span className="text-xs font-black text-[#0A1629]">USD 165 Billion</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-600 font-bold">Future Outlook</span>
                  <span className="text-xs font-black text-green-600">Positive</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">
                The steel industry is expected to show steady growth due to infrastructure, automotive, and construction demand in India.
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 2 & 3: INDUSTRIAL SETUP & PRODUCTION PROCESS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 2: Industrial Setup */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-[#0A1629] text-white flex items-center justify-center font-black text-xs">2</span>
              <h2 className="text-[20px] font-black text-[#0A1629]">Industrial Setup Requirements</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Land Requirement</span>
                <span className="font-black text-[#0A1629] text-sm">5 - 50 Acres</span>
                <span className="text-[10px] text-gray-500 block">Depending on scale</span>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Power Grid Capacity</span>
                <span className="font-black text-[#0A1629] text-sm">15 - 50 MW</span>
                <span className="text-[10px] text-gray-500 block">Dedicated HT connection</span>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Labor Requirement</span>
                <span className="font-black text-[#0A1629] text-sm">10 - 500 Workers</span>
                <span className="text-[10px] text-gray-500 block">Skilled + Unskilled</span>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Logistics Access</span>
                <span className="font-black text-[#0A1629] text-sm">NH Highway / Rail</span>
                <span className="text-[10px] text-gray-500 block">Heavy freight access</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-gray-700 block mb-2">Mandatory Licenses & Registrations:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">✓ Pollution Control (CPCB/SPCB)</span>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">✓ GST Registration</span>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">✓ MSME / Udyam</span>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">✓ Factory License</span>
              </div>
            </div>
          </div>

          {/* Section 3: Step-by-Step Production Process */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-[#0A1629] text-white flex items-center justify-center font-black text-xs">3</span>
              <h2 className="text-[20px] font-black text-[#0A1629]">Production Process (Step-by-Step)</h2>
            </div>

            <div className="space-y-2">
              {[
                { step: 1, title: 'Raw Material Processing', desc: 'Iron ore crushing, coal handling & flux mixing.' },
                { step: 2, title: 'Preparation & Sintering', desc: 'Blending raw materials into sintering furnace.' },
                { step: 3, title: 'Smelting & Blast Furnace', desc: 'Converting iron ore into molten liquid pig iron.' },
                { step: 4, title: 'Refining & Ladle Furnace', desc: 'Removal of impurities & alloying addition.' },
                { step: 5, title: 'Casting & Continuous Billet', desc: 'Solidifying molten steel into billets/slabs.' },
                { step: 6, title: 'Hot / Cold Rolling', desc: 'Shaping billets into TMT rebar, wire rods, or coils.' },
                { step: 7, title: 'Packaging & Dispatch', desc: 'Quality bundle tagging, weighbridge & dispatch.' },
              ].map((st) => (
                <div key={st.step} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                    {st.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-[#0A1629]">{st.title}</h4>
                    <p className="text-[11px] text-gray-500">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SECTION 4 & 5: VERIFIED SELLERS & 3 INDUSTRY SIZES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 4: Verified Sellers Table */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#EA580C] text-white flex items-center justify-center font-black text-xs">4</span>
                <h2 className="text-[20px] font-black text-[#0A1629]">Verified Sellers on Trishulan</h2>
              </div>
              <Link href="/dashboard" className="text-xs font-bold text-[#EA580C] hover:underline">View All Sellers →</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Product / Service</th>
                    <th className="py-2.5">Seller Name</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {verifiedSellers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-3 font-bold text-[#0A1629]">{s.product}</td>
                      <td className="py-3 text-gray-600">{s.seller}</td>
                      <td className="py-3 text-gray-500">{s.location}</td>
                      <td className="py-3">
                        <Link href="/dashboard" className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg font-bold text-[10px]">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Three Industry Sizes & Estimated Investment */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-[#0A1629] text-white flex items-center justify-center font-black text-xs">5</span>
              <h2 className="text-[20px] font-black text-[#0A1629]">Three Industry Sizes & Investment</h2>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-[#0A1629]">Small Scale Setup</span>
                  <span className="font-black text-[#EA580C] text-sm">₹5 - 15 Crore</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">Land: 5-10 acres • Production: 85,000 - 25,000 MT/yr • Employees: 10-100</div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-[#0A1629]">Medium Scale Setup</span>
                  <span className="font-black text-blue-700 text-sm">₹15 - 50 Crore</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">Land: 10-25 acres • Production: 25,000 - 75,000 MT/yr • Employees: 100-250</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-[#0A1629]">Large Scale Setup</span>
                  <span className="font-black text-[#0A1629] text-sm">₹50 - 200+ Crore</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">Land: 25-100+ acres • Production: 75,000 - 500,000+ MT/yr • Employees: 250-1,000+</div>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 6 & 8 & 9: MACHINES, RISKS & SURVIVAL ANALYSIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Recommended Machine Combination */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-[#EA580C] text-white flex items-center justify-center font-black text-xs">6</span>
              <h3 className="text-base font-black text-[#0A1629]">Recommended Machines</h3>
            </div>
            <div className="space-y-2">
              {machineCombinations.map((m, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <div className="font-bold text-[#0A1629]">{m.name}</div>
                  <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                    <span>Cap: {m.capacity}</span>
                    <span className="font-bold text-[#EA580C]">{m.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Risks & Fraud Alerts */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">8</span>
              <h3 className="text-base font-black text-[#0A1629]">Industry Risks & Fraud Alerts</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl">
                <span className="font-bold block">Operational Risk: Raw Material Fluctuation</span>
                <span className="text-[11px] text-red-700">Iron ore & coking coal price volatility can affect 20% margin.</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
                <span className="font-bold block">Commercial Risk: Credit Terms</span>
                <span className="text-[11px] text-amber-800">Use Trishulan Escrow Payment to prevent un-collectible buyer debts.</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl">
                <span className="font-bold block">Compliance Risk: Tax Filings</span>
                <span className="text-[11px] text-blue-800">Always verify supplier GSTIN status prior to advance payments.</span>
              </div>
            </div>
          </div>

          {/* Business Survival & Risk Analysis */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-[#EA580C] text-white flex items-center justify-center font-black text-xs">9</span>
              <h3 className="text-base font-black text-[#0A1629]">Business Survival Analysis</h3>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 via-white to-amber-50 text-[#0A1629] border-2 border-orange-200 rounded-2xl text-center space-y-2 shadow-sm">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Estimated 5-Year Survival Rate</span>
              <div className="text-[34px] font-black text-green-600">78%</div>
              <span className="text-xs text-[#64748B] font-medium block">High demand in domestic infrastructure</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex justify-between">
                <span className="text-gray-600 font-semibold">Break-Even Timeline</span>
                <span className="font-bold text-[#0A1629]">2.5 - 3.5 Years</span>
              </div>

              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex justify-between">
                <span className="text-gray-600 font-semibold">Net Profit Margin</span>
                <span className="font-bold text-green-600">12.4% - 16.8%</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
