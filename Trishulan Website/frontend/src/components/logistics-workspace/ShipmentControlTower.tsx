'use client';

import React, { useState, useEffect } from 'react';

interface ShipmentTowerData {
  activeShipments: number;
  onTime: string;
  needsAction: number;
  currentShipment: {
    id: string;
    route: string;
    milestones: Array<{ name: string; done: boolean; current?: boolean }>;
    lastEvent: string;
    sharedFolder: Array<{ name: string; status: string }>;
    exceptionAlert: string;
    exceptionSubtext: string;
  };
  shipmentLifecycle: Array<{ step: number; label: string }>;
  exampleText: string;
}

export default function ShipmentControlTower() {
  const [data, setData] = useState<ShipmentTowerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipmentTower = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/business-services/shipment-tower');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shipment tower data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipmentTower();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>SHIPMENT CONTROL TOWER / SAMPLE WORKSPACE</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Connecting to Express backend...)</span>}
        </h2>
        <span className="text-[11px] bg-slate-200/80 px-2.5 py-0.5 rounded text-slate-700 font-mono font-medium">
          Expanded Workspace
        </span>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* 3 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">ACTIVE SHIPMENTS</span>
            <span className="text-2xl font-extrabold text-[#0A1629]">{data?.activeShipments ?? 18}</span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">ON TIME</span>
            <span className="text-2xl font-extrabold text-emerald-600">{data?.onTime || '92%'}</span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">NEEDS ACTION</span>
            <span className="text-2xl font-extrabold text-amber-600">{data?.needsAction ?? 2}</span>
          </div>
        </div>

        {/* Main Shipment Card & Shared Folder Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Shipment Progress (2 cols) */}
          <div className="md:col-span-2 bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0A1629] mb-4">
                Shipment {data?.currentShipment?.id || 'TRC-2048'} | {data?.currentShipment?.route || 'Pune to Chennai | Road'}
              </h3>

              {/* Progress Milestones Stepper */}
              <div className="flex flex-wrap items-center gap-2 text-xs py-3 border-y border-slate-200">
                {(data?.currentShipment?.milestones || [
                  { name: 'Booked', done: true },
                  { name: 'Picked up', done: true },
                  { name: 'In transit', done: true, current: true },
                  { name: 'At destination', done: false },
                  { name: 'Delivered / POD', done: false },
                ]).map((m, idx) => (
                  <React.Fragment key={m.name}>
                    {idx > 0 && <span className="text-slate-400">→</span>}
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        m.current
                          ? 'bg-[#EA580C] text-white shadow animate-pulse'
                          : m.done
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white text-slate-400 border border-slate-200'
                      }`}
                    >
                      {m.name}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Last event: <span className="text-[#0A1629] font-bold">{data?.currentShipment?.lastEvent || '10:42 | Checkpoint scanned: Estimated arrival tomorrow 16:00'}</span>
              </p>
              <p className="text-[11px] text-slate-500 italic">
                Map locations and ETA depend on carrier date; manual update option available.
              </p>
            </div>
          </div>

          {/* Shared Shipment Folder (1 col) */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#0A1629] uppercase">
              Shared shipment folder
            </h3>
            <div className="space-y-2 text-xs">
              {(data?.currentShipment?.sharedFolder || [
                { name: 'Rate confirmation', status: 'saved' },
                { name: 'Packing list', status: 'uploaded' },
                { name: 'Transport document', status: 'issued' },
                { name: 'Proof of delivery', status: 'pending' },
              ]).map((f, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                  <span className="text-slate-800 font-medium">{f.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    f.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exception Alert Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
          <p className="text-xs font-bold text-amber-900">
            {data?.currentShipment?.exceptionAlert || 'Exception alert: destination delay +6 hours'}
          </p>
          <p className="text-[11px] text-amber-800">
            {data?.currentShipment?.exceptionSubtext || 'Notify buyer + seller | assign owner | request carrier update | record resolution'}
          </p>
        </div>

        {/* Shipment Lifecycle Stepper */}
        <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
          <span className="text-xs font-bold text-[#0A1629] uppercase block">Shipment Lifecycle</span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(data?.shipmentLifecycle || [
              { step: 1, label: 'Request rates' },
              { step: 2, label: 'Compare / approve' },
              { step: 3, label: 'Book carrier' },
              { step: 4, label: 'Track milestones' },
              { step: 5, label: 'Upload POD' },
              { step: 6, label: 'Reconcile freight' },
            ]).map((sl, idx) => (
              <React.Fragment key={sl.step}>
                {idx > 0 && <span className="text-slate-400">→</span>}
                <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm flex items-center gap-1.5 text-slate-800 font-medium">
                  <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white font-bold flex items-center justify-center text-[10px]">
                    {sl.step}
                  </span>
                  <span>{sl.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">Example Spec Scenario:</p>
          <p className="italic leading-relaxed">
            "{data?.exampleText || 'Example end-to-end shipment: after the buyer accepts a supplier quote, the seller converts the order into a shipment request with pallet dimensions and delivery window. The system compares carriers, the buyer approves a quote, the selected provider confirms the vehicle, pickup and delivery events update the shared timeline, and a photo/signature proof of delivery closes the shipment. An extra-charge alert sends the final invoice to a review queue.'}"
          </p>
        </div>
      </div>
    </div>
  );
}
