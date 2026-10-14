'use client';

import React from 'react';
import AccountRegistrationKycStatus from '@/components/business-services/AccountRegistrationKycStatus';

export default function KycBusinessServicesPage() {
  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 font-sans">
      <main className="max-w-7xl w-full mx-auto space-y-8">
        {/* Section 1: Account Registration / KYC Status */}
        <AccountRegistrationKycStatus />
      </main>
    </div>
  );
}
