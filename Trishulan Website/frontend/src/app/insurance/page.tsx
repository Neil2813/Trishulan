"use client";

import React, { useState } from "react";
import {
  Shield,
  Users,
  Heart,
  Building2,
  Phone,
  CheckCircle2,
  ArrowRight,
  Star,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  sumInsured: string;
  network: string;
  waitingPeriod: string;
  exclusions: string;
  copay: string;
  estimatedPremium: string;
  bestFor: string;
  highlight: boolean;
  badge: string;
  features: string[];
  color: string;
}

type CoverageTab = "GROUP_EMPLOYEE" | "INDIVIDUAL" | "FAMILY" | "BUSINESS_OWNER";

// ─── Plan Data ───────────────────────────────────────────────────────────────
const PLANS: Plan[] = [
  {
    id: "plan-a",
    name: "Plan A",
    sumInsured: "₹5 Lakh / Employee",
    network: "Basic hospital network",
    waitingPeriod: "30 days (pre-existing: 48 months)",
    exclusions: "Cosmetic surgery, dental (unless accident)",
    copay: "10% co-pay on non-network claims",
    estimatedPremium: "₹4,500 – ₹6,000 / employee / year",
    bestFor: "10–50 employees | Manufacturing units",
    highlight: false,
    badge: "Entry Level",
    features: [
      "In-patient hospitalisation",
      "Day care procedures (500+ listed)",
      "Pre & post hospitalisation (30/60 days)",
      "Ambulance cover up to ₹2,000",
      "Cashless at 3,000+ network hospitals",
    ],
    color: "from-slate-50 to-blue-50",
  },
  {
    id: "plan-b",
    name: "Plan B",
    sumInsured: "₹10 Lakh / Employee",
    network: "Pan-India network (5,000+ hospitals)",
    waitingPeriod: "Zero waiting period (first day cover)",
    exclusions: "War, self-inflicted injuries",
    copay: "No co-pay on network hospitals",
    estimatedPremium: "₹9,000 – ₹14,000 / employee / year",
    bestFor: "50–500 employees | Export-oriented units",
    highlight: true,
    badge: "Most Comprehensive",
    features: [
      "Everything in Plan A",
      "Zero waiting period — first day cover",
      "Maternity benefit (up to ₹75,000)",
      "New-born baby cover from day 1",
      "Mental health & OPD add-on available",
      "No co-pay at any network hospital",
      "Annual health check-up for all employees",
    ],
    color: "from-orange-50 to-amber-50",
  },
  {
    id: "plan-c",
    name: "Plan C",
    sumInsured: "Custom (₹3L – ₹25L)",
    network: "Customisable network",
    waitingPeriod: "Negotiable",
    exclusions: "As per policy wordings",
    copay: "Optional co-pay for lower premium",
    estimatedPremium: "Request a custom quote",
    bestFor: "Business owners | OPD add-ons | 500+ employees",
    highlight: false,
    badge: "Custom Quote",
    features: [
      "Fully configurable sum insured",
      "Optional OPD add-on module",
      "Co-pay options for lower premium",
      "Multi-location group policies",
      "Dedicated insurer relationship manager",
      "Annual renewal negotiation support",
    ],
    color: "from-emerald-50 to-teal-50",
  },
];

const COVERAGE_TABS: { id: CoverageTab; label: string; icon: React.ReactNode }[] = [
  { id: "GROUP_EMPLOYEE", label: "Employee Group", icon: <Users className="w-4 h-4" /> },
  { id: "INDIVIDUAL", label: "Individual", icon: <Heart className="w-4 h-4" /> },
  { id: "FAMILY", label: "Family Floater", icon: <Building2 className="w-4 h-4" /> },
  { id: "BUSINESS_OWNER", label: "Business Owner", icon: <Shield className="w-4 h-4" /> },
];

const FAQ_ITEMS = [
  {
    q: "Does Trishulan sell insurance directly?",
    a: "No. Trishulan is not an insurer or insurance broker. We facilitate a secure, consent-led introduction to licensed insurance intermediaries (IRDAI-registered brokers). Your contact details are only shared after you explicitly provide consent.",
  },
  {
    q: "Are any medical records shared with the insurer during the enquiry?",
    a: "Absolutely not. Trishulan does not collect or transmit any medical information during the referral process. The advisor will guide you through the formal application once you decide to proceed.",
  },
  {
    q: "How quickly will an advisor contact me?",
    a: "A licensed advisor will typically reach out within 1 business day of submitting your enquiry. Growth and Business tier members receive priority callback scheduling.",
  },
  {
    q: "Can I get insurance for my factory workers?",
    a: "Yes. Group Employee policies (Plan A, B, or Custom) are specifically designed for manufacturing units, factories, and industrial establishments with 10 to 500+ workers.",
  },
  {
    q: "What is the minimum group size for a group policy?",
    a: "Most insurers require a minimum of 7 employees for a group mediclaim policy. However, some insurers accept groups as small as 2-3 employees under certain conditions.",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<CoverageTab>("GROUP_EMPLOYEE");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState({
    contactPhone: "",
    companyName: "",
    employeeCount: "10",
    consentGranted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.consentGranted) {
      setError("Please provide consent before submitting your enquiry.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/insurance/lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            coverageType: activeTab,
            employeeCount: Number(formState.employeeCount),
            contactPhone: formState.contactPhone,
            companyName: formState.companyName,
            selectedPlan: selectedPlan,
            consentGranted: formState.consentGranted,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit enquiry");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1629] via-[#0f2044] to-[#1a3366] text-white pt-24 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-bold tracking-[.14em] uppercase bg-[#EA580C]/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/30">
              Module 6 — Benefits Access
            </span>
          </div>
          <div className="max-w-[680px]">
            <h1 className="text-[38px] md:text-[56px] font-black leading-[1.05] tracking-tight mb-6">
              Health Insurance
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                for Industrial India
              </span>
            </h1>
            <p className="text-[17px] text-slate-300 leading-relaxed mb-8 max-w-[540px]">
              Discover group health cover for your workers, family floaters for business
              owners, and custom plans for your enterprise team — through licensed,
              IRDAI-registered advisors. No medical records required for enquiry.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "10–500 employees",
                "Individual & family plans",
                "IRDAI-registered advisors",
                "Free callback within 1 day",
              ].map((badge) => (
                <span
                  key={badge}
                  className="text-[12px] font-semibold bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-slate-200"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer Banner ─────────────────────────────────────────────── */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <div className="max-w-[1200px] mx-auto flex items-start gap-3 text-[12.5px] text-blue-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>Disclosure:</strong> Trishulan is not an insurer or broker.
            We facilitate introductions to licensed IRDAI-registered intermediaries.
            Coverage details are indicative. This is not financial or medical advice.
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-14">

        {/* ── Coverage Type Tabs ─────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-[24px] font-black text-ink mb-2">
            Who needs coverage?
          </h2>
          <p className="text-[14px] text-muted mb-6">
            Select your coverage group to see the most relevant plan options.
          </p>
          <div className="flex flex-wrap gap-3">
            {COVERAGE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold border transition-all ${
                  activeTab === tab.id
                    ? "bg-[#0A1629] text-white border-[#0A1629] shadow-md"
                    : "bg-white text-[#475569] border-gray-200 hover:border-gray-400"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Plan Comparison Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all bg-gradient-to-b ${plan.color} ${
                selectedPlan === plan.id
                  ? "border-[#EA580C] shadow-xl scale-[1.02]"
                  : plan.highlight
                  ? "border-[#EA580C]/40 shadow-lg"
                  : "border-gray-200 hover:border-gray-400 shadow-sm"
              }`}
            >
              {/* Badge */}
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    plan.highlight
                      ? "bg-[#EA580C] text-white"
                      : "bg-white/80 text-[#475569] border border-gray-200"
                  }`}
                >
                  {plan.badge}
                </span>
                {selectedPlan === plan.id && (
                  <CheckCircle2 className="w-5 h-5 text-[#EA580C]" />
                )}
              </div>

              <h3 className="text-[22px] font-black text-ink mb-1">{plan.name}</h3>
              <div className="text-[26px] font-black text-[#0A1629] mb-4">
                {plan.sumInsured}
              </div>

              {/* Comparison table rows */}
              <div className="space-y-2 text-[12.5px] mb-5">
                {[
                  { label: "Network", value: plan.network },
                  { label: "Waiting Period", value: plan.waitingPeriod },
                  { label: "Co-Pay", value: plan.copay },
                  { label: "Est. Premium", value: plan.estimatedPremium },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2 py-1.5 border-b border-black/5">
                    <span className="text-muted shrink-0">{label}</span>
                    <span className="font-semibold text-ink text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Feature list */}
              <ul className="space-y-1.5 mb-5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-ink">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="text-[11px] text-muted italic">{plan.bestFor}</div>

              {selectedPlan === plan.id && (
                <div className="mt-4 bg-[#EA580C]/10 border border-[#EA580C]/20 rounded-lg px-3 py-2 text-[12px] text-[#EA580C] font-semibold text-center">
                  ✓ Selected — Complete the form below to request a callback
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Callback Request Form ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <div>
            <h2 className="text-[26px] font-black text-ink mb-3">
              Request a Free Advisor Callback
            </h2>
            <p className="text-[14px] text-muted mb-6 leading-relaxed">
              Fill in your details below and a licensed insurance advisor will
              contact you within 1 business day. Your information is strictly
              used for this enquiry and not disclosed without your consent.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-[13px] text-amber-800 mb-1">
                    Privacy Assurance
                  </div>
                  <div className="text-[12px] text-amber-700 leading-relaxed">
                    No medical records are collected or shared during this
                    referral. Your phone number will only be shared with the
                    advisor after you tick the consent box below.
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: <Shield className="w-5 h-5 text-blue-500" />, text: "IRDAI-registered advisors only" },
                { icon: <Zap className="w-5 h-5 text-orange-500" />, text: "Callback within 1 business day" },
                { icon: <Star className="w-5 h-5 text-amber-500" />, text: "No obligation — compare before you decide" },
                { icon: <Users className="w-5 h-5 text-emerald-500" />, text: "Group policies for 7 to 5,000+ employees" },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-[13px] text-ink">
                  {icon}
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-[20px] font-black text-ink mb-2">Enquiry Received!</h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  A licensed insurance advisor will contact you at{" "}
                  <strong>{formState.contactPhone}</strong> within{" "}
                  <strong>1 business day</strong>.
                  {selectedPlan && (
                    <>
                      {" "}Your interest in{" "}
                      <strong>
                        {PLANS.find((p) => p.id === selectedPlan)?.name}
                      </strong>{" "}
                      has been noted.
                    </>
                  )}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormState({
                      contactPhone: "",
                      companyName: "",
                      employeeCount: "10",
                      consentGranted: false,
                    });
                    setSelectedPlan(null);
                  }}
                  className="mt-6 text-[13px] text-[#EA580C] font-semibold underline"
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">
                    Coverage Group
                  </label>
                  <div className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-ink">
                    {COVERAGE_TABS.find((t) => t.id === activeTab)?.label}
                    {selectedPlan && (
                      <span className="ml-2 text-[#EA580C] font-semibold">
                        · {PLANS.find((p) => p.id === selectedPlan)?.name}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">
                    Contact Phone Number *
                  </label>
                  <input
                    name="contactPhone"
                    type="tel"
                    required
                    value={formState.contactPhone}
                    onChange={handleFormChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] text-ink outline-none focus:border-[#EA580C] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">
                    Company / Business Name
                  </label>
                  <input
                    name="companyName"
                    type="text"
                    value={formState.companyName}
                    onChange={handleFormChange}
                    placeholder="e.g. Bharat Engineering Works"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] text-ink outline-none focus:border-[#EA580C] transition-colors"
                  />
                </div>

                {activeTab === "GROUP_EMPLOYEE" && (
                  <div>
                    <label className="block text-[12px] font-semibold text-ink mb-1.5">
                      Number of Employees to Cover
                    </label>
                    <select
                      name="employeeCount"
                      value={formState.employeeCount}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] text-ink outline-none focus:border-[#EA580C] bg-white"
                    >
                      <option value="7">7–10 employees</option>
                      <option value="10">10–25 employees</option>
                      <option value="25">25–50 employees</option>
                      <option value="50">50–100 employees</option>
                      <option value="100">100–250 employees</option>
                      <option value="250">250–500 employees</option>
                      <option value="500">500+ employees</option>
                    </select>
                  </div>
                )}

                {/* Consent Checkbox */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consentGranted"
                      checked={formState.consentGranted}
                      onChange={handleFormChange}
                      className="mt-0.5 w-4 h-4 accent-[#EA580C]"
                    />
                    <span className="text-[12px] text-blue-800 leading-relaxed">
                      I consent to Trishulan sharing my name, phone number, and company
                      details with a licensed IRDAI-registered insurance advisor for the
                      purpose of this enquiry only. I confirm that no medical records
                      are being shared.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !formState.contactPhone || !formState.consentGranted}
                  className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Request Free Callback <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-muted text-center">
                  By submitting, you agree to our Privacy Policy.
                  No medical information is collected at this stage.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* ── Plan Comparison Table ─────────────────────────────────────── */}
        <div className="mb-14 overflow-x-auto">
          <h2 className="text-[22px] font-black text-ink mb-5">Full Plan Comparison</h2>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#0A1629] text-white">
                <th className="text-left px-4 py-3 font-semibold rounded-tl-xl">Criteria</th>
                {PLANS.map((p) => (
                  <th key={p.id} className={`text-center px-4 py-3 font-semibold ${p.id === "plan-c" ? "rounded-tr-xl" : ""}`}>
                    {p.name}
                    {p.highlight && (
                      <span className="ml-2 text-[9px] bg-[#EA580C] px-1.5 py-0.5 rounded-full font-bold">
                        ★ BEST
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Sum Insured", key: "sumInsured" },
                { label: "Hospital Network", key: "network" },
                { label: "Waiting Period", key: "waitingPeriod" },
                { label: "Co-Pay", key: "copay" },
                { label: "Exclusions", key: "exclusions" },
                { label: "Est. Premium", key: "estimatedPremium" },
                { label: "Best For", key: "bestFor" },
              ].map((row, i) => (
                <tr
                  key={row.key}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 font-semibold text-[#475569] border-b border-gray-100">
                    {row.label}
                  </td>
                  {PLANS.map((p) => (
                    <td
                      key={p.id}
                      className={`px-4 py-3 text-center text-ink border-b border-gray-100 ${
                        p.highlight ? "bg-orange-50/40 font-semibold" : ""
                      }`}
                    >
                      {p[row.key as keyof Plan] as string}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <div className="mb-14">
          <h2 className="text-[22px] font-black text-ink mb-5">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-[13.5px] text-ink">
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-[13px] text-muted leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Banner ───────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0A1629] to-[#1a3366] text-white p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[24px] font-black mb-2">
              Not sure which plan fits?
            </h3>
            <p className="text-[14px] text-slate-300 max-w-[480px]">
              Our advisors analyse your team size, budget, and industry risk
              profile to recommend the most suitable cover — at no cost to you.
            </p>
          </div>
          <button
            onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })}
            className="shrink-0 bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
          >
            Get Expert Advice <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
