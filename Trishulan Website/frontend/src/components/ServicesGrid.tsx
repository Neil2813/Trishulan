import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Boxes,
  Cog,
  Wrench,
  TrendingUp,
  BarChart3,
  Truck,
  Package,
  ShieldCheck,
  Building2,
  Scale,
} from 'lucide-react';

const serviceModules = [
  {
    category: 'CORE SOURCING',
    color: 'border-amber-500/30 bg-amber-50/40 text-amber-900',
    badgeBg: 'bg-amber-600',
    items: [
      { title: 'Raw Materials', desc: 'Industrial chemicals, polymers, steel & non-ferrous metals.', icon: Boxes, link: '/categories?cat=RAW_MATERIALS' },
      { title: 'Machinery & Equipment', desc: 'New, pre-owned & refurbished heavy industrial machines.', icon: Cog, link: '/categories?cat=MACHINERY' },
      { title: 'Industrial Spares', desc: 'OEM-grade hydraulic components, bearings & spares.', icon: Wrench, link: '/categories?cat=SPARES' },
    ]
  },
  {
    category: 'MARKET INTELLIGENCE',
    color: 'border-blue-500/30 bg-blue-50/40 text-blue-900',
    badgeBg: 'bg-blue-600',
    items: [
      { title: 'Live Market Prices', desc: 'Daily tracking of commodity price movements and spot rates.', icon: TrendingUp, link: '/market-prices' },
      { title: 'Market Analyzer', desc: 'Predictive 7-day, 30-day & multi-year historical trend analytics.', icon: BarChart3, link: '/market-analyzer' },
    ]
  },
  {
    category: 'LOGISTICS & WORKFORCE',
    color: 'border-emerald-500/30 bg-emerald-50/40 text-emerald-900',
    badgeBg: 'bg-emerald-600',
    items: [
      { title: 'Transport & Freight', desc: 'FTL, PTL and specialized heavy haulage shipping.', icon: Truck, link: '/logistics?type=TRANSPORT' },
      { title: 'Packing Services', desc: 'Professional export packaging and heavy equipment crating.', icon: Package, link: '/logistics?type=PACKING' },
      { title: 'Labour Insurance', desc: 'Instant workforce insurance cover for industrial sites.', icon: ShieldCheck, link: '/logistics?type=INSURANCE' },
    ]
  },
  {
    category: 'CORPORATE ADMINISTRATION',
    color: 'border-purple-500/30 bg-purple-50/40 text-purple-900',
    badgeBg: 'bg-purple-600',
    items: [
      { title: 'Business Registration', desc: 'Firm, LLP & Pvt Ltd e-filing structural consultation.', icon: Building2, link: '/corporate?type=FIRM_REGISTRATION' },
      { title: 'Trademark Services', desc: 'Government e-filing for MSME and corporate IP protection.', icon: Scale, link: '/corporate?type=TRADEMARK' },
    ]
  }
];

export default function ServicesGrid() {
  return (
    <section className="py-16 md:py-24 bg-[#FCFBF8] border-y border-gray-200/80 px-6">
      <div className="max-w-[1400px] mx-auto">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[12px] font-bold text-[#EA580C] uppercase tracking-[.1em]">
              MODULAR SERVICES MATRIX
            </span>
            <h2 className="text-[32px] md:text-[42px] font-black text-[#0A1629] tracking-tight leading-tight mt-1">
              End-to-End Operational Support
            </h2>
          </div>
          <p className="text-[#64748B] text-[15px] max-w-md">
            Integrated tools for procurement, market intelligence, logistics, and legal compliance under one dashboard.
          </p>
        </div>

        {/* Modular Grid */}
        <div className="space-y-10">
          {serviceModules.map((module, mIdx) => (
            <div key={mIdx}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-3 h-3 rounded-full ${module.badgeBg}`}></span>
                <h3 className="text-[13px] font-bold tracking-[.1em] text-[#0A1629] uppercase">
                  {module.category}
                </h3>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Items Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {module.items.map((item, iIdx) => (
                  <motion.div
                    key={iIdx}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.link}
                      className={`block p-6 rounded-[20px] border ${module.color} hover:shadow-md transition-all h-full flex flex-col justify-between group bg-white`}
                    >
                      <div>
                        <div className="mb-3">
                          <item.icon className="w-7 h-7 text-[#0A1629] group-hover:text-[#EA580C] transition-colors" />
                        </div>
                        <h4 className="text-[18px] font-bold text-[#0A1629] mb-2 group-hover:text-[#EA580C] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[13px] text-[#64748B] leading-relaxed mb-4">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#0A1629] group-hover:text-[#EA580C] transition-colors">
                        <span>Access Portal</span>
                        <span>→</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
