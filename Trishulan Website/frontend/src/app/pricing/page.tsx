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
    <div className="min-h-screen bg-bg py-8">
      {message && (
        <div className="max-w-xl mx-auto my-4 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-center font-bold text-sm rounded-xl">
          {message}
        </div>
      )}
      <PricingSection />

      {/* Tier Selector Buttons for Direct Upgrade Test */}
      <div className="max-w-xl mx-auto p-6 bg-card rounded-2xl border border-line text-center mt-8 mb-12 shadow-sm">
        <h4 className="font-bold text-sm text-ink mb-3">Quick Plan Upgrade Simulator</h4>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleSelectTier('BASIC')}
            disabled={loading}
            className="px-4 py-2 bg-line/40 hover:bg-line text-ink border border-line text-xs font-bold rounded-lg transition-colors"
          >
            Switch to Basic (Free)
          </button>
          <button
            onClick={() => handleSelectTier('GROWTH')}
            disabled={loading}
            className="px-4 py-2 bg-accent hover:bg-[#c2410a] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            Upgrade to Growth (₹1,999/mo)
          </button>
          <button
            onClick={() => handleSelectTier('ENTERPRISE')}
            disabled={loading}
            className="px-4 py-2 bg-ink hover:opacity-90 text-bg text-xs font-bold rounded-lg shadow-sm transition-opacity"
          >
            Upgrade to Enterprise (₹8,999/mo)
          </button>
        </div>
      </div>
    </div>
  );
}
