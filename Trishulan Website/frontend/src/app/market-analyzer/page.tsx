"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import IndustrialAnalyzerProductIntelligence from '@/components/market-analyzer/IndustrialAnalyzerProductIntelligence';

export default function MarketAnalyzerPage() {
  const [verifiedSellers, setVerifiedSellers] = useState<Array<{
    id: string;
    product: string;
    seller: string;
    location: string;
  }>>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [suppliersError, setSuppliersError] = useState(false);

  useEffect(() => {
    async function loadVerifiedSuppliers() {
      try {
        const response = await fetch('/api/platform-a/suppliers');
        if (!response.ok) throw new Error(`Failed to load suppliers (${response.status})`);
        const result = await response.json();
        const suppliers: Array<{
          id: string;
          supplierId: string;
          badge: string;
          productTitle: string;
          category: string;
          name: string;
          location: string;
        }> = Array.isArray(result.suppliers) ? result.suppliers : [];
        setVerifiedSellers(suppliers
          .filter((supplier) => supplier.badge === 'VERIFIED')
          .map((supplier) => ({
            id: supplier.id,
            product: supplier.productTitle || supplier.category || '—',
            seller: supplier.name || '—',
            location: supplier.location || '—',
          })));
      } catch (err) {
        setSuppliersError(true);
        console.warn('Failed to load verified suppliers:', err);
      } finally {
        setSuppliersLoading(false);
      }
    }
    loadVerifiedSuppliers();
  }, []);

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
                Explore available supplier and market data. Setup estimates and industry forecasts are shown only when sourced data is available.
              </p>
            </div>
          </div>
        </div>

        {/* Supplier listings are available; market benchmarks require a verified data source. */}
        <div className="space-y-8">
          <IndustrialAnalyzerProductIntelligence />
          <p className="rounded-xl border border-line bg-card p-5 text-sm text-muted">
            Verified product price benchmarks are not available from a connected data source.
          </p>
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

          <p className="rounded-xl border border-line bg-card p-5 text-sm text-muted">
            Market size and growth figures are not available from a connected data source.
          </p>
        </div>

        {/* Verified supplier records and sourced industry data */}
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
                  {suppliersLoading && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted">Loading verified suppliers…</td></tr>
                  )}
                  {!suppliersLoading && verifiedSellers.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted">
                      {suppliersError ? 'Verified supplier data is temporarily unavailable.' : 'No verified suppliers are currently available.'}
                    </td></tr>
                  )}
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

          {/* Section 5: Industry investment data */}
          <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-[#0A1629] text-white flex items-center justify-center font-black text-xs">5</span>
              <h2 className="text-[20px] font-black text-ink">Industry Setup & Investment</h2>
            </div>

            <p className="rounded-xl border border-line bg-card p-4 text-sm text-muted">
              Setup and investment estimates are not available from a connected data source.
            </p>
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
            <p className="text-xs text-muted">Machine recommendations are not available for this industry.</p>
          </div>

          {/* Industry Risks & Fraud Alerts */}
          <div className="bg-card rounded-[24px] border border-line p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">8</span>
              <h3 className="text-base font-black text-ink">Industry Risks & Fraud Alerts</h3>
            </div>
            <p className="text-xs text-muted">Risk alert data is not available from a connected source.</p>
          </div>

          {/* Business Survival & Risk Analysis */}
          <div className="bg-card rounded-[24px] border border-line p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">9</span>
              <h3 className="text-base font-black text-ink">Business Survival Analysis</h3>
            </div>

            <p className="text-xs text-muted">Business survival estimates are not available from a connected data source.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
