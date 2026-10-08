"use client";

import React, { useState, useEffect } from 'react';

export interface SMESupplierItem {
  id: string;
  supplierId: string;
  name: string;
  productTitle: string;
  category: string;
  price?: number;
  unit?: string;
  location: string;
  badge: 'VERIFIED' | 'DOCS_LISTED' | 'MANUFACTURER';
  productGroupsCount: number;
  moq: string;
  details: string;
  dimensions?: string;
  materials?: string;
  tolerances?: string;
  certifications?: string;
  responseTime?: string;
  hasStorefront?: boolean;
}

export default function SMEDigitalPresenceMockup() {
  const [searchTerm, setSearchTerm] = useState('stainless steel valves');
  const [locationFilter, setLocationFilter] = useState('India');
  const [suppliers, setSuppliers] = useState<SMESupplierItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Structured RFQ Modal State
  const [selectedSupplier, setSelectedSupplier] = useState<SMESupplierItem | null>(null);
  const [rfqQuantity, setRfqQuantity] = useState('50 pcs');
  const [rfqMaterials, setRfqMaterials] = useState('SS316 Stainless Steel');
  const [rfqTolerances, setRfqTolerances] = useState('± 0.02mm ISO 2768-m');
  const [rfqCerts, setRfqCerts] = useState('ISO 9001:2015 Required');
  const [rfqNotes, setRfqNotes] = useState('Please provide formal quotation with tooling fees, lead time, and sample availability.');
  const [submittingRfq, setSubmittingRfq] = useState(false);
  const [rfqSuccess, setRfqSuccess] = useState(false);

  const fetchSmeSuppliers = async (queryVal: string, locVal: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform-e/sme-network?query=${encodeURIComponent(queryVal)}&location=${encodeURIComponent(locVal)}`);
      const data = await res.json();
      if (data.smeSuppliers) {
        setSuppliers(data.smeSuppliers);
      }
    } catch (err) {
      console.error('Failed to fetch SME network catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialSuppliers() {
      try {
        const res = await fetch('/api/platform-e/sme-network');
        const data = await res.json();
        if (!ignore && data.smeSuppliers) {
          setSuppliers(data.smeSuppliers);
        }
      } catch (err) {
        console.error('Failed to fetch SME network catalogue:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadInitialSuppliers();
    return () => { ignore = true; };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSmeSuppliers(searchTerm, locationFilter);
  };

  const handleStructuredRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    setSubmittingRfq(true);
    try {
      const res = await fetch('/api/platform-e/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier.supplierId,
          sellerName: selectedSupplier.name,
          productTitle: selectedSupplier.productTitle,
          quantity: rfqQuantity,
          materials: rfqMaterials,
          tolerances: rfqTolerances,
          certifications: rfqCerts,
          text: rfqNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setRfqSuccess(true);
        setTimeout(() => {
          setRfqSuccess(false);
          setSelectedSupplier(null);
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to submit structured RFQ:', err);
    } finally {
      setSubmittingRfq(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      <div>
        <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">LIVE INTERACTIVE WORKBENCH</span>
        <h2 className="text-xl font-black text-[#0A1629] mt-0.5">
          Feature example: what the screen can show
        </h2>
      </div>

      {/* Screen Mockup Container */}
      <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 shadow-xs">
        
        {/* Dark Banner Header */}
        <div className="bg-[#0A1629] text-white px-5 py-3.5 font-extrabold text-xs tracking-wider uppercase flex justify-between items-center">
          <span>SUPPLIER SEARCH / INDUSTRIAL COMPONENTS</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
            Express DB Connected
          </span>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          
          {/* Search Inputs Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. stainless steel valves, components..."
                className="w-full bg-transparent text-xs font-semibold text-[#0A1629] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 sm:w-48">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Location:</span>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. India, Pune..."
                className="w-full bg-transparent text-xs font-semibold text-[#0A1629] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-lg transition-colors shrink-0"
            >
              [Search]
            </button>
          </form>

          {/* SME Catalogue Result Cards */}
          <div className="space-y-3 pt-1">
            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400 animate-pulse">
                Fetching SME storefront catalogues from Express backend...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                No matching SME component makers found for &quot;{searchTerm}&quot;.
              </div>
            ) : (
              suppliers.map((s, idx) => (
                <div key={s.id || idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-black text-slate-600 text-xs shrink-0">
                      {idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#0A1629]">{s.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.badge === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                          s.badge === 'DOCS_LISTED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.badge === 'VERIFIED' ? '✓ Verified profile' : s.badge === 'DOCS_LISTED' ? 'Business docs listed' : 'Manufacturer / distributor'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {s.productTitle} • {s.productGroupsCount} product groups • <span className="font-bold text-[#0A1629]">MOQ {s.moq}</span> • {s.location}
                      </p>

                      {s.materials && (
                        <div className="flex flex-wrap gap-2 text-[10.5px] text-slate-500 pt-0.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">Specs: {s.dimensions}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">Material: {s.materials}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">Tol: {s.tolerances}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSupplier(s)}
                    className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-lg transition-colors shrink-0 shadow-2xs"
                  >
                    Send inquiry
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Example Use Callout Box */}
      <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
        <p className="text-xs md:text-sm text-[#166534] font-medium leading-relaxed">
          <strong className="font-black text-[#14532D]">Example use:</strong> A small component maker builds a catalogue with product dimensions, materials, tolerances, certifications and MOQ. A buyer searches the catalogue and submits a structured RFQ.
        </p>
      </div>

      {/* Structured RFQ Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative animate-[fadeIn_0.15s_ease]">
            <button
              onClick={() => setSelectedSupplier(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-sm w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
            >
              ✕
            </button>

            <span className="text-[10px] font-extrabold text-[#EA580C] uppercase tracking-wider block">STRUCTURED BUYER RFQ</span>
            <h3 className="text-lg font-black text-[#0A1629] mt-0.5">
              Submit Structured RFQ to {selectedSupplier.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Item: <span className="font-bold text-slate-800">{selectedSupplier.productTitle}</span>
            </p>

            {rfqSuccess ? (
              <div className="my-6 p-4 bg-green-50 border border-green-200 text-green-900 rounded-xl text-center text-xs font-bold">
                ✓ Structured RFQ successfully submitted to Express backend server!
              </div>
            ) : (
              <form onSubmit={handleStructuredRfqSubmit} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Quantity:</label>
                    <input
                      type="text"
                      value={rfqQuantity}
                      onChange={(e) => setRfqQuantity(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Material Grade:</label>
                    <input
                      type="text"
                      value={rfqMaterials}
                      onChange={(e) => setRfqMaterials(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tolerances:</label>
                    <input
                      type="text"
                      value={rfqTolerances}
                      onChange={(e) => setRfqTolerances(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Certifications:</label>
                    <input
                      type="text"
                      value={rfqCerts}
                      onChange={(e) => setRfqCerts(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional Procurement Requirements & Notes:</label>
                  <textarea
                    rows={3}
                    value={rfqNotes}
                    onChange={(e) => setRfqNotes(e.target.value)}
                    required
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8]"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSupplier(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRfq}
                    className="px-5 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    {submittingRfq ? 'Submitting...' : 'Submit Structured RFQ'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
