'use client';

import React from 'react';
import AccountRegistrationKycStatus from '@/components/business-services/AccountRegistrationKycStatus';
import GuidedRegistrationChecklist from '@/components/business-services/GuidedRegistrationChecklist';

export default function KycBusinessServicesPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 font-sans">
      <main className="max-w-7xl w-full mx-auto space-y-8">
        {/* Light Theme Banner */}
        <div className="bg-card p-8 rounded-2xl border border-line/80 shadow">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            Business Setup & KYC Verification
          </span>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight mt-2">
            3. Account Registration, KYC & Business Setup
          </h1>
          <p className="text-muted text-sm mt-2 max-w-2xl">
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
