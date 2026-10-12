"use client";

import React, { useState } from "react";
import {
  FileText,
  Package,
  TrendingUp,
  Plus,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  CreditCard,
  BarChart3,
  ShoppingCart,
  Truck,
  BookOpen,
  Layers,
  Filter,
  Search,
  X,
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

// ─── Sample data ────────────────────────────────────────────────────────────
const SAMPLE_DOCS: DocItem[] = [
  {
    id: "d1", docNumber: "INV-0001", docType: "TAX_INVOICE",
    partyName: "Bharat Steel Works Pvt. Ltd.", partyGstin: "27AABCS1234F1ZX",
    subtotal: 125000, taxAmount: 22500, totalAmount: 147500, paidAmount: 147500,
    status: "PAID", dueDate: "2026-10-15T00:00:00.000Z", createdAt: "2026-09-25T10:00:00.000Z",
  },
  {
    id: "d2", docNumber: "SO-0003", docType: "SALES_ORDER",
    partyName: "Chennai Machinery Exports", partyGstin: "33AADCE5678G1ZK",
    subtotal: 85000, taxAmount: 15300, totalAmount: 100300, paidAmount: 30000,
    status: "PARTIAL", dueDate: "2026-10-31T00:00:00.000Z", createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "d3", docNumber: "DC-0002", docType: "DELIVERY_CHALLAN",
    partyName: "Rajasthan Minerals Trading Co.",
    subtotal: 45000, taxAmount: 8100, totalAmount: 53100, paidAmount: 0,
    status: "ISSUED", createdAt: "2026-10-08T14:00:00.000Z",
  },
  {
    id: "d4", docNumber: "QT-0005", docType: "QUOTATION",
    partyName: "Hyderabad Pharma Equipment Co.",
    subtotal: 220000, taxAmount: 39600, totalAmount: 259600, paidAmount: 0,
    status: "DRAFT", dueDate: "2026-10-20T00:00:00.000Z", createdAt: "2026-10-10T08:00:00.000Z",
  },
];

const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: "i1", skuCode: "MS-HR-001", itemName: "MS Hot Rolled Coil 2mm", category: "Raw Materials",
    hsnCode: "7208", unit: "MT", costPrice: 52000, salePrice: 58000,
    currentStock: 24.5, reorderPoint: 10, createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "i2", skuCode: "SS-304-002", itemName: "SS304 Sheet 1.5mm", category: "Raw Materials",
    hsnCode: "7219", unit: "MT", costPrice: 185000, salePrice: 210000,
    currentStock: 4.2, reorderPoint: 5, createdAt: "2026-09-10T00:00:00.000Z",
  },
  {
    id: "i3", skuCode: "BOLT-M12-003", itemName: "M12 x 50mm Hex Bolt (Gr 8.8)", category: "Fasteners",
    hsnCode: "7318", unit: "Pieces", costPrice: 18, salePrice: 28,
    currentStock: 5800, reorderPoint: 1000, createdAt: "2026-09-15T00:00:00.000Z",
  },
  {
    id: "i4", skuCode: "DRUM-HDPE-004", itemName: "HDPE Drum 200L Blue", category: "Packaging",
    hsnCode: "3923", unit: "Pieces", costPrice: 650, salePrice: 950,
    currentStock: 38, reorderPoint: 50, createdAt: "2026-09-20T00:00:00.000Z",
  },
];

const DAYBOOK_ENTRIES = [
  { date: "2026-10-10", type: "RECEIPT", narration: "Received payment — Bharat Steel Works", amount: 147500, balance: 147500, mode: "NEFT" },
  { date: "2026-10-09", type: "PAYMENT", narration: "Freight charges — Blue Dart Express", amount: -12400, balance: 0, mode: "IMPS" },
  { date: "2026-10-08", type: "RECEIPT", narration: "Advance received — Chennai Machinery Exports", amount: 30000, balance: 0, mode: "RTGS" },
  { date: "2026-10-07", type: "PAYMENT", narration: "Raw material purchase — JSW Steel", amount: -85000, balance: 0, mode: "Cheque" },
  { date: "2026-10-06", type: "PAYMENT", narration: "Packing material — Suraj Packaging", amount: -8200, balance: 0, mode: "UPI" },
  { date: "2026-10-05", type: "RECEIPT", narration: "Platform transaction — Trishulan RFQ-4821", amount: 53100, balance: 0, mode: "NEFT" },
];

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
  const [docs, setDocs] = useState<DocItem[]>(SAMPLE_DOCS);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const filtered = docs.filter(
    (d) =>
      (filterType === "ALL" || d.docType === filterType) &&
      (d.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.docNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleConvert = (doc: DocItem) => {
    const nextType = CONVERSION_MAP[doc.docType];
    if (!nextType) return;
    const newDoc: DocItem = {
      ...doc,
      id: "new-" + Date.now(),
      docNumber: `${nextType.split("_")[0].slice(0, 3)}-${String(docs.length + 1).padStart(4, "0")}`,
      docType: nextType,
      paidAmount: 0,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    };
    setDocs((prev) => [newDoc, ...prev]);
    setConvertingId(null);
    alert(`Converted to ${DOC_LABELS[nextType]} — ${newDoc.docNumber}`);
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA580C] text-white text-[13px] font-semibold hover:bg-[#c2410a] transition-colors"
        >
          <Plus className="w-4 h-4" /> New Document
        </button>
      </div>

      {/* Conversion pipeline banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-5 py-4 mb-5 flex items-center gap-4 flex-wrap">
        <div className="text-[12px] font-bold text-blue-800 shrink-0">1-Click Conversion Pipeline:</div>
        {(Object.keys(DOC_LABELS) as DocType[]).map((type, i, arr) => (
          <React.Fragment key={type}>
            <span className="text-[11px] font-semibold px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-700 whitespace-nowrap">
              {DOC_LABELS[type]}
            </span>
            {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
          </React.Fragment>
        ))}
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
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted text-[13px]">
            No documents found.
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>(SAMPLE_INVENTORY);
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState("");

  const filtered = items.filter(
    (i) =>
      i.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.skuCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockAdjust = (id: string) => {
    const qty = parseFloat(adjustQty);
    if (isNaN(qty)) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, currentStock: Math.max(0, i.currentStock + qty) } : i
      )
    );
    setAdjustingId(null);
    setAdjustQty("");
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
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA580C] text-white text-[13px] font-semibold hover:bg-[#c2410a] transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DaybookTab() {
  let runningBalance = 72000;
  const entries = DAYBOOK_ENTRIES.map((e) => {
    runningBalance += e.amount;
    return { ...e, runningBalance };
  });

  const totalReceipts = entries.filter((e) => e.type === "RECEIPT").reduce((s, e) => s + e.amount, 0);
  const totalPayments = Math.abs(entries.filter((e) => e.type === "PAYMENT").reduce((s, e) => s + e.amount, 0));

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Receipts (Oct)", value: fmtCurrency(totalReceipts), color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Total Payments (Oct)", value: fmtCurrency(totalPayments), color: "text-red-600", bg: "bg-red-50" },
          { label: "Net Cash Position", value: fmtCurrency(totalReceipts - totalPayments), color: "text-ink", bg: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white/60`}>
            <div className="text-[11px] text-muted font-semibold mb-1">{s.label}</div>
            <div className={`text-[22px] font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-[13px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Date", "Type", "Narration", "Amount", "Mode", "Balance"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-[#475569]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-muted whitespace-nowrap">{entry.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    entry.type === "RECEIPT" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                  }`}>
                    {entry.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink">{entry.narration}</td>
                <td className={`px-4 py-3 font-semibold ${entry.amount > 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {entry.amount > 0 ? "+" : ""}{fmtCurrency(Math.abs(entry.amount))}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{entry.mode}</span>
                </td>
                <td className="px-4 py-3 font-bold text-ink">{fmtCurrency(entry.runningBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryTab() {
  const totalRevenue = 485000;
  const totalPaid = 320000;
  const outstanding = totalRevenue - totalPaid;
  const totalInventoryValue = 220000;

  const plData = [
    { label: "Gross Revenue (Oct)", value: fmtCurrency(485000), positive: true },
    { label: "Raw Material Cost", value: `− ${fmtCurrency(240000)}`, positive: false },
    { label: "Operating Expenses", value: `− ${fmtCurrency(38000)}`, positive: false },
    { label: "Transport & Logistics", value: `− ${fmtCurrency(21000)}`, positive: false },
    { label: "Gross Profit", value: fmtCurrency(186000), positive: true, bold: true },
    { label: "Platform Fees (1.5%)", value: `− ${fmtCurrency(7275)}`, positive: false },
    { label: "Net Operating Profit", value: fmtCurrency(178725), positive: true, bold: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* P&L */}
      <div>
        <h3 className="font-black text-[17px] text-ink mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#EA580C]" /> Profit & Loss — October 2026
        </h3>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {plData.map((row, i) => (
            <div
              key={i}
              className={`flex justify-between px-5 py-3 border-b border-gray-100 ${
                row.bold ? "bg-gray-50" : ""
              }`}
            >
              <span className={`text-[13px] ${row.bold ? "font-black text-ink" : "text-muted"}`}>
                {row.label}
              </span>
              <span className={`text-[13px] font-bold ${
                row.bold ? "text-ink text-[15px]" : row.positive ? "text-emerald-700" : "text-red-600"
              }`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Receivables & Payables + Inventory */}
      <div className="space-y-5">
        <div>
          <h3 className="font-black text-[17px] text-ink mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#EA580C]" /> Receivables Snapshot
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {[
              { label: "Total Invoiced", value: fmtCurrency(totalRevenue), color: "text-ink" },
              { label: "Collected", value: fmtCurrency(totalPaid), color: "text-emerald-700" },
              { label: "Outstanding", value: fmtCurrency(outstanding), color: "text-red-600" },
              { label: "Overdue (>30 days)", value: fmtCurrency(42000), color: "text-red-700 font-black" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between text-[13px] pb-2 border-b border-gray-100">
                <span className="text-muted">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
            {/* Visual bar */}
            <div>
              <div className="flex justify-between text-[11px] text-muted mb-1.5">
                <span>Collection rate</span>
                <span>{Math.round((totalPaid / totalRevenue) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  style={{ width: `${(totalPaid / totalRevenue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-black text-[17px] text-ink mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#EA580C]" /> Inventory Value
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-[32px] font-black text-ink mb-1">
              {fmtCurrency(totalInventoryValue)}
            </div>
            <div className="text-[13px] text-muted mb-4">Total inventory at cost (FIFO)</div>
            <div className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              2 items below reorder point — review inventory tab
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("documents");

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "documents", label: "Invoices & Sales Docs", icon: <FileText className="w-4 h-4" /> },
    { id: "inventory", label: "Inventory & Stock", icon: <Package className="w-4 h-4" /> },
    { id: "daybook", label: "Day Book", icon: <BookOpen className="w-4 h-4" /> },
    { id: "summary", label: "P&L Summary", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0A1629] via-[#0f2044] to-[#1a3366] text-white pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.12),transparent_60%)]" />
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-[.14em] uppercase bg-[#EA580C]/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/30">
              Business Operations & Invoicing
            </span>
          </div>
          <h1 className="text-[38px] md:text-[52px] font-black leading-tight tracking-tight mb-4">
            Billing, Inventory &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Accounts
            </span>
          </h1>
          <p className="text-[16px] text-slate-300 max-w-[600px] leading-relaxed mb-6">
            Create estimates, quotations, sales orders, delivery challans, and tax
            invoices. Convert documents in one click. Track stock, manage payables
            and receivables — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              "1-Click document conversion",
              "GST tax invoice (CGST/SGST/IGST)",
              "Stock reorder alerts",
              "Receivables & P&L",
              "e-Way bill formatting",
            ].map((tag) => (
              <span
                key={tag}
                className="text-[12px] font-semibold bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-slate-200"
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
            { label: "Total Revenue (Oct)", value: "₹4,85,000", change: "+12%", icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50" },
            { label: "Outstanding", value: "₹1,65,000", change: "3 invoices", icon: <CreditCard className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50" },
            { label: "Inventory Value", value: "₹2,20,000", change: "4 SKUs", icon: <Package className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
            { label: "Low Stock Items", value: "2", change: "Needs reorder", icon: <AlertTriangle className="w-5 h-5 text-red-500" />, bg: "bg-red-50" },
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
