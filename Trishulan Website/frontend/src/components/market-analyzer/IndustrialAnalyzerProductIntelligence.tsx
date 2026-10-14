'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface IndustrialAnalyzerProductIntelligenceProps {
  onSearch: (query: string) => void;
  loading: boolean;
  error?: string | null;
  hasSearched: boolean;
  supplierCount: number;
}

export default function IndustrialAnalyzerProductIntelligence({
  onSearch,
  loading,
  error,
  hasSearched,
  supplierCount,
}: IndustrialAnalyzerProductIntelligenceProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-card border border-line rounded-xl overflow-hidden shadow text-ink max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-card px-6 py-3.5 border-b border-line flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-ink uppercase flex items-center gap-2">
          <span>SUPPLIER SEARCH</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Loading supplier directory...)</span>}
        </h2>
        <span className="text-[11px] bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded font-semibold">
          Supplier data
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified suppliers by product, seller, or category..."
            className="flex-1 bg-card border border-line rounded-lg px-4 py-2.5 text-xs text-ink placeholder-slate-400 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-accent hover:bg-[#c2410a] text-white font-bold text-xs rounded-lg transition shadow disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Suppliers'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {hasSearched && (
          <div className="bg-card/80 border border-line p-5 rounded-xl">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
              VERIFIED SUPPLIER LISTINGS
            </span>
            <span className="text-2xl font-extrabold text-ink mt-1 block">
              {loading ? '…' : supplierCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
