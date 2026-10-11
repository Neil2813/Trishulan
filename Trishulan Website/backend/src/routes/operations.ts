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
import { DocType } from '@prisma/client';

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
    } = req.body;

    if (!partyName || !items) {
      return res.status(400).json({ error: 'partyName and items are required' });
    }
    if (taxRatePercent === undefined || taxRatePercent === null) {
      return res.status(400).json({ error: 'taxRatePercent is required' });
    }
    if (!docType) {
      return res.status(400).json({ error: 'docType is required' });
    }

    const parsedItems = Array.isArray(items) ? items : JSON.parse(items);
    const subtotal = parsedItems.reduce(
      (sum: number, item: any) => sum + (Number(item.qty) * Number(item.unitPrice) || 0),
      0
    );
    const taxRate = Number(taxRatePercent);
    const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));
    const resolvedDocType: DocType = docType as DocType;

    const docNumber = await generateDocNumber(resolvedDocType, req.user.id);
    const doc = await prisma.businessDocument.create({
      data: {
        userId: req.user.id,
        docNumber,
        docType: resolvedDocType,
        partyName,
        partyGstin: partyGstin || null,
        partyAddress: partyAddress || null,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        status: 'DRAFT',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
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
    const { status, paidAmount } = req.body;
    const doc = await prisma.businessDocument.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: {
        status,
        ...(paidAmount !== undefined ? { paidAmount: Number(paidAmount) } : {}),
      },
    });
    if (doc.count === 0) return res.status(404).json({ error: 'Document not found' });
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
    } = req.body;

    if (!skuCode || !itemName) {
      return res.status(400).json({ error: 'skuCode and itemName are required' });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        userId: req.user.id,
        skuCode,
        itemName,
        category: category || 'General',
        hsnCode: hsnCode || null,
        unit: unit || 'Units',
        costPrice: Number(costPrice) || 0,
        salePrice: Number(salePrice) || 0,
        currentStock: Number(currentStock) || 0,
        reorderPoint: Number(reorderPoint) || 10,
        batchNumber: batchNumber || null,
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
    const { adjustment } = req.body;
    const item = await prisma.inventoryItem.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    const newStock = item.currentStock + Number(adjustment);
    const updated = await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        currentStock: newStock,
        reorderAlertSent: newStock <= item.reorderPoint,
      },
    });

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

    const invoices = documents.filter((d) => d.docType === 'TAX_INVOICE');
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
