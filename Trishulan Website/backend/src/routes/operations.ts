/**
 * operations.ts — Small-Business Billing, Inventory & Accounts routes (Guide pp. 28-29)
 *
 * Endpoints:
 *   GET  /api/operations/documents              — List all business documents
 *   POST /api/operations/documents              — Create a new document (estimate/invoice/etc.)
 *   GET  /api/operations/documents/:id          — Get a single document
 *   PATCH /api/operations/documents/:id/status  — Update document status (e.g. mark PAID)
 *   POST /api/operations/documents/:id/convert  — 1-click doc conversion pipeline
 *   GET  /api/operations/inventory              — List inventory items
 *   POST /api/operations/inventory              — Create an inventory item
 *   PATCH /api/operations/inventory/:id/stock   — Adjust stock level
 *   GET  /api/operations/daybook                — Daily cash/bank entry summary
 *   GET  /api/operations/summary                — Receivables, payables, P&L snapshot
 */

import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/db';
import { DocType, Prisma } from '@prisma/client';

const router = Router();

// ── Document number generation ───────────────────────────────────────────────
const DOC_PREFIXES: Record<DocType, string> = {
  ESTIMATE: 'EST',
  QUOTATION: 'QT',
  PROFORMA_INVOICE: 'PI',
  SALES_ORDER: 'SO',
  DELIVERY_CHALLAN: 'DC',
  TAX_INVOICE: 'INV',
};

async function generateDocNumber(docType: DocType, userId: string): Promise<string> {
  const count = await prisma.businessDocument.count({ where: { userId, docType } });
  return `${DOC_PREFIXES[docType]}-${String(count + 1).padStart(4, '0')}`;
}

// Conversion pipeline map (what a doc can be converted into)
const CONVERSION_MAP: Record<DocType, DocType | null> = {
  ESTIMATE: 'QUOTATION',
  QUOTATION: 'SALES_ORDER',
  PROFORMA_INVOICE: 'SALES_ORDER',
  SALES_ORDER: 'DELIVERY_CHALLAN',
  DELIVERY_CHALLAN: 'TAX_INVOICE',
  TAX_INVOICE: null,
};

// ────────────────────────────────────────────────────────────────────────────
// GET /api/operations/documents
// ────────────────────────────────────────────────────────────────────────────
router.get('/documents', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });
    const { docType, status } = req.query;
    if (docType !== undefined && !Object.values(DocType).includes(docType as DocType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }
    if (status !== undefined && !['DRAFT', 'ISSUED', 'PAID', 'PARTIAL', 'CANCELLED'].includes(String(status))) {
      return res.status(400).json({ error: 'Invalid document status' });
    }
    const documents = await prisma.businessDocument.findMany({
      where: {
        userId: req.user.id,
        ...(docType ? { docType: docType as DocType } : {}),
        ...(status ? { status: status as string } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.json({ documents });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch documents' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/operations/documents
// ────────────────────────────────────────────────────────────────────────────
router.post('/documents', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const {
      docType,
      partyName,
      partyGstin,
      partyAddress,
      items,
      taxRatePercent,
      notes,
      dueDate,
    } = req.body ?? {};

    if (typeof partyName !== 'string' || !partyName.trim()) {
      return res.status(400).json({ error: 'partyName is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }
    if (typeof taxRatePercent !== 'number' || !Number.isFinite(taxRatePercent) || taxRatePercent < 0 || taxRatePercent > 100) {
      return res.status(400).json({ error: 'taxRatePercent must be a number between 0 and 100' });
    }
    if (typeof docType !== 'string' || !Object.values(DocType).includes(docType as DocType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }
    if (partyGstin !== undefined && partyGstin !== null && typeof partyGstin !== 'string') {
      return res.status(400).json({ error: 'partyGstin must be a string' });
    }
    if (partyAddress !== undefined && partyAddress !== null && typeof partyAddress !== 'string') {
      return res.status(400).json({ error: 'partyAddress must be a string' });
    }
    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      return res.status(400).json({ error: 'notes must be a string' });
    }

    const parsedItems: Prisma.InputJsonObject[] = [];
    for (const item of items) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return res.status(400).json({ error: 'Each item must be an object' });
      }
      const row = item as Record<string, unknown>;
      const quantity = Number(row.qty);
      const unitPrice = Number(row.unitPrice);
      if (
        typeof row.description !== 'string' || !row.description.trim() ||
        !Number.isFinite(quantity) || quantity <= 0 ||
        !Number.isFinite(unitPrice) || unitPrice < 0
      ) {
        return res.status(400).json({ error: 'Each item needs a description, positive qty, and non-negative unitPrice' });
      }
      parsedItems.push({
        description: row.description.trim(),
        qty: quantity,
        unitPrice,
        total: Number((quantity * unitPrice).toFixed(2)),
        ...(typeof row.hsn === 'string' ? { hsn: row.hsn } : {}),
      });
    }
    const subtotal = Number(parsedItems.reduce(
      (sum, item) => sum + Number(item.qty) * Number(item.unitPrice),
      0
    ).toFixed(2));
    const taxAmount = Number(((subtotal * taxRatePercent) / 100).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));
    const resolvedDocType: DocType = docType as DocType;
    const resolvedDueDate = dueDate ? new Date(dueDate) : null;
    if (resolvedDueDate && Number.isNaN(resolvedDueDate.getTime())) {
      return res.status(400).json({ error: 'dueDate must be a valid date' });
    }

    const docNumber = await generateDocNumber(resolvedDocType, req.user.id);
    const doc = await prisma.businessDocument.create({
      data: {
        userId: req.user.id,
        docNumber,
        docType: resolvedDocType,
        partyName: partyName.trim(),
        partyGstin: partyGstin || null,
        partyAddress: partyAddress || null,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        status: 'DRAFT',
        dueDate: resolvedDueDate,
        notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
        items: parsedItems,
      },
    });

    return res.json({ success: true, document: doc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create document' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/operations/documents/:id
// ────────────────────────────────────────────────────────────────────────────
router.get('/documents/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const doc = await prisma.businessDocument.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    return res.json({ document: doc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch document' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/operations/documents/:id/status
// Body: { status, paidAmount? }
// ────────────────────────────────────────────────────────────────────────────
router.patch('/documents/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });
    const { status, paidAmount } = req.body ?? {};
    if (!['DRAFT', 'ISSUED', 'PAID', 'PARTIAL', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid document status' });
    }
    const document = await prisma.businessDocument.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    const resolvedPaidAmount = paidAmount === undefined
      ? (status === 'PAID' ? document.totalAmount : document.paidAmount)
      : Number(paidAmount);
    if (
      !Number.isFinite(resolvedPaidAmount) ||
      resolvedPaidAmount < 0 ||
      resolvedPaidAmount > document.totalAmount
    ) {
      return res.status(400).json({ error: 'paidAmount must be between zero and the document total' });
    }
    if (
      (status === 'PAID' && resolvedPaidAmount !== document.totalAmount) ||
      (status === 'PARTIAL' && (resolvedPaidAmount <= 0 || resolvedPaidAmount >= document.totalAmount)) ||
      (['DRAFT', 'ISSUED', 'CANCELLED'].includes(status) && resolvedPaidAmount > 0)
    ) {
      return res.status(400).json({ error: 'Document status and paidAmount are inconsistent' });
    }

    await prisma.businessDocument.update({
      where: { id: document.id },
      data: { status, paidAmount: resolvedPaidAmount },
    });
    return res.json({ success: true, message: 'Document status updated' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update document status' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/operations/documents/:id/convert
// 1-click conversion: Quotation → Sales Order → Delivery Challan → Tax Invoice
// ────────────────────────────────────────────────────────────────────────────
router.post('/documents/:id/convert', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const sourceDoc = await prisma.businessDocument.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!sourceDoc) return res.status(404).json({ error: 'Source document not found' });

    const targetType = CONVERSION_MAP[sourceDoc.docType];
    if (!targetType) {
      return res.status(400).json({
        error: `${sourceDoc.docType} is the final document type and cannot be converted further`,
      });
    }

    const docNumber = await generateDocNumber(targetType, req.user.id);
    const converted = await prisma.businessDocument.create({
      data: {
        userId: req.user.id,
        docNumber,
        docType: targetType,
        partyName: sourceDoc.partyName,
        partyGstin: sourceDoc.partyGstin,
        partyAddress: sourceDoc.partyAddress,
        subtotal: sourceDoc.subtotal,
        taxAmount: sourceDoc.taxAmount,
        totalAmount: sourceDoc.totalAmount,
        paidAmount: 0,
        status: 'DRAFT',
        notes: sourceDoc.notes,
        items: JSON.parse(JSON.stringify(sourceDoc.items)),
        parentDocId: sourceDoc.id,
      },
    });

    return res.json({
      success: true,
      message: `Converted ${sourceDoc.docType} → ${targetType} successfully`,
      document: converted,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to convert document' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/operations/inventory
// ────────────────────────────────────────────────────────────────────────────
router.get('/inventory', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });
    const items = await prisma.inventoryItem.findMany({
      where: { userId: req.user.id },
      orderBy: { itemName: 'asc' },
    });
    return res.json({ items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch inventory' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/operations/inventory
// ────────────────────────────────────────────────────────────────────────────
router.post('/inventory', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const {
      skuCode, itemName, category, hsnCode, unit,
      costPrice, salePrice, currentStock, reorderPoint, batchNumber,
    } = req.body ?? {};

    if (typeof skuCode !== 'string' || !skuCode.trim() || typeof itemName !== 'string' || !itemName.trim()) {
      return res.status(400).json({ error: 'skuCode and itemName are required' });
    }
    if ([category, hsnCode, unit, batchNumber].some((value) => value !== undefined && value !== null && typeof value !== 'string')) {
      return res.status(400).json({ error: 'Inventory text fields must be strings' });
    }
    const resolvedCostPrice = Number(costPrice ?? 0);
    const resolvedSalePrice = Number(salePrice ?? 0);
    const resolvedCurrentStock = Number(currentStock ?? 0);
    const resolvedReorderPoint = Number(reorderPoint ?? 10);
    if (
      !Number.isFinite(resolvedCostPrice) || resolvedCostPrice < 0 ||
      !Number.isFinite(resolvedSalePrice) || resolvedSalePrice < 0 ||
      !Number.isFinite(resolvedCurrentStock) || resolvedCurrentStock < 0 ||
      !Number.isFinite(resolvedReorderPoint) || resolvedReorderPoint < 0
    ) {
      return res.status(400).json({ error: 'Inventory quantities and prices must be non-negative numbers' });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        userId: req.user.id,
        skuCode: skuCode.trim(),
        itemName: itemName.trim(),
        category: typeof category === 'string' && category.trim() ? category.trim() : 'General',
        hsnCode: typeof hsnCode === 'string' && hsnCode.trim() ? hsnCode.trim() : null,
        unit: typeof unit === 'string' && unit.trim() ? unit.trim() : 'Units',
        costPrice: resolvedCostPrice,
        salePrice: resolvedSalePrice,
        currentStock: resolvedCurrentStock,
        reorderPoint: resolvedReorderPoint,
        batchNumber: typeof batchNumber === 'string' && batchNumber.trim() ? batchNumber.trim() : null,
      },
    });

    return res.json({ success: true, item });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create inventory item' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/operations/inventory/:id/stock
// Body: { adjustment, reason } — positive = stock in, negative = stock out
// ────────────────────────────────────────────────────────────────────────────
router.patch('/inventory/:id/stock', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });
    const { adjustment } = req.body ?? {};
    const numericAdjustment = Number(adjustment);
    if (!Number.isFinite(numericAdjustment) || numericAdjustment === 0) {
      return res.status(400).json({ error: 'adjustment must be a non-zero number' });
    }

    const result = await prisma.$transaction(async (transaction) => {
      const item = await transaction.inventoryItem.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });
      if (!item) return { outcome: 'NOT_FOUND' as const };

      const newStock = item.currentStock + numericAdjustment;
      if (newStock < 0) return { outcome: 'INSUFFICIENT_STOCK' as const };

      const updated = await transaction.inventoryItem.update({
        where: { id: item.id },
        data: {
          currentStock: newStock,
          reorderAlertSent: newStock <= item.reorderPoint,
        },
      });
      return { outcome: 'UPDATED' as const, item: updated };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (result.outcome === 'NOT_FOUND') return res.status(404).json({ error: 'Inventory item not found' });
    if (result.outcome === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: 'Stock adjustment cannot make inventory negative' });
    }
    const updated = result.item;
    const newStock = updated.currentStock;

    return res.json({
      success: true,
      item: updated,
      alert: newStock <= updated.reorderPoint
        ? `⚠ Stock at or below reorder point (${updated.reorderPoint} ${updated.unit})`
        : null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update stock' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/operations/summary
// P&L snapshot + receivables/payables
// ────────────────────────────────────────────────────────────────────────────
router.get('/summary', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const [documents, inventory] = await Promise.all([
      prisma.businessDocument.findMany({ where: { userId: req.user.id } }),
      prisma.inventoryItem.findMany({ where: { userId: req.user.id } }),
    ]);

    const invoices = documents.filter(
      (document) =>
        document.docType === 'TAX_INVOICE' &&
        ['ISSUED', 'PARTIAL', 'PAID'].includes(document.status)
    );
    const totalRevenue = invoices.reduce((s, d) => s + d.totalAmount, 0);
    const totalPaid = invoices.reduce((s, d) => s + d.paidAmount, 0);
    const totalOutstanding = totalRevenue - totalPaid;
    const totalInventoryValue = inventory.reduce(
      (s, i) => s + i.currentStock * i.costPrice,
      0
    );
    const lowStockItems = inventory.filter(
      (i) => i.currentStock <= i.reorderPoint
    ).length;

    return res.json({
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
        totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
        lowStockItems,
        openDocuments: documents.filter((d) => d.status === 'DRAFT' || d.status === 'ISSUED').length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch summary' });
  }
});

export default router;
