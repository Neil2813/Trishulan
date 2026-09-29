"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  const plans = [
    {
      name: 'Basic (Starter)',
      tagline: 'Essential procurement tools for new businesses & individual buyers.',
      monthlyPrice: 0,
      annualPrice: 0,
      transactionFee: '2.5% – 3.0% per trade',
      chatAccess: 'Free / Unlimited',
      marketDepth: "Today's Prices Only",
      trustVisibility: 'Standard Listing',
      logisticsAccess: 'Standard Booking',
      support: 'Ticketing System',
      highlight: false,
      badge: 'Free Forever',
      btnText: 'Get Started Free',
    },
    {
      name: 'Growth (Professional)',
      tagline: 'Tailored for growing factories & active regional distributors.',
      monthlyPrice: 1999,
      annualPrice: 19999,
      transactionFee: '1.5% per trade',
      chatAccess: 'Free / Unlimited',
      marketDepth: '7-Day & 30-Day Trends',
      trustVisibility: 'Verified Badge Directory',
      logisticsAccess: 'Preferred Rates',
      support: 'Priority Queue',
      highlight: true,
      badge: 'Most Popular',
      btnText: 'Upgrade to Growth',
    },
    {
      name: 'Enterprise (Advanced)',
      tagline: 'High-volume international traders, mills & large scale suppliers.',
      monthlyPrice: 8999,
      annualPrice: 89999,
      transactionFee: '0.5% – 1.0% per trade',
      chatAccess: 'Free / Unlimited',
      marketDepth: 'Full Analyzer & Historical Data',
      trustVisibility: 'Homepage Carousel Priority',
      logisticsAccess: 'Priority Dispatch',
      support: 'Dedicated 24x7 Manager',
      highlight: false,
      badge: 'Maximum Scale',
      btnText: 'Contact Enterprise',
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[12px] font-bold text-[#EA580C] uppercase tracking-[.1em]">
            HYBRID MONETIZATION MATRIX
          </span>
          <h2 className="text-[32px] md:text-[44px] font-black text-[#0A1629] tracking-tight leading-tight mt-1">
            Subscription Plans & Scaled Commissions
          </h2>
          <p className="text-[#64748B] text-[15px] mt-2">
            Transparent pricing designed to accelerate trade volume while offering deep market insights.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center bg-gray-100 p-1.5 rounded-full mt-6 border border-gray-200" suppressHydrationWarning>
            <button
              suppressHydrationWarning
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all ${
                billingCycle === 'MONTHLY' ? 'bg-[#0A1629] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all ${
                billingCycle === 'ANNUAL' ? 'bg-[#EA580C] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual Billing <span className="text-[10px] uppercase bg-white/20 px-1.5 py-0.5 rounded ml-1">Save 16%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice;
            const cycleText = billingCycle === 'MONTHLY' ? '/ month' : '/ year';

            return (
              <div
                key={idx}
                className={`rounded-[24px] p-8 flex flex-col justify-between transition-all relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-orange-50/80 via-white to-amber-50/50 border-2 border-[#EA580C] text-[#0A1629] shadow-2xl scale-[1.02]'
                    : 'bg-white border border-gray-200 text-[#0A1629] shadow-sm'
                }`}
              >
                {/* Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    plan.highlight ? 'bg-[#EA580C] text-white' : 'bg-gray-100 text-[#0A1629] border border-gray-200'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-[22px] font-extrabold mb-1">{plan.name}</h3>
                  <p className="text-[13px] leading-relaxed mb-6 text-[#64748B]">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <span className="text-[38px] font-black text-[#0A1629]">
                      {price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[14px] font-medium ml-1 text-[#64748B]">
                      {price === 0 ? '' : cycleText}
                    </span>
                  </div>

                  {/* Feature Breakdown Table */}
                  <ul className="space-y-3 text-[13.5px] mb-8">
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#64748B]">Transaction Fee</span>
                      <span className="font-bold text-[#0A1629]">{plan.transactionFee}</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#64748B]">Chat & Negotiation</span>
                      <span className="font-bold text-green-600">{plan.chatAccess}</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#64748B]">Market Data Depth</span>
                      <span className="font-bold text-[#0A1629]">{plan.marketDepth}</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#64748B]">Trust & Visibility</span>
                      <span className="font-bold text-[#0A1629]">{plan.trustVisibility}</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#64748B]">Logistics Access</span>
                      <span className="font-bold text-[#0A1629]">{plan.logisticsAccess}</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/pricing"
                  className={`w-full py-3.5 rounded-xl font-bold text-[14px] text-center transition-all ${
                    plan.highlight
                      ? 'bg-[#EA580C] hover:bg-[#c2410a] text-white shadow-lg'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#0A1629] border border-slate-300'
                  }`}
                >
                  {plan.btnText}
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
