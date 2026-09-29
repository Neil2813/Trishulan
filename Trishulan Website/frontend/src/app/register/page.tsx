"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { firebaseAuth, googleProvider, signInWithPopup } from '@/lib/firebase';
import { UserRole } from '@/types';
import DigitalIDCard from '@/components/DigitalIDCard';
import { ShoppingCart, Factory, CreditCard, FileText, Building2, User, Check, IdCard } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>('SELLER');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'BASIC' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');

  // Populated from Google OAuth
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // KYC & Document Verification
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [msmeNumber, setMsmeNumber] = useState('');

  // File upload statuses
  const [aadharUploaded, setAadharUploaded] = useState(false);
  const [panUploaded, setPanUploaded] = useState(false);
  const [gstUploaded, setGstUploaded] = useState(false);
  const [msmeUploaded, setMsmeUploaded] = useState(false);
  const [photoVerified, setPhotoVerified] = useState(false);
  const [bannerUploaded, setBannerUploaded] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrl(url);
      setPhotoVerified(true);
    }
  };

  // Step 1 → Firebase Google OAuth → proceed to Step 2
  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const fbUser = result.user;
      // Pre-fill details from Google account
      setName(fbUser.displayName || '');
      setEmail(fbUser.email || '');
      setCompanyName(companyName || `${fbUser.displayName || 'My'}'s Company`);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 submit → register on backend → Step 3
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          authProvider: 'FIREBASE',
          role,
          companyName,
          phone,
          gstNumber,
          city,
          state,
          tier: subscriptionPlan,
          kycStatus: 'VERIFIED',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setRegisteredUser(data.user || { name, email, role, companyName, gstNumber });
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-12 px-4 sm:px-6">
      <div className="max-w-[920px] mx-auto bg-white rounded-[24px] border border-gray-200 shadow-2xl p-6 md:p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-[.14em]">TRISHULAN INDUSTRIAL CONNECT</span>
          <h1 className="text-[28px] md:text-[34px] font-black text-[#0A1629] mt-1">
            {step === 3 ? 'Account Created & ID Card Generated' : 'Create Your Business Account'}
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-lg mx-auto">
            {step === 1 && 'Select your account role and tier, then sign in with Google to continue.'}
            {step === 2 && 'Complete mandatory KYC document upload and photo verification for your seller/buyer badge.'}
            {step === 3 && 'Your official Digital ID card has been issued and sent to your email.'}
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={`w-8 h-2 rounded-full transition-all ${step >= 1 ? 'bg-[#EA580C]' : 'bg-gray-200'}`}></span>
            <span className={`w-8 h-2 rounded-full transition-all ${step >= 2 ? 'bg-[#EA580C]' : 'bg-gray-200'}`}></span>
            <span className={`w-8 h-2 rounded-full transition-all ${step === 3 ? 'bg-green-500' : 'bg-gray-200'}`}></span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        {/* ── STEP 1: ROLE, TIER & GOOGLE OAUTH ── */}
        {step === 1 && (
          <div className="space-y-6">

            {/* Account Type Cards */}
            <div>
              <label className="block text-xs font-black text-[#0A1629] uppercase tracking-wider mb-3">
                Which account would you like to create?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setRole('BUYER')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    role === 'BUYER' ? 'border-[#EA580C] bg-orange-50/50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-[16px] text-[#0A1629]">Buyer</h3>
                      <input type="radio" checked={role === 'BUYER'} onChange={() => setRole('BUYER')} className="accent-[#EA580C]" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Access over 200 million products from 200,000 verified suppliers worldwide.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setRole('SELLER')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    role === 'SELLER' ? 'border-[#0A1629] bg-slate-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#EA580C] border border-orange-200 flex items-center justify-center shrink-0">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-[16px] text-[#0A1629]">Supplier / Seller</h3>
                      <input type="radio" checked={role === 'SELLER'} onChange={() => setRole('SELLER')} className="accent-[#0A1629]" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Sell your products to 40 million business buyers worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Tier Selection */}
            <div>
              <label className="block text-xs font-black text-[#0A1629] uppercase tracking-wider mb-3">
                Select Subscription Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSubscriptionPlan('BASIC')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    subscriptionPlan === 'BASIC' ? 'border-[#EA580C] bg-orange-50 font-bold' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] font-bold text-gray-500 block">STANDARD</span>
                  <div className="font-black text-[#0A1629]">BASIC PLAN</div>
                  <div className="text-xs text-[#EA580C] font-extrabold mt-1">FREE</div>
                  <span className="text-[10px] text-gray-500 block mt-1">Live market spot prices</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubscriptionPlan('GROWTH')}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    subscriptionPlan === 'GROWTH' ? 'border-[#EA580C] bg-amber-50 font-bold shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-2 py-0.5 bg-[#EA580C] text-white text-[9px] font-bold rounded-full">POPULAR</span>
                  <span className="text-[10px] font-bold text-gray-500 block">PRO B2B</span>
                  <div className="font-black text-[#0A1629]">GROWTH TIER</div>
                  <div className="text-xs text-[#EA580C] font-extrabold mt-1">₹1,999 / mo</div>
                  <span className="text-[10px] text-gray-500 block mt-1">30-day price trend analyzer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubscriptionPlan('ENTERPRISE')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    subscriptionPlan === 'ENTERPRISE' ? 'border-[#0A1629] bg-slate-100 font-bold' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] font-bold text-gray-500 block">CORPORATE</span>
                  <div className="font-black text-[#0A1629]">ENTERPRISE TIER</div>
                  <div className="text-xs text-[#0A1629] font-extrabold mt-1">₹4,999 / mo</div>
                  <span className="text-[10px] text-gray-500 block mt-1">Predictive volume & historical analysis</span>
                </button>
              </div>
            </div>

            {/* Google OAuth CTA */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-[#0A1629] font-bold text-[13px] flex items-center justify-center gap-3 transition-all shadow-sm disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {loading ? 'Signing in with Google…' : 'Continue with Google → Proceed to KYC'}
            </button>
          </div>
        )}

        {/* ── STEP 2: KYC & PHOTO VERIFICATION ── */}
        {step === 2 && (
          <form onSubmit={handleFinalRegister} className="space-y-6">

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
              <div>
                <span className="font-extrabold block">MANDATORY B2B KYC PROCESS</span>
                <span>Signed in as <strong>{email}</strong>. Upload AADHAR, PAN, GST, MSME, Photo & Factory Media.</span>
              </div>
              <button type="button" onClick={() => setStep(1)} className="font-bold underline text-xs shrink-0 ml-4">Edit Step 1</button>
            </div>

            {/* Company name (editable) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">Company / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Industrial Solutions Pvt Ltd"
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

            {/* Document Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">AADHAR Number *</label>
                <input
                  type="text"
                  required
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  placeholder="12-digit AADHAR number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">PAN Card Number *</label>
                <input
                  type="text"
                  required
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">GSTIN Number *</label>
                <input
                  type="text"
                  required
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="27AAAAA0000A1Z5"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A1629] mb-1">MSME / Udyam Reg. Number</label>
                <input
                  type="text"
                  value={msmeNumber}
                  onChange={(e) => setMsmeNumber(e.target.value)}
                  placeholder="UDYAM-MH-01-0000000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            {/* Document File Uploads */}
            <div>
              <label className="block text-xs font-black text-[#0A1629] uppercase tracking-wider mb-2">
                Upload Mandatory KYC Documents
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'AADHAR Card', Icon: IdCard, uploaded: aadharUploaded, setUploaded: setAadharUploaded },
                  { label: 'PAN Card', Icon: CreditCard, uploaded: panUploaded, setUploaded: setPanUploaded },
                  { label: 'GST Certificate', Icon: FileText, uploaded: gstUploaded, setUploaded: setGstUploaded },
                  { label: 'MSME Certificate', Icon: Building2, uploaded: msmeUploaded, setUploaded: setMsmeUploaded },
                ].map(({ label, Icon, uploaded, setUploaded }) => (
                  <label
                    key={label}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                      uploaded ? 'bg-green-50 border-green-300 text-green-800' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1 text-slate-700" />
                    <span className="text-[11px] font-bold block">{label}</span>
                    <span className="text-[9px] text-gray-400">{uploaded ? '✓ Uploaded' : 'Click to Upload'}</span>
                    <input type="file" accept="image/*,.pdf" onChange={() => setUploaded(true)} className="hidden" />
                  </label>
                ))}
              </div>
            </div>

            {/* Photo Verification & Factory Media */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                <span className="text-xs font-bold text-[#0A1629] block mb-2">Photo Verification (Selfie / Camera Snapshot)</span>
                {photoPreviewUrl ? (
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-green-500 mb-2">
                    <img src={photoPreviewUrl} alt="Selfie preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-slate-600 mb-2">
                    <User className="w-8 h-8 text-slate-500" />
                  </div>
                )}
                <label className="inline-block px-4 py-2 bg-[#EA580C] text-white text-xs font-bold rounded-xl cursor-pointer">
                  {photoVerified ? '✓ Photo Verified' : 'Take Selfie / Upload Photo'}
                  <input type="file" accept="image/*" onChange={handlePhotoCapture} className="hidden" />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center flex flex-col justify-center gap-2">
                <span className="text-xs font-bold text-[#0A1629] block">Factory Images & Video with Banner</span>
                <span className="text-[10px] text-gray-500">Banner must contain GST number, address & firm name.</span>
                <div className="flex gap-2 justify-center">
                  <label className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${bannerUploaded ? 'bg-green-100 text-green-800' : 'bg-white text-gray-700'}`}>
                    {bannerUploaded ? '✓ Banner Uploaded' : 'Upload Banner'}
                    <input type="file" accept="image/*" onChange={() => setBannerUploaded(true)} className="hidden" />
                  </label>
                  <label className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${videoUploaded ? 'bg-green-100 text-green-800' : 'bg-white text-gray-700'}`}>
                    {videoUploaded ? '✓ Video Uploaded' : 'Upload Video'}
                    <input type="file" accept="video/*" onChange={() => setVideoUploaded(true)} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? 'Verifying & Issuing Digital ID Card...' : 'Complete Registration & Generate Digital ID Card →'}
            </button>
          </form>
        )}

        {/* ── STEP 3: DIGITAL ID CARD ── */}
        {step === 3 && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease]">
            <DigitalIDCard
              name={name || registeredUser?.name || 'Industrial Member'}
              role={role === 'SELLER' ? 'SELLER' : 'BUYER'}
              companyName={companyName || registeredUser?.companyName || 'Trishulan Enterprise'}
              gstNumber={gstNumber || '27AAAAA0000A1Z5'}
              email={email || registeredUser?.email}
              photoUrl={photoPreviewUrl || undefined}
            />

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-[#EA580C] hover:bg-[#c2410a] text-white font-extrabold text-xs rounded-xl shadow-lg text-center"
              >
                Go to Main Dashboard →
              </Link>
              <Link
                href="/profile"
                className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#0A1629] font-bold text-xs rounded-xl border border-gray-300 text-center"
              >
                View Full Profile & KYC Docs
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
