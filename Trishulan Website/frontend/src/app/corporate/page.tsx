"use client";

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CorporatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [serviceType, setServiceType] = useState('TRADEMARK');
  const [companyName, setCompanyName] = useState('');
  const [entityType, setEntityType] = useState('MSME');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/business-services/corporate-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          companyName,
          entityType,
          details,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Could not submit your consultation request.');
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit your consultation request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-6">
      <div className="max-w-[800px] mx-auto bg-card rounded-[24px] border border-line shadow-xl p-8 md:p-10">
        
        <div className="text-center mb-8">
          <span className="text-[12px] font-bold text-purple-600 uppercase tracking-wider">CORPORATE ADMINISTRATION SERVICES</span>
          <h1 className="text-[32px] font-black text-ink mt-1">Trademark & Firm Registration</h1>
          <p className="text-xs text-muted mt-1">
            Unbundled pay-per-use administrative and legal gateways for industrial firms, LLPs & Private Limited companies.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center text-emerald-900">
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-extrabold text-[18px]">Consultation Request Submitted</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Our legal administration team will contact you within 4 hours with government fee breakdowns & filing details.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Corporate Service Needed</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-bold bg-card"
                >
                  <option value="TRADEMARK">Trademark Registration (Govt e-Filing)</option>
                  <option value="FIRM_REGISTRATION">Business Registration (Firm / LLP / Pvt Ltd)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Entity Structure</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-bold bg-card"
                >
                  <option value="MSME">MSME / Small Enterprise (₹4,500 Govt Fee)</option>
                  <option value="PvtLtd">Standard Pvt Ltd / LLP (₹9,000 Govt Fee)</option>
                  <option value="Proprietorship">Proprietorship Firm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Company / Brand Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Trishulan Industrial Equipments Pvt Ltd"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label htmlFor="corporate-request-details" className="mb-1 block text-xs font-bold text-ink">What do you need help with? <span className="font-medium text-muted">(optional)</span></label>
              <textarea
                id="corporate-request-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Share a few details so the team can prepare for your consultation."
                className="w-full resize-y rounded-xl border border-gray-300 bg-card px-4 py-3 text-xs focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
              <div className="font-bold">Transparent Pricing Guarantee:</div>
              <div>• Trademark e-filing: ₹4,500 (MSME) to ₹9,000 (Standard) + filing consultation.</div>
              <div>• Business Registration: Case-by-case structural quote based on state stamp duty.</div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:cursor-wait disabled:opacity-70 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              {submitting ? 'Submitting request…' : 'Request Corporate Legal Consultation →'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
