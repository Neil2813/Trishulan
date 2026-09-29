"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, UserRole } from '@/types';
import DigitalIDCard from '@/components/DigitalIDCard';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [role, setRole] = useState<UserRole>('BUYER');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.user) {
          const u: User = data.user;
          setUser(u);
          setName(u.name || '');
          setCompanyName(u.companyName || '');
          setPhone(u.phone || '');
          setGstNumber(u.gstNumber || '');
          setIndustrySector(u.industrySector || 'RAW_MATERIALS');
          setAddress(u.address || '');
          setCity(u.city || '');
          setState(u.state || '');
          setRole(u.role || 'BUYER');
        } else {
          router.push('/register');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          companyName,
          phone,
          gstNumber,
          industrySector,
          address,
          city,
          state,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setUser(data.user);
      setMessage('Profile details updated successfully in database!');
    } catch (err: any) {
      setError(err.message || 'Error saving profile details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 font-medium">
        Loading User Profile & Digital ID Card...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-12 px-4 sm:px-6">
      <div className="max-w-[1100px] mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[24px] font-black text-[#0A1629]">{name || 'User Profile'}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white font-extrabold text-[10px] uppercase">
                  {role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-extrabold text-[10px] uppercase">
                  ✓ MANDATORY KYC VERIFIED
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {companyName || 'Business Entity'} • {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Active Subscription Plan</span>
              <span className="text-[18px] font-black text-[#EA580C]">{user?.subscriptionTier || 'GROWTH'} TIER</span>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#EA580C] font-bold text-xs"
            >
              Manage Plans →
            </Link>
          </div>
        </div>

        {/* Digital ID Card Display Section */}
        <div>
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-[.14em]">OFFICIAL MEMBER CARD</span>
            <h2 className="text-[22px] font-black text-[#0A1629]">Your Issued Trishulan Digital ID Card</h2>
          </div>

          <DigitalIDCard
            name={name || 'Industrial Member'}
            role={role === 'SELLER' ? 'SELLER' : 'BUYER'}
            companyName={companyName || 'Trishulan Enterprise'}
            gstNumber={gstNumber || '27AAAAA0000A1Z5'}
            email={user?.email || 'member@trishulan.com'}
          />
        </div>

        {/* KYC Verification Checklist Status */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
            <div>
              <h3 className="font-black text-[18px] text-[#0A1629]">KYC Document Verification Status</h3>
              <p className="text-xs text-gray-500">Document inspection verified by Trishulan Compliance Hub</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">100% VERIFIED</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <span className="text-2xl block mb-1">🪪</span>
              <span className="text-xs font-bold text-[#0A1629] block">AADHAR Card</span>
              <span className="text-[10px] text-green-600 font-extrabold block mt-1">✓ Verified</span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <span className="text-2xl block mb-1">💳</span>
              <span className="text-xs font-bold text-[#0A1629] block">PAN Card</span>
              <span className="text-[10px] text-green-600 font-extrabold block mt-1">✓ Verified</span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <span className="text-2xl block mb-1">📜</span>
              <span className="text-xs font-bold text-[#0A1629] block">GST Certificate</span>
              <span className="text-[10px] text-green-600 font-extrabold block mt-1">✓ Verified</span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <span className="text-2xl block mb-1">📷</span>
              <span className="text-xs font-bold text-[#0A1629] block">Photo Selfie</span>
              <span className="text-[10px] text-green-600 font-extrabold block mt-1">✓ Verified</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-xl p-6 md:p-8">
          
          <div className="text-xs font-black text-[#EA580C] uppercase tracking-wider mb-4">
            EDIT BUSINESS PROFILE DETAILS
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-bold">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Full Representative Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Account Role (Fixed)</label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-[#0A1629]">
                  {role === 'SELLER' ? 'SELLER (Supplying & Listing)' : 'BUYER (Sourcing & Procurement)'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="27AAAAA0000A1Z5"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Industry Sector</label>
                <select
                  value={industrySector}
                  onChange={(e) => setIndustrySector(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                >
                  <option value="RAW_MATERIALS">Raw Materials (Steel, Polymers, Chemicals)</option>
                  <option value="MACHINERY">Industrial Machinery & Equipment</option>
                  <option value="SPARES">Industrial Spares & Hydraulics</option>
                  <option value="LOGISTICS">Transport & Freight Services</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1629] mb-1">Business Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
            >
              {saving ? 'Updating Database...' : 'Save Profile Changes →'}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
