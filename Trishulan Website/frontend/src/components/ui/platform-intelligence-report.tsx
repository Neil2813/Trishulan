"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export interface PlatformItem {
  id: string;
  code: string;
  title: string;
  focus: string;
  badge?: string;
  description: string;
  features: string[];
  trishulanAdvantage: string;
}

const DEFAULT_PLATFORMS: PlatformItem[] = [
  {
    id: 'platform-a',
    code: 'PLATFORM A',
    title: 'Platform A',
    focus: 'Indian supplier discovery',
    badge: 'Supplier Network',
    description: 'Specializes in domestic manufacturer directories and regional industrial supplier matching across key Indian manufacturing hubs.',
    features: ['Verified GSTIN Directory', 'Regional Factory Search', 'Direct Contact Inquiries', 'Category-wise SME Catalog'],
    trishulanAdvantage: 'Trishulan adds AI-based fraud risk scoring, escrow settlement guarantees, and instant machine feasibility calculation.'
  },
  {
    id: 'platform-b',
    code: 'PLATFORM B',
    title: 'Platform B',
    focus: 'Global wholesale sourcing',
    badge: 'Cross-Border',
    description: 'Cross-border B2B bulk ordering platform connecting Indian importers with international wholesale exporters.',
    features: ['Multi-currency Quotations', 'Trade Assurance', 'Customs Inspection Tools', 'Bulk Shipping Logistics'],
    trishulanAdvantage: 'Trishulan provides integrated domestic + export logistics with automated HSN tariff lookup and live price ticker.'
  },
  {
    id: 'platform-c',
    code: 'PLATFORM C',
    title: 'Platform C',
    focus: 'Indian B2B marketplace',
    badge: 'B2B E-Commerce',
    description: 'Full-stack domestic marketplace supporting direct bulk purchasing, seller storefronts, and integrated payment gateways.',
    features: ['Digital Storefronts', 'Instant Payment Gateway', 'Order Tracking', 'Buyer Protection'],
    trishulanAdvantage: 'Trishulan integrates raw material price forecasting, multi-modal search (voice/barcode/image), and digital ID verification.'
  },
  {
    id: 'platform-d',
    code: 'PLATFORM D',
    title: 'Platform D',
    focus: 'Trade data intelligence',
    badge: 'Analytics & Customs',
    description: 'Analytical trade data suite providing import-export shipment records, bill of entry tracking, and HS code analytics.',
    features: ['Customs Manifest Data', 'Competitor Export Insights', 'HS Code Price Trends', 'Shipment Volume Tracking'],
    trishulanAdvantage: 'Trishulan delivers real-time market price feeds directly tied to verified sellers and automated feasibility setup reports.'
  },
  {
    id: 'platform-e',
    code: 'PLATFORM E',
    title: 'Platform E',
    focus: 'SME digital presence + sourcing',
    badge: 'SME Digitalization',
    description: 'SME enablement platform offering website creation, CRM tools, and basic inquiry leads for small scale workshops.',
    features: ['SME Website Builder', 'Lead Management CRM', 'RFQ Broadcasting', 'Social Media Marketing'],
    trishulanAdvantage: 'Trishulan offers end-to-end industrial setup feasibility, machine combinations recommendation, and verified buyer matching.'
  }
];

interface PlatformIntelligenceReportProps {
  reportDate?: string;
  disclaimer?: string;
  platforms?: PlatformItem[];
}

export default function PlatformIntelligenceReport({
  reportDate = '30 September 2026',
  disclaimer = 'The five platforms are identified only as Platform A through Platform E. Product and company names are intentionally omitted from the report body. Interface drawings are original examples designed to explain common options; they are not screenshots of the live services.',
  platforms = DEFAULT_PLATFORMS
}: PlatformIntelligenceReportProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem | null>(null);

  return (
    <div className="w-full space-y-6">
      {/* Disclaimer Section */}
      <p className="text-xs md:text-[13px] leading-relaxed text-[#334155] font-normal max-w-4xl">
        {disclaimer}
      </p>

      {/* Grid Container */}
      <div className="bg-[#F3F6FA] border border-[#CBD5E1] rounded-[16px] overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-[#CBD5E1] border-b border-[#CBD5E1] last:border-b-0">
          
          {/* Platform A & Platform B */}
          <div
            onClick={() => setSelectedPlatform(platforms[0])}
            className="p-6 md:p-8 bg-[#F3F6FA] hover:bg-[#EAEFF6] transition-colors cursor-pointer border-b md:border-b-[#CBD5E1] md:border-r border-[#CBD5E1] group"
          >
            <h3 className="text-sm font-extrabold text-[#0F172A] tracking-wider uppercase mb-1 flex items-center justify-between">
              <span>{platforms[0].code}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to inspect →
              </span>
            </h3>
            <p className="text-xs md:text-sm text-[#475569] font-medium">
              {platforms[0].focus}
            </p>
          </div>

          <div
            onClick={() => setSelectedPlatform(platforms[1])}
            className="p-6 md:p-8 bg-[#F3F6FA] hover:bg-[#EAEFF6] transition-colors cursor-pointer border-b md:border-b-[#CBD5E1] group"
          >
            <h3 className="text-sm font-extrabold text-[#0F172A] tracking-wider uppercase mb-1 flex items-center justify-between">
              <span>{platforms[1].code}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to inspect →
              </span>
            </h3>
            <p className="text-xs md:text-sm text-[#475569] font-medium">
              {platforms[1].focus}
            </p>
          </div>

          {/* Platform C & Platform D */}
          <div
            onClick={() => setSelectedPlatform(platforms[2])}
            className="p-6 md:p-8 bg-[#F3F6FA] hover:bg-[#EAEFF6] transition-colors cursor-pointer border-b md:border-b-[#CBD5E1] md:border-r border-[#CBD5E1] group"
          >
            <h3 className="text-sm font-extrabold text-[#0F172A] tracking-wider uppercase mb-1 flex items-center justify-between">
              <span>{platforms[2].code}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to inspect →
              </span>
            </h3>
            <p className="text-xs md:text-sm text-[#475569] font-medium">
              {platforms[2].focus}
            </p>
          </div>

          <div
            onClick={() => setSelectedPlatform(platforms[3])}
            className="p-6 md:p-8 bg-[#F3F6FA] hover:bg-[#EAEFF6] transition-colors cursor-pointer border-b md:border-b-[#CBD5E1] group"
          >
            <h3 className="text-sm font-extrabold text-[#0F172A] tracking-wider uppercase mb-1 flex items-center justify-between">
              <span>{platforms[3].code}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to inspect →
              </span>
            </h3>
            <p className="text-xs md:text-sm text-[#475569] font-medium">
              {platforms[3].focus}
            </p>
          </div>

          {/* Platform E & Report Date */}
          <div
            onClick={() => setSelectedPlatform(platforms[4])}
            className="p-6 md:p-8 bg-[#F3F6FA] hover:bg-[#EAEFF6] transition-colors cursor-pointer border-b md:border-b-0 md:border-r border-[#CBD5E1] group"
          >
            <h3 className="text-sm font-extrabold text-[#0F172A] tracking-wider uppercase mb-1 flex items-center justify-between">
              <span>{platforms[4].code}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to inspect →
              </span>
            </h3>
            <p className="text-xs md:text-sm text-[#475569] font-medium">
              {platforms[4].focus}
            </p>
          </div>

          <div className="p-6 md:p-8 bg-[#F3F6FA]">
            <h3 className="text-sm font-extrabold text-[#0F172A] tracking-wider uppercase mb-1">
              REPORT DATE
            </h3>
            <p className="text-xs md:text-sm text-[#475569] font-medium">
              {reportDate}
            </p>
          </div>

        </div>
      </div>

      {/* Modal / Drill-down drawer when user clicks a platform */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative animate-[fadeIn_0.15s_ease]">
            <button
              onClick={() => setSelectedPlatform(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-base w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EA580C]/10 text-[#EA580C]">
                {selectedPlatform.badge}
              </span>
              <span className="text-xs text-gray-400 font-mono">B2B Competitive Benchmark</span>
            </div>

            <h3 className="text-xl font-black text-[#0A1629]">
              {selectedPlatform.code} Overview
            </h3>
            <p className="text-xs font-bold text-gray-600 mt-0.5">
              Focus: {selectedPlatform.focus}
            </p>

            <p className="text-xs text-gray-600 leading-relaxed mt-3">
              {selectedPlatform.description}
            </p>

            <div className="mt-4 space-y-2">
              <span className="text-xs font-bold text-[#0A1629] block uppercase tracking-wider">
                Core Capabilities Matrix:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {selectedPlatform.features.map((feat, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700 font-medium text-[11px]">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
              <span className="text-[10px] font-extrabold text-[#EA580C] uppercase tracking-wider block">
                Trishulan Platform Edge vs {selectedPlatform.code}:
              </span>
              <p className="text-xs text-gray-700 font-medium mt-1 leading-snug">
                {selectedPlatform.trishulanAdvantage}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              {selectedPlatform.id === 'platform-a' ? (
                <Link
                  href="/platform-a"
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#c2410a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Open Live Platform A Module →
                </Link>
              ) : selectedPlatform.id === 'platform-b' ? (
                <Link
                  href="/platform-b"
                  className="px-4 py-2 bg-[#00A896] hover:bg-[#008073] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Open Live Platform B Module →
                </Link>
              ) : selectedPlatform.id === 'platform-c' ? (
                <Link
                  href="/platform-c"
                  className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Open Live Platform C Module →
                </Link>
              ) : selectedPlatform.id === 'platform-d' ? (
                <Link
                  href="/platform-d"
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Open Live Platform D Module →
                </Link>
              ) : selectedPlatform.id === 'platform-e' ? (
                <Link
                  href="/platform-e"
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#c2410a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Open Live Platform E Module →
                </Link>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => setSelectedPlatform(null)}
                className="px-4 py-2 bg-[#0A1629] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
