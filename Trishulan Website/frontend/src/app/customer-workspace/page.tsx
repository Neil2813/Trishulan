'use client';

import React, { useState } from 'react';
import BuyerContactPreferencesModal from '@/components/customer-tasks/BuyerContactPreferencesModal';
import CustomerTasksDashboardWorkspace from '@/components/customer-tasks/CustomerTasksDashboardWorkspace';
import SupportDeskModal from '@/components/customer-tasks/SupportDeskModal';

export default function CustomerWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'preferences' | 'workspace'>('all');
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 font-sans">
      <main className="max-w-7xl w-full mx-auto space-y-8">
        {/* Page Hero Banner */}
        <div className="bg-card p-8 rounded-2xl border border-line/80 shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-100 text-cyan-800 border border-cyan-300 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                Platform Customer Portal & CRM
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight">
              Customer Home, Buyer & Seller Tasks & Contact Preferences
            </h1>
            <p className="text-muted text-sm mt-2 max-w-2xl">
              Consent-aware contact sharing, live buyer/supplier workspace dashboards, RFQ management, WhatsApp lead routing rules and support desk integration.
            </p>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-2 bg-line/30 p-1.5 rounded-xl border border-line self-stretch md:self-auto justify-center">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'all' ? 'bg-accent text-white shadow' : 'text-muted hover:text-slate-900'}`}
            >
              All Sections
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'preferences' ? 'bg-accent text-white shadow' : 'text-muted hover:text-slate-900'}`}
            >
              Contact Preferences
            </button>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'workspace' ? 'bg-accent text-white shadow' : 'text-muted hover:text-slate-900'}`}
            >
              Customer Workspace
            </button>
          </div>
        </div>

        {/* Section 1: Buyer Contact Preferences Modal / Section */}
        {(activeTab === 'all' || activeTab === 'preferences') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                1. Buyer Contact Preferences & Consent Routing
              </h2>
              <span className="text-xs font-medium text-muted">Spec View 1</span>
            </div>
            <BuyerContactPreferencesModal />
          </section>
        )}

        {/* Section 2: Customer Home / Buyer & Seller Tasks Workspace */}
        {(activeTab === 'all' || activeTab === 'workspace') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                2. Customer Home / Buyer and Seller Tasks Workspace
              </h2>
              <span className="text-xs font-medium text-muted">Spec View 2</span>
            </div>
            <CustomerTasksDashboardWorkspace
              onOpenSupportModal={() => setShowSupportModal(true)}
            />
          </section>
        )}
      </main>

      {/* Support Desk Modal */}
      {showSupportModal && (
        <SupportDeskModal onClose={() => setShowSupportModal(false)} />
      )}
    </div>
  );
}
