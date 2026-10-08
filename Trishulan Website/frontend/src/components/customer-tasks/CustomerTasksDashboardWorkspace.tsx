'use client';

import React, { useState, useEffect } from 'react';

interface WorkspaceData {
  buyerWorkspace?: {
    rfqsWaiting: number;
    quotesToCompare: number;
    deliveryUpdates: number;
  };
  supplierWorkspace?: {
    newLeads: number;
    quotesDue: number;
    lowStockAlerts: number;
  };
  recentActivity?: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    status: string;
    color: string;
  }>;
  supportCase?: {
    caseNumber: string;
    status: string;
    nextUpdate: string;
    assignedOwner: string;
  };
  quickActions?: string[];
  systemOptions?: string[];
  buyerRequirements?: string[];
  sellerRequirements?: string[];
  sharedRequirements?: string[];
}

export default function CustomerTasksDashboardWorkspace({
  onOpenSupportModal,
}: {
  onOpenSupportModal?: () => void;
}) {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer/workspace');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer workspace metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Bar */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>CUSTOMER HOME / BUYER AND SELLER TASKS / ILLUSTRATIVE</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Connecting to Express backend...)</span>}
        </h2>
        <button
          onClick={fetchWorkspaceData}
          className="text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg text-slate-800 shadow-sm transition"
        >
          🔄 Refresh Backend State
        </button>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Top Workspace Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buyer Workspace Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-extrabold text-[#0A1629] uppercase tracking-wider">
                Buyer workspace
              </h3>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded font-bold border border-sky-300">
                ACTIVE BUYER
              </span>
            </div>
            <div className="text-xs text-slate-700 font-medium py-3 px-3.5 bg-white rounded-lg border border-slate-200 flex flex-wrap gap-x-4 gap-y-1 shadow-sm">
              <span>
                <strong className="text-sky-700 text-sm font-extrabold">{data?.buyerWorkspace?.rfqsWaiting ?? 2}</strong> RFQs waiting
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="text-sky-700 text-sm font-extrabold">{data?.buyerWorkspace?.quotesToCompare ?? 3}</strong> quotes to compare
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="text-sky-700 text-sm font-extrabold">{data?.buyerWorkspace?.deliveryUpdates ?? 1}</strong> delivery update
              </span>
            </div>
          </div>

          {/* Supplier Workspace Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-extrabold text-[#0A1629] uppercase tracking-wider">
                Supplier workspace
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-bold border border-emerald-300">
                SELLER DASHBOARD
              </span>
            </div>
            <div className="text-xs text-slate-700 font-medium py-3 px-3.5 bg-white rounded-lg border border-slate-200 flex flex-wrap gap-x-4 gap-y-1 shadow-sm">
              <span>
                <strong className="text-emerald-700 text-sm font-extrabold">{data?.supplierWorkspace?.newLeads ?? 4}</strong> new leads
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="text-amber-700 text-sm font-extrabold">{data?.supplierWorkspace?.quotesDue ?? 2}</strong> quotes due
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="text-rose-700 text-sm font-extrabold">{data?.supplierWorkspace?.lowStockAlerts ?? 6}</strong> low-stock alerts
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Recent Activity & Support Case */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recent Activity (2 cols) */}
          <div className="md:col-span-2 bg-slate-50/80 border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-[#0A1629] uppercase tracking-wider mb-4">
              Recent activity
            </h3>
            <div className="space-y-3 text-xs">
              {(data?.recentActivity || [
                { id: '1', title: 'RFQ 208 - Supplier 1 sent a revised quote', color: 'sky' },
                { id: '2', title: 'Shipment 304 - ETA changed to 16:00', color: 'amber' },
                { id: '3', title: 'Invoice 1042 - payment due in 5 days', color: 'emerald' },
              ]).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-sm"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${act.color === 'sky' ? 'bg-sky-500' : act.color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-slate-800 font-bold">{act.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support Case (1 col) */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#0A1629] uppercase tracking-wider mb-3">
                Support case
              </h3>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5 text-xs shadow-sm">
                <p className="font-extrabold text-sky-800">
                  Case #{data?.supportCase?.caseNumber || 'CS-0198'}
                </p>
                <p className="text-slate-700">
                  Status: <span className="text-amber-800 font-bold">{data?.supportCase?.status || 'waiting on reply'}</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Next update: {data?.supportCase?.nextUpdate || 'within 1 day'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSupportModal}
              className="mt-4 w-full py-2 bg-white hover:bg-slate-100 text-sky-800 text-xs font-bold rounded-lg border border-slate-300 shadow-sm transition"
            >
              Open Support Centre Desk
            </button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-emerald-900 mr-2">Quick actions:</span>
            {['Build RFQ', 'Compare quotes', 'Repeat order', 'Track shipment', 'Get help'].map((action, idx) => (
              <React.Fragment key={action}>
                {idx > 0 && <span className="text-emerald-300">|</span>}
                <button
                  onClick={() => {
                    if (action === 'Get help' && onOpenSupportModal) {
                      onOpenSupportModal();
                    } else {
                      alert(`Triggering quick action: ${action}`);
                    }
                  }}
                  className="text-emerald-900 hover:text-emerald-700 font-bold transition underline underline-offset-2"
                >
                  {action}
                </button>
              </React.Fragment>
            ))}
          </div>
          <p className="text-[11px] text-emerald-800 italic">
            User-configurable notifications, language, currency and accessibility options.
          </p>
        </div>

        {/* Bottom Requirements Documentation Sections */}
        <div className="pt-6 border-t border-slate-200 space-y-6">
          {/* Buyer Requirements */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-sky-800">Buyer requirements</h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>Fast signup and onboarding that remembers preferences, language, currency, delivery locations and saved business details.</li>
              <li>RFQ builder that helps buyers describe a need with text, photos, drawings or a spreadsheet, checks missing specification fields and lets the buyer edit before sending.</li>
              <li>Compare supplier offers on a consistent view: specification match, price and currency, MOQ, taxes, freight, delivery date, payment terms, certifications and quote expiry.</li>
              <li>Shortlist suppliers, save products/searches, share a shortlist with teammates and set alerts for new quotes, price changes, stock availability or shipment events.</li>
              <li>Request a sample, clarification or meeting; keep the conversation and version history connected to the RFQ and order.</li>
              <li>See order and shipment milestones, expected delivery, required documents, invoice/payment status and a way to report a delay or damaged/short shipment.</li>
            </ul>
          </div>

          {/* Seller Requirements */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-emerald-800">Seller requirements</h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>A lead inbox that prioritizes qualified requests, shows response deadlines and avoids duplicate entry from buyer inquiry to quote/order.</li>
              <li>Quick quote templates and catalogue reuse, with editable line items, volume breaks, validity, tax/freight terms and attachments.</li>
              <li>Tools to show available capacity, lead time, service region, minimum order and temporary out-of-stock status so matching is more accurate.</li>
              <li>Customer relationship tools for reminders, team ownership, notes, repeat orders and buyer-request history, with consent-aware contact access.</li>
              <li>Analytics that focus on qualified RFQs, response time, quote completion, order conversion, repeat buyers and reasons for losing a deal.</li>
            </ul>
          </div>

          {/* Shared Customer Service Requirements */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-purple-800">Shared customer service requirements</h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>One support centre with searchable guides, ticket submission, attachment upload, case number, status, owner, expected response time and escalation route.</li>
              <li>Notifications that customers can control by category and channel: website, email, SMS or WhatsApp. Do not mix service updates with marketing permission.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
