'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { safeJsonFetch } from '@/lib/utils';

interface PackagingOption {
  option: string;
  suitableUse: string;
  moqTiming: string;
  buyerAction: string;
  actionType: string;
}

export default function PackagingRequirementsSupport() {
  const [options, setOptions] = useState<PackagingOption[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackagingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { ok, data: json, error: fetchErr } = await safeJsonFetch('/api/business-services/packaging-requirements');
      if (!ok || !json) throw new Error(fetchErr || 'Failed to load packaging requirements');
      setOptions(json.requirements || json.options || []);
      setDisclaimer(json.disclaimer || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch packaging requirements data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackagingData();
  }, []);

  return (
    <div className="bg-card border border-line rounded-xl overflow-hidden shadow text-ink max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-card px-6 py-3.5 border-b border-line flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-ink uppercase flex items-center gap-2">
          <span>PACKAGING REQUIREMENTS</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Loading...)</span>}
        </h2>
        <span className="text-[11px] bg-slate-200/80 px-2.5 py-0.5 rounded text-slate-700 font-mono font-medium">
          Packaging Standards
        </span>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 5 Documentation */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-ink">5. Packing and packaging support</h3>
          <p className="text-xs text-muted leading-relaxed">
            Help businesses specify product packaging, find packaging suppliers and request packaging quotations. The platform can capture product fragility, dimensions, quantity, export route, stacking, moisture and regulatory needs.
          </p>
        </div>

        {/* Packaging Requirements Table */}
        <div className="bg-card border border-line rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-card border-b border-line text-muted text-[10px] uppercase font-bold">
                  <th className="p-3.5">Option</th>
                  <th className="p-3.5">Suitable use</th>
                  <th className="p-3.5">MOQ / timing</th>
                  <th className="p-3.5">Buyer action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(options.length > 0
                  ? options
                  : [
                      { option: 'Export crate', suitableUse: 'Heavy machinery', moqTiming: '10 / 7 days', buyerAction: 'Request sample', actionType: 'SAMPLE' },
                      { option: 'Moisture barrier', suitableUse: 'Sea shipment', moqTiming: '100 / 5 days', buyerAction: 'Compare spec', actionType: 'SPEC' },
                      { option: 'Pallet + straps', suitableUse: 'Warehouse load', moqTiming: '20 / 3 days', buyerAction: 'Add to request', actionType: 'ADD' },
                      { option: 'Pack checklist', suitableUse: 'Photo evidence', moqTiming: 'Per shipment', buyerAction: 'Upload photos', actionType: 'UPLOAD' },
                    ]
                ).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-card transition">
                    <td className="p-3.5 font-bold text-ink">{row.packagingType || row.option}</td>
                    <td className="p-3.5 text-slate-700">{row.suitableFor || row.suitableUse}</td>
                    <td className="p-3.5 font-mono text-slate-700">{row.unitPrice || row.moqTiming}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => alert(`Buyer Action: Request Quote for ${row.packagingType || row.option}`)}
                        className="text-accent hover:underline font-bold text-xs"
                      >
                        {row.buyerAction || 'Request Quote'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-card px-4 py-2 text-[11px] text-muted border-t border-line italic">
            Indicative packing data; packaging supplier terms, weight limits and certifications apply.
          </div>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">How it works:</p>
          <p className="italic leading-relaxed">
            "{disclaimer || 'Example: a buyer exporting CNC lathes checks packaging specs, requests ISPM 15 wooden crating quotes, and includes photos in the packing checklist before loading.'}"
          </p>
        </div>
      </div>
    </div>
  );
}
