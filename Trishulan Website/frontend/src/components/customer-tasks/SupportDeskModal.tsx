'use client';

import React, { useState } from 'react';

interface SupportDeskModalProps {
  onClose: () => void;
}

export default function SupportDeskModal({ onClose }: SupportDeskModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('RFQ & Quote Inquiries');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);

  const guides = [
    { title: 'How to compare supplier quotes side-by-side', category: 'RFQ' },
    { title: 'Managing phone & WhatsApp consent preferences', category: 'Privacy' },
    { title: 'Tracking delivery updates & ETA milestones', category: 'Logistics' },
    { title: 'Creating volume-break quote templates', category: 'Selling' },
  ];

  const filteredGuides = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setLoading(true);
    try {
      const res = await fetch('/api/customer/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          category,
          description,
          attachment: attachment || undefined,
        }),
      });

      const data = await res.json();
      setSubmittedTicket(data);
    } catch (err: any) {
      setSubmittedTicket({ error: err.message || 'Failed to submit ticket' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl text-[#0A1629] max-w-3xl w-full max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-extrabold text-[#0A1629] uppercase tracking-wider">
              TRISHULAN SHARED CUSTOMER SERVICE & SUPPORT CENTRE
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Searchable guides, case tracking & ticket submission desk</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 text-base font-bold transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Guide Search Bar */}
          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-[#0A1629] uppercase">Searchable Support Guides</h3>
            <input
              type="text"
              placeholder="Search guides (e.g., compare quotes, WhatsApp consent, ETA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#0A1629] placeholder-slate-400 focus:outline-none focus:border-[#EA580C]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {filteredGuides.map((guide, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 flex justify-between items-center hover:border-slate-300 shadow-sm cursor-pointer">
                  <span className="text-slate-800 font-medium">{guide.title}</span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono font-bold">
                    {guide.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Submission Form */}
          <form onSubmit={handleSubmitTicket} className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-[#0A1629] uppercase">Submit Support Ticket</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject / Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Delay in Shipment #304"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
                >
                  <option value="RFQ & Quote Inquiries">RFQ & Quote Inquiries</option>
                  <option value="Shipment & Logistics">Shipment & Logistics</option>
                  <option value="Billing & Invoices">Billing & Invoices</option>
                  <option value="Privacy & Contact Opt-Out">Privacy & Contact Opt-Out</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description of Issue</label>
              <textarea
                required
                rows={3}
                placeholder="Describe your issue or question in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Attachment (Optional URL or File Ref)</label>
              <input
                type="text"
                placeholder="e.g., document_spec_sheet.pdf"
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
            >
              {loading ? 'Creating Ticket...' : 'Submit Support Ticket'}
            </button>
          </form>

          {/* Ticket Response Alert */}
          {submittedTicket && (
            <div className={`p-4 rounded-xl text-xs font-mono border ${submittedTicket.error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              {submittedTicket.error ? (
                <p>⚠️ {submittedTicket.error}</p>
              ) : (
                <div>
                  <p className="font-bold text-emerald-800">✓ Express Backend Created Support Ticket #{submittedTicket.ticket?.caseNumber || 'CS-101'}:</p>
                  <p className="mt-1 text-slate-700">Status: {submittedTicket.ticket?.status || 'OPEN'} | Priority: {submittedTicket.ticket?.priority || 'MEDIUM'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
