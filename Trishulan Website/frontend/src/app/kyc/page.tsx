'use client';

import React from 'react';
import AccountRegistrationKycStatus from '@/components/business-services/AccountRegistrationKycStatus';
import GuidedRegistrationChecklist from '@/components/business-services/GuidedRegistrationChecklist';

export default function KycBusinessServicesPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 px-4 sm:px-6 font-sans">
      <main className="max-w-7xl w-full mx-auto space-y-8">
        {/* Light Theme Banner */}
        <div className="bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/80 p-8 rounded-2xl border-2 border-emerald-200/80 shadow-md">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            Business Setup & KYC Verification
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A1629] tracking-tight mt-2">
            3. Account Registration, KYC & Business Setup
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-2xl">
            Account registration, verified contact checks, legal document review, guided compliance checklist, and adviser appointment requests.
          </p>
        </div>

        {/* Section 1: Account Registration / KYC Status */}
        <AccountRegistrationKycStatus />

        {/* Section 2: Guided Registration Checklist */}
        <GuidedRegistrationChecklist />
      </main>
    </div>
  );
}
