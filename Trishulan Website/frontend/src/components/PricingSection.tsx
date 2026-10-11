"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, AlertCircle } from 'lucide-react';

interface AiUsage {
  used: number;
  limit: number;
  tier: string;
}

// ── AI Usage Meter component (Guide pp. 26-27) ────────────────────────────────
function AiUsageMeter({
  used, limit, tier
}: { used: number; limit: number; tier: string }) {
  const pct = Math.min((used / limit) * 100, 100);
  const isWarning = pct >= 80;
  const isCritical = pct >= 95;

  return (
    <div className={`rounded-xl px-4 py-3 border mb-6 ${
      isCritical ? 'bg-red-50 border-red-200' :
      isWarning ? 'bg-amber-50 border-amber-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-blue-500'}`} />
          <span className="text-[12px] font-bold text-ink">
            AI Price Lookups — {tier} Plan
          </span>
        </div>
        <span className={`text-[11px] font-semibold ${
          isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-blue-600'
        }`}>
          {used} / {limit} used this month
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isWarning && (
        <div className={`flex items-center gap-1.5 mt-2 text-[11px] font-semibold ${
          isCritical ? 'text-red-600' : 'text-amber-700'
        }`}>
          <AlertCircle className="w-3.5 h-3.5" />
          {isCritical
            ? 'Limit almost reached — upgrade to continue AI price searches'
            : `${limit - used} lookups remaining — consider upgrading`}
        </div>
      )}
    </div>
  );
}

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [aiUsage, setAiUsage] = useState<AiUsage | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setAiUsage({
            used: data.user.aiLookupsUsed ?? 0,
            limit: data.user.aiLookupsLimit ?? 10,
            tier: data.user.tier ?? 'Starter',
          });
        }
      })
      .catch(() => {/* unauthenticated — meter hidden */});
  }, []);

  // Guide pp. 26-27 tier definitions — renamed to Starter / Growth / Business
  const plans = [
    {
      name: 'Starter',
      tagline: 'Essential tools for new businesses & individual buyers.',
      monthlyPrice: 0,
      annualPrice: 0,
      aiLookups: '10 / month',
      aiLookupsCount: 10,
      listings: 'Up to 25 listings',
      seats: '1 user seat',
      rfq: 'Search, profile & inquiry',
      leadControl: 'Website inquiry + contact choice',
      kyc: 'Account KYC status + checklist',
      analyzer: 'Basic category snapshot',
      shipment: 'Shipment IDs & basic status',
      billing: 'Basic invoices & expense log',
      insurance: 'Provider directory',
      support: 'Help centre / email ticket',
      highlight: false,
      badge: 'Free Forever',
      btnText: 'Get Started Free',
    },
    {
      name: 'Growth',
      tagline: 'For growing factories & active regional distributors.',
      monthlyPrice: 1999,
      annualPrice: 19999,
      aiLookups: '300 / month',
      aiLookupsCount: 300,
      listings: 'Up to 250 listings',
      seats: 'Up to 5 seats',
      rfq: 'RFQ matching + quote compare',
      leadControl: 'Selected-seller routing + WhatsApp opt-in',
      kyc: 'Business KYC document tracking',
      analyzer: 'Regional trends + saved alerts',
      shipment: 'Rate compare, booking & milestones',
      billing: 'Stock, purchase orders & reports',
      insurance: 'Compare & request callback',
      support: 'Faster ticket handling',
      highlight: true,
      badge: 'Most Popular',
      btnText: 'Upgrade to Growth',
    },
    {
      name: 'Business',
      tagline: 'High-volume traders, mills & large-scale enterprises.',
      monthlyPrice: 8999,
      annualPrice: 89999,
      aiLookups: '1,500 / month',
      aiLookupsCount: 1500,
      listings: 'Up to 2,000 listings',
      seats: 'Up to 20 seats (+ add-ons)',
      rfq: 'Team assignment + workflow controls',
      leadControl: 'CRM roles, consent history & audit log',
      kyc: 'Team/admin controls + audit trail',
      analyzer: 'Advanced dashboards + exports',
      shipment: 'Shared control tower, exceptions & freight reconciliation',
      billing: 'Team books, multiple locations & exports',
      insurance: 'Group-cover referral & team follow-up',
      support: 'Priority support / onboarding',
      highlight: false,
      badge: 'Maximum Scale',
      btnText: 'Contact Enterprise',
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-card px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[12px] font-bold text-accent uppercase tracking-[.1em]">
            SUBSCRIPTION TIERS — GUIDE PP. 26–27
          </span>
          <h2 className="text-[32px] md:text-[44px] font-black text-ink tracking-tight leading-tight mt-1">
            Starter · Growth · Business
          </h2>
          <p className="text-[#64748B] text-[15px] mt-2">
            Transparent pricing designed to accelerate trade volume while offering deep market insights.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center bg-line/30 p-1.5 rounded-full mt-6 border border-line" suppressHydrationWarning>
            <button
              suppressHydrationWarning
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all ${
                billingCycle === 'MONTHLY' ? 'bg-[#0A1629] text-white shadow' : 'text-muted hover:text-gray-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all ${
                billingCycle === 'ANNUAL' ? 'bg-accent text-white shadow' : 'text-muted hover:text-gray-900'
              }`}
            >
              Annual Billing <span className="text-[10px] uppercase bg-card/20 px-1.5 py-0.5 rounded ml-1">Save 17%</span>
            </button>
          </div>
        </div>

        {/* AI Usage Meter — shown only for authenticated users */}
        {aiUsage && <AiUsageMeter used={aiUsage.used} limit={aiUsage.limit} tier={aiUsage.tier} />}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice;
            const cycleText = billingCycle === 'MONTHLY' ? '/ month' : '/ year';
            const annualSavings = plan.monthlyPrice > 0 && billingCycle === 'ANNUAL'
              ? plan.monthlyPrice * 12 - plan.annualPrice
              : 0;

            return (
              <div
                key={idx}
                className={`rounded-[24px] p-8 flex flex-col justify-between transition-all relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-orange-50/80 via-white to-amber-50/50 border-2 border-[#EA580C] text-ink shadow-2xl scale-[1.02]'
                    : 'bg-card border border-line text-ink shadow-sm'
                }`}
              >
                {/* Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    plan.highlight ? 'bg-accent text-white' : 'bg-line/30 text-ink border border-line'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-[24px] font-extrabold mb-0.5">{plan.name}</h3>
                  <p className="text-[13px] leading-relaxed mb-5 text-[#64748B]">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-line">
                    <span className="text-[38px] font-black text-ink">
                      {price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[14px] font-medium ml-1 text-[#64748B]">
                      {price === 0 ? '' : cycleText}
                    </span>
                    {annualSavings > 0 && (
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                        You save ₹{annualSavings.toLocaleString('en-IN')} per year
                      </div>
                    )}
                  </div>

                  {/* Feature Breakdown — Guide pp. 26-27 table */}
                  <ul className="space-y-2.5 text-[12.5px] mb-8">
                    {[
                      { label: 'User Seats', val: plan.seats },
                      { label: 'Product Listings', val: plan.listings },
                      { label: '🤖 AI Price Lookups', val: plan.aiLookups, highlight: true },
                      { label: 'Buyer/Supplier Connection', val: plan.rfq },
                      { label: 'Lead & Contact Controls', val: plan.leadControl },
                      { label: 'KYC / Registration', val: plan.kyc },
                      { label: 'Industrial Analyzer', val: plan.analyzer },
                      { label: 'Shipment Management', val: plan.shipment },
                      { label: 'Billing / Inventory', val: plan.billing },
                      { label: 'Health Insurance', val: plan.insurance },
                      { label: 'Support SLA', val: plan.support },
                    ].map(({ label, val, highlight }) => (
                      <li key={label} className={`flex justify-between py-1.5 border-b border-gray-100 gap-2 ${highlight ? 'bg-blue-50/50 rounded-lg px-2 -mx-2' : ''}`}>
                        <span className={`shrink-0 ${highlight ? 'text-blue-700 font-semibold' : 'text-[#64748B]'}`}>{label}</span>
                        <span className={`font-bold text-right ${highlight ? 'text-blue-800' : 'text-ink'}`}>{val}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/pricing"
                  className={`w-full py-3.5 rounded-xl font-bold text-[14px] text-center transition-all block ${
                    plan.highlight
                      ? 'bg-accent hover:bg-[#c2410a] text-white shadow-lg'
                      : 'bg-line/30 hover:bg-slate-200 text-ink border border-line'
                  }`}
                >
                  {plan.btnText}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Attribution note */}
        <div className="mt-8 text-center text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            AI Price Lookup counts are reset monthly. Usage meters appear in your profile and header when you're within 20% of your plan limit.
          </span>
        </div>

      </div>
    </section>
  );
}
