'use client';

import React, { useState } from 'react';
import BuyerContactPreferencesModal from '@/components/customer-tasks/BuyerContactPreferencesModal';
import CustomerTasksDashboardWorkspace from '@/components/customer-tasks/CustomerTasksDashboardWorkspace';
import SupportDeskModal from '@/components/customer-tasks/SupportDeskModal';

export default function CustomerWorkspacePage() {
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 font-sans">
      <main className="max-w-7xl w-full mx-auto space-y-8">
        {/* Section 1: Buyer Contact Preferences Modal / Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Buyer Contact Preferences & Consent Routing
            </h2>
          </div>
          <BuyerContactPreferencesModal />
        </section>

        {/* Section 2: Customer Home / Buyer & Seller Tasks Workspace */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
              Customer Home / Buyer and Seller Tasks Workspace
            </h2>
          </div>
          <CustomerTasksDashboardWorkspace
            onOpenSupportModal={() => setShowSupportModal(true)}
          />
        </section>
      </main>

      {/* Support Desk Modal */}
      {showSupportModal && (
        <SupportDeskModal onClose={() => setShowSupportModal(false)} />
      )}
    </div>
  );
}
