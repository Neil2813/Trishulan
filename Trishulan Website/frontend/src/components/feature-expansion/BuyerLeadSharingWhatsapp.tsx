"use client";

import React, { useState } from 'react';

export default function BuyerLeadSharingWhatsapp() {
  const [buyerName, setBuyerName] = useState('Industrial Procurement Manager');
  const [buyerPhone, setBuyerPhone] = useState('9008631171');
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);
  const [selectedSellers, setSelectedSellers] = useState<string[]>(['usr_seller1', 'usr_seller2']);
  const [inquiryText, setInquiryText] = useState('We need 5,000 units SS304 hex bolts M12x50mm in Chennai within 30 days. Please send landed quotation.');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleToggleSeller = (id: string) => {
    if (selectedSellers.includes(id)) {
      setSelectedSellers(selectedSellers.filter(s => s !== id));
    } else {
      setSelectedSellers([...selectedSellers, id]);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSellers.length === 0) {
      alert('Please select at least one seller to receive your lead.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/discovery/lead-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName,
          buyerPhone,
          allowWhatsapp,
          selectedSellerIds: selectedSellers,
          message: inquiryText
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to share lead:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 md:p-8 shadow-md space-y-6">
      
      <div>
        <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider">FEATURE EXPANSION MODULE 3</span>
        <h2 className="text-xl md:text-2xl font-black text-[#0A1629] mt-0.5">
          Buyer lead sharing, WhatsApp and company database
        </h2>
        <p className="text-xs md:text-sm text-[#475569] font-medium mt-1 leading-relaxed max-w-4xl">
          When a buyer is interested in a product, capture a lead through an inquiry or RFQ form. Phone numbers remain protected until explicit buyer authorization is granted for named sellers and WhatsApp Business notifications.
        </p>
      </div>

      {/* Screen Form Container */}
      <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 shadow-xs">
        
        {/* Dark Banner Header */}
        <div className="bg-[#0A1629] text-white px-5 py-3.5 font-extrabold text-xs tracking-wider uppercase flex justify-between items-center">
          <span>PRIVACY-FIRST LEAD CAPTURE & WHATSAPP CONSENT</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
            Express DB Connected
          </span>
        </div>

        <form onSubmit={handleLeadSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Name / Representative</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Protected)</label>
              <div className="flex gap-2">
                <span className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center">
                  +91
                </span>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>
          </div>

          {/* Select Named Sellers */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Choose Named Sellers Authorized to Receive This Lead:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'usr_seller1', name: 'Apex Steel & Fasteners Corp' },
                { id: 'usr_seller2', name: 'Precision Metal Works Pvt Ltd' },
                { id: 'usr_seller3', name: 'Southern Industrial Supplies' },
              ].map((seller) => {
                const isSelected = selectedSellers.includes(seller.id);
                return (
                  <button
                    key={seller.id}
                    type="button"
                    onClick={() => handleToggleSeller(seller.id)}
                    className={`p-3 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-50 border-[#EA580C] text-[#EA580C]'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[11px]">{seller.name}</span>
                    <span className="text-xs">{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry / Lead Details</label>
            <textarea
              rows={3}
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              required
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-[#0A1629] focus:outline-none focus:border-[#EA580C]"
            ></textarea>
          </div>

          {/* WhatsApp Permission Checkbox */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
            <input
              type="checkbox"
              id="waCheck"
              checked={allowWhatsapp}
              onChange={(e) => setAllowWhatsapp(e.target.checked)}
              className="w-4 h-4 text-[#EA580C] accent-[#EA580C] rounded cursor-pointer"
            />
            <label htmlFor="waCheck" className="text-xs font-bold text-[#0A1629] cursor-pointer">
              Allow selected sellers to contact me on WhatsApp Business with quote updates & stock availability.
            </label>
          </div>

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-900 font-bold text-xs rounded-xl text-center">
              ✓ {successMessage}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#EA580C] hover:bg-[#c2410a] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              {submitting ? 'Delivering Lead...' : 'Deliver Lead to Selected Sellers'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
