"use client";

import React, { useEffect, useState } from 'react';
import { Building, Globe, Search } from 'lucide-react';
import { safeJsonFetch } from '@/lib/utils';

interface MarketPrice {
  id: string;
  commodity: string;
  category: string;
  currentPrice: number;
  unit: string;
  change24h: number;
  lastUpdated: string;
  dataSource?: string;
}

export default function MarketPricesPage() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [tier, setTier] = useState<string | null>(null);
  const [searchMaterial, setSearchMaterial] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPrices() {
      const result = await safeJsonFetch<{ marketPrices?: MarketPrice[]; tier?: string }>('/api/market');
      if (!result.ok || !result.data) {
        setError(result.error || 'Unable to load market prices.');
      } else {
        setPrices(result.data.marketPrices || []);
        setTier(result.data.tier || null);
      }
      setLoading(false);
    }
    loadPrices();
  }, []);

  const filteredPrices = prices.filter((price) =>
    price.commodity.toLowerCase().includes(searchMaterial.trim().toLowerCase())
  );
  const averagePrice = prices.length
    ? prices.reduce((sum, price) => sum + price.currentPrice, 0) / prices.length
    : null;
  const averageChange = prices.length
    ? prices.reduce((sum, price) => sum + price.change24h, 0) / prices.length
    : null;
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Search Bar */}
        <div className="bg-card rounded-[20px] p-4 border border-line shadow-sm">
          <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-line shadow-sm w-full">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input
              type="search"
              value={searchMaterial}
              onChange={(event) => setSearchMaterial(event.target.value)}
              placeholder="Search available commodities..."
              className="flex-1 text-xs font-semibold text-ink bg-transparent border-none outline-none"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-[24px] border border-line shadow flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted/70 uppercase block">Average listed benchmark</span>
              <div className="text-[32px] font-black text-ink mt-1">
                {loading ? 'Loading…' : averagePrice === null ? '—' : formatPrice(averagePrice)}
              </div>
              <span className="text-xs text-muted">Across returned market instruments</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Globe className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-[24px] border border-line shadow flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted/70 uppercase block">Average 24-hour change</span>
              <div className={`text-[32px] font-black mt-1 ${
                averageChange !== null && averageChange > 0 ? 'text-emerald-700' : 'text-ink'
              }`}>
                {loading ? 'Loading…' : averageChange === null ? '—' : `${averageChange > 0 ? '+' : ''}${averageChange.toFixed(2)}%`}
              </div>
              <span className="text-xs text-muted">From the market service response</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-accent flex items-center justify-center">
              <Building className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-[24px] border border-line shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-line">
            <div>
              <h2 className="font-extrabold text-[18px] text-ink">Available commodity benchmarks</h2>
              <p className="text-xs text-muted">Values and update times come from the market data API.</p>
            </div>
            {tier && <span className="text-xs font-bold text-accent">{tier} plan</span>}
          </div>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted">Loading market prices…</p>
          ) : filteredPrices.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line text-muted/70 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Commodity</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5 text-right">Price</th>
                    <th className="py-2.5 text-right">24h change</th>
                    <th className="py-2.5 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPrices.map((price) => (
                    <tr key={price.id} className="hover:bg-card">
                      <td className="py-3 font-bold text-ink">{price.commodity}</td>
                      <td className="py-3 text-muted">{price.category}</td>
                      <td className="py-3 text-right font-black text-accent">
                        {formatPrice(price.currentPrice)} / {price.unit}
                      </td>
                      <td className={`py-3 text-right font-bold ${
                        price.change24h > 0 ? 'text-green-700' : price.change24h < 0 ? 'text-red-700' : 'text-muted'
                      }`}>
                        {price.change24h > 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                      </td>
                      <td className="py-3 text-right text-muted/70 text-[10px]">
                        {new Date(price.lastUpdated).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-muted">
              {prices.length ? 'No market prices match this search.' : 'No market price data is available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
