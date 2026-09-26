"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const items = [
  {
    id: 1,
    imagePath: '/Trade Intelligence/ShipmentRecords.png',
    title: 'Shipment records',
    description: 'Search 816 bill-of-lading records by product, HS code, country and port.',
  },
  {
    id: 2,
    imagePath: '/Trade Intelligence/FindBuyers.png',
    title: 'Find buyers',
    description: 'Overseas companies importing your product, ranked by value and growth.',
  },
  {
    id: 3,
    imagePath: '/Trade Intelligence/PriceBenchmark.png',
    title: 'Price benchmark',
    description: 'Min, max and average rates by country before you negotiate.',
  },
  {
    id: 4,
    imagePath: '/Trade Intelligence/CompetitorAnanlysis.png', // Note the typo in file name
    title: 'Competitor analysis',
    description: 'Market share by shipment value across your category.',
  },
];

export default function TradeIntelligence() {
  return (
    <section className="relative px-6 py-16 md:py-24 bg-[url('/TradeIntelligence.png')] bg-cover bg-center bg-no-repeat">
      <div className="max-w-[1400px] w-full mx-auto relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-start justify-between mb-12 gap-8"
        >
          <div className="max-w-2xl">
            <h2 className="text-[32px] md:text-[44px] font-black text-[#0A1629] tracking-tight leading-tight mb-4">
              Trade intelligence
            </h2>
            <p className="text-[#64748B] text-[15px] md:text-[17px] font-medium">
              Shipment-level import and export data find buyers, benchmark prices, watch competitors.
            </p>
          </div>
        </motion.div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-white rounded-[24px] overflow-hidden flex flex-col shadow-sm border border-gray-100 group cursor-pointer"
            >
              {/* Image Section */}
              <div className="relative w-full h-[220px]">
                <Image 
                  src={item.imagePath} 
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              {/* Text Section */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-[18px] font-bold text-[#0A1629] mb-3 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[#64748B] text-[13px] leading-relaxed mb-6 flex-grow">
                  {item.description}
                </p>

                {/* Arrow Button */}
                <div className="self-end mt-auto">
                  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 group-hover:bg-gray-50 group-hover:text-[#0A1629] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
