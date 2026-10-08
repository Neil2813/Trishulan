"use client";

import React, { useState, useEffect } from 'react';

interface MetricData {
  newLeads: number;
  responded: number;
  openRfqs: number;
  weeklyTrend: { day: string; count: number }[];
}

export default function PlatformDActivityDashboard() {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await fetch('/api/platform-d/activity');
        const data = await res.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error('Failed to fetch Platform D activity metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  const newLeads = metrics?.newLeads ?? 24;
  const responded = metrics?.responded ?? 18;
  const openRfqs = metrics?.openRfqs ?? 7;
  const weeklyTrend = metrics?.weeklyTrend ?? [
    { day: 'Mon', count: 5 },
    { day: 'Tue', count: 9 },
    { day: 'Wed', count: 7 },
    { day: 'Thu', count: 12 },
    { day: 'Fri', count: 14 },
    { day: 'Sat', count: 10 },
    { day: 'Sun', count: 18 },
  ];

  const maxCount = Math.max(...weeklyTrend.map(t => t.count), 20);

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-black text-[#0A1629]">
          Illustrative activity dashboard
        </h2>
        <p className="text-xs text-[#64748B] font-medium mt-1">
          Sample activity counts only; actual dashboards and available metrics vary by plan. Connected live to Express backend metrics.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* NEW LEADS */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            NEW LEADS
          </span>
          <span className="text-2xl md:text-3xl font-black text-[#1D4ED8]">
            {loading ? '...' : newLeads}
          </span>
        </div>

        {/* RESPONDED */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            RESPONDED
          </span>
          <span className="text-2xl md:text-3xl font-black text-[#1D4ED8]">
            {loading ? '...' : responded}
          </span>
        </div>

        {/* OPEN RFQs */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            OPEN RFQs
          </span>
          <span className="text-2xl md:text-3xl font-black text-[#1D4ED8]">
            {loading ? '...' : openRfqs}
          </span>
        </div>

      </div>

      {/* Bar Chart Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
          <span>Weekly Research Query Volume</span>
          <span className="text-[#1D4ED8] font-bold">Mon - Sun Activity</span>
        </div>

        {/* Bar Chart Visual */}
        <div className="h-44 flex items-end gap-3 md:gap-6 pt-6 border-b border-slate-200 pb-2">
          {weeklyTrend.map((item, idx) => {
            const heightPercent = Math.min((item.count / maxCount) * 100, 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#1D4ED8] transition-colors">
                  {item.count}
                </span>
                <div className="w-full bg-slate-100 rounded-t h-32 flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-[#00A896] hover:bg-[#008073] rounded-t transition-all cursor-pointer shadow-xs"
                    title={`${item.day}: ${item.count} research queries`}
                  ></div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
