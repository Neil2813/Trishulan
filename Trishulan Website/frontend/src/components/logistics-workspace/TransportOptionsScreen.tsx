'use client';

import React, { useState, useEffect } from 'react';

interface TransportQuoteItem {
  id: string;
  provider: string;
  route: string;
  estimatedPrice: string;
  status: string;
  statusType: string;
}

export default function TransportOptionsScreen() {
  const [quotes, setQuotes] = useState<TransportQuoteItem[]>([]);
  const [exampleText, setExampleText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/business-services/transport-quotes');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setQuotes(json.transportQuotes || json.quotes || []);
      setExampleText(json.exampleText || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transport options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>TRANSPORT OPTIONS / ILLUSTRATIVE SCREEN</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Connecting to Express backend...)</span>}
        </h2>
        <span className="text-[11px] bg-slate-200/80 px-2.5 py-0.5 rounded text-slate-700 font-mono font-medium">
          Rate Comparison
        </span>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Transport Options Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold">
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Route / service</th>
                  <th className="p-3.5">Estimate</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(quotes.length > 0
                  ? quotes
                  : [
                      { id: '1', provider: 'VRL Logistics Express', route: 'Pune to Chennai / FTL Road', estimatedPrice: '₹48,500', status: 'Quote received', statusType: 'RECEIVED' },
                      { id: '2', provider: 'TCI Freight Services', route: 'Pune to Chennai / PTL Road', estimatedPrice: '₹22,000', status: '2-day transit', statusType: 'TRANSIT' },
                      { id: '3', provider: 'Safexpress Cargo', route: 'Pune to Chennai / Rail Air-Ride', estimatedPrice: '₹62,000', status: 'Capacity check', statusType: 'CAPACITY' },
                    ]
                ).map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-[#0A1629]">{row.carrierName || row.provider}</td>
                    <td className="p-3.5 text-slate-700">{row.mode || row.route}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">{row.rateQuote || row.estimatedPrice}</td>
                    <td className="p-3.5 text-slate-600 font-medium">{row.vehicleType || row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-500 border-t border-slate-200 italic">
            Illustrative quotes; verify cargo dimensions, insurance, exclusions and final charges.
          </div>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">Example Spec Scenario:</p>
          <p className="italic leading-relaxed">
            "{exampleText || 'Example: a user requesting 10 tons of steel plate transport compares rates from verified carriers, checks insurance coverage, and selects door-to-door delivery with tracking.'}"
          </p>
        </div>
      </div>
    </div>
  );
}
