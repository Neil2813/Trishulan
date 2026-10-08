'use client';

import React, { useState, useEffect } from 'react';

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
      const res = await fetch('/api/business-services/packaging-requirements');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>PACKAGING REQUIREMENTS / ILLUSTRATIVE SCREEN</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Connecting to Express backend...)</span>}
        </h2>
        <span className="text-[11px] bg-slate-200/80 px-2.5 py-0.5 rounded text-slate-700 font-mono font-medium">
          Section 5 Support
        </span>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Section 5 Documentation */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[#0A1629]">5. Packing and packaging support</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Help businesses specify product packaging, find packaging suppliers and request packaging quotations. The platform can capture product fragility, dimensions, quantity, export route, stacking, moisture and regulatory needs.
          </p>
        </div>

        {/* Packaging Requirements Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold">
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
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-[#0A1629]">{row.packagingType || row.option}</td>
                    <td className="p-3.5 text-slate-700">{row.suitableFor || row.suitableUse}</td>
                    <td className="p-3.5 font-mono text-slate-700">{row.unitPrice || row.moqTiming}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => alert(`Buyer Action: Request Quote for ${row.packagingType || row.option}`)}
                        className="text-[#EA580C] hover:underline font-bold text-xs"
                      >
                        {row.buyerAction || 'Request Quote'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-500 border-t border-slate-200 italic">
            Illustrative packing data; packaging supplier terms, weight limits and certifications apply.
          </div>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">Example Spec Scenario:</p>
          <p className="italic leading-relaxed">
            "{disclaimer || 'Example: a buyer exporting CNC lathes checks packaging specs, requests ISPM 15 wooden crating quotes, and includes photos in the packing checklist before loading.'}"
          </p>
        </div>
      </div>
    </div>
  );
}
