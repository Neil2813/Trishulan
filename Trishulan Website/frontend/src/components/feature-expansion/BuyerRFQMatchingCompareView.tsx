"use client";

import React, { useState, useEffect } from 'react';

export default function BuyerRFQMatchingCompareView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [clarificationText, setClarificationText] = useState('');
  const [clarificationSent, setClarificationSent] = useState(false);

  useEffect(() => {
    async function loadMatch() {
      try {
        const res = await fetch('/api/discovery/match');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch RFQ matching compare view:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, []);

  const topNeedSummary = data?.topNeedSummary?.rawString || 'Need: SS304 M12 hex bolts | 5,000 pcs | Chennai | delivery within 30 days';
  const comparisonRows = data?.comparisonRows || [];

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      <div>
        <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">FEATURE EXPANSION MODULE 2</span>
        <h2 className="text-xl md:text-2xl font-black text-[#0A1629] mt-0.5">
          Buyer RFQ matching and side-by-side compare view
        </h2>
        <p className="text-xs md:text-sm text-[#475569] font-medium mt-1 leading-relaxed max-w-4xl">
          Side-by-side quote comparison aligning currency, tax, freight, Incoterms, payment terms, validity, MOQ, and delivery window into common fields.
        </p>
      </div>

      {/* Screen Mockup Container */}
      <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 shadow-xs">
        
        {/* Dark Banner Header */}
        <div className="bg-[#0A1629] text-white px-5 py-3.5 font-extrabold text-xs tracking-wider uppercase flex justify-between items-center">
          <span>BUYER RFQ MATCHING / ILLUSTRATIVE COMPARE VIEW</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
            Express DB Connected
          </span>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Top Need Summary Header Bar */}
          <div className="p-3 bg-[#0A1629] text-white rounded-xl text-xs font-bold font-mono">
            {topNeedSummary}
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1D4ED8] text-white font-extrabold uppercase text-[11px]">
                  <th className="p-3.5">Supplier</th>
                  <th className="p-3.5">Match reason</th>
                  <th className="p-3.5">MOQ / ETA</th>
                  <th className="p-3.5">Quote status</th>
                  <th className="p-3.5">Unit Price / Incoterms</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs font-bold text-slate-400 animate-pulse">
                      Fetching live supplier quotes from Express backend...
                    </td>
                  </tr>
                ) : (
                  comparisonRows.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-[#0A1629]">{r.supplierName}</td>
                      <td className="p-3.5 text-blue-700 font-semibold">{r.matchReason}</td>
                      <td className="p-3.5 font-mono">{r.moqEta}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded font-extrabold text-[10px] ${
                          r.quoteStatus === 'Quote received' ? 'bg-green-100 text-green-800' :
                          r.quoteStatus === 'Clarification' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {r.quoteStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#0A1629] block">{r.unitPrice}</span>
                        <span className="text-[10px] text-slate-400">{r.incoterms} • {r.freight}</span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => {
                            setSelectedSupplier(r.supplierName);
                            setClarificationText(`Clarification for ${r.supplierName}: Can you confirm test certificate inclusion for ${r.moqEta}?`);
                          }}
                          className="px-3 py-1.5 bg-[#0A1629] hover:bg-[#1E293B] text-white font-bold text-[10px] rounded-lg shadow-2xs"
                        >
                          Select / Clarify
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 font-medium italic">
            Buyer can compare price, payment, freight, certifications and response completeness on one RFQ thread.
          </p>

        </div>
      </div>

      {/* Example Use Callout Box */}
      <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
        <p className="text-xs md:text-sm text-[#166534] font-medium leading-relaxed">
          <strong className="font-black text-[#14532D]">Example:</strong> A buyer posts one RFQ and receives three quote responses. The compare view explains why each supplier matched and places price, MOQ, delivery, documentation and freight into the same format. The buyer asks one clarification in the shared thread, then requests a transport quote after selecting the supplier.
        </p>
      </div>

      {/* Clarification Drawer / Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative animate-[fadeIn_0.15s_ease]">
            <button
              onClick={() => setSelectedSupplier(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-sm w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
            >
              ✕
            </button>

            <span className="text-[10px] font-extrabold text-[#EA580C] uppercase tracking-wider block">SHARED RFQ WORKSPACE</span>
            <h3 className="text-lg font-black text-[#0A1629] mt-0.5">
              RFQ Thread: {selectedSupplier}
            </h3>

            {clarificationSent ? (
              <div className="my-6 p-4 bg-green-50 border border-green-200 text-green-900 rounded-xl text-center text-xs font-bold">
                ✓ Clarification question sent directly to supplier on Express RFQ thread!
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ask Clarification / Next Steps:</label>
                  <textarea
                    rows={3}
                    value={clarificationText}
                    onChange={(e) => setClarificationText(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8]"
                  ></textarea>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      setClarificationSent(true);
                      setTimeout(() => {
                        setClarificationSent(false);
                        setSelectedSupplier(null);
                      }, 1800);
                    }}
                    className="px-4 py-2 bg-[#00A896] hover:bg-[#008073] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Request Transport Quote
                  </button>

                  <button
                    onClick={() => {
                      setClarificationSent(true);
                      setTimeout(() => {
                        setClarificationSent(false);
                        setSelectedSupplier(null);
                      }, 1800);
                    }}
                    className="px-5 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Send Clarification
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
