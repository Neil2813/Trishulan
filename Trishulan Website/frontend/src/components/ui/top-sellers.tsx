"use client";
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Marquee } from '@/components/ui/marquee';
import { motion } from 'framer-motion';

interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  productTitle: string;
  location: string;
  badge: string;
}

const SellerCard = ({
  supplier,
}: {
  supplier: Supplier;
}) => {
  const initials = supplier.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative w-[450px] cursor-pointer overflow-hidden rounded-2xl border border-line p-6',
        'bg-card transition-all',
        'flex flex-col gap-5 justify-between'
      )}
    >
      <div className="flex flex-row items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-navy-bg text-ink flex items-center justify-center text-lg font-bold shrink-0">
          {initials}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-ink">{supplier.name}</h3>
            {supplier.badge === 'VERIFIED' && (
              <span className="bg-up-bg text-up text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Verified
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-muted mt-0.5">
            {supplier.location || 'Location not provided'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="border border-line rounded-full px-3 py-1 text-xs text-body font-medium">
          {supplier.category}
        </span>
        <span className="text-sm font-medium text-muted">{supplier.productTitle}</span>
      </div>
      
      <div className="w-full h-px bg-line my-1" />
      
      <p className="text-xs text-muted">Supplier listing</p>
    </motion.figure>
  );
};

export default function TopSellers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const response = await fetch('/api/platform-a/suppliers');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to load suppliers');
        setSuppliers(
          (result.suppliers || []).filter((supplier: Supplier) => supplier.badge === 'VERIFIED')
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load suppliers');
      } finally {
        setLoading(false);
      }
    }
    loadSuppliers();
  }, []);

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
        {loading ? (
          <p className="py-8 text-sm text-muted">Loading verified supplier listings…</p>
        ) : error ? (
          <p className="py-8 text-sm text-rose-700">{error}</p>
        ) : suppliers.length ? (
          <Marquee pauseOnHover className="[--duration:50s] [--gap:1.5rem] overflow-visible py-4">
            {suppliers.map((supplier) => (
              <SellerCard key={supplier.id} supplier={supplier} />
            ))}
          </Marquee>
        ) : (
          <p className="py-8 text-sm text-muted">No verified supplier listings are available yet.</p>
        )}
      </div>
    </section>
  );
}
