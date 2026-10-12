import React from 'react';
import Link from 'next/link';
import {
  Layers,
  TrendingUp,
  Truck,
  Briefcase,
  LayoutDashboard,
  X,
  ArrowRight,
  Compass,
} from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenServicePoints?: () => void;
}

const pageSections = [
  {
    title: 'Trade & Platforms',
    icon: Layers,
    pages: [
      { name: 'Platform A', desc: 'Supplier discovery directory', href: '/platform-a' },
      { name: 'Platform B', desc: 'Wholesale RFQ & sourcing', href: '/platform-b' },
      { name: 'Platform C', desc: 'Export & trade lead portal', href: '/platform-c' },
      { name: 'Platform D', desc: 'Customs & trade intelligence', href: '/platform-d' },
      { name: 'Platform E', desc: 'SME digital presence & catalog', href: '/platform-e' },
    ]
  },
  {
    title: 'Market Intelligence',
    icon: TrendingUp,
    pages: [
      { name: 'Industrial Analyzer', desc: 'Factory setup feasibility & ROI', href: '/market-analyzer' },
      { name: 'Mandi Market Prices', desc: 'Live spot prices & mandi tickers', href: '/market-prices' },
      { name: 'Subscription Pricing', desc: 'Enterprise & tier plans', href: '/pricing' },
    ]
  },
  {
    title: 'Procurement & Logistics',
    icon: Truck,
    pages: [
      { name: 'Customer Workspace', desc: 'Buyer tasks, inquiries & preferences', href: '/customer-workspace' },
      { name: 'Service Points', desc: 'Physical inspection, dispute & escrow hubs', isServicePoints: true },
      { name: 'Logistics & Fleet', desc: 'Freight, packing & dispatch tracking', href: '/logistics' },
      { name: 'Post an RFQ', desc: 'Broadcast buyer requirements', href: '/rfq' },
      { name: 'Become a Seller', desc: 'Manufacturer storefront registration', href: '/sell' },
    ]
  },
  {
    title: 'Operations & Compliance',
    icon: Briefcase,
    pages: [
      { name: 'Business Operations', desc: 'Invoicing, billing & inventory control', href: '/operations' },
      { name: 'Health Insurance', desc: 'Industrial workforce medical access', href: '/insurance' },
      { name: 'KYC & Verification', desc: 'GSTIN, PAN & business verification', href: '/kyc' },
      { name: 'Corporate Services', desc: 'Compliance, tax & advisory', href: '/corporate' },
    ]
  },
  {
    title: 'Account & Support',
    icon: LayoutDashboard,
    pages: [
      { name: 'Live Dashboard', desc: 'Operational overview & analytics', href: '/dashboard' },
      { name: 'Company Profile', desc: 'Account settings & security', href: '/profile' },
      { name: 'Register Account', desc: 'Create buyer or seller profile', href: '/register' },
      { name: 'Help & Support', desc: 'Documentation & support desk', href: '/help' },
    ]
  },
];

export default function MegaMenu({ isOpen, onClose, onOpenServicePoints }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-[66px] left-0 w-full bg-card border-b border-line shadow-2xl z-50 animate-[fadeIn_0.15s_ease]">
      <div className="max-w-[1600px] mx-auto px-6 py-7">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold tracking-[.14em] text-accent uppercase">
                PLATFORM SITEMAP
              </span>
              <h3 className="text-[19px] font-extrabold text-ink leading-tight">
                All Platform Pages &amp; Modules
              </h3>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink bg-line/40 hover:bg-line/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Close Menu</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Column Grid of All Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {pageSections.map((section, sIdx) => (
            <div 
              key={sIdx} 
              className="bg-card p-4 rounded-xl border border-line flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-line">
                  <section.icon className="w-4 h-4 text-accent" />
                  <h4 className="font-bold text-[13.5px] text-ink">{section.title}</h4>
                </div>

                <ul className="space-y-1.5">
                  {section.pages.map((page, pIdx) => (
                    <li key={pIdx}>
                      {(page as any).isServicePoints ? (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenServicePoints?.();
                          }}
                          className="group block w-full text-left p-2 rounded-lg hover:bg-line/40 border border-transparent hover:border-line transition-all cursor-pointer"
                        >
                          <div className="text-[12.5px] font-bold text-ink group-hover:text-accent transition-colors flex items-center justify-between">
                            <span>{page.name}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                          </div>
                          <div className="text-[10.5px] text-muted font-medium leading-snug mt-0.5">
                            {page.desc}
                          </div>
                        </button>
                      ) : (
                        <Link 
                          href={page.href || '#'} 
                          onClick={onClose}
                          className="group block p-2 rounded-lg hover:bg-line/40 border border-transparent hover:border-line transition-all"
                        >
                          <div className="text-[12.5px] font-bold text-ink group-hover:text-accent transition-colors flex items-center justify-between">
                            <span>{page.name}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                          </div>
                          <div className="text-[10.5px] text-muted font-medium leading-snug mt-0.5">
                            {page.desc}
                          </div>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Footer Links */}
        <div className="mt-6 pt-4 border-t border-line flex flex-col md:flex-row items-center justify-between text-xs text-muted gap-3">
          <span className="font-medium">Direct access to all public, operational, and trade modules.</span>
          <div className="flex gap-4 flex-wrap font-bold text-ink">
            <Link href="/dashboard" onClick={onClose} className="hover:text-accent transition-colors">
              Dashboard →
            </Link>
            <Link href="/customer-workspace" onClick={onClose} className="hover:text-accent transition-colors">
              Workspace →
            </Link>
            <Link href="/insurance" onClick={onClose} className="hover:text-accent transition-colors">
              Insurance →
            </Link>
            <Link href="/operations" onClick={onClose} className="hover:text-accent transition-colors">
              Operations →
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenServicePoints?.();
              }}
              className="hover:text-accent transition-colors cursor-pointer font-bold text-ink"
            >
              Service Points →
            </button>
            <Link href="/rfq" onClick={onClose} className="hover:text-accent transition-colors">
              Post RFQ →
            </Link>
            <Link href="/help" onClick={onClose} className="hover:text-accent transition-colors">
              Help Center →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
