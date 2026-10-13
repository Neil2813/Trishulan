"use client";

import React, { useState } from 'react';

export default function TradeIntelligenceSampleAnalysis() {
  const [product, setProduct] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchIntelligence = async (p: string, d: string) => {
    if (!p.trim() || !d.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/platform-d/intelligence?query=${encodeURIComponent(p)}&destination=${encodeURIComponent(d)}`);
      if (!res.ok) throw new Error('Trade intelligence is unavailable');
      const result = await res.json();
      setData(result.intelligence ?? result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIntelligence(product, destination);
  };

  return (
    <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow space-y-6">
      
      <div>
        <h2 className="text-xl font-black text-ink">
          Trade intelligence analysis and supplier benchmarking
        </h2>
      </div>

      {/* Trade intelligence search */}
      <div className="border border-line rounded-2xl overflow-hidden bg-card shadow-xs">
        
        {/* Header Bar */}
        <div className="bg-[#0A1629] text-white px-5 py-3.5 font-extrabold text-xs tracking-wider uppercase flex justify-between items-center">
          <span>TRADE INTELLIGENCE</span>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Filter Bar */}
          <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card p-4 rounded-xl border border-line shadow-2xs">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase mb-1">Product / HS code</label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-line rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted uppercase mb-1">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-line rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !product.trim() || !destination.trim()}
                className="w-full px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Analyzing…' : 'Analyze'}
              </button>
            </div>
          </form>

          {/* Chart & Indicators Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Quarterly Bar Chart */}
            <div className="lg:col-span-2 bg-card border border-line p-5 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex justify-between items-center text-xs font-bold text-muted">
                <span>Trade intelligence for {product || '—'} → {destination || '—'}</span>
                {data?.lastUpdated && <span className="text-muted font-bold">{new Date(data.lastUpdated).toLocaleString()}</span>}
              </div>

              <div className="h-44 flex items-center justify-center border-b border-line pb-2 text-center text-xs text-muted">
                {loading ? 'Loading trade intelligence…' : data ? 'Shipment trend data is not provided by the current data source.' : 'Enter a product and destination to search.'}
              </div>
            </div>

            <div className="bg-card border border-line p-5 rounded-2xl space-y-3 shadow-2xs">
              <h4 className="text-xs font-black text-ink uppercase tracking-wider border-b border-slate-100 pb-2">
                Key indicators
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-muted font-semibold">Supplier profiles</span>
                  <span className="font-extrabold text-ink">{loading ? '…' : (data?.supplierCount ?? '—')}</span>
                </div>
                <p className="text-[11px] text-muted">
                  {data?.dataSource || (data ? 'Data source not specified.' : 'No analysis has been requested.')}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
