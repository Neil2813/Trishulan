"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Headphones,
  UserCheck,
  Package,
  ClipboardList,
  Truck,
  DollarSign,
  Shield,
} from "lucide-react";


const HELP_CATEGORIES = [
  {
    Icon: UserCheck,
    title: "Account & KYC",
    articles: [
      "How to complete KYC verification",
      "Resetting your password",
      "Updating company GSTIN details",
      "Understanding verification statuses",
    ],
    href: "/kyc",
  },
  {
    Icon: Package,
    title: "Listings & Catalogue",
    articles: [
      "How to create a product listing",
      "Listing quality checklist",
      "Adding HSN codes and certifications",
      "Updating stock availability",
    ],
    href: "/sell",
  },
  {
    Icon: ClipboardList,
    title: "RFQ & Quoting",
    articles: [
      "How to post a buyer requirement",
      "Comparing quotes side-by-side",
      "Understanding Incoterms (EXW/FOB/CIF)",
      "Accepting or rejecting a quote",
    ],
    href: "/rfq",
  },
  {
    Icon: Truck,
    title: "Orders & Logistics",
    articles: [
      "Tracking an active shipment",
      "How to use the Shipment Control Tower",
      "Understanding shipment milestones",
      "Freight reconciliation guide",
    ],
    href: "/logistics",
  },
  {
    Icon: DollarSign,
    title: "Billing & Invoicing",
    articles: [
      "Creating a tax invoice (CGST/SGST/IGST)",
      "Converting quotation to sales order",
      "Managing partial payments",
      "e-Way bill export formatting",
    ],
    href: "/operations",
  },
  {
    Icon: Shield,
    title: "Platform Safety",
    articles: [
      "9-step supplier verification process",
      "How to report a fraudulent listing",
      "Dispute resolution process",
      "Privacy and consent settings",
    ],
    href: "/customer-workspace",
  },
];

const FAQ_ITEMS = [
  {
    q: "How long does KYC verification take?",
    a: "Standard document review takes 2–3 business days. If additional documents are requested, the clock restarts from receipt of the complete set. You will receive email and SMS notifications at each status change.",
  },
  {
    q: "Can I post a requirement without creating an account?",
    a: "You can browse listings without an account, but posting an RFQ or contacting a seller requires registration. Trishulan accounts are free to create (Starter plan).",
  },
  {
    q: "How are buyer phone numbers protected?",
    a: "Your phone number is never disclosed simply because a seller viewed your profile or listing. Explicit granular consent is required before any contact detail is shared with a named supplier.",
  },
  {
    q: "What is the dispute resolution process?",
    a: "File a dispute ticket under category 'Dispute'. A Trishulan mediator will review within 48 hours. For payment disputes, evidence (invoice, payment receipt, delivery proof) accelerates resolution. Growth and Business tier users receive priority mediation.",
  },
  {
    q: "How do I cancel or modify a subscription?",
    a: "Go to your Profile → Subscription tab. You can downgrade at the end of your billing cycle. Annual plan refunds are handled case-by-case; contact support at care@trishulan.com.",
  },
  {
    q: "Is my chat and document data encrypted?",
    a: "Yes. All direct messages use ECDH P-256 end-to-end encryption (Web Crypto API). Documents uploaded for KYC are stored with AES-256 encryption and are accessible only to you and the verification team.",
  },
];

type TicketCategory = "Account" | "KYC" | "RFQ" | "Logistics" | "Billing" | "Dispute";

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "Account" as TicketCategory,
    details: "",
    priority: "MEDIUM",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/customer/ticket`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(ticketForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit ticket");
      setTicketRef(data.ticket?.caseNumber || "CS-" + Math.floor(1000 + Math.random() * 9000));
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Hero Search ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0A1629] to-[#1a3366] text-white pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.12),transparent_60%)]" />
        <div className="max-w-[860px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-[12px] font-semibold text-slate-200 mb-5">
            <Headphones className="w-3.5 h-3.5" />
            Trishulan Help & Support Centre
          </div>
          <h1 className="text-[38px] md:text-[52px] font-black leading-tight tracking-tight mb-4">
            How can we{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              help you?
            </span>
          </h1>
          <p className="text-[16px] text-slate-300 mb-8">
            Search our knowledge base, raise a support ticket, or contact us directly.
          </p>
          <div className="relative max-w-[540px] mx-auto">
            <Search className="absolute left-4 top-4 w-5 h-5 text-muted" />
            <input
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-ink text-[14px] outline-none shadow-xl"
              placeholder="Search help articles… e.g. 'KYC upload' or 'track shipment'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-14">

        {/* ── Contact Options ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              icon: <MessageCircle className="w-6 h-6 text-blue-500" />,
              title: "Live Chat Support",
              desc: "Mon–Fri, 9 AM – 7 PM IST",
              action: "Start Chat",
              bg: "bg-blue-50 border-blue-200",
              onClick: () => setShowTicketForm(true),
            },
            {
              icon: <FileText className="w-6 h-6 text-violet-500" />,
              title: "Email / Ticket",
              desc: "Response within 24 hours",
              action: "Raise a Ticket",
              bg: "bg-violet-50 border-violet-200",
              onClick: () => setShowTicketForm(true),
            },
            {
              icon: <Phone className="w-6 h-6 text-emerald-500" />,
              title: "Helpline",
              desc: "+91 98765 43200 | Mon–Sat 10AM–6PM",
              action: "Call Now",
              bg: "bg-emerald-50 border-emerald-200",
              onClick: () => {},
            },
            {
              icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
              title: "Dispute / Complaint",
              desc: "Payment, delivery, counterfeit claims",
              action: "File Dispute",
              bg: "bg-amber-50 border-amber-200",
              onClick: () => {
                setTicketForm((p) => ({ ...p, category: "Dispute" as TicketCategory }));
                setShowTicketForm(true);
              },
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-5 ${item.bg} cursor-pointer hover:shadow-md transition-all`}
              onClick={item.onClick}
            >
              <div className="mb-3">{item.icon}</div>
              <h3 className="font-black text-[14px] text-ink mb-1">{item.title}</h3>
              <p className="text-[12px] text-muted mb-3">{item.desc}</p>
              <button className="text-[12px] font-bold text-ink flex items-center gap-1 hover:gap-2 transition-all">
                {item.action} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* ── Ticket Form ────────────────────────────────────────────────── */}
        {showTicketForm && (
          <div className="mb-12 bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
            <h2 className="font-black text-[20px] text-ink mb-1">
              Raise a Support Ticket
            </h2>
            <p className="text-[13px] text-muted mb-6">
              We'll assign a case number and respond within your plan's SLA.
            </p>
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-black text-[18px] text-ink mb-1">Ticket Submitted!</h3>
                <p className="text-[13px] text-muted mb-2">
                  Your case number is{" "}
                  <strong className="font-mono text-[#EA580C]">{ticketRef}</strong>
                </p>
                <div className="flex items-center justify-center gap-2 text-[12px] text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  Expected first response: <strong>within 24 hours</strong>
                </div>
                <button
                  className="mt-5 text-[13px] text-[#EA580C] underline"
                  onClick={() => {
                    setSubmitted(false);
                    setShowTicketForm(false);
                    setTicketForm({ subject: "", category: "Account", details: "", priority: "MEDIUM" });
                  }}
                >
                  Submit another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">Category *</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-ink bg-white outline-none focus:border-[#EA580C]"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm((p) => ({ ...p, category: e.target.value as TicketCategory }))}
                  >
                    {(["Account", "KYC", "RFQ", "Logistics", "Billing", "Dispute"] as TicketCategory[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">Priority</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-ink bg-white outline-none focus:border-[#EA580C]"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm((p) => ({ ...p, priority: e.target.value }))}
                  >
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">Subject *</label>
                  <input
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-ink outline-none focus:border-[#EA580C]"
                    placeholder="Brief one-line description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm((p) => ({ ...p, subject: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">Details *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-ink outline-none focus:border-[#EA580C] resize-none"
                    placeholder="Describe the issue in detail. Include any order IDs, RFQ numbers, or error messages."
                    value={ticketForm.details}
                    onChange={(e) => setTicketForm((p) => ({ ...p, details: e.target.value }))}
                  />
                </div>
                {error && (
                  <div className="md:col-span-2 flex items-center gap-2 text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit Ticket"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTicketForm(false)}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold text-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── Help Categories ────────────────────────────────────────────── */}
        <div className="mb-12">
          <h2 className="text-[22px] font-black text-ink mb-6">Knowledge Base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HELP_CATEGORIES.filter(
              (cat) =>
                !searchTerm ||
                cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.articles.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()))
            ).map((cat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all"
              >
                <cat.Icon className="w-6 h-6 text-[#EA580C] mb-3" />
                <h3 className="font-black text-[15px] text-ink mb-3">{cat.title}</h3>
                <ul className="space-y-2 mb-4">
                  {cat.articles.map((article, j) => (
                    <li key={j} className="text-[12.5px] text-[#475569] flex items-start gap-2">
                      <span className="text-[#EA580C] mt-0.5 shrink-0">→</span>
                      {article}
                    </li>
                  ))}
                </ul>
                <Link
                  href={cat.href}
                  className="text-[12px] font-bold text-[#EA580C] hover:underline flex items-center gap-1"
                >
                  Go to {cat.title} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <div className="mb-12">
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
                  <span className="font-semibold text-[13.5px] text-ink pr-4">{faq.q}</span>
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

        {/* ── SLA Reference ────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#0A1629] to-[#1a3366] rounded-2xl p-8 text-white">
          <h3 className="font-black text-[18px] mb-4">Support SLA Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { tier: "Starter", sla: "Help centre + Email (24–48 hrs)", email: "care@trishulan.com", badge: "bg-slate-600" },
              { tier: "Growth", sla: "Priority queue (12 hrs first response)", email: "care@trishulan.com", badge: "bg-[#EA580C]" },
              { tier: "Business", sla: "Dedicated manager + onboarding (4 hrs)", email: "enterprise@trishulan.com", badge: "bg-amber-500" },
            ].map((s) => (
              <div key={s.tier} className="bg-white/10 rounded-xl p-4 border border-white/20">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${s.badge} text-white mb-2 inline-block`}>
                  {s.tier}
                </span>
                <div className="text-[13px] font-semibold text-slate-200 mb-1">{s.sla}</div>
                <div className="text-[11px] text-slate-400">{s.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
