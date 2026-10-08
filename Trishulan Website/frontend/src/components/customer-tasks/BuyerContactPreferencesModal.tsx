'use client';

import React, { useState } from 'react';

interface BuyerContactPreferencesModalProps {
  rfqId?: string;
  productName?: string;
  quantity?: string;
  suppliers?: { id: string; name: string }[];
  onClose?: () => void;
  onSuccess?: (data: any) => void;
}

export default function BuyerContactPreferencesModal({
  rfqId = 'rfq-208',
  productName = 'SS304 M12 bolts',
  quantity = '5,000 pcs',
  suppliers = [
    { id: 'sup-1', name: 'Supplier 1 (Apex Fasteners)' },
    { id: 'sup-2', name: 'Supplier 2 (Precision Steel)' },
    { id: 'sup-3', name: 'Supplier 3 (BoltsDirect)' },
  ],
  onClose,
  onSuccess,
}: BuyerContactPreferencesModalProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(['sup-1']);
  const [sharePhone, setSharePhone] = useState<boolean>(true);
  const [allowWhatsApp, setAllowWhatsApp] = useState<boolean>(false);
  const [futureOffers, setFutureOffers] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const toggleSupplier = (id: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleConsentSubmit = async (withPhone: boolean) => {
    setLoading(true);
    setSubmissionResult(null);

    try {
      const payload = {
        rfqId,
        productName,
        quantity,
        sellerIds: selectedSuppliers,
        sharePhone: withPhone ? sharePhone : false,
        allowWhatsApp: withPhone ? allowWhatsApp : false,
        futureOffers: withPhone ? futureOffers : false,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch('/api/customer/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSubmissionResult(data);
      if (onSuccess) onSuccess(data);
    } catch (err: any) {
      setSubmissionResult({ error: err.message || 'Failed to register contact preferences' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-4xl w-full mx-auto my-6 font-sans">
      {/* Top Illustrative Header Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
          BUYER CONTACT PREFERENCES / ILLUSTRATIVE
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 text-xs font-bold transition"
          >
            ✕ Close
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Main Mock Form Card */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <span className="text-sm font-semibold text-slate-600">Your RFQ: </span>
            <span className="text-base font-extrabold text-[#0A1629]">
              {productName}, {quantity}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-medium">
            <span className="font-bold text-[#0A1629]">Send request to:</span>
            {suppliers.map((sup) => (
              <label
                key={sup.id}
                className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-500 shadow-sm transition"
              >
                <input
                  type="checkbox"
                  checked={selectedSuppliers.includes(sup.id)}
                  onChange={() => toggleSupplier(sup.id)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-800">{sup.name}</span>
              </label>
            ))}
          </div>

          <hr className="border-slate-200 my-4" />

          {/* Consent Checkboxes */}
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sharePhone}
                  onChange={(e) => setSharePhone(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-[#0A1629]">
                    Share phone with {selectedSuppliers.length === 1 ? suppliers.find(s => s.id === selectedSuppliers[0])?.name || 'Selected Supplier' : 'Selected Suppliers'}
                  </span>
                </div>
              </label>
              <span className="text-xs text-slate-500 italic">This seller may call about this RFQ.</span>
            </div>

            <div className="flex items-start justify-between gap-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowWhatsApp}
                  onChange={(e) => setAllowWhatsApp(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-[#0A1629]">
                    Allow {selectedSuppliers.length === 1 ? suppliers.find(s => s.id === selectedSuppliers[0])?.name || 'Selected Supplier' : 'Selected Suppliers'} on WhatsApp
                  </span>
                </div>
              </label>
              <span className="text-xs text-slate-500 italic">This named seller may message about this RFQ.</span>
            </div>

            <div className="flex items-start justify-between gap-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={futureOffers}
                  onChange={(e) => setFutureOffers(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-[#0A1629]">Future product offers</span>
                </div>
              </label>
              <span className="text-xs text-slate-500 italic">Optional marketing messages, separate choice.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <button
              onClick={() => handleConsentSubmit(false)}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
            >
              Continue on site without phone sharing
            </button>
            <button
              onClick={() => handleConsentSubmit(true)}
              disabled={loading || selectedSuppliers.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send RFQ with selected contact options'}
            </button>
          </div>
        </div>

        {/* Backend Confirmation Alert */}
        {submissionResult && (
          <div className={`p-4 rounded-xl text-xs font-mono border ${submissionResult.error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
            {submissionResult.error ? (
              <p>⚠️ {submissionResult.error}</p>
            ) : (
              <div>
                <p className="font-bold text-emerald-800">✓ Express Backend Recorded Consent Record #{submissionResult.consentRecord?.id || 'OK'}:</p>
                <pre className="mt-2 text-[11px] overflow-x-auto text-emerald-900 bg-white p-3 rounded-lg border border-emerald-200">
                  {JSON.stringify(submissionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Requirements Bullet List from Spec */}
        <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-200">
          <p className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">•</span>
            <span>Show the exact product/RFQ and selected seller names before the buyer submits. Explain what contact information each seller will receive and for what purpose.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">•</span>
            <span>Keep permission to share the number on the site separate from permission for the named seller to contact the buyer on WhatsApp, and separate both from future offers. Save the consent wording, time, channel, seller IDs and RFQ reference.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">•</span>
            <span>Create a lead record in Trishulan Industrial Connect's company-managed database/CRM: buyer ID, requested product, quantity, location, selected seller IDs, permitted contact channels, status, timestamps and source page. Store a phone number only when needed and permitted.</span>
          </p>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">Example Privacy Workflow:</p>
          <p className="italic leading-relaxed">
            "A buyer searches for a product but their phone stays private. They submit an RFQ and select two named suppliers. They choose to share their phone through the site and separately allow those sellers to WhatsApp about that RFQ. Each supplier gets the lead in its site inbox and a WhatsApp alert; the phone number is revealed only through the allowed contact route. The CRM records the choices and routes the lead only to those suppliers."
          </p>
        </div>
      </div>
    </div>
  );
}
