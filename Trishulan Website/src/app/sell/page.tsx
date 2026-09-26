"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'RAW_MATERIALS' | 'MACHINERY' | 'SPARES'>('MACHINERY');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Unit');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          price: parseFloat(price),
          unit,
          location,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create listing');
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-12 px-6">
      <div className="max-w-[720px] mx-auto bg-white rounded-[24px] border border-gray-200 shadow-xl p-8 md:p-10">
        
        <div className="mb-8 text-center">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">SELLER DISTRIBUTION PORTAL</span>
          <h1 className="text-[32px] font-black text-[#0A1629] mt-1">List Product / Machinery</h1>
          <p className="text-xs text-gray-500 mt-1">
            Display your industrial equipment, spares, or raw materials to thousands of buyers.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#0A1629] mb-1.5">Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5-Axis CNC Milling Center Machine"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600 bg-white font-semibold"
              >
                <option value="RAW_MATERIALS">Raw Materials</option>
                <option value="MACHINERY">Machinery & Equipment</option>
                <option value="SPARES">Industrial Spares</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1.5">Location (City, State)</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rajkot, Gujarat"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1.5">Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2850000"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1.5">Unit of Measurement</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit or Metric Ton or Piece"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A1629] mb-1.5">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe machine specifications, warranty, condition (new/refurbished), and shipping terms..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg transition-all"
          >
            {loading ? 'Publishing Listing...' : 'Publish Listing to Marketplace →'}
          </button>
        </form>

      </div>
    </div>
  );
}
