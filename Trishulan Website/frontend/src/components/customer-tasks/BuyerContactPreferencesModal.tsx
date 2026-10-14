'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { safeJsonFetch } from '@/lib/utils';

interface BuyerContactPreferencesModalProps {
  rfqId?: string;
  productName?: string;
  quantity?: string;
  suppliers?: { id: string; name: string }[];
  onClose?: () => void;
  onSuccess?: (data: any) => void;
}

export default function BuyerContactPreferencesModal({
  rfqId = '',
  productName = '',
  quantity = '',
  suppliers = [],
  onClose,
  onSuccess,
}: BuyerContactPreferencesModalProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [sharePhone, setSharePhone] = useState<boolean>(false);
  const [allowWhatsApp, setAllowWhatsApp] = useState<boolean>(false);
  const [futureOffers, setFutureOffers] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<{ error?: string; success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    async function loadConsent() {
      try {
        const { ok, data } = await safeJsonFetch<{ consent?: { allowPhoneSharing: boolean; allowWhatsappAlerts: boolean; allowMarketing: boolean } }>('/api/customer/consent');
        if (ok && data?.consent) {
          setSharePhone(Boolean(data.consent.allowPhoneSharing));
          setAllowWhatsApp(Boolean(data.consent.allowWhatsappAlerts));
          setFutureOffers(Boolean(data.consent.allowMarketing));
        }
      } catch (err) {
        console.warn('Failed to load consent:', err);
      }
    }
    loadConsent();
  }, []);

  const toggleSupplier = (id: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleConsentSubmit = async (withPhone?: boolean) => {
    setLoading(true);
    setSubmissionResult(null);

    try {
      const payload: Record<string, any> = {
        allowPhoneSharing: withPhone !== undefined ? withPhone && sharePhone : sharePhone,
        allowWhatsappAlerts: withPhone !== undefined ? withPhone && allowWhatsApp : allowWhatsApp,
        allowMarketing: withPhone !== undefined ? withPhone && futureOffers : futureOffers,
        consentWording: rfqId
          ? 'Buyer submitted RFQ contact preferences'
          : 'User updated communication preferences in Customer Workspace',
      };

      if (rfqId) {
        payload.rfqId = rfqId;
        payload.productName = productName;
        payload.quantity = quantity;
        payload.sellerIds = selectedSuppliers;
      }

      const { ok, data, error } = await safeJsonFetch('/api/customer/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!ok) {
        setSubmissionResult({ error: error || 'Failed to update preferences' });
      } else {
        setSubmissionResult({ success: true, message: data?.message || 'Contact preferences saved successfully' });
        if (onSuccess) onSuccess(data);
      }
    } catch (err: any) {
      setSubmissionResult({ error: err.message || 'Failed to register contact preferences' });
    } finally {
      setLoading(false);
    }
  };

  const isRfqModal = Boolean(rfqId);

  return (
    <div className="bg-card border border-line rounded-xl overflow-hidden shadow text-ink max-w-4xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-card px-6 py-3.5 border-b border-line flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
          BUYER CONTACT PREFERENCES
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted hover:text-slate-900 text-xs font-bold transition"
          >
            ✕ Close
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Contact preference form */}
        <div className="bg-card/80 border border-line rounded-xl p-6 space-y-5">
          {isRfqModal ? (
            <>
              <div>
                <span className="text-sm font-semibold text-muted">Your RFQ: </span>
                <span className="text-base font-extrabold text-ink">
                  {productName ? `${productName}${quantity ? `, ${quantity}` : ''}` : 'Active RFQ'}
                </span>
              </div>

              {suppliers.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-medium">
                  <span className="font-bold text-ink">Send request to:</span>
                  {suppliers.map((sup) => (
                    <label
                      key={sup.id}
                      className="flex items-center gap-1.5 cursor-pointer bg-card px-3 py-1.5 rounded-lg border border-line hover:border-emerald-500 shadow-sm transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(sup.id)}
                        onChange={() => toggleSupplier(sup.id)}
                        className="rounded border-line text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-800">{sup.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <hr className="border-line my-4" />
            </>
          ) : (
            <div className="pb-2 border-b border-line">
              <h3 className="text-sm font-bold text-ink">Communication & Privacy Channels</h3>
              <p className="text-xs text-muted mt-0.5">
                Manage how sellers and the platform can contact you for quotes, order updates, and inquiries.
              </p>
            </div>
          )}

          {/* Consent Checkboxes */}
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4 p-3.5 bg-card rounded-xl border border-line shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sharePhone}
                  onChange={(e) => setSharePhone(e.target.checked)}
                  className="mt-1 rounded border-line text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-ink">Share phone with verified sellers</span>
                  <p className="text-xs text-muted mt-0.5">Allow verified suppliers to contact you by phone regarding your RFQs.</p>
                </div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4 p-3.5 bg-card rounded-xl border border-line shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowWhatsApp}
                  onChange={(e) => setAllowWhatsApp(e.target.checked)}
                  className="mt-1 rounded border-line text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-ink">WhatsApp notifications & alerts</span>
                  <p className="text-xs text-muted mt-0.5">Receive real-time lead updates, quote responses, and dispatch notices on WhatsApp.</p>
                </div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4 p-3.5 bg-card rounded-xl border border-line shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={futureOffers}
                  onChange={(e) => setFutureOffers(e.target.checked)}
                  className="mt-1 rounded border-line text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-ink">Platform announcements & product updates</span>
                  <p className="text-xs text-muted mt-0.5">Receive optional news about verified listings, market price benchmarks, and deals.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-line">
            {isRfqModal ? (
              <>
                <button
                  onClick={() => handleConsentSubmit(false)}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-line hover:bg-line/30 text-slate-700 font-bold text-xs transition"
                >
                  Continue without phone sharing
                </button>
                <button
                  onClick={() => handleConsentSubmit(true)}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Send RFQ with selected options'}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConsentSubmit()}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save Communication Preferences'}
              </button>
            )}
          </div>
        </div>

        {/* Backend Confirmation Alert */}
        {submissionResult && (
          <div className={`p-4 rounded-xl text-xs border ${submissionResult.error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            {submissionResult.error ? (
              <p className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /><span>{submissionResult.error}</span></p>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-800">{submissionResult.message || 'Contact Preferences Saved Successfully'}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
