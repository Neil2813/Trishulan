"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PlatformIntelligenceReport from '@/components/ui/platform-intelligence-report';
import IndustrialAnalyzerProductIntelligence from '@/components/market-analyzer/IndustrialAnalyzerProductIntelligence';
import AiMarketPriceAnalyzer from '@/components/market-analyzer/AiMarketPriceAnalyzer';

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
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1500px] mx-auto space-y-8">
        
        {/* Title Header */}
        {/* Title Header */}
        <div className="bg-card text-ink rounded-[24px] p-6 md:p-8 border border-line shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-[.16em]">PAGE 3 REFERENCE SPECIFICATION</span>
              <h1 className="text-[28px] md:text-[36px] font-black text-ink mt-1">Industrial Analyzer & Setup Feasibility</h1>
              <p className="text-[13.5px] text-[#64748B] font-medium mt-1 max-w-2xl">
                Comprehensive setup insights for new factories, machinery combinations, production workflows, investment tiers, and fraud risk alerts.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-gray-300 shadow-sm">
              <span className="text-xs text-muted font-bold">Industry Sector:</span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-card text-ink font-extrabold text-xs px-3 py-2 rounded-xl border border-line focus:outline-none"
              >
                <option value="Steel Manufacturing Industry">Steel Manufacturing Industry</option>
                <option value="Textile & Garment Machinery">Textile & Garment Machinery</option>
                <option value="Chemical & Polymer Processing">Chemical & Polymer Processing</option>
                <option value="Hydraulic & Heavy Spares">Hydraulic & Heavy Spares</option>
              </select>
            </div>
          </div>
        </div>

        {/* NEW REFERENCE SPECIFICATIONS: INDUSTRIAL ANALYZER & AI MARKET PRICE ANALYZER */}
        <div className="space-y-8">
          <IndustrialAnalyzerProductIntelligence />
          <AiMarketPriceAnalyzer />
        </div>

        {/* SECTION: B2B PLATFORM COMPETITIVE INTELLIGENCE MATRIX */}
        <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-[.14em]">REPORT BENCHMARK</span>
              <h2 className="text-[20px] font-black text-ink">B2B Platform Competitive Landscape Matrix</h2>
            </div>
            <span className="text-xs font-bold text-[#475569] bg-line/30 px-3 py-1.5 rounded-xl border border-line">
              Report Date: 30 September 2026
            </span>
          </div>

          <PlatformIntelligenceReport />
        </div>

        {/* SECTION: PROPOSED FEATURE EXPANSION BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-[24px] p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700">
          <div>
            <span className="text-[11px] font-extrabold text-accent uppercase tracking-wider block">
              NEXT-GEN PLATFORM EXTENSION
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white mt-1">
              Unified AI Search & Buyer RFQ Matching Workbench
            </h3>
            <p className="text-xs md:text-sm text-slate-300 font-medium mt-1 max-w-2xl">
              Natural language industrial search, AI match reasons, side-by-side quote comparison, and privacy-first WhatsApp lead sharing.
            </p>
          </div>

          <Link
            href="/rfq"
            className="px-6 py-3 bg-accent hover:bg-[#c2410a] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all shrink-0 whitespace-nowrap"
          >
            Launch RFQ Workbench →
          </Link>
        </div>

        {/* SECTION 1: MARKET LEVEL & FUTURE SCOPE */}
        <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">1</span>
            <h2 className="text-[20px] font-black text-ink">Market Level & Future Scope</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Trend chart visual */}
            <div className="md:col-span-2 bg-card text-ink rounded-2xl p-6 border border-line space-y-4 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-muted">
                <span>Market Size & Growth Trend (USD Billion)</span>
                <span className="text-green-600 font-bold">CAGR: +6.9% (2025-2030)</span>
              </div>

              <div className="h-36 flex items-end gap-4 pt-6 border-b border-line pb-2">
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
                      className="w-full bg-accent rounded-t transition-all hover:bg-[#c2410a]"
                    ></div>
                    <span className="text-[10px] text-muted font-mono font-semibold">{pt.year}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-card p-3 rounded-xl border border-line shadow-2xs">
                  <span className="text-[10px] text-muted block font-semibold">Current Market Level (2025)</span>
                  <span className="text-[20px] font-black text-ink">USD 165 Billion</span>
                  <span className="text-[10px] text-green-600 block font-bold">+6.8% vs 2024</span>
                </div>

                <div className="bg-card p-3 rounded-xl border border-line shadow-2xs">
                  <span className="text-[10px] text-muted block font-semibold">Future Scope (2030 Forecast)</span>
                  <span className="text-[20px] font-black text-accent">USD 230 Billion</span>
                  <span className="text-[10px] text-green-600 block font-bold">+6.9% CAGR (2025-2030)</span>
                </div>
              </div>
            </div>

            {/* Key Market Indicators */}
            <div className="bg-card border border-line rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-ink uppercase tracking-wider">Key Market Indicators</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-xs text-muted font-bold">Market Growth (CAGR)</span>
                  <span className="text-xs font-black text-green-600">6.9% (2025-2030)</span>
                </div>

                <div className="p-3 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-xs text-muted font-bold">Demand Trend</span>
                  <span className="text-xs font-black text-accent">Increasing</span>
                </div>

                <div className="p-3 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-xs text-muted font-bold">Market Size (2025)</span>
                  <span className="text-xs font-black text-ink">USD 165 Billion</span>
                </div>

                <div className="p-3 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-xs text-muted font-bold">Future Outlook</span>
                  <span className="text-xs font-black text-green-600">Positive</span>
                </div>
              </div>

              <p className="text-[11px] text-muted leading-relaxed">
                The steel industry is expected to show steady growth due to infrastructure, automotive, and construction demand in India.
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 2 & 3: INDUSTRIAL SETUP & PRODUCTION PROCESS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 2: Industrial Setup */}
          <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-[#0A1629] text-white flex items-center justify-center font-black text-xs">2</span>
              <h2 className="text-[20px] font-black text-ink">Industrial Setup Requirements</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-card rounded-xl border border-line">
                <span className="text-[10px] text-muted/70 font-bold block uppercase">Land Requirement</span>
                <span className="font-black text-ink text-sm">5 - 50 Acres</span>
                <span className="text-[10px] text-muted block">Depending on scale</span>
              </div>

              <div className="p-3.5 bg-card rounded-xl border border-line">
                <span className="text-[10px] text-muted/70 font-bold block uppercase">Power Grid Capacity</span>
                <span className="font-black text-ink text-sm">15 - 50 MW</span>
                <span className="text-[10px] text-muted block">Dedicated HT connection</span>
              </div>

              <div className="p-3.5 bg-card rounded-xl border border-line">
                <span className="text-[10px] text-muted/70 font-bold block uppercase">Labor Requirement</span>
                <span className="font-black text-ink text-sm">10 - 500 Workers</span>
                <span className="text-[10px] text-muted block">Skilled + Unskilled</span>
              </div>

              <div className="p-3.5 bg-card rounded-xl border border-line">
                <span className="text-[10px] text-muted/70 font-bold block uppercase">Logistics Access</span>
                <span className="font-black text-ink text-sm">NH Highway / Rail</span>
                <span className="text-[10px] text-muted block">Heavy freight access</span>
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
          <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-[#0A1629] text-white flex items-center justify-center font-black text-xs">3</span>
              <h2 className="text-[20px] font-black text-ink">Production Process (Step-by-Step)</h2>
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
                <div key={st.step} className="p-3 bg-card border border-line rounded-xl flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                    {st.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-ink">{st.title}</h4>
                    <p className="text-[11px] text-muted">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SECTION 4 & 5: VERIFIED SELLERS & 3 INDUSTRY SIZES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 4: Verified Sellers Table */}
          <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">4</span>
                <h2 className="text-[20px] font-black text-ink">Verified Sellers on Trishulan</h2>
              </div>
              <Link href="/dashboard" className="text-xs font-bold text-accent hover:underline">View All Sellers →</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line text-muted/70 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Product / Service</th>
                    <th className="py-2.5">Seller Name</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {verifiedSellers.map((s) => (
                    <tr key={s.id} className="hover:bg-card">
                      <td className="py-3 font-bold text-ink">{s.product}</td>
                      <td className="py-3 text-muted">{s.seller}</td>
                      <td className="py-3 text-muted">{s.location}</td>
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
          <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-[#0A1629] text-white flex items-center justify-center font-black text-xs">5</span>
              <h2 className="text-[20px] font-black text-ink">Three Industry Sizes & Investment</h2>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-ink">Small Scale Setup</span>
                  <span className="font-black text-accent text-sm">₹5 - 15 Crore</span>
                </div>
                <div className="text-xs text-muted mt-1">Land: 5-10 acres • Production: 85,000 - 25,000 MT/yr • Employees: 10-100</div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-ink">Medium Scale Setup</span>
                  <span className="font-black text-blue-700 text-sm">₹15 - 50 Crore</span>
                </div>
                <div className="text-xs text-muted mt-1">Land: 10-25 acres • Production: 25,000 - 75,000 MT/yr • Employees: 100-250</div>
              </div>

              <div className="p-4 rounded-xl bg-line/30 border border-line">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-ink">Large Scale Setup</span>
                  <span className="font-black text-ink text-sm">₹50 - 200+ Crore</span>
                </div>
                <div className="text-xs text-muted mt-1">Land: 25-100+ acres • Production: 75,000 - 500,000+ MT/yr • Employees: 250-1,000+</div>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 6 & 8 & 9: MACHINES, RISKS & SURVIVAL ANALYSIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Recommended Machine Combination */}
          <div className="bg-card rounded-[24px] border border-line p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">6</span>
              <h3 className="text-base font-black text-ink">Recommended Machines</h3>
            </div>
            <div className="space-y-2">
              {machineCombinations.map((m, idx) => (
                <div key={idx} className="p-3 bg-card rounded-xl border border-line text-xs">
                  <div className="font-bold text-ink">{m.name}</div>
                  <div className="flex justify-between text-[11px] text-muted mt-1">
                    <span>Cap: {m.capacity}</span>
                    <span className="font-bold text-accent">{m.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Risks & Fraud Alerts */}
          <div className="bg-card rounded-[24px] border border-line p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">8</span>
              <h3 className="text-base font-black text-ink">Industry Risks & Fraud Alerts</h3>
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
          <div className="bg-card rounded-[24px] border border-line p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">9</span>
              <h3 className="text-base font-black text-ink">Business Survival Analysis</h3>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 via-white to-amber-50 text-ink border border-line rounded-2xl text-center space-y-2 shadow-sm">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Estimated 5-Year Survival Rate</span>
              <div className="text-[34px] font-black text-green-600">78%</div>
              <span className="text-xs text-[#64748B] font-medium block">High demand in domestic infrastructure</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-card border border-line rounded-xl flex justify-between">
                <span className="text-muted font-semibold">Break-Even Timeline</span>
                <span className="font-bold text-ink">2.5 - 3.5 Years</span>
              </div>

              <div className="p-2.5 bg-card border border-line rounded-xl flex justify-between">
                <span className="text-muted font-semibold">Net Profit Margin</span>
                <span className="font-bold text-green-600">12.4% - 16.8%</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
