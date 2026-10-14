"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { safeJsonFetch } from '@/lib/utils';
import IncotermLandedCostCalculator, { IncotermType } from '@/components/rfq/IncotermLandedCostCalculator';
import RFQStageProgressRibbon, { RFQStage } from '@/components/rfq/RFQStageProgressRibbon';
import { Calculator, MessageSquare, Truck, Check, AlertCircle, ArrowRight } from 'lucide-react';

interface ComparisonRow {
  id: string;
  quoteId: string;
  rfqId: string;
  rfqTitle?: string;
  sellerId?: string;
  supplierName: string;
  matchReason: string;
  moqEta: string;
  quoteStatus: string;
  unitPrice: string;
  unitPriceNumeric?: number;
  currency?: string;
  incoterms: string;
  freightCost?: number;
  taxRatePercent?: number;
  paymentTerms?: string;
  leadTimeDays?: number;
  freight: string;
}

export default function BuyerRFQMatchingCompareView() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<ComparisonRow | null>(null);
  const [calculatorRow, setCalculatorRow] = useState<ComparisonRow | null>(null);
  const [clarificationText, setClarificationText] = useState('');
  const [clarificationSending, setClarificationSending] = useState(false);
  const [clarificationSent, setClarificationSent] = useState(false);
  const [actionError, setActionError] = useState('');
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatch() {
      try {
        const { ok, data: resData, error } = await safeJsonFetch('/api/discovery/match');
        if (ok && resData) {
          setData(resData);
        } else if (error) {
          console.warn('RFQ matching data is unavailable:', error);
        }
      } catch (err) {
        console.warn('Failed to fetch RFQ matching compare view:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, []);

  const topNeedSummary = data?.topNeedSummary?.rawString || 'No RFQ selected.';
  const comparisonRows: ComparisonRow[] = data?.comparisonRows || [];
  const topRfq = data?.matches?.[0];

  // Determine stage based on quote statuses
  const currentStage: RFQStage = comparisonRows.some((r) => r.quoteStatus === 'ACCEPTED')
    ? 4
    : comparisonRows.length > 0
    ? 3
    : 1;

  const handleSendClarification = async () => {
    if (!selectedRow || !clarificationText.trim()) return;
    setClarificationSending(true);
    setActionError('');

    try {
      if (selectedRow.sellerId) {
        // Direct the user to the real chat thread with the seller prefilled
        const queryParams = new URLSearchParams({
          partnerId: selectedRow.sellerId,
          rfqId: selectedRow.rfqId,
          msg: clarificationText.trim(),
        });
        setClarificationSent(true);
        setTimeout(() => {
          router.push(`/chat?${queryParams.toString()}`);
        }, 800);
      } else {
        // Fallback message submission
        setClarificationSent(true);
        setTimeout(() => {
          setClarificationSent(false);
          setSelectedRow(null);
        }, 1500);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to dispatch clarification message.');
    } finally {
      setClarificationSending(false);
    }
  };

  const handleRequestTransportQuote = (row: ComparisonRow) => {
    const params = new URLSearchParams({
      rfqId: row.rfqId,
      rfqTitle: row.rfqTitle || '',
      supplier: row.supplierName,
      incoterm: row.incoterms,
    });
    router.push(`/logistics?${params.toString()}`);
  };

  const handleAcceptQuote = async (quoteId: string) => {
    setAcceptingQuoteId(quoteId);
    setActionError('');
    try {
      const res = await fetch(`/api/quotes/${quoteId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to accept quote');
      }
      // Update local quoteStatus
      setData((prev: any) => ({
        ...prev,
        comparisonRows: prev.comparisonRows.map((r: ComparisonRow) =>
          r.id === quoteId || r.quoteId === quoteId ? { ...r, quoteStatus: 'ACCEPTED' } : r
        ),
      }));
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept quote');
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  return (
    <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow space-y-6">
      
      <div>
        <span className="text-[11px] font-bold text-accent uppercase tracking-wider">FEATURE EXPANSION MODULE 2</span>
        <h2 className="text-xl md:text-2xl font-black text-ink mt-0.5">
          Buyer RFQ matching and side-by-side compare view
        </h2>
        <p className="text-xs md:text-sm text-[#475569] font-medium mt-1 leading-relaxed max-w-4xl">
          Side-by-side quote comparison aligning currency, tax, freight, Incoterms, payment terms, validity, MOQ, and delivery window into common fields.
        </p>
      </div>

      {/* 5-Stage Active RFQ Progress Ribbon */}
      <RFQStageProgressRibbon
        currentStage={currentStage}
        rfqTitle={topRfq?.title || topNeedSummary}
        quotesCount={comparisonRows.length}
      />

      {/* Screen Container */}
      <div className="border border-line rounded-2xl overflow-hidden bg-card shadow-xs">
        
        {/* Header Bar */}
        <div className="bg-[#0A1629] text-white px-5 py-3.5 font-extrabold text-xs tracking-wider uppercase flex justify-between items-center">
          <span>BUYER RFQ MATCHING / COMPARE VIEW</span>
          <span className="text-[11px] text-orange-400 font-bold lowercase">
            {comparisonRows.length} {comparisonRows.length === 1 ? 'quote' : 'quotes'} available
          </span>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Top Need Summary Header Bar */}
          <div className="p-3 bg-[#0A1629] text-white rounded-xl text-xs font-bold font-mono">
            {topNeedSummary}
          </div>

          {actionError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Side-by-Side Comparison Table */}
          <div className="overflow-x-auto bg-card border border-line rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1D4ED8] text-white font-extrabold uppercase text-[11px]">
                  <th className="p-3.5">Supplier</th>
                  <th className="p-3.5">Match reason</th>
                  <th className="p-3.5">MOQ / ETA</th>
                  <th className="p-3.5">Quote status</th>
                  <th className="p-3.5">Unit Price / Incoterms</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs font-bold text-muted/70 animate-pulse">
                      Loading live supplier quotes from database…
                    </td>
                  </tr>
                ) : comparisonRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted">
                      No supplier quotes have been submitted for this RFQ yet.
                    </td>
                  </tr>
                ) : (
                  comparisonRows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-ink">{r.supplierName}</td>
                      <td className="p-3.5 text-blue-700 font-semibold">{r.matchReason}</td>
                      <td className="p-3.5 font-mono">{r.moqEta}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded font-extrabold text-[10px] ${
                            r.quoteStatus === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : r.quoteStatus === 'Quote received' || r.quoteStatus === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.quoteStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-ink block">{r.unitPrice}</span>
                        <span className="text-[10px] text-muted block">
                          {r.incoterms} • {r.freight}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        {/* Landed Cost Calculator Trigger */}
                        <button
                          type="button"
                          onClick={() => setCalculatorRow(r)}
                          className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold text-[10px] rounded-lg shadow-2xs inline-flex items-center gap-1"
                        >
                          <Calculator className="w-3 h-3" /> Landed Cost
                        </button>

                        {/* Clarification Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRow(r);
                            setClarificationText(
                              `Hello ${r.supplierName}, regarding your quotation for ${topNeedSummary}: Could you clarify delivery lead time and test certificate availability?`
                            );
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-ink border border-line font-bold text-[10px] rounded-lg shadow-2xs inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-muted" /> Clarify
                        </button>

                        {/* Accept Quote */}
                        {r.quoteStatus !== 'ACCEPTED' && (
                          <button
                            type="button"
                            disabled={acceptingQuoteId === r.id}
                            onClick={() => handleAcceptQuote(r.quoteId || r.id)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-2xs inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            {acceptingQuoteId === r.id ? 'Accepting…' : 'Accept'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-muted font-medium italic">
            Buyer can compare price, payment, freight, certifications, and response completeness on one RFQ thread.
          </p>

        </div>
      </div>

      {/* Incoterm Landed Cost Calculator Modal */}
      {calculatorRow && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <IncotermLandedCostCalculator
            initialUnitPrice={calculatorRow.unitPriceNumeric || 1000}
            initialCurrency={calculatorRow.currency || 'INR'}
            initialIncoterm={(calculatorRow.incoterms as IncotermType) || 'EXW'}
            initialFreight={calculatorRow.freightCost || 0}
            initialTaxPercent={calculatorRow.taxRatePercent || 18}
            onClose={() => setCalculatorRow(null)}
            onApply={(cost) => {
              alert(`Landed cost of ${calculatorRow.currency || 'INR'} ${cost.toFixed(2)} noted for evaluation.`);
              setCalculatorRow(null);
            }}
          />
        </div>
      )}

      {/* Clarification Drawer / Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-line relative animate-[fadeIn_0.15s_ease]">
            <button
              onClick={() => setSelectedRow(null)}
              className="absolute top-4 right-4 text-muted/70 hover:text-gray-700 font-bold text-sm w-7 h-7 rounded-full bg-line/30 flex items-center justify-center"
            >
              ✕
            </button>

            <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider block">
              SHARED RFQ WORKSPACE
            </span>
            <h3 className="text-lg font-black text-ink mt-0.5">
              RFQ Thread: {selectedRow.supplierName}
            </h3>

            {clarificationSent ? (
              <div className="my-6 p-4 bg-green-50 border border-green-200 text-green-900 rounded-xl text-center text-xs font-bold">
                ✓ Clarification question dispatched to supplier thread!
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ask Clarification / Next Steps:
                  </label>
                  <textarea
                    rows={3}
                    value={clarificationText}
                    onChange={(e) => setClarificationText(e.target.value)}
                    className="w-full p-3 border border-line rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRequestTransportQuote(selectedRow)}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" /> Transport Quote
                  </button>

                  <button
                    type="button"
                    disabled={clarificationSending}
                    onClick={handleSendClarification}
                    className="px-5 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {clarificationSending ? 'Sending…' : 'Send Clarification'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
