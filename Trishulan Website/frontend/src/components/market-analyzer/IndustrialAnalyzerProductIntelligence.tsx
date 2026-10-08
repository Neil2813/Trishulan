'use client';

import React, { useState, useEffect } from 'react';

interface IndustrialAnalyzerData {
  query: string;
  demandIndex: string;
  supplierCount: number;
  priceChange: string;
  leadTime: string;
  quarterlyChart: Array<{ period: string; value: number }>;
  aiFindings: string[];
  calloutExample: string;
  lastUpdated: string;
  dataSource: string;
}

export default function IndustrialAnalyzerProductIntelligence() {
  const [searchQuery, setSearchQuery] = useState('Industrial Pump Components & Steel Raw Materials');
  const [data, setData] = useState<IndustrialAnalyzerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyzerMetrics = async (q: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/market/analyzer?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch industrial analyzer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyzerMetrics(searchQuery);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalyzerMetrics(searchQuery);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Top Illustrative Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>INDUSTRIAL ANALYZER / SAMPLE PRODUCT INTELLIGENCE</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Connecting to Express backend...)</span>}
        </h2>
        <span className="text-[11px] bg-slate-200/80 px-2.5 py-0.5 rounded text-slate-700 font-mono font-medium">
          Spec 1 View
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, grade, material, application, specification or HS code..."
            className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-[#0A1629] placeholder-slate-400 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-xs rounded-lg transition shadow disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Market'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              DEMAND INDEX
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A1629] mt-1 block">
              {data?.demandIndex || '78 / 100'}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              SUPPLIER COUNT
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A1629] mt-1 block">
              {data?.supplierCount ?? 146}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              PRICE CHANGE
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 block">
              {data?.priceChange || '+2.4%'}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              LEAD TIME
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1 block">
              {data?.leadTime || '3-5 weeks'}
            </span>
          </div>
        </div>

        {/* Chart & AI Findings Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chart Visual (2 cols) */}
          <div className="md:col-span-2 bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-[#0A1629] uppercase">Quarterly Demand & Volume Movement</span>
              <span className="text-[10px] text-slate-500 font-mono">{data?.dataSource}</span>
            </div>

            <div className="h-44 flex items-end gap-3 pt-6 border-b border-slate-200 pb-2">
              {(data?.quarterlyChart || [
                { period: 'Q1', value: 50 },
                { period: 'Q2', value: 65 },
                { period: 'Q3', value: 60 },
                { period: 'Q4', value: 68 },
                { period: 'Q1', value: 72 },
                { period: 'Q2', value: 78 },
              ]).map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    style={{ height: `${(bar.value / 100) * 100}%` }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">{bar.period}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 italic mt-3">
              Illustrative indicator only: define data source, period, market and formula before decisions.
            </p>
          </div>

          {/* AI Findings Panel (1 col) */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              AI findings
            </h3>

            <div className="space-y-3 text-xs">
              {(data?.aiFindings || [
                'Demand rising in target segment',
                'Compare 3 product grades',
                'Check regional certification',
                'Save search alert',
              ]).map((finding, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-700">
                  <span className="text-sky-600 font-bold">•</span>
                  <span className="font-medium">{finding}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">Example Spec Scenario:</p>
          <p className="italic leading-relaxed">
            "{data?.calloutExample || 'a buyer searching for industrial pump components reviews demand by region, sees supplier availability and likely lead times, saves a target market, then opens matched supplier profiles. All scores are illustrative until backed by real data sources.'}"
          </p>
        </div>

        {/* Detailed Spec Feature List */}
        <div className="text-xs text-slate-700 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="font-bold text-[#0A1629] mb-1">Industrial Analyzer Core Scope:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Search products by name, grade, material, application, specification or HS code.</li>
            <li>Show national and international market coverage, supplier counts, demand direction, indicative lead times and trade activity.</li>
            <li>Compare regions and product grades; separate manufacturers, distributors and service providers where information supports it.</li>
            <li>Create saved searches and alerts for new suppliers, buyer requirements, price movements or market activity.</li>
            <li>Display each metric definition, source type, coverage, date range and confidence.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
