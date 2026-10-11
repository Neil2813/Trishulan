"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'RAW_MATERIALS' | 'MACHINERY' | 'SPARES'>('MACHINERY');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Unit');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          price: parseFloat(price),
          unit,
          location,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create listing');

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-6">
      <div className="max-w-[720px] mx-auto bg-card rounded-[24px] border border-line shadow-xl p-8 md:p-10">

        <div className="mb-8 text-center">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">SELLER DISTRIBUTION PORTAL</span>
          <h1 className="text-[32px] font-black text-ink mt-1">List Product / Machinery</h1>
          <p className="text-xs text-muted mt-1">
            Display your industrial equipment, spares, or raw materials to thousands of buyers.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5-Axis CNC Milling Center Machine"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600 bg-card font-semibold"
              >
                <option value="RAW_MATERIALS">Raw Materials</option>
                <option value="MACHINERY">Machinery & Equipment</option>
                <option value="SPARES">Industrial Spares</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Location (City, State)</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rajkot, Gujarat"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2850000"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Unit of Measurement</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit or Metric Ton or Piece"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe machine specifications, warranty, condition (new/refurbished), and shipping terms..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg transition-all"
          >
            {loading ? 'Publishing Listing...' : 'Publish Listing to Marketplace →'}
          </button>
        </form>

      </div>

      {/* ── 30-Day Supplier Rollout Roadmap (Guide p. 35) ─────────────────── */}
      <div className="max-w-[860px] mx-auto mt-12 bg-card rounded-[24px] border border-line shadow-xl p-8 md:p-10">
        <div className="mb-6">
          <span className="text-[11px] font-bold text-accent uppercase tracking-[.1em]">
            SUPPLIER SUCCESS
          </span>
          <h2 className="text-[26px] font-black text-ink mt-1">
            30-Day Small Industrial Supplier Rollout Roadmap
          </h2>
          <p className="text-[13px] text-muted mt-2 leading-relaxed">
            Follow this proven onboarding plan to go from a new profile to qualified buyer leads within 30 days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            {
              days: "Day 1–5",
              title: "Build Your Profile",
              color: "bg-blue-50 border-blue-200",
              badge: "bg-blue-100 text-blue-700",
              icon: "🏭",
              steps: [
                "Complete KYC verification (GSTIN, PAN)",
                "Upload bank proof & factory photos",
                "Set up digital ID card & company profile",
                "Define product categories & certifications",
              ],
            },
            {
              days: "Day 6–15",
              title: "Create Strong Listings",
              color: "bg-violet-50 border-violet-200",
              badge: "bg-violet-100 text-violet-700",
              icon: "📦",
              steps: [
                "List 10+ products with full specs & MOQ",
                "Include test certificates & grade details",
                "Set competitive pricing with valid unit",
                "Upload product photos & data sheets",
              ],
            },
            {
              days: "Day 16–20",
              title: "Respond Fast",
              color: "bg-amber-50 border-amber-200",
              badge: "bg-amber-100 text-amber-700",
              icon: "⚡",
              steps: [
                "Reply to all buyer inquiries within 2 hours",
                "Submit formal quotes with Incoterms",
                "Enable WhatsApp notification alerts",
                "Set your lead-time & stock status",
              ],
            },
            {
              days: "Day 21–25",
              title: "Measure & Adjust",
              color: "bg-emerald-50 border-emerald-200",
              badge: "bg-emerald-100 text-emerald-700",
              icon: "📊",
              steps: [
                "Review qualified lead count in dashboard",
                "Check which listings generate most views",
                "Adjust pricing based on market price data",
                "Request feedback from trial buyers",
              ],
            },
            {
              days: "Day 26–30",
              title: "Review & Renew",
              color: "bg-rose-50 border-rose-200",
              badge: "bg-rose-100 text-rose-700",
              icon: "🔄",
              steps: [
                "Calculate cost vs. leads generated",
                "Upgrade to Growth plan if ROI positive",
                "Plan next 30 days with improved listings",
                "Activate saved searches & price alerts",
              ],
            },
          ].map((phase) => (
            <div
              key={phase.days}
              className={`rounded-2xl border p-4 ${phase.color}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{phase.icon}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${phase.badge}`}>
                  {phase.days}
                </span>
              </div>
              <h4 className="font-black text-[14px] text-ink mb-2">{phase.title}</h4>
              <ul className="space-y-1.5">
                {phase.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-[#475569]">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Product Listing Quality Checklist (Guide p. 35) */}
        <div className="bg-gradient-to-r from-[#0A1629] to-[#1a3366] rounded-2xl p-6 text-white">
          <h3 className="font-black text-[16px] mb-4 flex items-center gap-2">
            ✅ Product Listing Quality Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Title includes: Product name + Grade/Spec + Key dimension",
              "Description: Material, application, finish, and tolerance",
              "Commercial fields: MOQ, unit price (EXW), valid-until date",
              "Evidence: BIS / ISO certificate number or test report link",
              "Photo: At least 2 product images (clear background)",
              "Delivery: Lead time in days + covered states/regions",
              "Call to action: 'Request quote' or 'Message seller' enabled",
              "HSN code: Correctly classified for GST compliance",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] text-slate-200">
                <span className="text-emerald-400 mt-0.5 shrink-0">☑</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

