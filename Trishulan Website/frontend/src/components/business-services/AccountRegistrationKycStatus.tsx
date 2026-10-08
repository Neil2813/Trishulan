'use client';

import React, { useState, useEffect } from 'react';

interface KycDocument {
  id: string;
  requirement: string;
  requestedItem: string;
  status: string;
  fileUrl?: string | null;
  statusColor: string;
  issueExplanation?: string;
}

interface KycStatusData {
  accountType: string;
  stepper: Array<{ step: number; title: string; status: string }>;
  documents: KycDocument[];
  consentCaptured: boolean;
  privacyNotice: string;
  journeySteps: Array<{ step: number; label: string; active: boolean; current?: boolean }>;
  exampleText: string;
}

export default function AccountRegistrationKycStatus() {
  const [data, setData] = useState<KycStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Re-upload form state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('address_proof_utility_bill.pdf');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/business-services/kyc-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.kycStatus || json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KYC status metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const handleReuploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) return;

    setUploading(true);
    try {
      const res = await fetch('/api/business-services/reupload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedDocId, fileName }),
      });
      const json = await res.json();
      setUploadResult(json);
      setSelectedDocId(null);
    } catch (err: any) {
      setUploadResult({ error: err.message || 'Failed to submit document re-upload' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>ACCOUNT REGISTRATION / KYC STATUS / ILLUSTRATIVE</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Connecting to Express backend...)</span>}
        </h2>
        <button
          onClick={fetchKycStatus}
          className="text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg text-slate-800 shadow-sm transition"
        >
          🔄 Refresh State
        </button>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Stepper (4 steps) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(data?.stepper || [
            { step: 1, title: 'Account', status: 'Done' },
            { step: 2, title: 'Contact check', status: 'Done' },
            { step: 3, title: 'Identity / business', status: 'In review' },
            { step: 4, title: 'Approval', status: 'Pending' },
          ]).map((st) => (
            <div
              key={st.step}
              className={`p-3.5 rounded-xl border flex items-center gap-3 shadow-sm ${
                st.status === 'Done'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : st.status === 'In review'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs ${
                  st.status === 'Done'
                    ? 'bg-emerald-600 text-white'
                    : st.status === 'In review'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {st.step}
              </span>
              <div>
                <div className="font-extrabold text-xs text-[#0A1629]">{st.title}</div>
                <div className="text-[10px] font-mono font-semibold capitalize">{st.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Submitted for business account Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-extrabold text-[#0A1629]">Submitted for business account</span>
            <span className="text-[10px] text-slate-600 font-mono font-bold">Role: {data?.accountType || 'BUSINESS_SELLER'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold bg-slate-50">
                  <th className="p-3.5">Requirement</th>
                  <th className="p-3.5">Requested Item</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(data?.documents || []).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-[#0A1629]">{doc.requirement}</td>
                    <td className="p-3.5 text-slate-700">{doc.requestedItem}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          doc.status === 'Received'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {doc.status === 'Needs review' ? (
                        <button
                          onClick={() => setSelectedDocId(doc.id)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow transition"
                        >
                          Secure Re-upload
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">✓ Uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Re-upload Drawer if Needs Review */}
        {selectedDocId && (
          <form onSubmit={handleReuploadSubmit} className="bg-amber-50 border border-amber-300 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-amber-900">Re-upload Corrected Business Address Evidence</h4>
            <p className="text-[11px] text-amber-800">
              {(data?.documents?.find((d) => d.id === selectedDocId)?.issueExplanation) || 'Document needs clear resubmission.'}
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter filename or document reference (e.g. electricity_bill_2026.pdf)..."
                className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#0A1629] focus:outline-none"
              />
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Submit File'}
              </button>
            </div>
          </form>
        )}

        {uploadResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg font-mono">
            ✓ {uploadResult.message}
          </div>
        )}

        {/* Consent Banner Callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 italic text-center">
          {data?.privacyNotice || 'Consent, secure upload, purpose, retention and support contact shown before submission.'}
        </div>

        {/* 6-Step Journey Flow Timeline */}
        <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
          <span className="text-xs font-bold text-[#0A1629] uppercase block">Account Creation and KYC Journey</span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(data?.journeySteps || [
              { step: 1, label: 'Create account', active: true },
              { step: 2, label: 'Verify contact', active: true },
              { step: 3, label: 'Select account type', active: true },
              { step: 4, label: 'Submit consent', active: true },
              { step: 5, label: 'Review / correct', active: true, current: true },
              { step: 6, label: 'KYC status active', active: false },
            ]).map((js, idx) => (
              <React.Fragment key={js.step}>
                {idx > 0 && <span className="text-slate-400">→</span>}
                <div
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${
                    js.current
                      ? 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                      : js.active
                      ? 'bg-emerald-100 text-emerald-900 font-medium border-emerald-300'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white font-bold flex items-center justify-center text-[10px]">
                    {js.step}
                  </span>
                  <span>{js.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">Example Spec Scenario:</p>
          <p className="italic leading-relaxed">
            "{data?.exampleText || 'a new industrial supplier registers with a work email, confirms its phone, selects a business-seller account and uploads the business document and authorized-person evidence requested for its region. The dashboard shows "Address evidence - needs review," explains the issue, and offers a secure re-upload. The supplier can see what features are available while review is pending.'}"
          </p>
        </div>
      </div>
    </div>
  );
}
