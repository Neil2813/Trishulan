"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, AlertCircle } from 'lucide-react';

interface AiUsage {
  used: number;
  limit: number;
  tier: string;
}

// ── AI Usage Meter component ──────────────────────────────────────────
function AiUsageMeter({
  used, limit, tier
}: { used: number; limit: number; tier: string }) {
  const pct = Math.min((used / limit) * 100, 100);
  const isWarning = pct >= 80;
  const isCritical = pct >= 95;

  return (
    <div className={`rounded-2xl px-5 py-4 border mb-8 max-w-3xl mx-auto transition-all ${
      isCritical ? 'bg-red-500/10 border-red-500/30' :
      isWarning ? 'bg-amber-500/10 border-amber-500/30' :
      'bg-blue-500/10 border-blue-500/30'
    }`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-blue-500'}`} />
          <span className="text-[13px] font-bold text-ink">
            AI Price Lookups — {tier} Plan
          </span>
        </div>
        <span className={`text-[12px] font-semibold ${
          isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-blue-500'
        }`}>
          {used} / {limit} used this month
        </span>
      </div>
      <div className="h-2 bg-line/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isWarning && (
        <div className={`flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold ${
          isCritical ? 'text-red-500' : 'text-amber-500'
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

  // Subscription tier definitions — Starter / Growth / Business
  const plans = [
    {
      name: 'Starter',
      tagline: 'Essential tools for new businesses & individual buyers.',
      monthlyPrice: 0,
      annualPrice: 0,
      aiLookups: '10 / month',
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
    <section className="py-16 md:py-24 bg-bg px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[12px] font-bold text-accent uppercase tracking-[.14em]">
            SUBSCRIPTION TIERS
          </span>
          <h2 className="text-[32px] md:text-[44px] font-black text-ink tracking-tight leading-tight mt-1">
            Starter · Growth · Business
          </h2>
          <p className="text-muted text-[15px] mt-2 max-w-xl mx-auto">
            Transparent pricing designed to accelerate trade volume while offering deep market insights.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center bg-card p-1.5 rounded-full mt-6 border border-line shadow-sm" suppressHydrationWarning>
            <button
              suppressHydrationWarning
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-ink text-bg shadow'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Monthly Billing
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-accent text-white shadow'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                billingCycle === 'ANNUAL' ? 'bg-white/20 text-white' : 'bg-accent/15 text-accent'
              }`}>
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* AI Usage Meter — shown only for authenticated users */}
        {aiUsage && <AiUsageMeter used={aiUsage.used} limit={aiUsage.limit} tier={aiUsage.tier} />}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice;
            const cycleText = billingCycle === 'MONTHLY' ? '/ month' : '/ year';
            const annualSavings = plan.monthlyPrice > 0 && billingCycle === 'ANNUAL'
              ? plan.monthlyPrice * 12 - plan.annualPrice
              : 0;

            return (
              <div
                key={idx}
                className={`rounded-[24px] p-7 sm:p-8 flex flex-col h-full transition-all relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-orange-50/90 via-card to-amber-50/50 border-2 border-accent text-ink shadow-xl shadow-accent/10 lg:-translate-y-2 lg:shadow-2xl'
                    : 'bg-card border border-line text-ink shadow-sm hover:shadow-md'
                }`}
              >
                {/* Badge Header with fixed height for alignment */}
                <div className="flex items-center justify-between h-7 mb-4">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    plan.highlight
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-line/40 text-ink border border-line'
                  }`}>
                    {plan.badge}
                  </span>
                  {plan.highlight && (
                    <span className="text-[11px] font-bold text-accent tracking-wide">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Plan Name */}
                <h3 className="text-[26px] font-extrabold text-ink tracking-tight mb-1.5">{plan.name}</h3>
                
                {/* Tagline with min-height to ensure price row aligns across cards */}
                <p className="text-[13px] leading-relaxed text-muted min-h-[40px] mb-6">
                  {plan.tagline}
                </p>

                {/* Price block with min-height to ensure feature lists align across cards */}
                <div className="mb-6 pb-6 border-b border-line min-h-[82px] flex flex-col justify-center">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[36px] sm:text-[40px] font-black text-ink tracking-tight">
                      {price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[13px] font-medium text-muted">
                      {price === 0 ? '' : cycleText}
                    </span>
                  </div>
                  {annualSavings > 0 ? (
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                      You save ₹{annualSavings.toLocaleString('en-IN')} per year
                    </div>
                  ) : (
                    <div className="h-[18px]"></div>
                  )}
                </div>

                {/* Feature Breakdown table with synchronized row heights */}
                <ul className="space-y-2 text-[12.5px] mb-8 flex-1">
                  {[
                    { label: 'User Seats', val: plan.seats },
                    { label: 'Product Listings', val: plan.listings },
                    { label: 'AI Price Lookups', val: plan.aiLookups, highlight: true },
                    { label: 'Buyer/Supplier Connection', val: plan.rfq },
                    { label: 'Lead & Contact Controls', val: plan.leadControl },
                    { label: 'KYC / Registration', val: plan.kyc },
                    { label: 'Industrial Analyzer', val: plan.analyzer },
                    { label: 'Shipment Management', val: plan.shipment },
                    { label: 'Billing / Inventory', val: plan.billing },
                    { label: 'Health Insurance', val: plan.insurance },
                    { label: 'Support SLA', val: plan.support },
                  ].map(({ label, val, highlight }) => (
                    <li
                      key={label}
                      className={`flex items-center justify-between py-2 border-b border-line/60 gap-3 min-h-[42px] ${
                        highlight
                          ? 'bg-accent/10 border-accent/25 rounded-lg px-2.5 -mx-1'
                          : ''
                      }`}
                    >
                      <span className={`shrink-0 ${highlight ? 'text-accent font-semibold' : 'text-muted'}`}>
                        {label}
                      </span>
                      <span className={`font-bold text-right leading-snug ${highlight ? 'text-accent font-black' : 'text-ink'}`}>
                        {val}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button pinned to bottom */}
                <Link
                  href="/pricing"
                  className={`w-full py-3.5 rounded-xl font-bold text-[14px] text-center transition-all block mt-auto ${
                    plan.highlight
                      ? 'bg-accent hover:bg-accent-2 text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 active:scale-[0.99]'
                      : 'bg-line/40 hover:bg-line text-ink border border-line hover:border-ink/20 active:scale-[0.99]'
                  }`}
                >
                  {plan.btnText}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Attribution note */}
        <div className="mt-10 text-center text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent" />
            AI Price Lookup counts are reset monthly. Usage meters appear in your profile and header when you&apos;re within 20% of your plan limit.
          </span>
        </div>

      </div>
    </section>
  );
}
