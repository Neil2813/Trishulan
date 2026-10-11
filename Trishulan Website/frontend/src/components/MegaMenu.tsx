import React from 'react';
import Link from 'next/link';
import { Boxes, Cog, Wrench, Truck, X, Heart, FileText, LifeBuoy } from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  {
    title: 'Raw Materials & Metals',
    icon: Boxes,
    links: [
      { label: 'Steel & Rebars', href: '/platform-a?cat=RAW_MATERIALS&sub=steel' },
      { label: 'Polymers & Plastics', href: '/platform-a?cat=RAW_MATERIALS&sub=polymers' },
      { label: 'Industrial Chemicals', href: '/platform-a?cat=RAW_MATERIALS&sub=chemicals' },
      { label: 'Aluminum & Non-Ferrous', href: '/platform-a?cat=RAW_MATERIALS&sub=aluminum' },
    ]
  },
  {
    title: 'Machinery & Equipment',
    icon: Cog,
    links: [
      { label: 'CNC Milling & Lathes', href: '/platform-a?cat=MACHINERY&sub=cnc' },
      { label: 'Hydraulic Presses', href: '/platform-a?cat=MACHINERY&sub=hydraulic' },
      { label: 'Packaging Machinery', href: '/platform-a?cat=MACHINERY&sub=packaging' },
      { label: 'Generators & Power Systems', href: '/platform-a?cat=MACHINERY&sub=power' },
    ]
  },
  {
    title: 'Spares & Components',
    icon: Wrench,
    links: [
      { label: 'Hydraulic Cylinders & Valves', href: '/platform-a?cat=SPARES&sub=cylinders' },
      { label: 'Bearings & Bushings', href: '/platform-a?cat=SPARES&sub=bearings' },
      { label: 'Industrial Fasteners', href: '/platform-a?cat=SPARES&sub=fasteners' },
      { label: 'Pneumatic Systems', href: '/platform-a?cat=SPARES&sub=pneumatics' },
    ]
  },
  {
    title: 'Operational Support',
    icon: Truck,
    links: [
      { label: 'Transport & Freight', href: '/logistics?type=TRANSPORT' },
      { label: 'Professional Packing', href: '/logistics?type=PACKING' },
      { label: 'Shipment Control Tower', href: '/logistics' },
      { label: 'Skilled Workforce', href: '/logistics?type=WORKFORCE' },
    ]
  },
  {
    title: 'Business Services',
    icon: FileText,
    links: [
      { label: 'Billing & Invoicing', href: '/operations' },
      { label: 'Inventory Management', href: '/operations?tab=inventory' },
      { label: 'KYC & Registration', href: '/kyc' },
      { label: 'Corporate Services', href: '/corporate' },
    ]
  },
  {
    title: 'Benefits & Support',
    icon: Heart,
    links: [
      { label: 'Health Insurance Access', href: '/insurance' },
      { label: 'Market Price Analyzer', href: '/market-prices' },
      { label: 'Industrial Analyzer', href: '/market-analyzer' },
      { label: 'Help & Support', href: '/help' },
    ]
  },
];

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-[66px] left-0 w-full bg-card border-b border-line shadow-xl z-50 animate-[fadeIn_0.15s_ease]">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-bold tracking-[.1em] text-accent uppercase">INDUSTRIAL SECTORS</span>
            <h3 className="text-[20px] font-extrabold text-ink">Browse Product & Service Matrix</h3>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-gray-900 bg-line/30 px-3 py-1.5 rounded-lg"
          >
            <span>Close Menu</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-card/50 p-4 rounded-2xl border border-gray-100 hover:border-line transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <cat.icon className="w-4 h-4 text-accent" />
                <h4 className="font-bold text-[14px] text-ink">{cat.title}</h4>
              </div>
              <ul className="space-y-2">
                {cat.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      href={link.href} 
                      onClick={onClose}
                      className="text-[12.5px] text-[#475569] hover:text-accent hover:translate-x-1 inline-block transition-all font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <span>Need custom sourcing or bulk procurement?</span>
          <div className="flex gap-4 flex-wrap">
            <Link href="/rfq" onClick={onClose} className="font-bold text-accent hover:underline">
              Post an RFQ →
            </Link>
            <Link href="/sell" onClick={onClose} className="font-bold text-ink hover:underline">
              Become a Verified Seller →
            </Link>
            <Link href="/insurance" onClick={onClose} className="font-bold text-ink hover:underline">
              Health Insurance →
            </Link>
            <Link href="/operations" onClick={onClose} className="font-bold text-ink hover:underline">
              Business Operations →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
