'use client';

import React, { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  task: string;
  neededItem: string;
  status: string;
  nextAction: string;
  actionType: string;
}

export default function GuidedRegistrationChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [exampleText, setExampleText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Adviser appointment modal state
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [serviceNeeded, setServiceNeeded] = useState<string>('Company Secretary / GST Registration');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [appointmentResult, setAppointmentResult] = useState<any>(null);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/business-services/checklist');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setChecklist(json.checklist || []);
      setExampleText(json.exampleText || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registration checklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/business-services/adviser-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, serviceNeeded }),
      });
      const json = await res.json();
      setAppointmentResult(json);
    } catch (err: any) {
      setAppointmentResult({ error: err.message || 'Failed to request callback' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md text-[#0A1629] max-w-6xl w-full mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest text-[#0A1629] uppercase flex items-center gap-2">
          <span>BUSINESS REGISTRATION / ILLUSTRATIVE SCREEN</span>
          {loading && <span className="text-[10px] text-sky-600 font-normal animate-pulse">(Connecting to Express backend...)</span>}
        </h2>
        <span className="text-[11px] bg-slate-200/80 px-2.5 py-0.5 rounded text-slate-700 font-mono font-medium">
          Guidance Desk
        </span>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Guided Registration Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold">
                  <th className="p-3.5">Task</th>
                  <th className="p-3.5">Needed Item</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(checklist.length > 0
                  ? checklist
                  : [
                      { id: '1', task: 'Business type', neededItem: 'Choose legal form', status: 'Complete', nextAction: 'Review choice', actionType: 'REVIEW' },
                      { id: '2', task: 'Identity records', neededItem: 'Owner ID/address', status: 'Upload pending', nextAction: 'Add secure files', actionType: 'UPLOAD' },
                      { id: '3', task: 'Tax registration', neededItem: 'Business details', status: 'Not started', nextAction: 'View official steps', actionType: 'GUIDANCE' },
                      { id: '4', task: 'Adviser support', neededItem: 'Appointment request', status: 'Optional', nextAction: 'Request callback', actionType: 'APPOINTMENT' },
                    ]
                ).map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-[#0A1629]">{row.title || row.task}</td>
                    <td className="p-3.5 text-slate-700">{row.neededItem || 'Required verification doc'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          row.completed || row.status === 'Complete'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : row.status === 'Upload pending'
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : row.status === 'Optional'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {row.completed ? 'Complete' : row.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {row.actionType === 'APPOINTMENT' || row.id === 'step-4' ? (
                        <button
                          onClick={() => setShowAppointmentModal(true)}
                          className="px-3 py-1 bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-[10px] rounded-lg shadow transition"
                        >
                          {row.nextAction || 'Request Adviser Callback'}
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Triggering next action for ${row.title || row.task}`)}
                          className="text-sky-700 hover:underline font-bold text-xs"
                        >
                          {row.nextAction || 'View Details'} →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-500 border-t border-slate-200 italic">
            Sample checklist only; requirements depend on jurisdiction and business type.
          </div>
        </div>

        {/* Spec Callout Box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-cyan-900">
          <p className="font-bold text-cyan-800 mb-1">Example Spec Scenario:</p>
          <p className="italic leading-relaxed">
            "{exampleText || 'Example: a new industrial supplier selects "sole proprietor" and its state. The platform produces a checklist, lets the user upload required documents to a secure account, and offers an appointment request with a listed advisor. A progress card shows which steps remain.'}"
          </p>
        </div>

        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className="bg-purple-50 border border-purple-200 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-purple-900 uppercase">
                Request Callback from Listed Business & Tax Advisor
              </h3>
              <button onClick={() => setShowAppointmentModal(false)} className="text-slate-500 hover:text-slate-900 text-xs font-bold">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAppointmentSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-[#0A1629]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-[#0A1629]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Service Needed</label>
                  <select
                    value={serviceNeeded}
                    onChange={(e) => setServiceNeeded(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-[#0A1629]"
                  >
                    <option value="Company Secretary / GST Registration">Company Secretary / GST Registration</option>
                    <option value="Licensing & Pollution Clearance">Licensing & Pollution Clearance</option>
                    <option value="MSME Udyam Registration">MSME Udyam Registration</option>
                    <option value="Customs & Export-Import Code (IEC)">Customs & Export-Import Code (IEC)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Booking Callback...' : 'Confirm Callback Request'}
              </button>
            </form>

            {appointmentResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg font-mono">
                ✓ {appointmentResult.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
