"use client";

import React, { useState, useEffect } from 'react';

export interface TradeLeadItem {
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
}

export default function TradeLeadPortalMockup() {
  const [searchTerm, setSearchTerm] = useState('stainless steel valves');
  const [locationFilter, setLocationFilter] = useState('India');
  const [tradeLeads, setTradeLeads] = useState<TradeLeadItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Requirement Posting Modal State
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('10,000 Laminated Pouches (Food-Contact)');
  const [reqDetails, setReqDetails] = useState('Size: 200x300mm, Material: PET/FOIL/PE, 3-side seal, food grade certification required.');
  const [reqQty, setReqQty] = useState('10,000 pcs');
  const [reqDestination, setReqDestination] = useState('Mumbai, Maharashtra');
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);

  const fetchLeads = async (queryVal: string, locVal: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform-c/trade-leads?query=${encodeURIComponent(queryVal)}&location=${encodeURIComponent(locVal)}`);
      const data = await res.json();
      if (data.tradeLeads) {
        setTradeLeads(data.tradeLeads);
      }
    } catch (err) {
      console.error('Failed to fetch trade leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(searchTerm, locationFilter);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(searchTerm, locationFilter);
  };

  const handlePostRequirementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReq(true);
    try {
      const res = await fetch('/api/platform-c/requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reqTitle,
          details: reqDetails,
          quantity: reqQty,
          destination: reqDestination,
          category: 'RAW_MATERIALS'
        })
      });
      const data = await res.json();
      if (data.success) {
        setReqSuccess(true);
        setTimeout(() => {
          setReqSuccess(false);
          setShowRequirementModal(false);
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to post requirement:', err);
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">LIVE INTERACTIVE MODULE</span>
          <h2 className="text-xl font-black text-[#0A1629] mt-0.5">
            Feature example: what the screen can show
          </h2>
        </div>

        <button
          onClick={() => setShowRequirementModal(true)}
          className="px-4 py-2.5 bg-[#EA580C] hover:bg-[#c2410a] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          + Post Buy Requirement
        </button>
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
                placeholder="e.g. stainless steel valves, pouches..."
                className="w-full bg-transparent text-xs font-semibold text-[#0A1629] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 sm:w-48">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Location:</span>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. India, Maharashtra..."
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

          {/* Trade Lead Results Cards */}
          <div className="space-y-3 pt-1">
            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400 animate-pulse">
                Fetching trade leads & suppliers from Express backend...
              </div>
            ) : tradeLeads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                No trade leads found for "{searchTerm}".
              </div>
            ) : (
              tradeLeads.map((s, idx) => (
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
                    onClick={() => setShowRequirementModal(true)}
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
          <strong className="font-black text-[#14532D]">Example use:</strong> A food processor needs 10,000 laminated pouches. It posts size, material, print design, food-contact requirement, quantity and destination; suppliers provide quotations.
        </p>
      </div>

      {/* Post Buy Requirement Modal */}
      {showRequirementModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative animate-[fadeIn_0.15s_ease]">
            <button
              onClick={() => setShowRequirementModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-sm w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
            >
              ✕
            </button>

            <span className="text-[10px] font-extrabold text-[#EA580C] uppercase tracking-wider block">B2B TRADE LEAD PORTAL</span>
            <h3 className="text-lg font-black text-[#0A1629] mt-0.5">
              Post Buying Requirement
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Broadcast your specifications to verified Indian suppliers on Trishulan B2B.
            </p>

            {reqSuccess ? (
              <div className="my-6 p-4 bg-green-50 border border-green-200 text-green-900 rounded-xl text-center text-xs font-bold">
                ✓ Buy requirement successfully posted to Express backend server!
              </div>
            ) : (
              <form onSubmit={handlePostRequirementSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Title:</label>
                  <input
                    type="text"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#EA580C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Quantity:</label>
                    <input
                      type="text"
                      value={reqQty}
                      onChange={(e) => setReqQty(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Destination:</label>
                    <input
                      type="text"
                      value={reqDestination}
                      onChange={(e) => setReqDestination(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Specifications & Requirements:</label>
                  <textarea
                    rows={3}
                    value={reqDetails}
                    onChange={(e) => setReqDetails(e.target.value)}
                    required
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#EA580C]"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequirementModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReq}
                    className="px-5 py-2 bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    {submittingReq ? 'Broadcasting...' : 'Broadcast Requirement'}
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
