'use client';

import React, { useState, useEffect } from 'react';

interface MarketRow {
  market: string;
  indicativeRange: string;
  currencyUnit: string;
  updated: string;
  confidence: string;
  sourceType?: string;
  marketCoverage?: string;
}

interface PriceAnalyzerData {
  searchCriteria: {
    product: string;
    grade: string;
    thickness: string;
  };
  markets: MarketRow[];
  aiSummary: string;
  aiSummarySubtext: string;
  sourcesCallout: string;
  exampleCallout: string;
  trustControlNotice: string;
  lastUpdated: string;
  fxRates?: {
    usdInr: number;
    usdEur: number;
    source: string;
  };
}

export default function AiMarketPriceAnalyzer() {
  const [product, setProduct] = useState('stainless steel sheet 304');
  const [grade, setGrade] = useState('2B');
  const [thickness, setThickness] = useState('2 mm');
  const [data, setData] = useState<PriceAnalyzerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reporting anomaly state
  const [showReportForm, setShowReportForm] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('Price anomaly / Stale quote');
  const [reportComments, setReportComments] = useState<string>('');
  const [reportResult, setReportResult] = useState<any>(null);
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);

  const fetchPriceBenchmark = async (p: string, g: string, t: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/market/ai-price-analyzer?product=${encodeURIComponent(p)}&grade=${encodeURIComponent(g)}&thickness=${encodeURIComponent(t)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI price benchmark data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceBenchmark(product, grade, thickness);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPriceBenchmark(product, grade, thickness);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetch('/api/market/report-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: `${product}_${grade}_${thickness}`,
          reason: reportReason,
          userComments: reportComments,
        }),
      });
      const resData = await res.json();
      setReportResult(resData);
    } catch (err: any) {
      setReportResult({ error: err.message || 'Failed to submit report' });
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>AI MARKET PRICE ANALYZER / ILLUSTRATIVE</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Live Frankfurter FX & Yahoo Finance API)</span>}
        </h2>
        <span className="text-[11px] bg-slate-200/80 px-2.5 py-0.5 rounded text-slate-700 font-mono font-medium">
          Spec 2 View
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Product Criteria Bar */}
        <form onSubmit={handleFormSubmit} className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product</label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. stainless steel sheet 304"
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 2B or SS316"
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Thickness / Spec</label>
              <input
                type="text"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                placeholder="e.g. 2 mm"
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
            <div className="text-[11px] text-slate-600 font-mono">
              Product: <span className="text-[#0A1629] font-bold">{product}</span> | Grade: <span className="text-[#0A1629] font-bold">{grade}</span> | Thickness: <span className="text-[#0A1629] font-bold">{thickness}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
            >
              {loading ? 'Fetching Benchmark...' : 'Fetch Live Market Prices'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Live Market Price Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="p-3.5 font-bold">Market</th>
                <th className="p-3.5 font-bold">Indicative range</th>
                <th className="p-3.5 font-bold">Currency / unit</th>
                <th className="p-3.5 font-bold">Updated</th>
                <th className="p-3.5 font-bold">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(data?.markets || [
                { market: 'National - India', indicativeRange: 'INR 210-238', currencyUnit: 'per kg', updated: 'Today, 09:00', confidence: 'Medium' },
                { market: 'International - East Asia', indicativeRange: 'USD 2.42-2.76', currencyUnit: 'per kg', updated: 'Today, 08:30', confidence: 'Medium' },
                { market: 'International - Europe', indicativeRange: 'EUR 2.35-2.69', currencyUnit: 'per kg', updated: 'Yesterday', confidence: 'Low' },
              ]).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-[#0A1629]">{row.market}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700">{row.indicativeRange}</td>
                  <td className="p-3.5 text-slate-700 font-medium">{row.currencyUnit}</td>
                  <td className="p-3.5 text-slate-500">{row.updated}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      row.confidence === 'High'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : row.confidence === 'Medium'
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {row.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Summary Box */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
          <p className="text-xs font-bold text-[#0A1629]">
            <span className="text-emerald-700">AI summary: </span>
            {data?.aiSummary || 'national benchmark is stable; international ranges differ by delivery basis and currency.'}
          </p>
          <p className="text-[11px] text-slate-600 italic">
            {data?.aiSummarySubtext || 'Compare grade, tax, freight, incoterms, quantity and payment terms before treating quotes as equivalent.'}
          </p>
        </div>

        {/* Sources Callout Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
          <p className="leading-relaxed">
            {data?.sourcesCallout || 'Sources: supplier quotes, published indices, trade records and user-submitted offers. Display source, timestamp, market coverage and confidence beside every estimate.'}
          </p>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">Example Spec Scenario:</p>
          <p className="italic leading-relaxed">
            "{data?.exampleCallout || 'Example: a user searches "SS316 sheet, 2 mm, 2B finish." The analyzer shows separate India, East Asia and Europe ranges, with currencies, unit, timestamp and source labels. AI explains that the numbers are not directly comparable until grade, tax, freight, quantity and delivery basis match. The sample values in the drawing are fictional.'}"
          </p>
        </div>

        {/* Price Data Controls and Trust Labels */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#0A1629] uppercase">Price Data Controls & Trust Labels</h3>
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 transition"
            >
              🚩 Report Incorrect Listing / Anomaly
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data?.trustControlNotice || 'A daily price panel needs a dependable feed strategy. It should label delayed data, stale data, low sample counts and model estimates. It should never present an AI-generated number as an official market price. Keep source attribution, timestamp, currency conversion time and user-submitted quote status visible. Provide a way to report an incorrect listing and a record of the assumptions used in each comparison.'}
          </p>

          {/* Anomaly Form Drawer */}
          {showReportForm && (
            <form onSubmit={handleReportSubmit} className="mt-4 p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-rose-700">Report Listing or Price Anomaly</h4>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-[#0A1629]"
                >
                  <option value="Price anomaly / Stale quote">Price anomaly / Stale quote</option>
                  <option value="Incorrect unit or currency conversion">Incorrect unit or currency conversion</option>
                  <option value="Unrealistic supplier quote">Unrealistic supplier quote</option>
                  <option value="Missing specification matching">Missing specification matching</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Comments / Audit Notes</label>
                <textarea
                  rows={2}
                  value={reportComments}
                  onChange={(e) => setReportComments(e.target.value)}
                  placeholder="Describe why this market price or listing seems inaccurate..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-[#0A1629]"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReport}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
              >
                {submittingReport ? 'Submitting Flag...' : 'Submit Audit Report'}
              </button>
            </form>
          )}

          {reportResult && (
            <div className={`p-3 rounded-lg text-xs font-mono border ${reportResult.error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
              {reportResult.error ? `⚠️ ${reportResult.error}` : `✓ ${reportResult.message} (Report ID: ${reportResult.report?.reportId})`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
