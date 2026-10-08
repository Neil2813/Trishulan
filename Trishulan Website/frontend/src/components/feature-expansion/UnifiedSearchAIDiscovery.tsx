"use client";

import React, { useState, useEffect } from 'react';

export default function UnifiedSearchAIDiscovery() {
  const [activeTab, setActiveTab] = useState<'Product name' | 'HSN code' | 'Industry' | 'Seller company' | 'Barcode' | 'AI search'>('AI search');
  const [queryInput, setQueryInput] = useState('AI: Find SS304 hex bolts, M12 x 50 mm, 5,000 pieces, near Chennai');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const executeSearch = async (mode: string, q: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, query: q })
      });
      const data = await res.json();
      if (data.parsedResult) {
        setParsedData(data.parsedResult.parsed);
      } else {
        setParsedData(null);
      }
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Failed to execute search:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(activeTab, queryInput);
  }, [activeTab]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(activeTab, queryInput);
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      <div>
        <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">FEATURE EXPANSION MODULE 1</span>
        <h2 className="text-xl md:text-2xl font-black text-[#0A1629] mt-0.5">
          Unified search bar and AI discovery
        </h2>
        <p className="text-xs md:text-sm text-[#475569] font-medium mt-1 leading-relaxed max-w-4xl">
          Place a prominent search bar across the website and app. Let users choose what they are searching for or enter a natural-language request and let AI help interpret it. Search works for products, specifications, and verified suppliers.
        </p>
      </div>

      {/* Screen Mockup Container */}
      <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 shadow-xs">
        
        {/* Dark Banner Header */}
        <div className="bg-[#0A1629] text-white px-5 py-3.5 font-extrabold text-xs tracking-wider uppercase flex justify-between items-center">
          <span>UNIFIED INDUSTRIAL SEARCH / ILLUSTRATIVE</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
            Express AI Connected
          </span>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Mode Tabs */}
          <div className="flex flex-wrap bg-white p-1 rounded-xl border border-slate-200 gap-1">
            {(['Product name', 'HSN code', 'Industry', 'Seller company', 'Barcode', 'AI search'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'AI search') {
                    setQueryInput('AI: Find SS304 hex bolts, M12 x 50 mm, 5,000 pieces, near Chennai');
                  } else if (tab === 'HSN code') {
                    setQueryInput('7214 (Iron/Steel Bars)');
                  } else if (tab === 'Barcode') {
                    setQueryInput('8901030678912 (Hydraulic Bearing)');
                  } else {
                    setQueryInput('Stainless steel valves');
                  }
                }}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-extrabold transition-all text-center ${
                  activeTab === tab
                    ? 'bg-[#00A896] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleFormSubmit} className="flex gap-2 bg-white p-2 rounded-xl border border-slate-300 shadow-2xs">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Enter product name, HSN code, or natural-language AI prompt..."
              className="flex-1 px-4 py-3 text-xs font-semibold text-[#0A1629] border-none outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
            >
              Search
            </button>
          </form>

          {/* AI Parsed Interpretation Box */}
          {parsedData && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs font-mono text-blue-900">
              <span className="font-extrabold text-[#1D4ED8] block mb-0.5">
                AI understood:
              </span>
              <span>
                {parsedData.product} | grade {parsedData.grade} | {parsedData.size} | quantity {parsedData.quantity} | destination {parsedData.destination}
              </span>
            </div>
          )}

          {/* Search Results Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400 animate-pulse">
                Executing AI search across Express database...
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {searchResults.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#0A1629] text-sm">{item.title}</span>
                        {item.isVerified && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <div className="text-slate-600 font-medium mt-1 flex flex-wrap items-center gap-3">
                        <span className="text-[#1D4ED8] font-bold">{item.matchReason}</span>
                        <span>• Seller: {item.sellerName}</span>
                        <span>• {item.location}</span>
                        <span>• MOQ {item.moq}</span>
                      </div>
                    </div>

                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0A1629] font-extrabold text-xs rounded-lg border border-slate-200 shrink-0">
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Example Use Callout Box */}
      <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
        <p className="text-xs md:text-sm text-[#166534] font-medium leading-relaxed">
          <strong className="font-black text-[#14532D]">Example:</strong> A buyer scans a package barcode, or switches to AI search and enters a free-text industrial requirement. Search returns matching catalogue products and seller profiles with visible match reasons, MOQ and location. The buyer edits the parsed filters, compares suppliers and sends a structured RFQ.
        </p>
      </div>

    </div>
  );
}
