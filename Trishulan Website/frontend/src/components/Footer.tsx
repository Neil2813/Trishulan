import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-bg text-[#475569] mt-[54px] pt-[60px] pb-[30px] border-t border-line relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-[#EBE4DB]/30 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      
      <div className="w-full px-6 lg:px-8 max-w-[1600px] mx-auto relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-12 gap-[40px] lg:gap-[30px]">
        
        {/* Column 1: Brand & Info */}
        <div className="col-span-1 sm:col-span-2 md:col-span-5 lg:col-span-3">
          <Link className="flex items-center gap-[12px] shrink-0 mb-[16px]" href="/">
            <div className="relative w-[48px] h-[48px]">
              <Image src="/TrishulanLogo.jpeg" alt="Trishulan Logo" fill sizes="48px" className="object-contain" />
            </div>
            <div>
              <div className="font-alata font-extrabold text-[18px] text-ink tracking-[.02em] leading-[1.05]">TRISHULAN</div>
              <div className="text-[10px] text-[#64748B] tracking-[.14em] font-semibold">INDUSTRIAL CONNECT</div>
            </div>
          </Link>
          <p className="text-[13px] text-[#64748B] my-[16px] leading-[1.6] max-w-[280px]">
            India's trusted industrial marketplace — connecting verified buyers and sellers across the country.
          </p>
          <div className="flex gap-[12px] mt-[24px]" suppressHydrationWarning>
            <button suppressHydrationWarning className="w-[36px] h-[36px] rounded-[8px] bg-gray-200/60 flex items-center justify-center text-[#475569] hover:bg-gray-300 transition-colors">in</button>
            <button suppressHydrationWarning className="w-[36px] h-[36px] rounded-[8px] bg-gray-200/60 flex items-center justify-center text-[#475569] hover:bg-gray-300 transition-colors">𝕏</button>
            <button suppressHydrationWarning className="w-[36px] h-[36px] rounded-[8px] bg-gray-200/60 flex items-center justify-center text-[#475569] hover:bg-gray-300 transition-colors">f</button>
            <button suppressHydrationWarning className="w-[36px] h-[36px] rounded-[8px] bg-gray-200/60 flex items-center justify-center text-[#475569] hover:bg-gray-300 transition-colors">▶</button>
          </div>
        </div>
        
        {/* Column 2: For Buyers */}
        <div className="lg:col-span-2">
          <h6 className="text-[12px] text-ink tracking-[.1em] uppercase font-bold mb-[8px]">For buyers</h6>
          <div className="w-[32px] h-[2px] bg-accent mb-[16px]"></div>
          <ul>
            {/* Fixed: /categories → / (landing page has categories anchor) */}
            <li className="mb-[12px]"><Link href="/" className="text-[13px] hover:text-accent transition-colors">All categories</Link></li>
            {/* Fixed: /sellers → /platform-a (supplier discovery) */}
            <li className="mb-[12px]"><Link href="/platform-a" className="text-[13px] hover:text-accent transition-colors">Verified sellers</Link></li>
            <li className="mb-[12px]"><Link href="/rfq" className="text-[13px] hover:text-accent transition-colors">Post a requirement</Link></li>
            {/* Fixed: /market → /market-prices */}
            <li className="mb-[12px]"><Link href="/market-prices" className="text-[13px] hover:text-accent transition-colors">Market prices</Link></li>
            {/* Fixed: /orders → /logistics (Shipment Control Tower) */}
            <li className="mb-[12px]"><Link href="/logistics" className="text-[13px] hover:text-accent transition-colors">Track an order</Link></li>
          </ul>
        </div>

        {/* Column 3: For Sellers */}
        <div className="lg:col-span-2">
          <h6 className="text-[12px] text-ink tracking-[.1em] uppercase font-bold mb-[8px]">For sellers</h6>
          <div className="w-[32px] h-[2px] bg-accent mb-[16px]"></div>
          <ul>
            <li className="mb-[12px]"><Link href="/sell" className="text-[13px] hover:text-accent transition-colors">Sell on Trishulan</Link></li>
            <li className="mb-[12px]"><Link href="/register" className="text-[13px] hover:text-accent transition-colors">Create seller account</Link></li>
            <li className="mb-[12px]"><Link href="/dashboard" className="text-[13px] hover:text-accent transition-colors">Manage orders</Link></li>
            {/* Fixed: /analyzer → /market-analyzer */}
            <li className="mb-[12px]"><Link href="/market-analyzer" className="text-[13px] hover:text-accent transition-colors">Demand insights</Link></li>
            {/* New: Operations / Billing */}
            <li className="mb-[12px]"><Link href="/operations" className="text-[13px] hover:text-accent transition-colors">Billing & Inventory</Link></li>
          </ul>
        </div>

        {/* Column 4: Trade Data */}
        <div className="lg:col-span-2">
          <h6 className="text-[12px] text-ink tracking-[.1em] uppercase font-bold mb-[8px]">Trade data</h6>
          <div className="w-[32px] h-[2px] bg-accent mb-[16px]"></div>
          <ul>
            <li className="mb-[12px]"><Link href="/feature-expansion" className="text-[13px] hover:text-accent transition-colors">All trade tools</Link></li>
            {/* Fixed: /shipments → /logistics */}
            <li className="mb-[12px]"><Link href="/logistics" className="text-[13px] hover:text-accent transition-colors">Shipment records</Link></li>
            {/* Fixed: /benchmark → /market-analyzer */}
            <li className="mb-[12px]"><Link href="/market-analyzer" className="text-[13px] hover:text-accent transition-colors">Price benchmark</Link></li>
            {/* Fixed: /landed → /feature-expansion */}
            <li className="mb-[12px]"><Link href="/feature-expansion" className="text-[13px] hover:text-accent transition-colors">Landed cost</Link></li>
            {/* New: Health Insurance */}
            <li className="mb-[12px]"><Link href="/insurance" className="text-[13px] hover:text-accent transition-colors">Health Insurance</Link></li>
            {/* New: Help & Support */}
            <li className="mb-[12px]"><Link href="/help" className="text-[13px] hover:text-accent transition-colors">Help & Support</Link></li>
          </ul>
        </div>


        {/* Column 5: Subscribe */}
        <div className="col-span-1 sm:col-span-2 md:col-span-5 lg:col-span-3">
          <h6 className="text-[12px] text-ink tracking-[.1em] uppercase font-bold mb-[8px]">Price & trend updates</h6>
          <div className="w-[32px] h-[2px] bg-accent mb-[16px]"></div>
          <p className="text-[13px] text-[#64748B] mb-[16px]">Weekly market movements, straight to your inbox.</p>
          
          <div className="relative mb-[12px]">
            <input suppressHydrationWarning type="email" placeholder="Work email" className="w-full px-[16px] py-[12px] rounded-[8px] border border-gray-300 bg-card text-ink text-[13px] outline-none focus:border-[#EA580C] transition-colors" />
            <Mail className="absolute right-[14px] top-[14px] w-4 h-4 text-muted/70" />
          </div>
          
          <button suppressHydrationWarning className="w-full py-[12px] rounded-[8px] bg-accent hover:bg-[#c2410a] text-white text-[14px] font-bold transition-colors shadow flex items-center justify-center gap-[8px]">
            Subscribe <span>→</span>
          </button>
        </div>

      </div>
      
      {/* Footer Bottom Line */}
      <div className="w-full px-6 lg:px-8 max-w-[1600px] mx-auto mt-[60px]">
        <div className="border-t border-line/80 pt-[24px] pb-[10px] flex flex-col md:flex-row items-center justify-between gap-[16px] text-[11px] font-bold text-[#94A3B8] tracking-[.05em] uppercase">
          <div className="flex items-center gap-[12px]">
            <span className="w-[12px] h-[1px] bg-accent"></span>
            <span>Trade connects opportunities.</span>
          </div>
          <div className="text-[11px] font-normal text-[#64748B] normal-case tracking-normal">
            © 2026 Trishulan Industrial Connect. All rights reserved.
          </div>
          <div className="flex items-center gap-[12px]">
            <span className="w-[12px] h-[1px] bg-accent"></span>
            <span>Built for a stronger supply chain.</span>
          </div>
        </div>
      </div>
      
    </footer>
  );
}
