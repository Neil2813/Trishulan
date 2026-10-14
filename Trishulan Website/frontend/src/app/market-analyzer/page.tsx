"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import IndustrialAnalyzerProductIntelligence from '@/components/market-analyzer/IndustrialAnalyzerProductIntelligence';
import { safeJsonFetch } from '@/lib/utils';

export default function MarketAnalyzerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [verifiedSellers, setVerifiedSellers] = useState<Array<{
    id: string;
    product: string;
    seller: string;
    location: string;
  }>>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
    setSuppliersLoading(true);
    setSuppliersError(false);

    try {
      const url = query.trim()
        ? `/api/platform-a/suppliers?query=${encodeURIComponent(query.trim())}`
        : '/api/platform-a/suppliers';

      const { ok, data: result } = await safeJsonFetch(url);
      if (!ok || !result) {
        setSuppliersError(true);
        setVerifiedSellers([]);
        return;
      }

      const suppliers: Array<{
        id: string;
        supplierId?: string;
        badge?: string;
        productTitle?: string;
        category?: string;
        name?: string;
        location?: string;
      }> = Array.isArray(result.suppliers) ? result.suppliers : [];

      setVerifiedSellers(
        suppliers
          .filter((supplier) => supplier.badge === 'VERIFIED')
          .map((supplier) => ({
            id: supplier.id,
            product: supplier.productTitle || supplier.category || '—',
            seller: supplier.name || '—',
            location: supplier.location || '—',
          }))
      );
    } catch (err) {
      setSuppliersError(true);
      console.warn('Failed to load verified suppliers:', err);
    } finally {
      setSuppliersLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1500px] mx-auto space-y-8">
        <IndustrialAnalyzerProductIntelligence
          onSearch={handleSearch}
          loading={suppliersLoading}
          error={suppliersError ? 'Verified supplier data is temporarily unavailable.' : null}
          hasSearched={hasSearched}
          supplierCount={verifiedSellers.length}
        />

        {hasSearched && (
          <div className="bg-card rounded-[24px] border border-line p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs">1</span>
                <h2 className="text-[20px] font-black text-ink">Verified Sellers on Trishulan</h2>
              </div>
              <Link href="/dashboard" className="text-xs font-bold text-accent hover:underline">View All Sellers →</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line text-muted/70 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Product / Service</th>
                    <th className="py-2.5">Seller Name</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suppliersLoading && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted">Searching verified suppliers…</td></tr>
                  )}
                  {!suppliersLoading && verifiedSellers.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted">
                      {suppliersError
                        ? 'Verified supplier data is temporarily unavailable.'
                        : `No verified suppliers found${searchQuery ? ` matching "${searchQuery}"` : ''}.`}
                    </td></tr>
                  )}
                  {verifiedSellers.map((s) => (
                    <tr key={s.id} className="hover:bg-card">
                      <td className="py-3 font-bold text-ink">{s.product}</td>
                      <td className="py-3 text-muted">{s.seller}</td>
                      <td className="py-3 text-muted">{s.location}</td>
                      <td className="py-3">
                        <Link href="/dashboard" className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg font-bold text-[10px]">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
