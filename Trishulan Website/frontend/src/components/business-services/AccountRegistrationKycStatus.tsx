'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

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

interface PincodeLookupResult {
  pincode: string;
  city?: string;
  district?: string;
  state?: string;
  postOffices?: string[];
}

interface PanVerificationResult {
  valid: boolean;
  nameMatched?: boolean;
  dateOfBirthMatched?: boolean;
  entityType?: string;
  statusMessage?: string;
  error?: string;
}

export default function AccountRegistrationKycStatus() {
  const [data, setData] = useState<KycStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Re-upload form state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [pincodeResult, setPincodeResult] = useState<PincodeLookupResult | null>(null);
  const [pan, setPan] = useState('');
  const [panName, setPanName] = useState('');
  const [panDateOfBirth, setPanDateOfBirth] = useState('');
  const [panConsent, setPanConsent] = useState(false);
  const [panLoading, setPanLoading] = useState(false);
  const [panError, setPanError] = useState<string | null>(null);
  const [panResult, setPanResult] = useState<PanVerificationResult | null>(null);

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

  const handlePincodeLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) return;

    setPincodeLoading(true);
    setPincodeError(null);
    setPincodeResult(null);
    try {
      const res = await fetch(`/api/business-services/pincode-lookup?pincode=${encodeURIComponent(pincode)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.data?.error || json.error || 'Unable to look up this pincode');
      }
      setPincodeResult(json.data);
    } catch (err: any) {
      setPincodeError(err.message || 'Unable to look up this pincode');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePanVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panConsent || panLoading) return;

    const [year, month, day] = panDateOfBirth.split('-');
    const dateOfBirth = `${day}/${month}/${year}`;
    setPanLoading(true);
    setPanError(null);
    setPanResult(null);
    try {
      const res = await fetch('/api/kyc/verify-pan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pan: pan.trim().toUpperCase(),
          name: panName.trim(),
          dateOfBirth,
          consent: panConsent,
          reason: 'Business customer onboarding KYC verification',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `PAN verification failed (HTTP ${res.status})`);
      }
      setPanResult(json);
    } catch (err: unknown) {
      setPanError(err instanceof Error ? err.message : 'PAN verification failed');
    } finally {
      setPanLoading(false);
    }
  };

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
    <div className="bg-card border border-line rounded-xl overflow-hidden shadow text-ink max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-card px-6 py-3.5 border-b border-line flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-ink uppercase flex items-center gap-2">
          <span>ACCOUNT REGISTRATION / KYC STATUS</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Loading...)</span>}
        </h2>
        <button
          onClick={fetchKycStatus}
          className="text-xs font-bold bg-card hover:bg-line/30 border border-line px-3 py-1 rounded-lg text-slate-800 shadow-sm transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh State</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stepper (4 steps) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(data?.stepper || []).map((st) => (
            <div
              key={st.step}
              className={`p-3.5 rounded-xl border flex items-center gap-3 shadow-sm ${
                st.status === 'Done'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : st.status === 'In review'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-card border-line text-muted'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs ${
                  st.status === 'Done'
                    ? 'bg-emerald-600 text-white'
                    : st.status === 'In review'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-300 text-muted'
                }`}
              >
                {st.step}
              </span>
              <div>
                <div className="font-extrabold text-xs text-ink">{st.title}</div>
                <div className="text-[10px] font-mono font-semibold capitalize">{st.status}</div>
              </div>
            </div>
          ))}
        </div>
        {!loading && !error && !data?.stepper?.length && (
          <p className="text-xs text-muted">Verification progress is not available.</p>
        )}

        <section className="bg-card border border-line rounded-xl p-4 space-y-3">
          <div>
            <h3 className="text-xs font-extrabold text-ink">Verify PAN details</h3>
            <p className="text-[11px] text-muted mt-1">
              PAN status, holder name, and date of birth are checked with the verification provider.
              Your consent is required. Verification is available to signed-in users.
            </p>
          </div>
          <form onSubmit={handlePanVerification} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="kyc-pan" className="block text-[11px] font-semibold text-ink mb-1">PAN number</label>
              <input
                id="kyc-pan"
                type="text"
                autoComplete="off"
                maxLength={10}
                required
                pattern="[A-Z]{3}[ABCFGHLJPT][A-Z][0-9]{4}[A-Z]"
                value={pan}
                onChange={(e) => {
                  setPan(e.target.value.toUpperCase().slice(0, 10));
                  setPanResult(null);
                  setPanError(null);
                }}
                placeholder="ABCDE1234F"
                className="w-full bg-card border border-line rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label htmlFor="kyc-pan-name" className="block text-[11px] font-semibold text-ink mb-1">Name as printed on PAN</label>
              <input
                id="kyc-pan-name"
                type="text"
                autoComplete="name"
                minLength={2}
                required
                value={panName}
                onChange={(e) => {
                  setPanName(e.target.value);
                  setPanResult(null);
                  setPanError(null);
                }}
                className="w-full bg-card border border-line rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label htmlFor="kyc-pan-dob" className="block text-[11px] font-semibold text-ink mb-1">Date of birth / incorporation</label>
              <input
                id="kyc-pan-dob"
                type="date"
                required
                value={panDateOfBirth}
                onChange={(e) => {
                  setPanDateOfBirth(e.target.value);
                  setPanResult(null);
                  setPanError(null);
                }}
                className="w-full bg-card border border-line rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <label className="sm:col-span-2 flex items-start gap-2 text-[11px] text-ink">
              <input
                type="checkbox"
                checked={panConsent}
                onChange={(e) => {
                  setPanConsent(e.target.checked);
                  setPanResult(null);
                  setPanError(null);
                }}
                className="mt-0.5 accent-emerald-600"
              />
              <span>
                I consent to Trishulan sending this PAN, name, and date of birth to its verification provider
                for business customer onboarding verification.
              </span>
            </label>
            <div className="sm:col-span-2 flex items-center gap-3 flex-wrap">
              <button
                type="submit"
                disabled={!panConsent || panLoading}
                className="px-4 py-2 bg-accent hover:opacity-90 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
              >
                {panLoading ? 'Verifying...' : 'Verify PAN'}
              </button>
              {panError && <p role="alert" className="text-xs text-rose-700">{panError}</p>}
              {panResult?.valid && (
                <p role="status" className="text-xs text-emerald-800 font-semibold">
                  {panResult.statusMessage || 'PAN, holder name, and date of birth verified'}
                </p>
              )}
              {panResult && !panResult.valid && (
                <p role="alert" className="text-xs text-rose-700">{panResult.error || 'PAN verification did not pass'}</p>
              )}
            </div>
          </form>
        </section>

        <section className="bg-card border border-line rounded-xl p-4 space-y-3">
          <div>
            <h3 className="text-xs font-extrabold text-ink">Postal code lookup</h3>
            <p className="text-[11px] text-muted mt-1">
              Find the city/locality, district, and state for an Indian 6-digit PIN code using India Post data.
              This does not verify identity, address ownership, or PAN/GSTIN records.
            </p>
          </div>
          <form onSubmit={handlePincodeLookup} className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="kyc-pincode" className="sr-only">6-digit postal PIN code</label>
            <input
              id="kyc-pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setPincodeError(null);
                setPincodeResult(null);
              }}
              placeholder="Enter 6-digit PIN code"
              className="flex-1 bg-card border border-line rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="submit"
              disabled={pincode.length !== 6 || pincodeLoading}
              className="px-4 py-2 bg-accent hover:opacity-90 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
            >
              {pincodeLoading ? 'Looking up...' : 'Look up PIN code'}
            </button>
          </form>
          {pincodeError && (
            <p role="alert" className="text-xs text-rose-700">{pincodeError}</p>
          )}
          {pincodeResult && (
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs">
              <div>
                <dt className="text-emerald-800 font-semibold">City / locality</dt>
                <dd className="text-emerald-950 mt-0.5">{pincodeResult.city || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-emerald-800 font-semibold">District</dt>
                <dd className="text-emerald-950 mt-0.5">{pincodeResult.district || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-emerald-800 font-semibold">State</dt>
                <dd className="text-emerald-950 mt-0.5">{pincodeResult.state || 'Not available'}</dd>
              </div>
              {!!pincodeResult.postOffices?.length && (
                <div className="sm:col-span-3">
                  <dt className="text-emerald-800 font-semibold">Post offices</dt>
                  <dd className="text-emerald-950 mt-0.5">{pincodeResult.postOffices.join(', ')}</dd>
                </div>
              )}
            </dl>
          )}
        </section>

        {/* Submitted for business account Table */}
        <div className="bg-card border border-line rounded-xl overflow-hidden shadow-sm">
          <div className="bg-card px-4 py-3 border-b border-line flex justify-between items-center">
            <span className="text-xs font-extrabold text-ink">Submitted for business account</span>
            <span className="text-[10px] text-muted font-mono font-bold">Role: {data?.accountType || '—'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line text-muted text-[10px] uppercase font-bold bg-card">
                  <th className="p-3.5">Requirement</th>
                  <th className="p-3.5">Requested Item</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(data?.documents || []).map((doc) => (
                  <tr key={doc.id} className="hover:bg-card transition">
                    <td className="p-3.5 font-bold text-ink">{doc.requirement}</td>
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
                {!loading && !error && !data?.documents?.length && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted">
                      No verification documents are available.
                    </td>
                  </tr>
                )}
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
                className="flex-1 bg-card border border-line rounded px-3 py-2 text-xs text-ink focus:outline-none"
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
        <div className="bg-card/80 border border-line p-4 rounded-xl space-y-3">
          <span className="text-xs font-bold text-ink uppercase block">Account Creation and KYC Journey</span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(data?.journeySteps || []).map((js, idx) => (
              <React.Fragment key={js.step}>
                {idx > 0 && <span className="text-muted/70">→</span>}
                <div
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${
                    js.current
                      ? 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                      : js.active
                      ? 'bg-emerald-100 text-emerald-900 font-medium border-emerald-300'
                      : 'bg-card text-muted/70 border-line'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[10px]">
                    {js.step}
                  </span>
                  <span>{js.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          {!loading && !error && !data?.journeySteps?.length && (
            <p className="text-xs text-muted">The account journey is not available.</p>
          )}
        </div>

      </div>
    </div>
  );
}
