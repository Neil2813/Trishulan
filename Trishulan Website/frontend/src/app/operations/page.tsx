"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Package,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Download,
  CreditCard,
  BarChart3,
  BookOpen,
  Layers,
  Search,
} from "lucide-react";


// ─── Types ───────────────────────────────────────────────────────────────────
type DocType =
  | "ESTIMATE"
  | "QUOTATION"
  | "PROFORMA_INVOICE"
  | "SALES_ORDER"
  | "DELIVERY_CHALLAN"
  | "TAX_INVOICE";

type Tab = "documents" | "inventory" | "daybook" | "summary";

interface DocItem {
  id: string;
  docNumber: string;
  docType: DocType;
  partyName: string;
  partyGstin?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  dueDate?: string;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  skuCode: string;
  itemName: string;
  category: string;
  hsnCode?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  reorderPoint: number;
  createdAt: string;
}

// ─── Helper functions ─────────────────────────────────────────────────────────
const DOC_LABELS: Record<DocType, string> = {
  ESTIMATE: "Estimate",
  QUOTATION: "Quotation",
  PROFORMA_INVOICE: "Pro-forma Invoice",
  SALES_ORDER: "Sales Order",
  DELIVERY_CHALLAN: "Delivery Challan",
  TAX_INVOICE: "Tax Invoice",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  ISSUED: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const CONVERSION_MAP: Record<DocType, DocType | null> = {
  ESTIMATE: "QUOTATION",
  QUOTATION: "SALES_ORDER",
  PROFORMA_INVOICE: "SALES_ORDER",
  SALES_ORDER: "DELIVERY_CHALLAN",
  DELIVERY_CHALLAN: "TAX_INVOICE",
  TAX_INVOICE: null,
};

function fmtCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Tab Components ───────────────────────────────────────────────────────────

function DocumentsTab() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [convertingId, setConvertingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/operations/documents")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load documents");
        const result = await response.json();
        setDocs(Array.isArray(result.documents) ? result.documents : []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter(
    (d) =>
      (filterType === "ALL" || d.docType === filterType) &&
      (d.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.docNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleConvert = async (doc: DocItem) => {
    const nextType = CONVERSION_MAP[doc.docType];
    if (!nextType) return;
    setConvertingId(doc.id);
    try {
      const response = await fetch(`/api/operations/documents/${encodeURIComponent(doc.id)}/convert`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Could not convert document");
      const result = await response.json();
      if (result.document) setDocs((prev) => [result.document, ...prev]);
    } catch {
      alert("Document conversion failed. Please try again.");
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-[#EA580C] text-ink"
            placeholder="Search by party name or doc number…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-ink outline-none focus:border-[#EA580C] bg-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          {Object.entries(DOC_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>


      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-[13px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Doc Number", "Type", "Party Name", "Total Amt", "Paid", "Status", "Due Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-[#475569] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">Loading documents…</td></tr>}
            {loadError && <tr><td colSpan={8} className="px-4 py-8 text-center text-red-600">Documents are temporarily unavailable.</td></tr>}
            {filtered.map((doc) => {
              const nextType = CONVERSION_MAP[doc.docType];
              const outstanding = doc.totalAmount - doc.paidAmount;
              return (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-ink">{doc.docNumber}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {DOC_LABELS[doc.docType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    <div>{doc.partyName}</div>
                    {doc.partyGstin && (
                      <div className="text-[10.5px] text-muted font-mono">{doc.partyGstin}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">{fmtCurrency(doc.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-emerald-700">{fmtCurrency(doc.paidAmount)}</div>
                    {outstanding > 0 && (
                      <div className="text-[10.5px] text-red-500">
                        {fmtCurrency(outstanding)} outstanding
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[doc.status] || "bg-gray-100 text-gray-600"}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{fmtDate(doc.dueDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-[11px] text-muted hover:text-ink flex items-center gap-1 border border-gray-200 px-2 py-1 rounded-lg">
                        <Download className="w-3 h-3" /> PDF
                      </button>
                      {nextType && (
                        <button
                          onClick={() => handleConvert(doc)}
                          disabled={convertingId === doc.id}
                          className="text-[11px] text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 border border-blue-200 px-2 py-1 rounded-lg"
                          title={`Convert to ${DOC_LABELS[nextType]}`}
                        >
                          <RefreshCw className="w-3 h-3" /> → {DOC_LABELS[nextType].split(" ")[0]}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && !loadError && filtered.length === 0 && (
          <div className="text-center py-10 text-muted text-[13px]">
            No documents found.
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState("");

  useEffect(() => {
    fetch("/api/operations/inventory")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load inventory");
        const result = await response.json();
        setItems(Array.isArray(result.items) ? result.items : []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(
    (i) =>
      i.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.skuCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockAdjust = async (id: string) => {
    const qty = parseFloat(adjustQty);
    if (!Number.isFinite(qty) || qty === 0) return;
    try {
      const response = await fetch(`/api/operations/inventory/${encodeURIComponent(id)}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustment: qty }),
      });
      if (!response.ok) throw new Error("Could not adjust stock");
      const result = await response.json();
      if (result.item) {
        setItems((prev) => prev.map((item) => item.id === id ? result.item : item));
      }
      setAdjustingId(null);
      setAdjustQty("");
    } catch {
      alert("Stock adjustment failed. Check the quantity and try again.");
    }
  };

  const totalValue = items.reduce((s, i) => s + i.currentStock * i.costPrice, 0);
  const lowStockItems = items.filter((i) => i.currentStock <= i.reorderPoint);

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Items", value: items.length, icon: <Package className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50" },
          { label: "Total Stock Value", value: fmtCurrency(totalValue), icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-50" },
          { label: "Low Stock Alerts", value: lowStockItems.length, icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, bg: "bg-amber-50" },
          { label: "Categories", value: [...new Set(items.map((i) => i.category))].length, icon: <Layers className="w-4 h-4 text-purple-500" />, bg: "bg-purple-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-white/60`}>
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-[11px] text-muted font-semibold">{stat.label}</span>
            </div>
            <div className="text-[20px] font-black text-ink">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-[13px] mb-1.5">
            <AlertTriangle className="w-4 h-4" />
            {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} at or below reorder point
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((i) => (
              <span key={i.id} className="text-[11px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
                {i.skuCode} — {i.currentStock} {i.unit} (min: {i.reorderPoint})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-[#EA580C] text-ink"
            placeholder="Search by item name or SKU…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-[13px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["SKU", "Item Name", "HSN", "Unit", "Cost Price", "Sale Price", "Stock", "Reorder Pt.", "Stock Value", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-[#475569] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10} className="px-4 py-8 text-center text-muted">Loading inventory…</td></tr>}
            {loadError && <tr><td colSpan={10} className="px-4 py-8 text-center text-red-600">Inventory is temporarily unavailable.</td></tr>}
            {filtered.map((item) => {
              const isLow = item.currentStock <= item.reorderPoint;
              return (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50/50 ${isLow ? "bg-amber-50/30" : ""}`}>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{item.skuCode}</td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {item.itemName}
                    <div className="text-[11px] font-normal text-muted">{item.category}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{item.hsnCode || "—"}</td>
                  <td className="px-4 py-3 text-muted">{item.unit}</td>
                  <td className="px-4 py-3">{fmtCurrency(item.costPrice)}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{fmtCurrency(item.salePrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${isLow ? "text-amber-600" : "text-ink"}`}>
                      {item.currentStock} {item.unit}
                    </span>
                    {isLow && <div className="text-[10px] text-amber-500 font-semibold">Low stock</div>}
                  </td>
                  <td className="px-4 py-3 text-muted">{item.reorderPoint} {item.unit}</td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {fmtCurrency(item.currentStock * item.costPrice)}
                  </td>
                  <td className="px-4 py-3">
                    {adjustingId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-[12px]"
                          placeholder="±qty"
                          value={adjustQty}
                          onChange={(e) => setAdjustQty(e.target.value)}
                        />
                        <button onClick={() => handleStockAdjust(item.id)} className="text-[11px] bg-emerald-500 text-white px-2 py-1 rounded-lg">✓</button>
                        <button onClick={() => setAdjustingId(null)} className="text-[11px] bg-gray-200 text-gray-600 px-2 py-1 rounded-lg">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAdjustingId(item.id)}
                        className="text-[11px] border border-gray-200 px-3 py-1 rounded-lg text-ink hover:border-[#EA580C] hover:text-[#EA580C] transition-colors"
                      >
                        Adjust Stock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && !loadError && filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-muted">No inventory items are available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DaybookTab() {
  return (
    <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-muted">
      Day book entries are not available from a connected data source.
    </div>
  );
}

function SummaryTab() {
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalPaid: number;
    totalOutstanding: number;
    totalInventoryValue: number;
    lowStockItems: number;
    openDocuments: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/api/operations/summary")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load summary");
        const result = await response.json();
        setSummary(result.summary ?? null);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="font-black text-[17px] text-ink mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#EA580C]" /> Receivables
        </h3>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          {loadError ? (
            <p className="text-sm text-red-600">Financial summary is temporarily unavailable.</p>
          ) : loading ? (
            <p className="text-sm text-muted">Loading summary…</p>
          ) : summary ? (
            [
              { label: "Invoiced", value: fmtCurrency(summary.totalRevenue) },
              { label: "Collected", value: fmtCurrency(summary.totalPaid) },
              { label: "Outstanding", value: fmtCurrency(summary.totalOutstanding) },
              { label: "Open documents", value: String(summary.openDocuments) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-[13px] pb-2 border-b border-gray-100">
                <span className="text-muted">{row.label}</span>
                <span className="font-bold text-ink">{row.value}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No receivables data is available.</p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="font-black text-[17px] text-ink mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#EA580C]" /> Inventory
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {loading ? <p className="text-sm text-muted">Loading summary…</p> : loadError ? (
              <p className="text-sm text-red-600">Inventory summary is temporarily unavailable.</p>
            ) : summary ? (
              <>
                <div className="text-[32px] font-black text-ink mb-1">{fmtCurrency(summary.totalInventoryValue)}</div>
                <div className="text-[13px] text-muted mb-4">Total inventory at cost</div>
                <div className="text-[12px] text-muted bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                  {summary.lowStockItems} item{summary.lowStockItems === 1 ? "" : "s"} at or below reorder point
                </div>
              </>
            ) : <p className="text-sm text-muted">No inventory summary is available.</p>}
          </div>
        </div>
        <p className="text-xs text-muted">Profit and loss details are not available from the connected summary service.</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("documents");
  const [overview, setOverview] = useState<{
    totalRevenue: number;
    totalOutstanding: number;
    totalInventoryValue: number;
    lowStockItems: number;
    openDocuments: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/operations/summary")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load operations overview");
        const result = await response.json();
        setOverview(result.summary ?? null);
      })
      .catch(() => setOverview(null));
  }, []);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "documents", label: "Invoices & Sales Docs", icon: <FileText className="w-4 h-4" /> },
    { id: "inventory", label: "Inventory & Stock", icon: <Package className="w-4 h-4" /> },
    { id: "daybook", label: "Day Book", icon: <BookOpen className="w-4 h-4" /> },
    { id: "summary", label: "P&L Summary", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-orange-50/40 via-white to-slate-50 border-b border-line pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.08),transparent_60%)] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-[.14em] uppercase bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-200">
              Business Operations & Invoicing
            </span>
          </div>
          <h1 className="text-[38px] md:text-[52px] font-black leading-tight tracking-tight text-ink mb-4">
            Billing, Inventory &{" "}
            <span className="text-accent">
              Accounts
            </span>
          </h1>
          <p className="text-[16px] text-muted max-w-[620px] leading-relaxed mb-6 font-medium">
            Create estimates, quotations, sales orders, delivery challans, and tax
            invoices. Convert documents in one click. Track stock, manage payables
            and receivables — all in one place.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {[
              "1-Click document conversion",
              "GST tax invoice (CGST/SGST/IGST)",
              "Stock reorder alerts",
              "Receivables & P&L",
              "e-Way bill formatting",
            ].map((tag) => (
              <span
                key={tag}
                className="text-[12px] font-semibold bg-white border border-line shadow-xs px-3.5 py-1.5 rounded-full text-ink"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 py-10">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: overview ? fmtCurrency(overview.totalRevenue) : "—", change: "From issued invoices", icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50" },
            { label: "Outstanding", value: overview ? fmtCurrency(overview.totalOutstanding) : "—", change: overview ? `${overview.openDocuments} open documents` : "Data unavailable", icon: <CreditCard className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50" },
            { label: "Inventory Value", value: overview ? fmtCurrency(overview.totalInventoryValue) : "—", change: "At cost", icon: <Package className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
            { label: "Low Stock Items", value: overview ? String(overview.lowStockItems) : "—", change: overview ? "At or below reorder point" : "Data unavailable", icon: <AlertTriangle className="w-5 h-5 text-red-500" />, bg: "bg-red-50" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-5 border border-white/60 flex items-start gap-3`}>
              <div className="mt-0.5 shrink-0">{stat.icon}</div>
              <div>
                <div className="text-[11px] text-muted font-semibold mb-0.5">{stat.label}</div>
                <div className="text-[22px] font-black text-ink leading-tight">{stat.value}</div>
                <div className="text-[11px] text-muted">{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto gap-2 mb-7 pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#0A1629] text-white shadow-md"
                  : "bg-white text-[#475569] border border-gray-200 hover:border-gray-400"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "daybook" && <DaybookTab />}
          {activeTab === "summary" && <SummaryTab />}
        </div>
      </div>

    </div>
  );
}
