"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Store } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function RFQPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'RAW_MATERIALS' | 'MACHINERY' | 'SPARES'>('RAW_MATERIALS');
  const [quantity, setQuantity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter product or service name');
      return;
    }
    setError('');
    setStep(2);
  };

  const submitRFQ = async () => {
    setError('');
    const parsedTargetPrice = Number(targetPrice);
    if (!Number.isFinite(parsedTargetPrice) || parsedTargetPrice <= 0) {
      setError('Enter a target budget greater than zero.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          quantity,
          targetPrice: parsedTargetPrice,
          details: `Delivery City: ${city}, Phone: ${phone}${details.trim() ? `. Specs: ${details.trim()}` : ''}`,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        setError('Sign in to post your requirement. Your details will stay here while you sign in.');
        setShowAuth(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to submit RFQ');
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitRFQ();
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6">
      <div className="max-w-[620px] mx-auto bg-card rounded-[24px] border border-line shadow-2xl p-6 md:p-10">
        
        {/* Page 5 Header: Post Requirement option & Let Us Provide You Verified Sellers */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-accent uppercase tracking-[.14em]">Request for Quotation</span>
          <h1 className="text-[28px] font-black text-ink mt-0.5">Post Requirement Option</h1>
          <p className="text-[14px] text-teal-600 font-bold mt-1">
            Let Us Provide You Verified Sellers
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Enter Product Name */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-6">
            <div>
              <label htmlFor="rfq-title" className="block text-xs font-bold text-muted mb-2">Enter Product or Service Name *</label>
              <div className="relative">
                <input
                  id="rfq-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Embroidery Machine 12 Needle, Steel TMT Rebar 12mm..."
                  className="w-full px-4 py-3.5 rounded-2xl border border-line text-sm font-semibold focus:outline-none focus:border-[#EA580C] pr-10"
                />
                <Mic className="w-5 h-5 text-muted/70 absolute right-3.5 top-4 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Next</span>
              <span>&gt;</span>
            </button>

            {/* Illustration Icon Container matching Page 5 */}
            <div className="pt-6 text-center border-t border-gray-100 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                <Store className="w-9 h-9" />
              </div>
              <span className="text-xs text-muted font-medium">Top verified manufacturers ready to quote.</span>
            </div>
          </form>
        )}

        {/* STEP 2: Quantity, Location & Specs */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-[fadeIn_0.15s_ease]">
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold rounded-xl flex justify-between items-center">
              <span>Selected Product: "{title}"</span>
              <button type="button" onClick={() => setStep(1)} className="underline text-[11px]">Change</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rfq-quantity" className="block text-xs font-bold text-ink mb-1">Quantity & Unit *</label>
                <input
                  id="rfq-quantity"
                  type="text"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 5 Sets or 50 MT"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label htmlFor="rfq-target-price" className="block text-xs font-bold text-ink mb-1">Target Budget (₹/unit) *</label>
                <input
                  id="rfq-target-price"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rfq-city" className="block text-xs font-bold text-ink mb-1">Delivery City / Location *</label>
                <input
                  id="rfq-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Rajahmundry or Guntur"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label htmlFor="rfq-phone" className="block text-xs font-bold text-ink mb-1">Contact Phone Number *</label>
                <input
                  id="rfq-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rfq-details" className="block text-xs font-bold text-ink mb-1">Additional Specifications / Notes</label>
              <textarea
                id="rfq-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Specify needle count, embroidery area, max speed, machine type..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-accent hover:bg-[#c2410a] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              {loading ? 'Submitting to Verified Sellers...' : 'Post Requirement & Match Verified Sellers →'}
            </button>
          </form>
        )}

      </div>
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          void submitRFQ();
        }}
      />
    </div>
  );
}
