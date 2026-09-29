"use client";

import React, { useState } from 'react';
import PricingSection from '@/components/PricingSection';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSelectTier = async (tier: 'BASIC' | 'GROWTH' | 'ENTERPRISE') => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully updated subscription to ${tier} Plan!`);
      } else {
        setMessage(data.error || 'Failed to update subscription. Please login.');
      }
    } catch (err: any) {
      setMessage(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      {message && (
        <div className="max-w-xl mx-auto my-4 p-4 bg-amber-50 border border-amber-300 text-amber-900 text-center font-bold text-sm rounded-xl">
          {message}
        </div>
      )}
      <PricingSection />

      {/* Tier Selector Buttons for Direct Upgrade Test */}
      <div className="max-w-xl mx-auto p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center mt-8 mb-12">
        <h4 className="font-bold text-sm text-[#0A1629] mb-3">Quick Plan Upgrade Simulator</h4>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleSelectTier('BASIC')}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-[#0A1629] text-xs font-bold rounded-lg"
          >
            Switch to Basic (Free)
          </button>
          <button
            onClick={() => handleSelectTier('GROWTH')}
            disabled={loading}
            className="px-4 py-2 bg-[#EA580C] hover:bg-[#c2410a] text-white text-xs font-bold rounded-lg"
          >
            Upgrade to Growth (₹1,999/mo)
          </button>
          <button
            onClick={() => handleSelectTier('ENTERPRISE')}
            disabled={loading}
            className="px-4 py-2 bg-[#0A1629] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg"
          >
            Upgrade to Enterprise (₹8,999/mo)
          </button>
        </div>
      </div>
    </div>
  );
}
