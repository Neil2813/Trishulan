'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, FileText, CheckCircle2, ShieldCheck, Headphones } from 'lucide-react';
import { safeJsonFetch } from '@/lib/utils';

interface WorkspaceSummary {
  activeRfqsCount: number;
  pendingQuotesCount: number;
  verifiedSuppliersCount: number;
  openTicketsCount: number;
}

interface SupportTicket {
  id: string;
  caseNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
}

export default function CustomerTasksDashboardWorkspace({
  onOpenSupportModal,
}: {
  onOpenSupportModal?: () => void;
}) {
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [wsRes, ticketRes] = await Promise.all([
        safeJsonFetch<{ workspace?: WorkspaceSummary }>('/api/customer/workspace'),
        safeJsonFetch<{ tickets?: SupportTicket[] }>('/api/customer/tickets'),
      ]);

      if (wsRes.ok && wsRes.data?.workspace) {
        setWorkspace(wsRes.data.workspace);
      } else if (!wsRes.ok && wsRes.error) {
        setError(wsRes.error);
      }

      if (ticketRes.ok && Array.isArray(ticketRes.data?.tickets)) {
        setTickets(ticketRes.data.tickets);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer workspace metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const latestTicket = tickets[0] || null;

  return (
    <div className="bg-card border border-line rounded-xl overflow-hidden shadow text-ink max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Bar */}
      <div className="bg-card px-6 py-3.5 border-b border-line flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-ink uppercase flex items-center gap-2">
          <span>CUSTOMER WORKSPACE & TASKS</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Loading...)</span>}
        </h2>
        <button
          onClick={fetchWorkspaceData}
          className="text-xs font-bold bg-card hover:bg-line/30 border border-line px-3 py-1 rounded-lg text-slate-800 shadow-sm transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Workspace Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buyer Tasks & RFQs Card */}
          <div className="bg-card/80 border border-line rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Buyer RFQ Workspace</span>
              </h3>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded font-bold border border-sky-300">
                ACTIVE PIPELINE
              </span>
            </div>
            <div className="text-xs text-slate-700 font-medium py-3 px-3.5 bg-card rounded-lg border border-line flex flex-wrap gap-x-6 gap-y-2 shadow-sm">
              <div>
                <span className="text-muted block text-[11px]">Active RFQs</span>
                <strong className="text-sky-700 text-base font-extrabold">
                  {loading ? '…' : workspace?.activeRfqsCount ?? 0}
                </strong>
              </div>
              <div className="border-r border-line" />
              <div>
                <span className="text-muted block text-[11px]">Pending Quotes</span>
                <strong className="text-sky-700 text-base font-extrabold">
                  {loading ? '…' : workspace?.pendingQuotesCount ?? 0}
                </strong>
              </div>
            </div>
          </div>

          {/* Platform & Supplier Ecosystem Card */}
          <div className="bg-card/80 border border-line rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Ecosystem</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-bold border border-emerald-300">
                DIRECTORY
              </span>
            </div>
            <div className="text-xs text-slate-700 font-medium py-3 px-3.5 bg-card rounded-lg border border-line flex flex-wrap gap-x-6 gap-y-2 shadow-sm">
              <div>
                <span className="text-muted block text-[11px]">Verified Sellers</span>
                <strong className="text-emerald-700 text-base font-extrabold">
                  {loading ? '…' : workspace?.verifiedSuppliersCount ?? 0}
                </strong>
              </div>
              <div className="border-r border-line" />
              <div>
                <span className="text-muted block text-[11px]">Open Support Tickets</span>
                <strong className="text-amber-700 text-base font-extrabold">
                  {loading ? '…' : workspace?.openTicketsCount ?? 0}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Support Case Desk Card */}
        <div className="bg-card/80 border border-line rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-purple-600" />
                <span>Customer Care & Support Desk</span>
              </h3>
              {latestTicket ? (
                <div className="bg-card p-3 rounded-lg border border-line space-y-1 text-xs">
                  <p className="font-extrabold text-sky-800">
                    Case #{latestTicket.caseNumber}: {latestTicket.subject}
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    Status: <span className="font-bold text-emerald-700">{latestTicket.status}</span> • Priority: <span className="font-semibold text-amber-700">{latestTicket.priority}</span> • Category: {latestTicket.category}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted">
                  {loading ? 'Checking open support tickets…' : 'No active support tickets open. Need help with quotes, verification, or logistics?'}
                </p>
              )}
            </div>

            <button
              onClick={onOpenSupportModal}
              className="shrink-0 px-4 py-2.5 bg-card hover:bg-line/30 text-sky-800 text-xs font-bold rounded-lg border border-line shadow-sm transition"
            >
              Open Support Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
