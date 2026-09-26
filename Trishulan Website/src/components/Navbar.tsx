"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const links = [
    "All categories",
    "Trade data",
    "Shipments",
    "Find buyers",
    "Find suppliers",
    "Price benchmark",
    "Countries",
    "Competitors",
    "Product intel",
    "Market prices",
    "HSN lookup"
  ];

  return (
    <nav className="bg-[#0b1b36] border-b border-[#1c2e4a]">
      <div className="wrap h-[40px] flex items-center overflow-x-auto no-scrollbar gap-[24px]">
        {links.map((link, i) => (
          <Link 
            key={i} 
            href="#" 
            className="text-[#9bb2d2] hover:text-white text-[13px] font-semibold whitespace-nowrap transition-colors"
          >
            {link}
          </Link>
        ))}
      </div>
    </nav>
  );
}
