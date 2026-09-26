"use client";

import React from 'react';
import Link from 'next/link';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  {
    title: 'Raw Materials & Metals',
    icon: '🏗️',
    links: [
      { label: 'Steel & Rebars', href: '/categories?cat=RAW_MATERIALS&sub=steel' },
      { label: 'Polymers & Plastics', href: '/categories?cat=RAW_MATERIALS&sub=polymers' },
      { label: 'Industrial Chemicals', href: '/categories?cat=RAW_MATERIALS&sub=chemicals' },
      { label: 'Aluminum & Non-Ferrous', href: '/categories?cat=RAW_MATERIALS&sub=aluminum' },
    ]
  },
  {
    title: 'Machinery & Equipment',
    icon: '⚙️',
    links: [
      { label: 'CNC Milling & Lathes', href: '/categories?cat=MACHINERY&sub=cnc' },
      { label: 'Hydraulic Presses', href: '/categories?cat=MACHINERY&sub=hydraulic' },
      { label: 'Packaging Machinery', href: '/categories?cat=MACHINERY&sub=packaging' },
      { label: 'Generators & Power Systems', href: '/categories?cat=MACHINERY&sub=power' },
    ]
  },
  {
    title: 'Spares & Components',
    icon: '🔧',
    links: [
      { label: 'Hydraulic Cylinders & Valves', href: '/categories?cat=SPARES&sub=cylinders' },
      { label: 'Bearings & Bushings', href: '/categories?cat=SPARES&sub=bearings' },
      { label: 'Industrial Fasteners', href: '/categories?cat=SPARES&sub=fasteners' },
      { label: 'Pneumatic Systems', href: '/categories?cat=SPARES&sub=pneumatics' },
    ]
  },
  {
    title: 'Operational Support',
    icon: '🚚',
    links: [
      { label: 'Transport & Freight', href: '/logistics?type=TRANSPORT' },
      { label: 'Professional Packing', href: '/logistics?type=PACKING' },
      { label: 'Labour Insurance', href: '/logistics?type=INSURANCE' },
      { label: 'Skilled Workforce', href: '/logistics?type=WORKFORCE' },
    ]
  }
];

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-[66px] left-0 w-full bg-white border-b border-gray-200 shadow-xl z-50 animate-[fadeIn_0.15s_ease]">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-bold tracking-[.1em] text-[#EA580C] uppercase">INDUSTRIAL SECTORS</span>
            <h3 className="text-[20px] font-extrabold text-[#0A1629]">Browse Product & Service Matrix</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg"
          >
            Close Menu ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{cat.icon}</span>
                <h4 className="font-bold text-[16px] text-[#0A1629]">{cat.title}</h4>
              </div>
              <ul className="space-y-2.5">
                {cat.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      href={link.href} 
                      onClick={onClose}
                      className="text-[13.5px] text-[#475569] hover:text-[#EA580C] hover:translate-x-1 inline-block transition-all font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <span>Need custom sourcing or bulk procurement?</span>
          <div className="flex gap-4">
            <Link href="/rfq" onClick={onClose} className="font-bold text-[#EA580C] hover:underline">
              Post an RFQ →
            </Link>
            <Link href="/sell" onClick={onClose} className="font-bold text-[#0A1629] hover:underline">
              Become a Verified Seller →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
