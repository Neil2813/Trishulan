# TRISHULAN INDUSTRIAL CONNECT — EXHAUSTIVE PLATFORM AUDIT & ARCHITECTURAL REVIEW

**Reference Blueprint**: `trishulan_industrial_connect_platform_guide (2).pdf` (36 Pages)
**Document Release Date**: 30 September 2026
**Last Audit Update**: 14 October 2026
**Audited Codebase**: Next.js 16 (App Router + React 19) Frontend | Express.js + Socket.IO Backend | Prisma ORM + PostgreSQL
**Audit Scope (14 October 2026)**: Source-level comparison of app routes, relevant frontend components, Express routes/services, Prisma schema, and the supplied guide. This is not a runtime, deployed-database, external-provider, or production-readiness certification.

---

## TABLE OF CONTENTS
1. [Executive Summary & Source-Level Metrics](#1-executive-summary--source-level-metrics)
2. [Comparative Archetypes & Benchmark Matrix (pp. 1–12, 36)](#2-comparative-archetypes--benchmark-matrix-pp-112-36)
3. [Proposed Feature Expansions (pp. 13–16)](#3-proposed-feature-expansions-pp-1316)
   - 3.1 [Unified Search Bar & AI Discovery (p. 13)](#31-unified-search-bar--ai-discovery-p-13)
   - 3.2 [Buyer RFQ Matching & Side-by-Side Compare (p. 14)](#32-buyer-rfq-matching--side-by-side-compare-p-14)
   - 3.3 [Buyer Lead Sharing, WhatsApp & Granular Consent (pp. 14–15)](#33-buyer-lead-sharing-whatsapp--granular-consent-pp-1415)
   - 3.4 [Customer Workspace & Dual Buyer/Seller Tasks (p. 16)](#34-customer-workspace--dual-buyerseller-tasks-p-16)
4. [Core Business Modules Deep-Dive (pp. 17–25)](#4-core-business-modules-deep-dive-pp-1725)
   - 4.1 [Module 1: Industrial Analyzer (p. 17)](#41-module-1-industrial-analyzer-p-17)
   - 4.2 [Module 2: AI-Assisted Daily Market Price Analyzer (pp. 17–18)](#42-module-2-ai-assisted-daily-market-price-analyzer-pp-1718)
   - 4.3 [Module 3: KYC, Document Verification & Business Setup (pp. 19–20)](#43-module-3-kyc-document-verification--business-setup-pp-1920)
   - 4.4 [Module 4: Transport & Shipment Control Tower (pp. 20–23)](#44-module-4-transport--shipment-control-tower-pp-2023)
   - 4.5 [Module 5: Packing & Packaging Support (pp. 22–23)](#45-module-5-packing--packaging-support-pp-2223)
   - 4.6 [Module 6: Health Insurance Access (p. 24)](#46-module-6-health-insurance-access-p-24)
   - 4.7 [Module 7 & 8: Buyer-Supplier Connection & Connected Services Dashboard (pp. 24–25)](#47-module-7--8-buyer-supplier-connection--connected-services-dashboard-pp-2425)
5. [Subscription Tiers & Monetization Quota Rules (pp. 26–27)](#5-subscription-tiers--monetization-quota-rules-pp-2627)
6. [Small-Business Billing, Inventory & Accounts (pp. 28–29)](#6-small-business-billing-inventory--accounts-pp-2829)
7. [Feature-by-Feature 16-Point Checklist Audit (pp. 30–33)](#7-feature-by-feature-16-point-checklist-audit-pp-3033)
8. [Help Desk, Dispute Resolution, Platform Safety & 30-Day Rollout (pp. 34–35)](#8-help-desk-dispute-resolution-platform-safety--30-day-rollout-pp-3435)
9. [Prisma Database Schema Audit & Blueprint Diff](#9-prisma-database-schema-audit--blueprint-diff)
10. [Frontend Routing & Dead-Link Audit](#10-frontend-routing--dead-link-audit)
11. [Previously Reported Data Cleanup — Current Source Check](#11-previously-reported-data-cleanup--current-source-check)
12. [Current Implementation Roadmap](#12-current-implementation-roadmap)

---

## 1. Executive Summary & Source-Level Metrics

This document compares source code with the 36-page guide. The guide describes proposed and illustrative product capabilities; it is not evidence that a feature is live. The checks below establish source presence and wiring only unless explicitly stated otherwise.

**14 October 2026 update**: The earlier readiness percentages had no documented weighting or repeatable denominator. They are retired rather than presented as current product readiness. The following counts are directly verifiable in the checked-in source:

| Source-level metric | Current result | Measurement boundary |
| :--- | :---: | :--- |
| App Router page files | 23 | `frontend/src/app/**/page.tsx`; presence does not prove each page workflow works. |
| Platform A–E page routes present | 5 / 5 (100%) | All five `platform-*/page.tsx` files exist. |
| Admin API handlers protected by router-level `requireAdmin` | 9 / 9 (100%) | One overview GET and eight PATCH handlers in `backend/src/routes/admin.ts`. |
| Admin PATCH handlers writing an audit log | 8 / 8 (100%) | Source contains an `AdminAuditLog` write in each PATCH handler. |
| Previously flagged Footer destinations mapped to existing page routes | 8 / 8 (100%) | Original destinations were replaced; some labels now point to broader pages, not dedicated features. |
| Backend handlers present for barcode/image endpoints called by the UI | 0 / 2 (0%) | The frontend calls `/api/search/barcode` and `/api/search/visual`; neither handler is registered in the backend source. |
| Operations daybook API handler present | 0 / 1 (0%) | The UI tab is a placeholder and no `/api/operations/daybook` handler exists. |

No aggregate readiness percentage is reported: source presence alone cannot establish end-to-end operation, deployment state, provider availability, or feature quality.

### Cross-verified project progress

| Area | Current progress evidenced in source |
| :--- | :--- |
| Core platform | Authenticated listing, RFQ, quote, chat, support-ticket, operations-document, inventory, KYC-status, and admin workflows have persistence-backed routes. The shipment tower reads persisted bookings and admin can update limited status/exception fields, but no user-facing booking-creation route was found. Direct chat enforces encrypted payloads; the separate Platform A inquiry route does not. |
| Buyer consent and lead sharing | Consent records exist, but the page's modal has no RFQ/seller context and its field names do not match the API. Lead-sharing UI is unmounted and its request contract also differs from the endpoint. These features are not end-to-end despite persistence code. |
| Market intelligence | FX/finance-provider calls exist, but product prices and extended histories are calculated/synthesized, and the “AI” findings are template text. Platform D is a wrapper around this analyzer, not trade-manifest intelligence. |
| Logistics, packaging, and insurance | Shipment bookings are user-scoped; transport and packaging screens show constants. Insurance leads persist with consent, but plan records are static and provider handoff/callback completion is not implemented. |
| Operations, notifications, and exports | Document/inventory/summary routes are present. Day Book and PDF export are placeholders; header notifications and Digital ID email reporting are local UI state rather than delivery workflows. |
| Runtime/deployment | Frontend production build and backend TypeScript check passed. Frontend lint could not complete because the checked-in ESLint config cannot resolve its `eslint-config-next/core-web-vitals` import. Database migration state, configured provider credentials, production storage, live delivery, and end-to-end behavior remain unverified. |

---

## 2. Comparative Archetypes & Benchmark Matrix (pp. 1–12, 36)

The guide opens with a neutral comparative evaluation of 5 business platform archetypes:
- **Platform A**: Indian supplier discovery marketplace (lead-gen model).
- **Platform B**: Global wholesale sourcing marketplace (RFQ marketplace, cross-border, order protection).
- **Platform C**: Indian B2B marketplace and trade-lead portal (buy requirements, distributor discovery).
- **Platform D**: Import-export intelligence and trade-data platform (shipments, customs manifests, HS code trends).
- **Platform E**: SME digital-presence and sourcing network (digital card, structured catalogue, storefront).

### Detailed Audit of Pages 1–12:

| Guide Pages | Module | Current source status |
| :--- | :--- | :--- |
| pp. 1-2 | Capability Comparison Matrix | Comparison UI exists; platform capability claims are not independently verified here. |
| pp. 3-4 | Platform A (Supplier Search) | Page and DB-backed listing endpoint exist; search integrations and runtime behavior are not fully verified. |
| pp. 5-6 | Platform B (Wholesale RFQ) | Page and RFQ endpoints exist; every illustrated workflow is not confirmed. |
| pp. 7-8 | Platform C (Trade Leads) | Page and DB-backed lead/RFQ routes exist; available records depend on database contents. |
| pp. 9-10 | Platform D (Trade Intelligence) | Page and endpoint exist; service uses market analyzer data and database counts, not an evidenced shipment-manifest provider. |
| pp. 11-12 | Platform E (SME Shopfront) | Page and DB-backed seller/listing route exist; this does not establish a configurable standalone seller website. |

#### What is working (Oct 2026):
1. All 5 archetype pages are built and routed in the Next.js app.
2. Weekly activity routes query message timestamps from the database for the last seven days and group them in application code by UTC weekday. This is not a PostgreSQL window query or a real-time event stream.
3. Supplier badges (VERIFIED / DOCS_LISTED / MANUFACTURER) derive from real `seller.verifiedSeller` and `seller.hasCertificates` DB fields — not `index % 2` logic.
4. POST inquiries (Platform A), POST RFQs (Platforms B/C/E) now persist to DB and require authentication.

#### Remaining Gaps:
- Platform D's `fetchTradeIntelligence()` delegates to the industrial market analyzer and adds database counts. No source evidence was found for a trade-manifest provider, competitor shipment history, or Gemini synthesis.
- `ChatMessage` has a composite index including timestamp; query plans and performance have not been tested.

---

## 3. Proposed Feature Expansions (pp. 13–16)

### 3.1 Unified Search Bar & AI Discovery (p. 13)

* **Codebase Implementation Audit**:
  - The standalone `UnifiedSearchAIDiscovery.tsx` component exists but is not imported by an app page.
  - The Header mounts `SearchToolsModal.tsx`; typed search routes to supplier search and the backend exposes text search at `/api/discovery/search`.
  - The modal posts barcode and image uploads to `/api/search/barcode` and `/api/search/visual`, but no matching backend handlers are registered.

* **October 2026 Changes**:
  - Voice input uses the browser Web Speech API where supported; it is browser-side speech recognition, not a backend voice service.
  - Product matching scores are sourced from listing data where present, otherwise null.

* **Remaining Gaps**:
  - HSN quick-select UI contains two example codes; no HSN lookup provider/API is wired.
  - Text discovery uses basic keyword matching; no Gemini 2.5 Flash integration was found.
  - Barcode/image lookup buttons currently fail against this backend because their requested server routes do not exist.
  - The multi-modal modal describes image recognition and HSN lookup, but only typed keyword search and browser-side speech recognition have implemented paths.

---

### 3.2 Buyer RFQ Matching & Side-by-Side Compare (p. 14)

* **Codebase Implementation Audit**:
  - Component: `BuyerRFQMatchingCompareView.tsx`.
  - Page: `/rfq` with 2-step wizard (`RFQPage.tsx`).
  - Backend API: `GET /api/discovery/match` and `POST /api/quotes` in `quotes.ts`.
  - Chat Suite: `ChatSuite.tsx` with Web Crypto ECDH E2EE messaging.
  - The compare-view component is not imported by an app page; source existence alone does not establish a reachable comparison UI.

* **October 2026 Changes**:
  - ✅ `GET /api/discovery/match` returns real RFQ→Quote DB joins for the authenticated user; removed JSW Steel / Tata Steel hardcoded rows.
  - ✅ `POST /api/quotes` requires auth; all fields (currency, incoterm, paymentTerms, taxRatePercent) are now required.
  - ✅ `GET /api/quotes/rfq/:rfqId` requires auth; removed `getDemoQuotes()` with 3 fake Pune/Ahmedabad/Chennai sellers.
  - ✅ `PATCH /api/quotes/:id/status` enforces auth guard.

* **Remaining Gaps**:
  - No Incoterm landed cost calculator.
  - No `Review` / `TransactionRating` model for post-transaction feedback.
  - 5-stage progress ribbon not displayed on active RFQ threads.
  - The compare-view component is not wired to a page; its compare action and “Send Clarification” / “Request Transport Quote” buttons only update local UI state and do not send a message or request.

---

### 3.3 Buyer Lead Sharing, WhatsApp & Granular Consent (pp. 14–15)

* **Current source behavior (cross-checked 14 October 2026)**:
  - `BuyerConsentLog` persists consent records. The backend expects `targetSellerId`, `allowPhoneSharing`, `allowWhatsappAlerts`, and `allowMarketing`.
  - `/customer-workspace` mounts `BuyerContactPreferencesModal` without `rfqId` or `suppliers`; its submit actions remain disabled in that page. Even when given props, the modal sends `sellerIds`, `sharePhone`, `allowWhatsApp`, and `futureOffers`, which do not match the backend field names. The API therefore records default-false consent against `GENERAL`, not the selected sellers and choices.
  - `GET /api/customer/consent` returns the buyer's latest record without filtering by seller or RFQ, so it cannot currently retrieve context-specific consent.
  - `BuyerLeadSharingWhatsapp.tsx` is not imported by an app page. Its payload (`buyerPhone`, `message`, `selectedSellerIds`) does not match `/api/discovery/lead-share` (`recipientPhone`, `leadTitle`, `recipientName`). The endpoint returns a `wa.me` URL only; it neither persists a routed lead nor dispatches a message, and it does not validate the recorded consent for the selected seller.
  - The consent API can append a false-valued consent record, but no working user-facing revocation flow was confirmed given the current modal wiring and payload mismatch.

* **Remaining Gaps**:
  - Wire the consent form to an RFQ and named sellers, align the request/response contracts, load existing preferences, and verify the consent record before any contact-sharing action.
  - No `LeadRouting` model or per-seller/per-channel delivery audit exists. No WhatsApp Business provider integration was found.

---

### 3.4 Customer Workspace & Dual Buyer/Seller Tasks (p. 16)

* **Codebase Implementation Audit**:
  - Component: `CustomerTasksDashboardWorkspace.tsx`.
  - Modal: `SupportDeskModal.tsx`.
  - Backend API: `GET /api/customer/workspace`, `POST /api/customer/ticket`.

* **October 2026 Changes**:
  - ⚠️ Ticket rows are persisted to `SupportTicket`, but the mounted form sends `description` while the API reads `details`; the submitted issue description is therefore stored as an empty string. The form's `attachment` value is also ignored by the API.
  - ✅ `GET /api/customer/workspace` removed hardcoded `{4, 12, 28, 1}`; queries live DB. `verifiedSuppliersCount` is now `prisma.user.count({ where: { role: 'SELLER', verifiedSeller: true } })`.
  - ✅ `POST /api/customer/ticket` removed random `tck-XXX` demo ticket and requires auth. The route omits assignee/SLA values, but Prisma schema defaults still assign the default support desk and “Within 24 hours” SLA.
  - ✅ `GET /api/customer/tickets` removed hardcoded `CS-1042` ticket; requires auth.

* **Remaining Gaps**:
  - Seller workspace lacks controls to toggle factory capacity, lead time, or out-of-stock status.
  - The admin workspace now supports ticket agent assignment, priority, and status. `nextUpdateSla` remains non-editable.
  - Workspace quick actions other than “Get help” show a browser alert; the requirements panels are static documentation, not task controls. Ticket attachment upload and customer email/SMS notifications were not found.

---

## 4. Core Business Modules Deep-Dive (pp. 17–25)

### 4.1 Module 1: Industrial Analyzer (p. 17)

* **Codebase Implementation Audit**:
  - Page: `/market-analyzer` (`MarketAnalyzerPage.tsx`).
  - Component: `IndustrialAnalyzerProductIntelligence.tsx`.
  - Backend API: `GET /api/market` → `marketDataService.ts`.

* **Remaining Gaps**:
  - Saved searches and price movement alerts cannot be saved to the database.
  - The “save search alert” language is returned as a static recommendation; no alert subscription or delivery workflow exists.

---

### 4.2 Module 2: AI-Assisted Daily Market Price Analyzer (pp. 17–18)

* **Codebase Implementation Audit**:
  - Component: `AiMarketPriceAnalyzer.tsx`.
  - Page: `/market-prices` (`MarketPricesPage.tsx`).

* **Remaining Gaps**:
  - EXW vs FOB vs CIF toggle does not calculate freight/port handling adjustments.
  - No incorrect-price reporting UI was found. `POST /api/market/report-listing` is unauthenticated, does not validate or persist the submitted fields, and returns a generated report ID; it is not a durable reporting workflow.
  - The analyzer output is not a verified product-specific market feed: INR ranges are formula-derived from one Yahoo Finance ticker's daily percentage change, while source labels and “Today” timestamps are fixed strings. The AI summary/findings are templates; no generative AI call was found.
  - The market-price endpoint converts live Yahoo Finance values and FX into product prices using configured multipliers. Its 30-day and yearly histories are synthesized from the current value, not fetched historical series. Treat these values as illustrative estimates, not verified commodity quotations.

---

### 4.3 Module 3: KYC, Document Verification & Business Setup (pp. 19–20)

* **Codebase Implementation Audit**:
  - Components: `AccountRegistrationKycStatus.tsx`, `GuidedRegistrationChecklist.tsx`.
  - Backend Service: `kycService.ts`.

* **October 2026 Changes**:
  - ✅ `GET /api/business-services/kyc-status` removed `defaultKycDocuments[]` (mock `/uploads/gstin_certificate.pdf`); reads from `user.kycDocuments` in DB; requires auth.
  - ✅ `GET /api/business-services/checklist` derives completion from persisted account/KYC/listing data and requires auth.
  - ✅ `POST /api/business-services/adviser-appointment` removed `'Tomorrow'`/`'10:00 AM'` defaults; `preferredDate` and `preferredTime` now required; requires auth.
  - ✅ `POST /api/business-services/reupload` requires auth.
  - ✅ `register/page.tsx` removed hardcoded GSTIN fallback `'27AAAAA0000A1Z5'` from Digital ID Card.

* **Remaining Gaps**:
  - Registration's KYC file controls only set local “uploaded” booleans; they do not submit file bytes. `POST /api/business-services/reupload` records a filename/status but does not receive or store file bytes. No KYC document object-storage integration was found.
  - No document expiry date tracking or alert background jobs.
  - `kycDocuments` and `bankVerified` are present on `User`; the old `listingsCount` reference is not a `User` column and should not be treated as a required schema field.
  - The Help FAQ claims KYC documents are AES-256 encrypted and accessible to the user and verification team; the current source does not upload/store those file bytes, so this claim is not supported by the implementation.

---

### 4.4 Module 4: Transport & Shipment Control Tower (pp. 20–23)

* **Codebase Implementation Audit**:
  - Components: `TransportOptionsScreen.tsx`, `ShipmentControlTower.tsx`.
  - Page: `/logistics`.
  - Backend Route: `businessServices.ts`.

* **Current source behavior (14 October 2026)**:
  - `GET /api/business-services/transport-quotes` returns a hard-coded VRL/TCI/Safexpress sample array; it does not query `TransportQuote`. The route has no handler-level authentication check; global middleware only extracts an optional session.
  - `GET /api/business-services/shipment-tower` requires authentication and reads `LogisticsBooking` rows for the current user. It derives milestone steps from limited status/timestamp data; it does not connect to carrier telemetry.
  - `GET /api/business-services/packaging-requirements` returns a hard-coded two-item sample array; it does not query `PackagingOption` or require a signed-in user.
  - `defaultKycDocuments` and `defaultShipmentControlTower` are also present as unused sample constants; KYC status and shipment-tower handlers use persisted user/booking data instead.

* **Remaining Gaps**:
  - `TransportQuote` and `PackagingOption` models exist, but the corresponding read endpoints currently return constants rather than querying them. Shipment lifecycle fields are part of `LogisticsBooking`.
  - No user-facing route to create a `LogisticsBooking` was found; the visible tower reads existing records and the admin can update limited status/exception fields. Interactive Freight Reconciliation and carrier quote integration are not implemented.
  - The schema has timestamp milestones, exception notes, freight amounts, and document URLs, but no GPS/status-step/POD-status fields or full reconciliation workflow.
  - The route comments claim the transport/packaging data are database-backed; those comments do not match the implementation.

---

### 4.5 Module 5: Packing & Packaging Support (pp. 22–23)

* **Codebase Implementation Audit**:
  - Component: `PackagingRequirementsSupport.tsx`.
  - Page: `/logistics`.

* **Remaining Gaps**:
  - Packaging inquiries cannot be submitted as distinct RFQs to packaging suppliers.
  - Pre-dispatch photo inspection uploads not connected to storage.
  - “Request Quote” on each displayed packaging option only raises a browser alert; it creates no request.

---

### 4.6 Module 6: Health Insurance Access (p. 24)

* **Codebase Implementation Audit**:
  - Backend Route: `insurance.ts` — `GET /plans`, `POST /lead`, `GET /leads`.
  - Frontend Page: `/insurance`.

* **Current source behavior (14 October 2026)**:
  - The `/insurance` page and authenticated referral workflow exist. `POST /api/insurance/lead` validates consent and required fields, then persists to `HealthInsuranceLead`; `GET /api/insurance/leads` is user-scoped.
  - `GET /api/insurance/plans` returns a hard-coded illustrative plan comparison. No insurer/broker API, referral dispatch, or callback completion integration is evidenced in source.
  - The API and page promise a callback within one business day, but the source shows only lead persistence and an admin status update; it does not establish a scheduled callback or provider handoff.

* **Remaining Gaps**:
  - Verify legal/provider approval and the callback/referral workflow before representing sample plans or the stated callback SLA as a live insurance service.
  - Plan data is illustrative, not a live quote or policy offer.

---

### 4.7 Module 7 & 8: Buyer-Supplier Connection & Connected Services Dashboard (pp. 24–25)

* **Codebase Implementation Audit**:
  - Dashboard: `/dashboard` with Digital ID modal (`DigitalIDCard.tsx`).

* **Remaining Gaps**:
  - 5-stage progress ribbon not displayed on active RFQ threads.
  - Verified badges lack verification date/issuer tooltips.

---

## 5. Subscription Tiers & Monetization Quota Rules (pp. 26–27)

* **Codebase Implementation Audit**:
  - Page: `/pricing` (`PricingPage.tsx`) and `PricingSection.tsx`.
  - Prisma User Model: `SubscriptionTier` enum (`BASIC`, `GROWTH`, `ENTERPRISE`).

* **October 2026 Changes**:
  - ✅ `PricingSection.tsx` loads session usage from `/api/auth/me` and hides the meter for unauthenticated users.
  - ⚠️ The UI falls back to a limit of 10 and tier label `Starter`; current `User` schema/API has `aiLookupsUsed`, `aiLookupsResetAt`, and `subscriptionTier`, but no `aiLookupsLimit` or `tier` fields.

* **Remaining Gaps**:
  - Tier names in Prisma are `BASIC`/`GROWTH`/`ENTERPRISE` — should align to guide's `Starter`/`Growth`/`Business`.
  - Server-side monthly quota enforcement/increment/reset was not found in the checked-in backend search; the UI's meter and fallback are not enforcement.
  - `POST /api/subscription` changes the authenticated user's tier directly; no payment-provider or entitlement verification is present in that route.
  - `GET /api/market` removes fields by the user's current tier but does not increment or check `aiLookupsUsed`. The UI's tier/limit fallback also reads `tier` and `aiLookupsLimit`, which are not the schema/API fields (`subscriptionTier`, no limit field).

---

## 6. Small-Business Billing, Inventory & Accounts (pp. 28–29)

* **Codebase Implementation Audit**:
  - Page: `/operations` (`OperationsPage.tsx`).
  - Backend Route: `operations.ts`.

* **October 2026 Changes**:
  - ✅ `GET /api/operations/documents` removed `getDemoDocuments()` (Bharat Steel Works / Chennai Machinery / Rajasthan Minerals); requires auth.
  - ✅ `POST /api/operations/documents` requires auth; removed `doc-demo` fallback, `taxRatePercent || 18` default, `docType || 'TAX_INVOICE'` default — all now required.
  - ✅ `GET /api/operations/inventory` removed `getDemoInventory()` (MS Coil / SS304 / Hex Bolt); requires auth.
  - ✅ `POST /api/operations/inventory` requires auth; removed `inv-demo` fallback.
  - ✅ `GET /api/operations/summary` removed hardcoded `{ totalRevenue: 485000, totalPaid: 320000, totalOutstanding: 165000, totalInventoryValue: 220000, lowStockItems: 3, openDocuments: 7 }`; requires auth; returns real DB aggregation.

* **Remaining Gaps**:
  - e-Invoice and e-Way bill export formatting not implemented.
  - The document-row `PDF` button has no click handler; no functioning document PDF generation/export was found.
  - No `GET /api/operations/daybook` endpoint exists. The Day Book tab displays a placeholder stating that connected entries are unavailable.
  - Stock valuation methods (FIFO / Weighted Average) not implemented.
  - The route file header advertises a Day Book endpoint, but no handler is registered. The operations page also advertises e-Way bill formatting despite having no such export implementation.

---

## 7. Feature-by-Feature 16-Point Checklist Audit (pp. 30–33)

| # | Checklist Feature | Current source evidence | Status |
| :-: | :--- | :--- | :--- |
| **1** | **Product and supplier search** | Header text search and supplier/listing routes exist; image and barcode UI calls have no server handlers. | **Partial** |
| **2** | **Product listing / catalogue** | `/sell`, `Listing` persistence, marketplace reads, and admin publication control exist. | **Partial** |
| **3** | **Company profile & verification** | Profile/registration and digital ID UI exist; external verification depends on configured providers and has not been runtime-validated. | **Partial** |
| **4** | **Inquiry / messaging** | `ChatSuite.tsx` direct-message API requires encrypted payloads; Platform A inquiry writes a separate plaintext `ChatMessage`. | **Partial / inquiry path is not E2EE** |
| **5** | **Requirement post / RFQ** | Authenticated RFQ creation/listing persists through Prisma; this does not implement the complete post-order buyer journey. | **Partial** |
| **6** | **Quote comparison** | Quote APIs and the compare-view component exist, but `BuyerRFQMatchingCompareView` is not imported by an app page. | **Partial / component not wired** |
| **7** | **Lead inbox and seller CRM** | Customer workspace and ticket routes exist; the workspace aggregates selected counters and is not a full CRM. | **Partial** |
| **8** | **Verification and trust signals** | Provider-backed GSTIN/PAN service code and KYC review flows exist; provider credentials/results and verification provenance are unverified. | **Partial / external provider unverified** |
| **9** | **Trade data and market charts** | Market price service uses external market/FX data; platform-D intelligence is derived from the market analyzer and database counts, not trade-manifest data. | **Partial** |
| **10** | **Alerts and saved searches** | No persisted alert/saved-search model or workflow was found; visible alert affordances are not a demonstrated notification service. | **Not implemented as a persisted workflow** |
| **11** | **Storefront / website** | Platform-E network page reads seller/listing data; a configurable seller website builder was not found. | **Partial** |
| **12** | **Reports and export** | The operations page exposes a PDF button without a handler; Digital ID downloads an image, while its “Send to Email” control only changes local UI state. | **Partial; no document PDF or email delivery** |
| **13** | **Subscription and promotions** | Pricing UI and subscription-tier API/schema exist; payment integration and server-enforced AI quota were not found. | **Partial** |
| **14** | **Mobile / notifications** | The Header notification drawer is local state with no data source; no email, SMS, WhatsApp Business, or device push delivery workflow was found. | **UI affordance only** |
| **15** | **Logistics / transaction tools** | Booking/status and shipment display use `LogisticsBooking`; carrier quotes and packaging options are hard-coded samples, with no carrier integration or reconciliation flow. | **Partial** |
| **16** | **Unified search and AI discovery** | Basic text discovery and browser speech input exist; AI discovery is not wired, and barcode/image server endpoints are absent. | **Partial** |

These statuses describe repository evidence only; they are not weighted into a readiness percentage.

---

## 8. Help Desk, Dispute Resolution, Platform Safety & 30-Day Rollout (pp. 34–35)

### 8.1 Help & Support Center (p. 34)

* **October 2026 Changes**:
  - Ticket creation now writes a `SupportTicket` row, but the form/API payload mismatch means the issue description is stored empty and the attachment reference is ignored (see Section 3.4).
  - The route omits explicit assignee/SLA values; the Prisma schema still supplies `Trishulan Support Desk` and `Within 24 hours` defaults.

* **Remaining Gaps**:
  - `/help` exists; a dedicated `/support` page and end-to-end dispute/grievance workflow remain unverified.
  - No dedicated in-app dispute/grievance portal was found. This source audit does not make a legal-compliance determination.
  - The admin workspace can assign a support agent and update priority/status; `nextUpdateSla` is not editable through the admin API. Although the ticket-creation route omits these values, Prisma schema defaults still set `assignedAgent` to `Trishulan Support Desk` and `nextUpdateSla` to `Within 24 hours`.
  - Help content advertises plan-specific response times, a 48-hour dispute mediation promise, email/SMS status notifications, and file encryption; those delivery/response workflows are not implemented or verified in the checked source. The support modal only accepts an attachment URL/reference, and the API ignores that field; there is no file-upload workflow.
  - The Help FAQ says “all direct messages” are E2EE, but Platform A inquiry messages are stored as plaintext. The encrypted guarantee applies to the `ChatSuite` direct-message endpoint, not every message path.

### 8.2 Administrator workspace and access control (guide pp. 15, 26)

* **14 October 2026 implementation**:
  - Admin access is separate from the buyer/seller business role. `ADMIN_EMAILS` is backend-only; public registration accepts only buyer/seller roles and cannot set `isAdmin`.
  - Successful sign-in provisions `isAdmin` for an allowlisted existing account. Admin APIs require both the stored flag and current allowlist membership, so removing an email blocks subsequent admin requests.
  - `/admin` navigation and page access are gated by `user.isAdmin`; server-side route authorization remains authoritative.
  - The admin API exposes operational queues/actions for KYC, support, consent-led insurance referrals, shipments, corporate requests, adviser appointments, RFQs, and listing visibility, with mutations recorded in `AdminAuditLog`.
  - KYC correction actions update individual document status and the seller-facing correction explanation. Insurance phone numbers are withheld without recorded consent, and handoff is rejected without consent.
  - Admin controls and audit history partially implement the guide's role-based-access/admin-control direction. This does not establish full multi-user team permissions, audit retention/export controls, privacy/legal compliance, or the other workflow requirements in the guide.

* **Deployment note**: The schema additions require Prisma Client generation and a database schema deployment before the admin API can run against an existing database. The database push is an operator action and is not performed by this audit.

### 8.3 Safety, Evaluation & 30-Day Rollout Roadmap (p. 35)

* **Codebase Implementation Audit**:
  - The `/market-analyzer` page has a fraud-alert section, but its copy states that risk-alert data is unavailable from a connected source; no risk-analysis implementation was found.
  - 30-Day Supplier Rollout Roadmap on `/sell` page.

* **Remaining Gaps**:
  - Rollout roadmap on `/sell` is static UI — not driven by user's actual onboarding progress.

---

## 9. Prisma Database Schema Audit & Blueprint Diff

### Active Models (confirmed by route usage)

| Model | Status | Used By |
| :--- | :---: | :--- |
| `User` | ✅ Active | Core auth + profile |
| `Listing` | ✅ Active | All platform routes |
| `RFQ` | ✅ Active | `quotes.ts`, platform B/C/E |
| `Quote` | ✅ Active | `quotes.ts` |
| `ChatMessage` | ✅ Active | `chat.ts` + platform activity |
| `MarketPrice` | ✅ Active | `marketDataService.ts` |
| `LogisticsBooking` | ✅ Active | Shipment timestamps, exception, freight and document fields |
| `BuyerConsentLog` | ✅ Active | `buyerPreferences.ts` |
| `SupportTicket` | ✅ Active | `buyerPreferences.ts` |
| `BusinessDocument` | ✅ Active | `operations.ts` |
| `InventoryItem` | ✅ Active | `operations.ts` |
| `HealthInsuranceLead` | ✅ Active | `insurance.ts` |
| `CorporateRequest` | ✅ Active | Corporate services |
| `AdminAuditLog` | ✅ Active | Admin mutation audit history |
| `TransportQuote` | Schema present; route not using it | Transport endpoint returns constants; no quote CRUD use was found |
| `PackagingOption` | Schema present; route not using it | Packaging endpoint returns constants; no catalog query or administration flow was found |

### Logistics and operations schema status (checked 14 October 2026)

| Capability/model | Current schema representation | Remaining note |
| :--- | :--- | :--- |
| Shipment control tower | `LogisticsBooking` includes lifecycle timestamps, exception note, freight fields, and document URLs. | No separate `Shipment` model is required by the current route implementation. |
| Transport quotes | `TransportQuote` exists and is user-scoped. | No route reads or writes this model; `/transport-quotes` returns a hard-coded provider array. |
| Packaging catalog | `PackagingOption` exists with active/name/category/description fields. | No route reads or writes this model; `/packaging-requirements` returns a hard-coded sample array. The schema also lacks supplier, MOQ, lead-time, and unit-price fields shown in the old proposed model. |
| Admin authorization/history | `User.isAdmin`, `Listing.isPublished`, and `AdminAuditLog` exist in `schema.prisma`. | Existing deployments need the schema synchronized before using these fields/tables. |

The former “User fields must be added” list mixed fields from different models and outdated names. In the current schema, `subscriptionTier` (not `tier`), `aiLookupsUsed` and `aiLookupsResetAt` are on `User`; `productGroupsCount` and `matchScore` are on `Listing`; `employeeCount` is an integer. There is no `aiLookupsLimit` or `listingsCount` column on `User`. The schema's presence does not prove the deployed database is synchronized.

---

## 10. Frontend Routing & Dead-Link Audit

| Link in UI | Source Component | Target URL | Existing Page? | Required Resolution |
| :--- | :---: | :---: | :---: | :--- |
| Link label | Source | Current target | Route file exists? | Notes |
| :--- | :--- | :--- | :---: | :--- |
| All categories | `Footer.tsx` | `/` | Yes | Goes to landing page; no dedicated `/categories` page. |
| Verified sellers | `Footer.tsx` | `/platform-a` | Yes | Supplier discovery; does not guarantee every seller is verified. |
| Track an order | `Footer.tsx` | `/logistics` | Yes | Shipment data still depends on account records and integration gaps above. |
| Market prices | `Footer.tsx` | `/market-prices` | Yes | Existing route. |
| Shipment records | `Footer.tsx` | `/logistics` | Yes | Existing route. |
| Price benchmark | `Footer.tsx` | `/market-analyzer` | Yes | Existing route. |
| Landed cost | `Footer.tsx` | `/market-prices` | Yes | Route exists, but a dedicated landed-cost calculator was not found. |
| Demand insights | `Footer.tsx` | `/market-analyzer` | Yes | Existing route. |
| Customer Workspace | Header navigation | `/customer-workspace` | Yes | Existing route. |
| Help & Support | `Footer.tsx` | `/help` | Yes | Help page exists; this does not establish a full grievance workflow. |
| Service Points | Header modal | Modal trigger | N/A | Client-side modal. |

The eight destinations previously recorded as broken no longer target missing route paths (8/8 mapped to existing routes). This is a source-path check, not an interactive browser test; several links are broad substitutes rather than dedicated features.

---

## 11. Previously Reported Data Cleanup — Current Source Check

> This section replaces the earlier removal log, whose “fix applied” column overstated what the current source establishes. The findings below describe checked-in implementation, not production data quality or deployed behavior.

| Area | Current source finding |
| :--- | :--- |
| Insurance (`insurance.ts`) | Plan comparisons are hard-coded illustrative records. Consented referral leads are persisted and user-scoped; insurer/broker dispatch and callback completion are not evidenced. |
| Transport and packaging (`businessServices.ts`) | `/transport-quotes` and `/packaging-requirements` return hard-coded sample arrays, even though related Prisma models exist. |
| Shipments and KYC (`businessServices.ts`) | Shipment tower reads authenticated, user-scoped booking records. KYC default/sample constants remain in source; their presence alone does not establish that they are returned by the active routes. |
| Platform activity (`platformA.ts`) | Message timestamps are fetched for the recent seven-day period and grouped by UTC weekday in application code; this is not a SQL window query. |
| Platform D (`platformD.ts`, `marketDataService.ts`) | `fetchTradeIntelligence()` exists and delegates to the industrial market analyzer plus database counts. A trade-manifest feed, shipment history, or Gemini synthesis is not evidenced. |
| Market analyzer and prices (`marketDataService.ts`) | Yahoo Finance and Frankfurter data are inputs, but product price ranges are multiplier-based estimates; 30-day/year history is synthesized, and fixed source labels/timestamps and template “AI” text are not verified feeds. |
| Buyer consent (`buyerPreferences.ts`, customer-workspace page) | The API persists records, but the mounted modal lacks RFQ/supplier props and sends field names that do not match the API. Selected consent is therefore not persisted as intended. |
| Lead sharing (`BuyerLeadSharingWhatsapp.tsx`, `featureExpansion.ts`) | Component is not mounted; request fields do not match the API. The API only returns a WhatsApp URL and does not check consent or persist delivery. |
| Search tools (`SearchToolsModal.tsx`) | Voice input uses the browser Speech API. The UI calls barcode and visual-search endpoints for which no backend handlers are registered; HSN examples have no lookup provider. |
| Operations (`operations.ts`, operations page) | Document and inventory APIs exist. The Day Book remains a UI placeholder without an API handler; the operations PDF button has no click handler. Route comments incorrectly list Day Book as available. |
| Subscription (`subscription.ts`, `schema.prisma`) | Usage is surfaced in the UI, but monthly quota enforcement was not found. The subscription route changes the authenticated user's tier without payment-provider verification. |
| Footer routes (`Footer.tsx`) | The previously flagged destinations now resolve to existing routes, but some are broad substitutes rather than dedicated feature pages (Section 10). |
| Support and notifications (`SupportDeskModal.tsx`, `buyerPreferences.ts`, `Header.tsx`) | Ticket rows persist, but the form sends `description` and `attachment` while the API reads `details` and ignores the attachment; header notifications are local state. Help text advertises email/SMS and response SLAs not established by the implementation. |
| KYC storage and identity export | Registration upload controls only set local booleans; re-upload stores metadata, not bytes. Digital ID email action reports success locally without sending email. |

---

## 12. Current Implementation Roadmap

This is a source-grounded sequence, not a delivery estimate or a claim that any work is complete. Resolve the release-safety and data-integrity gaps first. Items that depend on providers or product decisions are explicitly gated and should not be treated as committed scope until those decisions are made.

### Phase 0 — Release safety and persistence correctness

1. **Enforce subscription entitlements.** Do not let a client request alone grant a paid tier. Define trusted entitlement verification (for example, an approved billing provider or an audited operator workflow); enforce tier access and lookup quotas on the server, including reset rules. If no trusted source is available, disable self-service tier upgrades rather than returning a success-shaped entitlement change.
   - **Done when:** unauthorized tier changes are rejected; tier and quota rules are tested at the API boundary; upgrade, downgrade, reset, and failure behavior are documented.
2. **Repair buyer-consent persistence and retrieval.** Supply the required RFQ/seller context, align request fields with the API, and define how consent is read and updated for a specific seller/RFQ. Do not initiate lead sharing unless the required seller-specific consent is present.
   - **Done when:** a buyer can save, retrieve, change, and withdraw the intended preferences; persisted values match the choices shown in the UI; missing or withdrawn consent blocks sharing.
3. **Repair support-ticket submission.** Align the form and API contract so ticket details are not silently empty. Decide whether attachments are supported; either implement authorized file upload and persist a usable reference, or remove the attachment affordance. Make assignee and SLA behavior explicit and ensure displayed promises match actual handling.
   - **Done when:** submitted details are persisted and visible to the support/admin workflow; attachment behavior is truthful and tested; defaults and user-facing SLA copy agree.
4. **Verify deployment prerequisites.** Compare the deployed database and generated Prisma Client with the checked-in schema using the approved deployment procedure; this audit did not perform a database push.
   - **Done when:** the deployment is confirmed compatible, with migration/generation output reviewed and a rollback/recovery path identified.

### Phase 1 — Production data and trust signals

1. **Review sensitive-document handling.** Establish where KYC files and product/factory images are actually stored, who can access them, and how access, retention, and deletion are controlled. Registration currently records local upload state, and the re-upload endpoint stores metadata rather than file bytes.
   - **Done when:** upload, storage, authorization, retention, and deletion behavior are implemented and verified; UI claims describe that behavior accurately.
2. **Correct market-data representation.** Either use a documented provider for product-level prices and historical series or clearly present the current multiplier-derived values and synthetic history as illustrative estimates. Remove unsupported live/verified-source and AI-analysis claims.
   - **Done when:** every displayed value has an accurate source, timestamp, and methodology label, or is unmistakably marked illustrative; unavailable data is not presented as a live quote.
3. **Reconcile help and feature copy.** Review notifications, encryption scope, insurance callback timing, support response targets, dispute mediation, and export claims against implemented workflows.
   - **Done when:** each promise is backed by a working workflow and owner, or is revised/removed; encrypted messaging claims are scoped to the endpoint that actually encrypts messages.

### Phase 2 — Complete confirmed product workflows

Start each item only after product requirements, data ownership, access rules, and acceptance criteria are agreed:

1. **Consent-based lead sharing:** mount and connect the component, align its request with the API, and decide whether the product only generates a WhatsApp link or tracks a real dispatch. Do not describe link generation as message delivery.
2. **Insurance referrals:** decide whether the feature is informational or a provider referral. For referrals, select an approved provider/handoff and define observable callback status; otherwise keep the experience clearly informational and remove callback promises.
3. **Transport and packaging:** decide whether these are illustrative guides or operational quote/catalog workflows. For persisted workflows, use the existing schema where it fits (or make reviewed schema changes), enforce user/role access, and provide the relevant create/update lifecycle. Do not present hard-coded samples as live quotes.
4. **Barcode and visual search:** implement and validate the backend contracts called by `SearchToolsModal.tsx`, including provider/error behavior, or disable/remove the unsupported actions until a provider and supported inputs are defined.
5. **Operations Day Book and PDF export:** define the authoritative financial-entry source, permissions, date/amount semantics, and export contents before implementing either. The current Day Book is a placeholder, and the PDF button is not wired.
   - **Done when for each confirmed workflow:** the agreed user journey works end-to-end, invalid/unauthorized requests fail explicitly, persisted data is scoped correctly, and focused tests cover success and failure cases.

### Phase 3 — Conditional scope and product decisions

1. **Platform D trade data:** choose and integrate a verifiable source only if shipment/manifests or competitor trade flows are a confirmed product requirement. The current analyzer wrapper does not provide that feed. If not in scope, describe Platform D according to its implemented market-analysis and database-count inputs.
2. **Disputes and grievances:** determine the required support/dispute process with product and compliance stakeholders. A `/help` page alone does not establish a grievance workflow or legal compliance; implement a separate workflow only if required.
3. **Tier naming and packaging:** decide whether `BASIC`/`GROWTH`/`ENTERPRISE` should change to match customer-facing labels. If changed, plan and test the database enum/data migration before release.
4. **Remaining support, RFQ-progress, and seller-verification UX:** document the desired behavior and reuse existing admin assignment, priority, and status controls rather than duplicating them.


