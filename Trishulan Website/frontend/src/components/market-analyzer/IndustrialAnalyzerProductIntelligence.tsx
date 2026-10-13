'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { safeJsonFetch } from '@/lib/utils';

interface IndustrialAnalyzerData {
  supplierCount: number;
}

export default function IndustrialAnalyzerProductIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<IndustrialAnalyzerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const searchSuppliers = async (q: string) => {
    try {
      setLoading(true);
      setError(null);
      const { ok, data: json, error: fetchErr } = await safeJsonFetch(`/api/platform-a/suppliers?query=${encodeURIComponent(q)}`);
      if (!ok || !json) throw new Error(fetchErr || 'Supplier data is unavailable');
      const suppliers = Array.isArray(json.suppliers) ? json.suppliers : [];
      setData({
        supplierCount: suppliers.filter((supplier: { badge?: string }) => supplier.badge === 'VERIFIED').length,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Supplier data is unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchSuppliers(searchQuery);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchSuppliers(searchQuery);
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

        <div className="bg-card/80 border border-line p-5 rounded-xl">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
            VERIFIED SUPPLIER LISTINGS
          </span>
          <span className="text-2xl font-extrabold text-ink mt-1 block">
            {loading ? '…' : data?.supplierCount ?? '—'}
          </span>
          <p className="text-xs text-muted mt-2">
            Product demand, price benchmarks, lead times, and setup estimates are not available from a verified source.
          </p>
        </div>

        <div className="text-xs text-slate-700 space-y-2 leading-relaxed bg-card p-4 rounded-xl border border-line">
          <p className="font-bold text-ink mb-1">Data availability</p>
          <p className="text-muted">
            Search results come from supplier listings currently stored on the platform. No market forecast or live price feed is connected.
          </p>
        </div>
      </div>
    </div>
  );
}
