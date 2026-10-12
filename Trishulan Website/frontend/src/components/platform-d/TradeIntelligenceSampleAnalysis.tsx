"use client";

import React, { useState, useEffect } from 'react';

export default function TradeIntelligenceSampleAnalysis() {
  const [product, setProduct] = useState('Pump components');
  const [destination, setDestination] = useState('United Arab Emirates');
  const [period, setPeriod] = useState('Last 12 months');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchIntelligence = async (p: string, d: string, per: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform-d/intelligence?query=${encodeURIComponent(p)}&destination=${encodeURIComponent(d)}&period=${encodeURIComponent(per)}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch trade intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence(product, destination, period);
  }, []);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIntelligence(product, destination, period);
  };

  const quarterlyTrend = data?.quarterlyTrend || [
    { period: 'Q1', count: 32 },
    { period: 'Q2', count: 44 },
    { period: 'Q3', count: 40 },
    { period: 'Q4', count: 56 },
    { period: 'Q1 (New)', count: 62 },
    { period: 'Q2 (New)', count: 70 },
    { period: 'Q3 (New)', count: 60 },
    { period: 'Q4 (New)', count: 85 },
  ];

  const maxVal = Math.max(...quarterlyTrend.map((q: any) => q.count), 100);

  return (
    <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow space-y-6">
      
      <div>
        <span className="text-[11px] font-bold text-accent uppercase tracking-wider">LIVE INTERACTIVE WORKSPACE</span>
        <h2 className="text-xl font-black text-ink mt-0.5">
          Trade intelligence analysis and supplier benchmarking
        </h2>
      </div>

      {/* Screen Mockup Container */}
      <div className="border border-line rounded-2xl overflow-hidden bg-card shadow-xs">
        
        {/* Dark Banner Header */}
        <div className="bg-[#0A1629] text-white px-5 py-3.5 font-extrabold text-xs tracking-wider uppercase flex justify-between items-center">
          <span>TRADE INTELLIGENCE / SAMPLE ANALYSIS</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
            Express API Connected
          </span>
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

            <div>
              <label className="block text-[11px] font-bold text-muted uppercase mb-1">Period</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="flex-1 px-3 py-2 bg-card border border-line rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-[#1D4ED8]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Analyze
                </button>
              </div>
            </div>
          </form>

          {/* Chart & Indicators Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Quarterly Bar Chart */}
            <div className="lg:col-span-2 bg-card border border-line p-5 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex justify-between items-center text-xs font-bold text-muted">
                <span>Shipment Volume Trend ({product} → {destination})</span>
                <span className="text-green-600 font-bold">Active Customs Activity</span>
              </div>

              <div className="h-44 flex items-end gap-2 md:gap-4 pt-6 border-b border-line pb-2">
                {quarterlyTrend.map((q: any, idx: number) => {
                  const heightPercent = Math.min((q.count / maxVal) * 100, 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] font-bold text-muted/70 group-hover:text-[#1D4ED8]">
                        {q.count}
                      </span>
                      <div className="w-full bg-line/30 rounded-t h-32 flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-t transition-all cursor-pointer shadow-xs"
                          title={`${q.period}: ${q.count} shipments`}
                        ></div>
                      </div>
                      <span className="text-[10px] text-muted font-mono font-semibold">
                        {q.period}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sample Indicators */}
            <div className="bg-card border border-line p-5 rounded-2xl space-y-3 shadow-2xs">
              <h4 className="text-xs font-black text-ink uppercase tracking-wider border-b border-slate-100 pb-2">
                Key indicators
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-muted font-semibold">• shipment count</span>
                  <span className="font-extrabold text-ink">
                    {loading ? '...' : (data?.indicators?.shipmentCount || '142 Shipments')}
                  </span>
                </div>

                <div className="p-2.5 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-muted font-semibold">• supplier count</span>
                  <span className="font-extrabold text-ink">
                    {loading ? '...' : (data?.indicators?.supplierCount || '28 Exporters')}
                  </span>
                </div>

                <div className="p-2.5 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-muted font-semibold">• average declared value</span>
                  <span className="font-extrabold text-green-600">
                    {loading ? '...' : (data?.indicators?.avgDeclaredValue || '$48,500')}
                  </span>
                </div>

                <div className="p-2.5 bg-card rounded-xl border border-line flex justify-between items-center">
                  <span className="text-muted font-semibold">• repeat buyer trend</span>
                  <span className="font-extrabold text-accent">
                    {loading ? '...' : (data?.indicators?.repeatBuyerTrend || '+14.2% Growth')}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Example Use Callout Box */}
      <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
        <p className="text-xs md:text-sm text-[#166534] font-medium leading-relaxed">
          <strong className="font-black text-[#14532D]">Example use:</strong> A pump exporter identifies a target country, searches pump-related product codes and shipment activity, checks repeat importers and supplier relationships, then validates prospects independently before outreach.
        </p>
      </div>

    </div>
  );
}
