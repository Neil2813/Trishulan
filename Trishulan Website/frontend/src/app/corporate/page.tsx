"use client";

import React, { useState } from 'react';

export default function CorporatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [serviceType, setServiceType] = useState('TRADEMARK');
  const [companyName, setCompanyName] = useState('');
  const [entityType, setEntityType] = useState('MSME');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-12 px-6">
      <div className="max-w-[800px] mx-auto bg-white rounded-[24px] border border-gray-200 shadow-xl p-8 md:p-10">
        
        <div className="text-center mb-8">
          <span className="text-[12px] font-bold text-purple-600 uppercase tracking-wider">CORPORATE ADMINISTRATION SERVICES</span>
          <h1 className="text-[32px] font-black text-[#0A1629] mt-1">Trademark & Firm Registration</h1>
          <p className="text-xs text-gray-500 mt-1">
            Unbundled pay-per-use administrative and legal gateways for industrial firms, LLPs & Private Limited companies.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center text-emerald-900">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-extrabold text-[18px]">Consultation Request Submitted</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Our legal administration team will contact you within 4 hours with government fee breakdowns & filing details.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Corporate Service Needed</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                >
                  <option value="TRADEMARK">Trademark Registration (Govt e-Filing)</option>
                  <option value="FIRM_REGISTRATION">Business Registration (Firm / LLP / Pvt Ltd)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Entity Structure</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                >
                  <option value="MSME">MSME / Small Enterprise (₹4,500 Govt Fee)</option>
                  <option value="PvtLtd">Standard Pvt Ltd / LLP (₹9,000 Govt Fee)</option>
                  <option value="Proprietorship">Proprietorship Firm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1">Company / Brand Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Trishulan Industrial Equipments Pvt Ltd"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
              <div className="font-bold">Transparent Pricing Guarantee:</div>
              <div>• Trademark e-filing: ₹4,500 (MSME) to ₹9,000 (Standard) + filing consultation.</div>
              <div>• Business Registration: Case-by-case structural quote based on state stamp duty.</div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Request Corporate Legal Consultation →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
