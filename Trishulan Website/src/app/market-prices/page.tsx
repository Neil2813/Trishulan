"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function MarketPricesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Steel (Rebar)');
  const [searchMaterial, setSearchMaterial] = useState('');

  const categories = [
    'Steel (Rebar)', 'Aluminium', 'Copper', 'PET Resin', 'Crude Oil', 'Urea', 'PVC', 'LNG'
  ];

  const statePrices = [
    { state: 'Maharashtra', avgPrice: 47850, lowest: 45200, highest: 52600, trend: '+1.9%' },
    { state: 'Gujarat', avgPrice: 47430, lowest: 44800, highest: 51700, trend: '+1.8%' },
    { state: 'Karnataka', avgPrice: 46980, lowest: 44100, highest: 50800, trend: '+1.6%' },
    { state: 'Tamil Nadu', avgPrice: 46750, lowest: 43900, highest: 50300, trend: '+1.5%' },
    { state: 'Andhra Pradesh', avgPrice: 46320, lowest: 43800, highest: 49900, trend: '+1.4%' },
    { state: 'Telangana', avgPrice: 46100, lowest: 43500, highest: 49600, trend: '+1.3%' },
    { state: 'Uttar Pradesh', avgPrice: 45980, lowest: 42700, highest: 49200, trend: '+1.2%' },
    { state: 'West Bengal', avgPrice: 45760, lowest: 42300, highest: 48900, trend: '+1.1%' },
    { state: 'Delhi', avgPrice: 45480, lowest: 41900, highest: 48700, trend: '+1.0%' },
    { state: 'Rajasthan', avgPrice: 45120, lowest: 41600, highest: 48300, trend: '+0.8%' },
  ];

  const countryPrices = [
    { country: 'USA 🇺🇸', priceUSD: 720, priceINR: 60480, change: '+1.2%', lastUpdated: '17 Sep 2026, 10:30 AM' },
    { country: 'China 🇨🇳', priceUSD: 660, priceINR: 55440, change: '+0.9%', lastUpdated: '17 Sep 2026, 10:29 AM' },
    { country: 'Japan 🇯🇵', priceUSD: 690, priceINR: 57960, change: '+1.0%', lastUpdated: '17 Sep 2026, 10:25 AM' },
    { country: 'Germany 🇩🇪', priceUSD: 770, priceINR: 64680, change: '+1.3%', lastUpdated: '17 Sep 2026, 10:20 AM' },
    { country: 'UK 🇬🇧', priceUSD: 740, priceINR: 62160, change: '+1.1%', lastUpdated: '17 Sep 2026, 10:18 AM' },
    { country: 'UAE 🇦🇪', priceUSD: 680, priceINR: 57120, change: '+0.8%', lastUpdated: '17 Sep 2026, 10:15 AM' },
    { country: 'Saudi Arabia 🇸🇦', priceUSD: 640, priceINR: 53760, change: '+0.7%', lastUpdated: '17 Sep 2026, 10:12 AM' },
    { country: 'Australia 🇦🇺', priceUSD: 750, priceINR: 63000, change: '+1.4%', lastUpdated: '17 Sep 2026, 10:10 AM' },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-orange-50/90 via-white to-amber-50/80 text-[#0A1629] rounded-[24px] p-6 md:p-8 border-2 border-orange-200 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#EA580C]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-[.16em]">PAGE 4 REFERENCE SPECIFICATION</span>
              <h1 className="text-[28px] md:text-[36px] font-black text-[#0A1629] mt-1">Market Price Today</h1>
              <p className="text-[13.5px] text-[#64748B] font-medium mt-1 max-w-xl">
                Get real-time and average market prices of any product across Indian states and global countries. Search, compare, and make better business decisions.
              </p>
            </div>

            {/* Material Search Input */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-gray-300 shadow-sm max-w-md w-full">
              <input
                type="text"
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
                placeholder="Search anything... (e.g. Steel, Copper, Chemicals)"
                className="flex-1 px-3 py-2 text-xs font-semibold text-[#0A1629] border-none outline-none"
              />
              <button className="px-5 py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-xs shadow-sm">
                Search
              </button>
            </div>
          </div>

          {/* Category Chips bar */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
            <span className="text-xs text-gray-500 font-bold shrink-0">Popular Categories:</span>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#EA580C] text-white shadow-md'
                    : 'bg-white text-[#0A1629] border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Global vs Indian Average Price Band */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase block">Global Average Price</span>
              <div className="text-[32px] font-black text-[#0A1629] mt-1">$ 628 <span className="text-xs text-gray-500 font-normal">/ MT</span></div>
              <span className="text-xs font-bold text-green-600 block mt-0.5">▲ +2.4% vs last week</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-3xl font-bold">
              🌐
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase block">Indian Average Price</span>
              <div className="text-[32px] font-black text-[#EA580C] mt-1">₹ 46,850 <span className="text-xs text-gray-500 font-normal">/ MT</span></div>
              <span className="text-xs font-bold text-green-600 block mt-0.5">▲ +1.8% vs last week</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center text-3xl font-bold">
              🇮🇳
            </div>
          </div>
        </div>

        {/* Main Content Split: State Prices vs Country Prices & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: India & International Tables */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* India - State Wise Prices Table */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <h3 className="font-extrabold text-[18px] text-[#0A1629]">India - State Wise Prices ({selectedCategory})</h3>
                  <p className="text-xs text-gray-500">Average spot rates across major industrial state hubs</p>
                </div>
                <span className="text-xs font-bold text-[#EA580C]">Showing 10 States</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5">State</th>
                      <th className="py-2.5 text-right">Avg. Price (₹/MT)</th>
                      <th className="py-2.5 text-right">Lowest Price</th>
                      <th className="py-2.5 text-right">Highest Price</th>
                      <th className="py-2.5 text-right">Trend 7D</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {statePrices.map((st, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 font-bold text-[#0A1629]">{st.state}</td>
                        <td className="py-3 text-right font-black text-[#EA580C]">₹{st.avgPrice.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right text-gray-600">₹{st.lowest.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right text-gray-600">₹{st.highest.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right font-bold text-green-600">{st.trend} ▲</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* International - Country Wise Prices Table */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <h3 className="font-extrabold text-[18px] text-[#0A1629]">International - Country Wise Prices</h3>
                  <p className="text-xs text-gray-500">Global trade benchmark spot rates in USD & INR equivalent</p>
                </div>
                <span className="text-xs font-bold text-blue-600">Showing 8 Countries</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5">Country</th>
                      <th className="py-2.5 text-right">Avg Price (USD/MT)</th>
                      <th className="py-2.5 text-right">Local Price (INR/MT)</th>
                      <th className="py-2.5 text-right">Change %</th>
                      <th className="py-2.5 text-right">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {countryPrices.map((cp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 font-bold text-[#0A1629]">{cp.country}</td>
                        <td className="py-3 text-right font-bold text-blue-700">${cp.priceUSD}</td>
                        <td className="py-3 text-right font-extrabold text-[#0A1629]">₹{cp.priceINR.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right font-bold text-green-600">{cp.change} ▲</td>
                        <td className="py-3 text-right text-gray-400 text-[10px]">{cp.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Column 3: Price Range, Market Insights & Quick Actions */}
          <div className="space-y-6">
            
            {/* Price Range & Market Insights Box */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xl space-y-4">
              <h3 className="font-black text-sm text-[#0A1629] uppercase tracking-wider">Price Range & Market Insights</h3>

              <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Lowest Recorded:</span>
                  <span className="font-bold text-green-700">₹41,600 / MT</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Highest Recorded:</span>
                  <span className="font-bold text-red-700">₹52,600 / MT</span>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-2 font-extrabold text-sm">
                  <span className="text-[#0A1629]">National Average:</span>
                  <span className="text-[#EA580C]">₹46,850 / MT</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl">
                  <span className="text-gray-600 font-semibold">Demand Outlook</span>
                  <span className="font-bold text-green-600">Stable (+2.5%)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl">
                  <span className="text-gray-600 font-semibold">Supply Index</span>
                  <span className="font-bold text-amber-600">Moderate</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl">
                  <span className="text-gray-600 font-semibold">3-Month Forecast</span>
                  <span className="font-bold text-blue-600">Bullish Trend</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel (Page 4 Reference Spec) */}
            <div className="bg-white text-[#0A1629] p-6 rounded-[24px] border border-gray-200 shadow-lg space-y-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#EA580C]">Quick Actions</h3>

              <button
                onClick={() => alert('Price Alert set! You will receive SMS & Email notifications on market movements.')}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-[#0A1629] font-bold text-xs rounded-xl border border-gray-200 text-left px-4 flex items-center justify-between transition-colors"
              >
                <span>🔔 Set Price Alert</span>
                <span className="text-gray-400">→</span>
              </button>

              <Link
                href="/market-analyzer"
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-[#0A1629] font-bold text-xs rounded-xl border border-gray-200 text-left px-4 flex items-center justify-between transition-colors block"
              >
                <span>📊 Market Analyzer</span>
                <span className="text-gray-400">→</span>
              </Link>

              <Link
                href="/dashboard"
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-[#0A1629] font-bold text-xs rounded-xl border border-gray-200 text-left px-4 flex items-center justify-between transition-colors block"
              >
                <span>🏢 Find Suppliers</span>
                <span className="text-gray-400">→</span>
              </Link>

              <Link
                href="/rfq"
                className="w-full py-3 bg-[#EA580C] hover:bg-[#c2410a] text-white font-extrabold text-xs rounded-xl text-center block shadow-md transition-colors"
              >
                Request Quote +
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
