"use client";

import React, { useState } from 'react';

export default function BuyRequirementFormMockup() {
  const [product, setProduct] = useState('Industrial centrifugal pump');
  const [quantity, setQuantity] = useState('50 units');
  const [specification, setSpecification] = useState('SS316; 15 HP, 3-phase');
  const [delivery, setDelivery] = useState('Pune, India - within 45 days');
  const [attachmentName, setAttachmentName] = useState('Pump datasheet.pdf');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/platform-b/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          quantity,
          specification,
          delivery,
          attachmentName,
          category: 'MACHINERY'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
      }
    } catch (err) {
      console.error('Failed to submit RFQ:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      <div>
        <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">LIVE INTERACTIVE MODULE</span>
        <h2 className="text-xl font-black text-[#0A1629] mt-0.5">
          Feature example: what the screen can show
        </h2>
      </div>

      {/* Screen Mockup Container */}
      <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 shadow-xs">
        
        {/* Dark Banner Header */}
        <div className="bg-[#0A1629] text-white px-5 py-3.5 font-extrabold text-xs tracking-wider uppercase flex justify-between items-center">
          <span>BUY REQUIREMENT / REQUEST FOR QUOTATION</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
            Express DB Connected
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Form Rows */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-bold text-slate-700">Product</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#0A1629] focus:outline-none focus:border-[#00A896]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-bold text-slate-700">Quantity</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#0A1629] focus:outline-none focus:border-[#00A896]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-bold text-slate-700">Specification</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#0A1629] focus:outline-none focus:border-[#00A896]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-bold text-slate-700">Delivery</label>
            <div className="md:col-span-3">
              <input
                type="text"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#0A1629] focus:outline-none focus:border-[#00A896]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-bold text-slate-700">Attachments</label>
            <div className="md:col-span-3 flex items-center gap-2">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#0A1629] focus:outline-none focus:border-[#00A896]"
              />
              <label className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors whitespace-nowrap">
                [Upload]
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAttachmentName(f.name);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center animate-[fadeIn_0.2s_ease]">
              ✓ Buy requirement RFQ successfully submitted to Express backend!
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#00A896] hover:bg-[#008073] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>{submitting ? 'Broadcasting...' : 'Send to suppliers'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Example Use Callout Box */}
      <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
        <p className="text-xs md:text-sm text-[#166534] font-medium leading-relaxed">
          <strong className="font-black text-[#14532D]">Example use:</strong> A distributor needs 5,000 custom brackets. The buyer attaches a drawing and requests material grade, unit price at multiple volumes, tooling fee, production time, sample availability and FOB/CIF options.
        </p>
      </div>

    </div>
  );
}
