"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  Building2,
  CalendarClock,
  Check,
  ClipboardList,
  FileCheck2,
  HelpCircle,
  LifeBuoy,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import type { CorporateServiceType, Listing, ListingCategory, RFQStatus, UserRole } from "@/types";

type SectionKey =
  | "overview"
  | "kyc"
  | "support"
  | "insurance"
  | "logistics"
  | "corporate"
  | "appointments"
  | "rfqs"
  | "listings"
  | "accounts"
  | "audit";

type KycDocumentRecord = {
  id?: string;
  requirement?: string;
  requestedItem?: string;
  fileName?: string;
  fileUrl?: string | null;
  status?: string;
  issueExplanation?: string;
};

type KycAccount = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  phone: string | null;
  gstNumber: string | null;
  kycStatus: string;
  kycDocuments: unknown;
  verifiedSeller: boolean;
  updatedAt: string;
};

type SupportTicket = {
  id: string;
  caseNumber: string;
  category: string;
  subject: string;
  details: string;
  priority: string;
  status: string;
  assignedAgent: string | null;
  nextUpdateSla: string;
  createdAt: string;
  user: { name: string; email: string; companyName: string | null };
};

type InsuranceLead = {
  id: string;
  coverageType: string;
  employeeCount: number;
  coverageSum: string;
  contactPhone: string;
  companyName: string | null;
  selectedPlan: string | null;
  consentGranted: boolean;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
};

type Shipment = {
  id: string;
  shipmentRef: string | null;
  serviceType: string;
  origin: string;
  destination: string;
  details: string;
  status: string;
  carrierName: string | null;
  transportMode: string | null;
  exceptionNote: string | null;
  quotedFreight: number | null;
  finalFreight: number | null;
  createdAt: string;
  user: { name: string; companyName: string | null };
};

type CorporateRequest = {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  serviceType: CorporateServiceType;
  entityType: string | null;
  details: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
};

type Appointment = {
  id: string;
  preferredDate: string;
  preferredTime: string;
  topic: string | null;
  status: string;
  createdAt: string;
  user: { name: string; email: string; phone: string | null; companyName: string | null };
};

type AdminRfq = {
  id: string;
  title: string;
  category: ListingCategory;
  quantity: string;
  targetPrice: number;
  details: string;
  status: RFQStatus;
  createdAt: string;
  buyer: { name: string; email: string; companyName: string | null };
  _count: { quotes: number };
};

type AdminListing = Listing & {
  seller: { companyName: string | null; verifiedSeller: boolean };
};

type Account = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
  companyName: string | null;
  subscriptionTier: string;
  verifiedSeller: boolean;
  kycStatus: string;
  createdAt: string;
};

type AuditLog = {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: unknown;
  createdAt: string;
};

type AdminSummary = {
  users: number;
  buyers: number;
  sellers: number;
  verifiedSellers: number;
  listings: number;
  publishedListings: number;
  unpublishedListings: number;
  rfqs: number;
  openRfqs: number;
  pendingKyc: number;
  openTickets: number;
  insuranceFollowUps: number;
  activeShipments: number;
  shipmentExceptions: number;
  openCorporateRequests: number;
  pendingAppointments: number;
};

type AdminQueues = {
  listings: AdminListing[];
  kyc: KycAccount[];
  tickets: SupportTicket[];
  insurance: InsuranceLead[];
  shipments: Shipment[];
  corporateRequests: CorporateRequest[];
  appointments: Appointment[];
  rfqs: AdminRfq[];
  accounts: Account[];
  auditLogs: AuditLog[];
};

type AdminOverview = {
  summary: AdminSummary;
  queues: AdminQueues;
};

const sections: Array<{ id: SectionKey; label: string; icon: typeof Activity; badge?: keyof AdminSummary }> = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "kyc", label: "Seller KYC", icon: FileCheck2, badge: "pendingKyc" },
  { id: "support", label: "Support & disputes", icon: LifeBuoy, badge: "openTickets" },
  { id: "insurance", label: "Insurance referrals", icon: ShieldCheck, badge: "insuranceFollowUps" },
  { id: "logistics", label: "Logistics", icon: Truck, badge: "shipmentExceptions" },
  { id: "corporate", label: "Corporate requests", icon: Building2, badge: "openCorporateRequests" },
  { id: "appointments", label: "Adviser appointments", icon: CalendarClock, badge: "pendingAppointments" },
  { id: "rfqs", label: "RFQs & escalations", icon: ClipboardList, badge: "openRfqs" },
  { id: "listings", label: "Listing moderation", icon: PackageCheck, badge: "unpublishedListings" },
  { id: "accounts", label: "Accounts", icon: Users },
  { id: "audit", label: "Admin activity", icon: BadgeCheck },
];

const categoryLabels: Record<ListingCategory, string> = {
  RAW_MATERIALS: "Raw materials",
  MACHINERY: "Machinery",
  SPARES: "Spares",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number | null) {
  return value === null ? "—" : `₹${value.toLocaleString("en-IN")}`;
}

function getDocuments(value: unknown): KycDocumentRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (document): document is KycDocumentRecord =>
      typeof document === "object" && document !== null && !Array.isArray(document),
  );
}

function safeDocumentUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  if (/^https:\/\//i.test(value)) return value;
  return null;
}

function StatusPill({ children }: { children: string }) {
  const normalized = children.toUpperCase();
  const color = ["VERIFIED", "RESOLVED", "COMPLETED", "DELIVERED", "CONFIRMED", "CONTACTED"].includes(normalized)
    ? "bg-emerald-50 text-emerald-700"
    : ["REJECTED", "URGENT", "CANCELLED"].includes(normalized)
      ? "bg-red-50 text-red-700"
      : ["UNDER_REVIEW", "IN_TRANSIT", "IN_NEGOTIATION", "HANDED_OFF", "HIGH"].includes(normalized)
        ? "bg-amber-50 text-amber-800"
        : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${color}`}>{children.replaceAll("_", " ")}</span>;
}

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [access, setAccess] = useState<"checking" | "allowed" | "denied" | "error">("checking");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [search, setSearch] = useState("");

  const loadOverview = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else {
      setLoading(true);
      setAccess("checking");
    }
    setError("");

    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        setAccess("denied");
        setOverview(null);
        return;
      }
      if (!response.ok) throw new Error(`Admin data could not be loaded (${response.status}).`);

      const result = await response.json() as AdminOverview;
      if (!result.summary || !result.queues) throw new Error("The admin API returned an unexpected response.");
      setOverview(result);
      setAccess("allowed");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Admin data could not be loaded.");
      setAccess("error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const runAction = useCallback(async (
    key: string,
    path: string,
    payload: Record<string, unknown>,
  ) => {
    setSaving(key);
    setError("");
    try {
      const response = await fetch(`/api/admin/${path}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Action failed (${response.status}).`);
      await loadOverview(true);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The admin action could not be completed.");
    } finally {
      setSaving("");
    }
  }, [loadOverview]);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const listings = overview?.queues.listings ?? [];
    if (!query) return listings;
    return listings.filter((listing) =>
      [listing.title, listing.sellerName, listing.location, listing.category]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [overview?.queues.listings, search]);

  if (loading && access === "checking") {
    return (
      <main role="status" aria-live="polite" className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <div className="w-full animate-pulse space-y-4">
          <div className="h-32 rounded-3xl bg-line/50" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 rounded-2xl bg-line/40" />
            <div className="h-24 rounded-2xl bg-line/40" />
          </div>
          <span className="sr-only">Checking administrator access</span>
        </div>
      </main>
    );
  }

  if (access === "denied" || access === "error") {
    const unavailable = access === "error";
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-3xl border border-line bg-card p-8 text-center shadow-lg">
          <div className={`mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl ${unavailable ? "bg-amber-50 text-amber-700" : "bg-orange-50 text-accent"}`}>
            {unavailable ? <AlertTriangle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <h1 className="text-xl font-black text-ink">{unavailable ? "Admin workspace unavailable" : "Administrator access required"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {unavailable ? error : "This workspace is limited to administrator accounts. Sign in with an allowlisted administrator account to continue."}
          </p>
          {unavailable && (
            <button type="button" onClick={() => void loadOverview()} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white hover:bg-accent-2">
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          )}
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-line px-5 text-sm font-bold text-ink hover:bg-bg">
            Back to marketplace
          </Link>
        </section>
      </main>
    );
  }

  if (!overview) return null;
  const { summary, queues } = overview;

  return (
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 sm:py-8">
      <main className="mx-auto max-w-[1500px] space-y-6">
        <section className="relative overflow-hidden rounded-[28px] border border-line bg-card p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-32 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
                <Activity className="h-3.5 w-3.5 text-orange-400" /> Admin workspace
              </span>
              <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">Marketplace control room</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Review seller verification, support cases, insurance referrals, shipments, corporate requests, RFQs, and listing visibility. Sensitive queues are available only to allowlisted administrators.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/platform-a" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-bold text-ink hover:bg-bg">
                View marketplace <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button type="button" disabled={refreshing} onClick={() => void loadOverview(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-white hover:bg-accent-2 disabled:opacity-70">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> {refreshing ? "Refreshing" : "Refresh data"}
              </button>
            </div>
          </div>
          {error && <div role="alert" className="relative mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Admin workspace sections">
          {sections.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeSection === id}
              onClick={() => setActiveSection(id)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
                activeSection === id ? "bg-ink text-white" : "border border-line bg-card text-muted hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
              {badge && summary[badge] > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeSection === id ? "bg-white/15 text-white" : "bg-orange-100 text-orange-800"}`}>{summary[badge]}</span>}
            </button>
          ))}
        </div>

        {activeSection === "overview" && (
          <OverviewPanel summary={summary} queues={queues} onSelect={setActiveSection} />
        )}
        {activeSection === "kyc" && (
          <QueuePanel title="Seller verification review" description="Review business identity, KYC status, and submitted document records. Status decisions are audited." count={summary.pendingKyc}>
            {queues.kyc.map((account) => {
              const documents = getDocuments(account.kycDocuments);
              return (
                <RecordCard key={account.id} title={account.companyName || account.name} subtitle={`${account.name} · ${account.email}`} meta={`GSTIN ${account.gstNumber || "not provided"} · Updated ${formatDate(account.updatedAt)}`} status={account.kycStatus}>
                  <div className="space-y-2">
                    {documents.length === 0 && <p className="text-xs text-muted">No KYC document metadata has been submitted.</p>}
                    {documents.map((document, index) => {
                      const url = safeDocumentUrl(document.fileUrl);
                      return (
                        <div key={document.id || index} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bg px-3 py-2 text-xs">
                          <span>
                            <span className="block font-semibold text-ink">{document.requirement || document.requestedItem || document.fileName || `Document ${index + 1}`}</span>
                            <span className="mt-1 block text-muted">{document.status || "Status unavailable"}{document.issueExplanation ? ` · ${document.issueExplanation}` : ""}</span>
                          </span>
                          <span className="flex flex-wrap items-center gap-2">
                            {url && <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:underline">Open</a>}
                            {document.id && document.status !== "Received" && (
                              <ActionButton
                                disabled={saving === account.id}
                                variant="success"
                                onClick={() => void runAction(account.id, `kyc/${account.id}`, { documentId: document.id, documentStatus: "RECEIVED" })}
                              >
                                Mark reviewed
                              </ActionButton>
                            )}
                            {document.id && document.status !== "Needs review" && (
                              <ActionButton
                                disabled={saving === account.id}
                                variant="danger"
                                onClick={() => void runAction(account.id, `kyc/${account.id}`, {
                                  documentId: document.id,
                                  documentStatus: "NEEDS_REVIEW",
                                  reason: "Please upload a clear, complete copy so our team can verify this document.",
                                })}
                              >
                                Request correction
                              </ActionButton>
                            )}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <ActionButton disabled={saving === account.id} onClick={() => void runAction(account.id, `kyc/${account.id}`, { status: "UNDER_REVIEW" })}>Start review</ActionButton>
                      <ActionButton variant="success" disabled={saving === account.id} onClick={() => void runAction(account.id, `kyc/${account.id}`, { status: "VERIFIED" })}>Verify seller</ActionButton>
                    </div>
                  </div>
                </RecordCard>
              );
            })}
            {queues.kyc.length === 0 && <EmptyState text="No sellers are currently awaiting verification." />}
          </QueuePanel>
        )}
        {activeSection === "support" && (
          <QueuePanel title="Support & dispute tickets" description="Triage open support cases, set priority, and record assignment and resolution status." count={summary.openTickets}>
            {queues.tickets.map((ticket) => (
              <RecordCard key={ticket.id} title={`${ticket.caseNumber} · ${ticket.subject}`} subtitle={`${ticket.user.companyName || ticket.user.name} · ${ticket.user.email}`} meta={`${ticket.category} · ${ticket.nextUpdateSla} · ${formatDate(ticket.createdAt)}`} status={ticket.status}>
                <p className="mb-3 whitespace-pre-wrap text-xs leading-relaxed text-body">{ticket.details || "No additional details provided."}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-[11px] font-semibold text-muted">Priority
                    <select value={ticket.priority} disabled={saving === ticket.id} onChange={(event) => void runAction(ticket.id, `tickets/${ticket.id}`, { priority: event.target.value })} className="ml-2 rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-ink">
                      {["LOW", "MEDIUM", "HIGH", "URGENT"].map((value) => <option key={value}>{value}</option>)}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-muted">Status
                    <select value={ticket.status} disabled={saving === ticket.id} onChange={(event) => void runAction(ticket.id, `tickets/${ticket.id}`, { status: event.target.value })} className="ml-2 rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-ink">
                      {["OPEN", "WAITING_ON_REPLY", "RESOLVED", "CLOSED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-muted">Assigned to
                    <input
                      key={`${ticket.id}-${ticket.assignedAgent || ""}`}
                      defaultValue={ticket.assignedAgent || ""}
                      placeholder="Support agent"
                      maxLength={120}
                      disabled={saving === ticket.id}
                      onBlur={(event) => {
                        const assignedAgent = event.currentTarget.value.trim() || null;
                        if (assignedAgent !== ticket.assignedAgent) {
                          void runAction(ticket.id, `tickets/${ticket.id}`, { assignedAgent });
                        }
                      }}
                      className="ml-2 w-36 rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-ink"
                    />
                  </label>
                </div>
              </RecordCard>
            ))}
            {queues.tickets.length === 0 && <EmptyState text="No open support tickets." />}
          </QueuePanel>
        )}
        {activeSection === "insurance" && (
          <QueuePanel title="Insurance referral follow-up" description="Handle consented referral handoffs and callback follow-up only. This is not an insurance underwriting or claims workbench." count={summary.insuranceFollowUps}>
            {queues.insurance.map((lead) => (
              <RecordCard key={lead.id} title={lead.companyName || lead.user.name} subtitle={`${lead.user.name} · ${lead.user.email}`} meta={`${lead.coverageType.replaceAll("_", " ")} · ${lead.employeeCount} employees · ${lead.coverageSum} · ${formatDate(lead.createdAt)}`} status={lead.status}>
                <div className="flex flex-wrap items-center gap-3 text-xs text-body">
                  <span>Callback: {lead.consentGranted && lead.contactPhone ? <a className="font-bold text-accent" href={`tel:${encodeURIComponent(lead.contactPhone)}`}>{lead.contactPhone}</a> : "Unavailable without consent"}</span>
                  <span>Plan: {lead.selectedPlan || "Custom / not specified"}</span>
                  <span className={lead.consentGranted ? "text-emerald-700" : "text-red-700"}>{lead.consentGranted ? "Consent recorded" : "Consent missing — do not hand off"}</span>
                </div>
                <label className="mt-3 inline-flex items-center text-[11px] font-semibold text-muted">Referral status
                  <select value={lead.status} disabled={saving === lead.id} onChange={(event) => void runAction(lead.id, `insurance-leads/${lead.id}`, { status: event.target.value })} className="ml-2 rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-ink">
                    {["REQUESTED", "HANDED_OFF", "CONTACTED", "CLOSED"].filter((value) => value !== "HANDED_OFF" || lead.consentGranted || lead.status === value).map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                  </select>
                </label>
              </RecordCard>
            ))}
            {queues.insurance.length === 0 && <EmptyState text="No insurance referrals need follow-up." />}
          </QueuePanel>
        )}
        {activeSection === "logistics" && (
          <QueuePanel title="Shipment control tower exceptions" description="Track active shipments, record or clear operational exceptions, and update shipment status." count={summary.activeShipments}>
            {queues.shipments.map((shipment) => (
              <RecordCard key={shipment.id} title={`${shipment.shipmentRef || shipment.id.slice(0, 8).toUpperCase()} · ${shipment.origin} → ${shipment.destination}`} subtitle={`${shipment.user.companyName || shipment.user.name} · ${shipment.carrierName || shipment.transportMode || "Carrier not assigned"}`} meta={`${shipment.serviceType} · Quote ${formatCurrency(shipment.quotedFreight)} · Final ${formatCurrency(shipment.finalFreight)} · ${formatDate(shipment.createdAt)}`} status={shipment.status}>
                {shipment.details && <p className="mb-3 text-xs text-body">{shipment.details}</p>}
                <p className={`mb-3 text-xs ${shipment.exceptionNote ? "font-semibold text-amber-800" : "text-muted"}`}>Exception: {shipment.exceptionNote || "None recorded"}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-[11px] font-semibold text-muted">Status
                    <select value={shipment.status} disabled={saving === shipment.id} onChange={(event) => void runAction(shipment.id, `shipments/${shipment.id}`, { status: event.target.value })} className="ml-2 rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-ink">
                      {["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                    </select>
                  </label>
                  <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const formData = new FormData(event.currentTarget);
                      const note = String(formData.get("exceptionNote") || "").trim();
                      void runAction(shipment.id, `shipments/${shipment.id}`, { exceptionNote: note || null });
                    }}
                  >
                    <label className="sr-only" htmlFor={`shipment-exception-${shipment.id}`}>Shipment exception note</label>
                    <input
                      id={`shipment-exception-${shipment.id}`}
                      name="exceptionNote"
                      defaultValue={shipment.exceptionNote || ""}
                      placeholder="Add or update exception note"
                      maxLength={1000}
                      disabled={saving === shipment.id}
                      className="min-w-56 rounded-lg border border-line bg-card px-3 py-2 text-xs text-ink"
                    />
                    <button
                      type="submit"
                      disabled={saving === shipment.id}
                      className="rounded-lg border border-line px-3 py-2 text-xs font-bold text-ink hover:bg-bg disabled:opacity-50"
                    >
                      Save note
                    </button>
                  </form>
                </div>
              </RecordCard>
            ))}
            {queues.shipments.length === 0 && <EmptyState text="No active shipments or unresolved exceptions." />}
          </QueuePanel>
        )}
        {activeSection === "corporate" && (
          <QueuePanel title="Corporate services requests" description="Track persisted trademark and business-registration consultations through their service lifecycle." count={summary.openCorporateRequests}>
            {queues.corporateRequests.map((request) => (
              <RecordCard key={request.id} title={request.companyName} subtitle={`${request.user.name} · ${request.user.email} · ${request.user.phone || "No phone provided"}`} meta={`${request.serviceType.replaceAll("_", " ")} · ${request.entityType || "Entity not specified"} · ${formatDate(request.createdAt)}`} status={request.status}>
                <p className="mb-3 text-xs text-body">{request.details || "No additional details."}</p>
                <label className="text-[11px] font-semibold text-muted">Request status
                  <select value={request.status} disabled={saving === request.id} onChange={(event) => void runAction(request.id, `corporate-requests/${request.id}`, { status: event.target.value })} className="ml-2 rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-ink">
                    {["SUBMITTED", "UNDER_REVIEW", "PROCESSING", "COMPLETED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                  </select>
                </label>
              </RecordCard>
            ))}
            {queues.corporateRequests.length === 0 && <EmptyState text="No active corporate-service requests." />}
          </QueuePanel>
        )}
        {activeSection === "appointments" && (
          <QueuePanel title="Business adviser appointments" description="Review scheduling requests and update the appointment status." count={summary.pendingAppointments}>
            {queues.appointments.map((appointment) => (
              <RecordCard key={appointment.id} title={`${appointment.user.companyName || appointment.user.name} · ${appointment.topic || "Business advisory"}`} subtitle={`${appointment.user.name} · ${appointment.user.email} · ${appointment.user.phone || "No phone provided"}`} meta={`${new Date(appointment.preferredDate).toLocaleDateString("en-IN")} at ${appointment.preferredTime}`} status={appointment.status}>
                <label className="text-[11px] font-semibold text-muted">Appointment status
                  <select value={appointment.status} disabled={saving === appointment.id} onChange={(event) => void runAction(appointment.id, `appointments/${appointment.id}`, { status: event.target.value })} className="ml-2 rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-ink">
                    {["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
              </RecordCard>
            ))}
            {queues.appointments.length === 0 && <EmptyState text="No upcoming adviser appointments." />}
          </QueuePanel>
        )}
        {activeSection === "rfqs" && (
          <QueuePanel title="Open RFQs & escalation context" description="Monitor buyer requirements, quote activity, and statuses. Closing or cancelling an RFQ is recorded in the admin audit log." count={summary.openRfqs}>
            {queues.rfqs.map((rfq) => (
              <RecordCard key={rfq.id} title={rfq.title} subtitle={`${rfq.buyer.companyName || rfq.buyer.name} · ${rfq.buyer.email}`} meta={`${categoryLabels[rfq.category]} · ${rfq.quantity} · Target ${formatCurrency(rfq.targetPrice)} · ${rfq._count.quotes} quotes · ${formatDate(rfq.createdAt)}`} status={rfq.status}>
                <p className="mb-3 whitespace-pre-wrap text-xs leading-relaxed text-body">{rfq.details}</p>
                <label className="text-[11px] font-semibold text-muted">RFQ status
                  <select value={rfq.status} disabled={saving === rfq.id} onChange={(event) => void runAction(rfq.id, `rfqs/${rfq.id}`, { status: event.target.value })} className="ml-2 rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-ink">
                    {["OPEN", "IN_NEGOTIATION", "COMPLETED", "CANCELLED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                  </select>
                </label>
              </RecordCard>
            ))}
            {queues.rfqs.length === 0 && <EmptyState text="No open RFQs." />}
          </QueuePanel>
        )}
        {activeSection === "listings" && (
          <QueuePanel title="Marketplace listing moderation" description="Unpublishing hides a listing from marketplace discovery and chat listing context; it does not delete the seller's record." count={summary.unpublishedListings}>
            <label className="relative mb-4 block max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <span className="sr-only">Search listings</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, seller, location" className="h-10 w-full rounded-xl border border-line bg-bg pl-9 pr-3 text-xs text-ink outline-none focus:border-accent" />
            </label>
            {filteredListings.map((listing) => (
              <RecordCard key={listing.id} title={listing.title} subtitle={`${listing.seller.companyName || listing.sellerName} · ${listing.seller.verifiedSeller ? "Verified seller" : "Not verified"}`} meta={`${categoryLabels[listing.category]} · ${listing.location} · ${formatCurrency(listing.price)} / ${listing.unit} · ${formatDate(listing.createdAt)}`} status={listing.isPublished ? "PUBLISHED" : "UNPUBLISHED"}>
                <div className="flex items-center justify-between gap-3">
                  <p className="line-clamp-2 text-xs text-body">{listing.description}</p>
                  <ActionButton variant={listing.isPublished ? "danger" : "success"} disabled={saving === listing.id} onClick={() => void runAction(listing.id, `listings/${listing.id}`, { isPublished: !listing.isPublished })}>
                    {listing.isPublished ? "Unpublish" : "Publish"}
                  </ActionButton>
                </div>
              </RecordCard>
            ))}
            {filteredListings.length === 0 && <EmptyState text={queues.listings.length ? "No listings match your search." : "No marketplace listings found."} />}
            {queues.listings.length >= 50 && <p className="pt-2 text-center text-[11px] text-muted">Showing the latest 50 listings. Use search to filter this set.</p>}
          </QueuePanel>
        )}
        {activeSection === "accounts" && (
          <QueuePanel title="Recent platform accounts" description="Account overview for support context. Account suspension and subscription changes are not enabled here." count={summary.users}>
            {queues.accounts.map((account) => (
              <RecordCard key={account.id} title={account.companyName || account.name} subtitle={`${account.name} · ${account.email}`} meta={`${account.role} · ${account.subscriptionTier} plan · Joined ${formatDate(account.createdAt)}`} status={account.role === "SELLER" ? account.kycStatus : "ACCOUNT"}>
                <div className="flex flex-wrap gap-3 text-xs text-muted">
                  {account.role === "SELLER" && <span>{account.verifiedSeller ? "Verified seller" : "Verification pending"}</span>}
                  {account.isAdmin && <span className="font-bold text-orange-700">Admin allowlisted</span>}
                </div>
              </RecordCard>
            ))}
            {queues.accounts.length === 0 && <EmptyState text="No accounts found." />}
          </QueuePanel>
        )}
        {activeSection === "audit" && (
          <QueuePanel title="Administrator activity log" description="Each supported status and listing visibility change is recorded with the actor, target, action, and changed fields." count={queues.auditLogs.length}>
            {queues.auditLogs.map((entry) => (
              <RecordCard key={entry.id} title={entry.action.replaceAll("_", " ")} subtitle={`${entry.targetType} · ${entry.targetId}`} meta={`Admin ${entry.adminId} · ${formatDate(entry.createdAt)}`}>
                <pre className="overflow-x-auto rounded-lg bg-bg p-3 text-[10px] text-body">{JSON.stringify(entry.details, null, 2)}</pre>
              </RecordCard>
            ))}
            {queues.auditLogs.length === 0 && <EmptyState text="No administrator actions have been recorded yet." />}
          </QueuePanel>
        )}
      </main>
    </div>
  );
}

function OverviewPanel({ summary, queues, onSelect }: { summary: AdminSummary; queues: AdminQueues; onSelect: (section: SectionKey) => void }) {
  const metrics: Array<{ label: string; value: number; note: string; icon: typeof Activity }> = [
    { label: "Platform accounts", value: summary.users, note: `${summary.buyers} buyers · ${summary.sellers} sellers`, icon: Users },
    { label: "Published listings", value: summary.publishedListings, note: `${summary.unpublishedListings} unpublished · ${summary.listings} total`, icon: PackageCheck },
    { label: "Seller verification", value: summary.pendingKyc, note: `${summary.verifiedSellers} verified sellers`, icon: FileCheck2 },
    { label: "Open support cases", value: summary.openTickets, note: "Tickets awaiting staff follow-up", icon: LifeBuoy },
    { label: "Insurance follow-ups", value: summary.insuranceFollowUps, note: "Consent-led referral queue", icon: ShieldCheck },
    { label: "Active shipments", value: summary.activeShipments, note: `${summary.shipmentExceptions} with exceptions`, icon: Truck },
    { label: "Open RFQs", value: summary.openRfqs, note: `${summary.rfqs} total RFQs`, icon: ClipboardList },
    { label: "Corporate / adviser", value: summary.openCorporateRequests + summary.pendingAppointments, note: `${summary.openCorporateRequests} requests · ${summary.pendingAppointments} appointments`, icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <section aria-label="Admin operations metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-2 text-3xl font-black text-ink">{value.toLocaleString("en-IN")}</p></div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-accent"><Icon className="h-5 w-5" /></span>
            </div>
            <p className="mt-3 text-[11px] text-muted">{note}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-extrabold text-ink">Needs attention</h2><p className="mt-1 text-xs text-muted">Jump into queues with outstanding work.</p></div><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
          <div className="space-y-2">
            {([
              ["kyc", "Seller verification", summary.pendingKyc],
              ["support", "Support & dispute tickets", summary.openTickets],
              ["insurance", "Insurance referrals", summary.insuranceFollowUps],
              ["logistics", "Shipment exceptions", summary.shipmentExceptions],
              ["corporate", "Corporate service requests", summary.openCorporateRequests],
              ["appointments", "Adviser appointments", summary.pendingAppointments],
            ] as Array<[SectionKey, string, number]>).map(([section, label, count]) => (
              <button key={section} type="button" onClick={() => onSelect(section)} className="flex w-full items-center justify-between rounded-xl border border-line px-3 py-2.5 text-left transition hover:bg-bg">
                <span className="text-xs font-semibold text-ink">{label}</span><span className="flex items-center gap-2 text-xs font-extrabold text-accent">{count}<ArrowUpRight className="h-3.5 w-3.5" /></span>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-extrabold text-ink">Recent marketplace listings</h2><p className="mt-1 text-xs text-muted">Newest entries from the moderated catalog.</p></div><PackageCheck className="h-5 w-5 text-accent" /></div>
          <div className="space-y-3">
            {queues.listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                <div className="min-w-0"><p className="truncate text-xs font-bold text-ink">{listing.title}</p><p className="mt-1 truncate text-[10px] text-muted">{listing.sellerName} · {formatDate(listing.createdAt)}</p></div>
                <StatusPill>{listing.isPublished ? "PUBLISHED" : "UNPUBLISHED"}</StatusPill>
              </div>
            ))}
            {queues.listings.length === 0 && <p className="text-xs text-muted">No listings available.</p>}
            <button type="button" onClick={() => onSelect("listings")} className="pt-1 text-xs font-bold text-accent hover:underline">Open listing moderation →</button>
          </div>
        </div>
      </section>
      <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-900">
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Referral contact details and KYC documents are visible only inside the authenticated admin API. Insurance referrals are consent-based; do not use this area for underwriting or medical data.</p>
      </div>
    </div>
  );
}

function QueuePanel({ title, description, count, children }: { title: string; description: string; count: number; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-lg font-extrabold text-ink">{title}</h2><p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted">{description}</p></div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-orange-800">{count} open</span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RecordCard({ title, subtitle, meta, status, children }: { title: string; subtitle: string; meta: string; status?: string; children?: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-line bg-card p-4 transition hover:border-line-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-extrabold text-ink">{title}</h3>
          <p className="mt-1 break-all text-xs text-body">{subtitle}</p>
          <p className="mt-1 text-[10px] text-muted">{meta}</p>
        </div>
        {status && <StatusPill>{status}</StatusPill>}
      </div>
      {children && <div className="mt-3 border-t border-line pt-3">{children}</div>}
    </article>
  );
}

function ActionButton({ children, onClick, disabled, variant = "neutral" }: { children: React.ReactNode; onClick: () => void; disabled: boolean; variant?: "neutral" | "success" | "danger" }) {
  const style = variant === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
    : variant === "danger"
      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      : "border-line bg-card text-ink hover:bg-bg";
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-lg border px-3 py-2 text-[11px] font-bold transition disabled:cursor-wait disabled:opacity-60 ${style}`}>{disabled ? "Saving…" : children}</button>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center"><HelpCircle className="mx-auto h-6 w-6 text-muted/60" /><p className="mt-2 text-xs text-muted">{text}</p></div>;
}
