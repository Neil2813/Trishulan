"use client";

import React, { useState, useEffect } from 'react';

export interface SupplierItem {
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
  responseTime?: string;
  hasCertificates?: boolean;
}

export default function SupplierSearchMockup() {
  const [searchTerm, setSearchTerm] = useState('stainless steel valves');
  const [locationFilter, setLocationFilter] = useState('India');
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySentSuccess, setInquirySentSuccess] = useState(false);

  // Fetch dynamic suppliers from Express Backend API
  const fetchSuppliers = async (queryVal: string, locVal: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform-a/suppliers?query=${encodeURIComponent(queryVal)}&location=${encodeURIComponent(locVal)}`);
      const data = await res.json();
      if (data.suppliers) {
        setSuppliers(data.suppliers);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(searchTerm, locationFilter);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuppliers(searchTerm, locationFilter);
  };

  const handleSendInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !inquiryText.trim()) return;

    setInquirySending(true);
    try {
      const res = await fetch('/api/platform-a/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier.supplierId,
          sellerName: selectedSupplier.name,
          productTitle: selectedSupplier.productTitle,
          text: inquiryText
        })
      });
      const data = await res.json();
      if (data.success) {
        setInquirySentSuccess(true);
        setTimeout(() => {
          setInquirySentSuccess(false);
          setSelectedSupplier(null);
          setInquiryText('');
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to post inquiry:', err);
    } finally {
      setInquirySending(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      <div>
        <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">LIVE INTERACTIVE MODULE</span>
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
            Express API Connected
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
                placeholder="e.g. stainless steel valves, rebar..."
                className="w-full bg-transparent text-xs font-semibold text-[#0A1629] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 sm:w-48">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Location:</span>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. India, Mumbai..."
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

          {/* Dynamic Supplier Results Cards */}
          <div className="space-y-3 pt-1">
            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400 animate-pulse">
                Fetching suppliers from Express backend database...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                No matching suppliers found for "{searchTerm}". Try another search term.
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

                      {s.details && (
                        <p className="text-[11px] text-slate-500 italic">
                          "{s.details}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSupplier(s);
                      setInquiryText(`Requesting quotation for ${s.productTitle}. Please provide MOQ terms, grade certificate, and delivery timeline to ${s.location}.`);
                    }}
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

      {/* Example Use Box */}
      <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
        <p className="text-xs md:text-sm text-[#166534] font-medium leading-relaxed">
          <strong className="font-black text-[#14532D]">Example use:</strong> A maintenance buyer searches for a 2-inch stainless steel valve, selects the delivery region, compares three suppliers and asks each for grade certificate, price, MOQ and delivery time.
        </p>
      </div>

      {/* Inquiry Submission Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative animate-[fadeIn_0.15s_ease]">
            <button
              onClick={() => setSelectedSupplier(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-sm w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
            >
              ✕
            </button>

            <span className="text-[10px] font-extrabold text-[#EA580C] uppercase tracking-wider block">DIRECT SUPPLIER INQUIRY</span>
            <h3 className="text-lg font-black text-[#0A1629] mt-0.5">
              Send Inquiry to {selectedSupplier.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Product: <span className="font-bold text-slate-800">{selectedSupplier.productTitle}</span> (MOQ: {selectedSupplier.moq})
            </p>

            {inquirySentSuccess ? (
              <div className="my-6 p-4 bg-green-50 border border-green-200 text-green-900 rounded-xl text-center text-xs font-bold">
                ✓ Inquiry successfully submitted to Express backend server!
              </div>
            ) : (
              <form onSubmit={handleSendInquirySubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Details & Request:</label>
                  <textarea
                    rows={4}
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
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
                    disabled={inquirySending}
                    className="px-5 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    {inquirySending ? 'Submitting...' : 'Submit Inquiry'}
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
