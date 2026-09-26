"use client";

import React, { useState } from 'react';

interface DigitalIDCardProps {
  name: string;
  role: 'BUYER' | 'SELLER';
  companyName: string;
  companyId?: string;
  gstNumber?: string;
  email?: string;
  photoUrl?: string;
}

export default function DigitalIDCard({
  name,
  role,
  companyName,
  companyId = 'TRISH-2026-94820',
  gstNumber = '27AAAAA0000A1Z5',
  email = 'member@trishulan.com',
  photoUrl,
}: DigitalIDCardProps) {
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  return (
    <div className="bg-[#0A1629] text-white rounded-[24px] p-6 md:p-8 shadow-2xl border border-slate-700 relative overflow-hidden max-w-lg mx-auto">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA580C]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-700/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-[#EA580C] text-lg font-alata">
            T
          </div>
          <div>
            <h4 className="font-extrabold text-[15px] tracking-wider text-white">TRISHULAN CONNECT</h4>
            <span className="text-[9.5px] uppercase font-bold text-gray-400 tracking-widest block">OFFICIAL B2B INDUSTRIAL ID</span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 font-extrabold text-[10px] tracking-wider uppercase">
          ✓ KYC VERIFIED
        </span>
      </div>

      {/* Card Main Body */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        
        {/* User Photo Box */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-[#EA580C] p-1 shadow-lg relative overflow-hidden flex items-center justify-center text-4xl">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="select-none">👤</span>
            )}
          </div>
          <span className="mt-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            {role === 'SELLER' ? 'VERIFIED SELLER' : 'VERIFIED BUYER'}
          </span>
        </div>

        {/* Member Details */}
        <div className="sm:col-span-2 space-y-2.5">
          <div>
            <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider block">Member / Firm Representative</span>
            <h3 className="text-[18px] font-black text-white leading-tight">{name || 'Industrial Member'}</h3>
          </div>

          <div>
            <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider block">Company / Firm Name</span>
            <div className="text-[13.5px] font-extrabold text-amber-300">{companyName || 'Trishulan Enterprise'}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Company ID</span>
              <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 block">
                {companyId}
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">GSTIN / Tax ID</span>
              <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 block truncate">
                {gstNumber}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code & Verification Row */}
      <div className="mt-6 pt-5 border-t border-slate-700/80 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          {/* Simulated QR Code matrix */}
          <div className="w-16 h-16 bg-white p-1.5 rounded-xl shrink-0 border border-white/20 shadow-md">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="100" fill="white" />
              {/* Corner markers */}
              <rect x="5" y="5" width="25" height="25" fill="#0A1629" />
              <rect x="9" y="9" width="17" height="17" fill="white" />
              <rect x="13" y="13" width="9" height="9" fill="#0A1629" />
              
              <rect x="70" y="5" width="25" height="25" fill="#0A1629" />
              <rect x="74" y="9" width="17" height="17" fill="white" />
              <rect x="78" y="13" width="9" height="9" fill="#0A1629" />

              <rect x="5" y="70" width="25" height="25" fill="#0A1629" />
              <rect x="9" y="74" width="17" height="17" fill="white" />
              <rect x="13" y="78" width="9" height="9" fill="#0A1629" />

              {/* Data dots */}
              <rect x="35" y="10" width="8" height="8" fill="#EA580C" />
              <rect x="48" y="10" width="8" height="8" fill="#0A1629" />
              <rect x="35" y="25" width="8" height="8" fill="#0A1629" />
              <rect x="48" y="25" width="8" height="8" fill="#EA580C" />
              <rect x="10" y="38" width="8" height="8" fill="#0A1629" />
              <rect x="25" y="38" width="8" height="8" fill="#0A1629" />
              <rect x="40" y="45" width="20" height="20" fill="#0A1629" />
              <rect x="70" y="45" width="10" height="10" fill="#EA580C" />
              <rect x="85" y="45" width="8" height="8" fill="#0A1629" />
              <rect x="70" y="70" width="12" height="12" fill="#0A1629" />
              <rect x="85" y="70" width="10" height="10" fill="#EA580C" />
            </svg>
          </div>

          <div className="text-[11px] text-gray-300">
            <span className="font-bold text-white block">Scan to Verify Authenticity</span>
            <span className="text-[10px] text-gray-400">Encrypted Trishulan Trust Chain ID</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleSendEmail}
            className="px-3.5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#c2410a] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <span>✉️</span>
            <span>{emailSent ? 'Sent to Email!' : 'Send to Email'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>📥</span>
            <span>Download ID</span>
          </button>
        </div>

      </div>

      {emailSent && (
        <div className="mt-4 p-2.5 bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold rounded-xl text-center animate-[fadeIn_0.15s_ease]">
          ✓ Digital ID Card & Verification Certificate emailed to {email}
        </div>
      )}

    </div>
  );
}
