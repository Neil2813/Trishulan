"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { Marquee } from '@/components/ui/marquee';
import { motion } from 'framer-motion';

const sellers = [
  {
    initials: 'SB',
    name: 'Shree Balaji Chemicals',
    location: 'Ahmedabad',
    tenure: '12 yrs on Trishulan',
    tags: ['Raw Materials'],
    rating: 4.8,
    reviews: 127,
    fulfilment: 98,
  },
  {
    initials: 'GS',
    name: 'Gujarat Steel Traders',
    location: 'Ahmedabad',
    tenure: '15 yrs on Trishulan',
    tags: ['Raw Materials', 'Machinery'],
    rating: 4.7,
    reviews: 98,
    fulfilment: 96,
  },
  {
    initials: 'MP',
    name: 'Mahalaxmi Polymers',
    location: 'Surat',
    tenure: '10 yrs on Trishulan',
    tags: ['Raw Materials'],
    rating: 4.9,
    reviews: 156,
    fulfilment: 99,
  },
  {
    initials: 'RA',
    name: 'Rajesh Alloys Pvt Ltd',
    location: 'Jaipur',
    tenure: '8 yrs on Trishulan',
    tags: ['Raw Materials', 'Spares & Parts'],
    rating: 4.6,
    reviews: 74,
    fulfilment: 95,
  },
  {
    initials: 'KE',
    name: 'Konark Engineering Works',
    location: 'Pune',
    tenure: '9 yrs on Trishulan',
    tags: ['Machinery', 'Spares & Parts'],
    rating: 4.5,
    reviews: 61,
    fulfilment: 94,
  },
  {
    initials: 'VP',
    name: 'Vardhman Polymers',
    location: 'Vadodara',
    tenure: '11 yrs on Trishulan',
    tags: ['Raw Materials'],
    rating: 4.8,
    reviews: 112,
    fulfilment: 97,
  },
];

const firstRow = sellers.slice(0, 3);
const secondRow = sellers.slice(3);

const SellerCard = ({
  initials,
  name,
  location,
  tenure,
  tags,
  rating,
  reviews,
  fulfilment,
}: {
  initials: string;
  name: string;
  location: string;
  tenure: string;
  tags: string[];
  rating: number;
  reviews: number;
  fulfilment: number;
}) => {
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative w-[450px] cursor-pointer overflow-hidden rounded-2xl border border-line p-6',
        'bg-white transition-all',
        'flex flex-col gap-5 justify-between'
      )}
    >
      <div className="flex flex-row items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-navy-bg text-ink flex items-center justify-center text-lg font-bold shrink-0">
          {initials}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-ink">{name}</h3>
            <span className="bg-up-bg text-up text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Verified
            </span>
          </div>
          <p className="text-sm font-medium text-muted mt-0.5">
            {location} • {tenure}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {tags.map((tag) => (
          <span key={tag} className="border border-line rounded-full px-3 py-1 text-xs text-body font-medium">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="w-full h-px bg-line my-1" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted">★</span>
          <span className="font-bold text-ink">{rating}</span>
          <span className="text-muted">({reviews})</span>
        </div>
        <div className="text-sm">
          <span className="font-bold text-ink">{fulfilment}%</span>
          <span className="text-muted ml-1">fulfilment</span>
        </div>
      </div>
    </motion.figure>
  );
};

export default function TopSellers() {
  return (
    <section className="relative w-full overflow-hidden bg-[url('/Marquee.png')] bg-cover bg-center bg-no-repeat py-[80px]">
      
      {/* Top Text Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[1600px] mx-auto px-[20px] sm:px-[40px] md:px-[60px] lg:px-[80px] mb-[40px]"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-[40px]">
          
          {/* Left Headings */}
          <div className="pl-[20px] md:pl-[60px] lg:pl-[100px]">
            <h2 className="text-[36px] md:text-[48px] font-black text-[#042417] mb-[8px] tracking-tight">Top verified sellers</h2>
            <p className="text-[16px] md:text-[18px] text-[#475569] font-medium">KYC and GST checked before they can list.</p>
          </div>
          
        </div>
      </motion.div>

      {/* Marquee Row */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-visible">
        <Marquee pauseOnHover className="[--duration:50s] [--gap:1.5rem] overflow-visible py-4">
          {sellers.map((seller) => (
            <SellerCard key={seller.name} {...seller} />
          ))}
          {sellers.map((seller) => (
            <SellerCard key={seller.name + "-dup"} {...seller} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
