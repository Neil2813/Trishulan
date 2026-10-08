'use client';

import React, { useState, useEffect } from 'react';

interface TransportQuote {
  id: string;
  provider: string;
  mode: string;
  capacity: string;
  estimatedPrice: string;
  transitTime: string;
  pickup: string;
  destination: string;
  includedServices: string[];
  exclusions: string[];
  demurrageNotes: string;
}

interface Milestone {
  step: number;
  title: string;
  status: string;
  time: string;
}

export default function TransportShipmentSupport() {
  const [quotes, setQuotes] = useState<TransportQuote[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/business-services/transport-quotes');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setQuotes(json.transportQuotes || json.quotes || []);
      setMilestones(json.milestones || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transport quotation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>4. TRANSPORT AND SHIPMENT SUPPORT / ILLUSTRATIVE</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Connecting to Express backend...)</span>}
        </h2>
        <span className="text-[11px] bg-slate-200/80 px-2.5 py-0.5 rounded text-slate-700 font-mono font-medium">
          Multimodal Logistics
        </span>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Milestone Tracker Bar */}
        <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
          <span className="text-xs font-bold text-[#0A1629] uppercase block">Shipment Milestones Tracker</span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(milestones.length > 0 ? milestones : [
              { step: 1, title: 'Rate Requested', status: 'COMPLETED', time: '09:00 AM' },
              { step: 2, title: 'Carrier Booked', status: 'COMPLETED', time: '11:30 AM' },
              { step: 3, title: 'In Transit', status: 'IN_PROGRESS', time: 'ETA 06:00 PM' },
              { step: 4, title: 'POD Verified', status: 'PENDING', time: 'Tomorrow' },
            ]).map((ms, idx) => (
              <React.Fragment key={ms.step}>
                {idx > 0 && <span className="text-slate-400">→</span>}
                <div
                  className={`px-3.5 py-1.5 rounded-lg border text-xs flex flex-col shadow-sm ${
                    ms.status === 'COMPLETED'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : ms.status === 'IN_PROGRESS'
                      ? 'bg-sky-50 border-sky-300 text-sky-900 animate-pulse font-bold'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="font-bold">{ms.title}</span>
                  <span className="text-[10px] opacity-80">{ms.time}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Multimodal Transport Quotes Comparison Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#0A1629] uppercase">Multimodal Transport Quotations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(quotes.length > 0 ? quotes : [
              { id: '1', provider: 'VRL Logistics Express', mode: 'FTL Road', estimatedPrice: '₹48,500', pickup: 'Mumbai', destination: 'Pune', capacity: '32 Ft Container', transitTime: '1 Day', includedServices: ['Transit Insurance', 'Live GPS'], exclusions: ['Loading Labor'], demurrageNotes: 'Free 3 hours loading' },
              { id: '2', provider: 'TCI Freight Services', mode: 'PTL Road', estimatedPrice: '₹22,000', pickup: 'Ahmedabad', destination: 'Surat', capacity: '19 Ft Truck', transitTime: '2 Days', includedServices: ['Door Pickup'], exclusions: ['Unloading'], demurrageNotes: 'Demurrage ₹500/hr after 2h' },
            ]).map((q: any) => (
              <div key={q.id} className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-300 shadow-sm transition">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-sky-100 border border-sky-300 text-sky-800 px-2 py-0.5 rounded font-mono font-bold">
                      {q.mode || 'FTL'}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 font-mono">{q.rateQuote || q.estimatedPrice}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#0A1629]">{q.carrierName || q.provider}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Route: <span className="text-slate-800 font-semibold">{q.pickup || 'Origin'} → {q.destination || 'Destination'}</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Capacity: <span className="text-slate-800 font-semibold">{q.vehicleType || q.capacity}</span> | Transit: <span className="text-slate-800 font-semibold">{q.estimatedTransitDays ? `${q.estimatedTransitDays} Days` : q.transitTime || '1-2 Days'}</span>
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] space-y-1">
                    <p className="text-emerald-700 font-bold">Included: {Array.isArray(q.includedServices) ? q.includedServices.join(', ') : 'Transit Insurance, Tracking'}</p>
                    <p className="text-rose-700">Exclusions: {Array.isArray(q.exclusions) ? q.exclusions.join(', ') : 'Manual Tolls'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 italic">
                  ℹ️ {q.demurrageNotes || 'Standard demurrage rules apply after free loading window.'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Rules List */}
        <div className="text-xs text-slate-700 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="font-bold text-[#0A1629] mb-1">Transport & Shipment Features:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Connect buyers and sellers to transport providers and shipment services. Make route, vehicle/container type, pickup, delivery, load dimensions, weight, handling needs, insurance and timing visible before a booking request.</li>
            <li>Request road, rail, air, sea or multimodal transport quotations based on route and cargo details.</li>
            <li>Compare provider quotes on estimated price, transit time, capacity, included services and exclusions.</li>
            <li>Track shipment milestones: quote requested, booked, picked up, in transit, delivered, exception.</li>
            <li>Share shipment documents and proof of delivery among the buyer, seller and transporter.</li>
            <li>Show whether charges are estimates or confirmed; explain demurrage, detention, customs and accessorial costs.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
