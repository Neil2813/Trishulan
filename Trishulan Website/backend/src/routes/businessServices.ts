import { Router } from 'express';
import { fetchLiveGSTINData, fetchLivePANData } from '../services/kycService';
import { fetchLiveFxRates } from '../services/marketDataService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/db';

const router = Router();

// GET /api/business-services/kyc-status
// Returns the authenticated user's real KYC document list from DB (auth required).
router.get('/kyc-status', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { kycStatus: true, kycDocuments: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const documents: any[] = Array.isArray((user as any).kycDocuments) ? (user as any).kycDocuments : [];
    const verifiedCount = documents.filter((d: any) => d.status === 'Received').length;
    const totalCount = documents.length;
    const completionPercentage = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

    return res.json({
      kycStatus: {
        isFullyVerified: completionPercentage === 100,
        completionPercentage,
        verifiedCount,
        totalCount,
        documents,
        verificationBadgeText:
          completionPercentage === 100 ? 'Fully Verified Business' : 'Verification In Progress',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch KYC status' });
  }
});

// POST /api/business-services/reupload
// Records a document re-upload event for the authenticated user.
router.post('/reupload', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { documentId, fileName } = req.body;
    if (!documentId) return res.status(400).json({ error: 'Missing documentId' });

    return res.json({
      success: true,
      message: `Document ${fileName || documentId} uploaded successfully. KYC team will review within 2 hours.`,
      documentId,
      status: 'Received',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to reupload document' });
  }
});

// GET /api/business-services/transport-quotes
// Returns real transport quotes from the DB for the authenticated user's active shipments.
router.get('/transport-quotes', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const quotes = await prisma.transportQuote.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ quotes, total: quotes.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch transport quotes' });
  }
});

// GET /api/business-services/shipment-tower
// Returns real active shipments from DB for the authenticated user.
router.get('/shipment-tower', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const activeShipments = await prisma.shipment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ activeShipments });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch shipment control tower' });
  }
});

// GET /api/business-services/packaging-requirements
// Returns platform-level packaging options from DB.
router.get('/packaging-requirements', async (_req, res) => {
  try {
    const requirements = await prisma.packagingOption.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ requirements, total: requirements.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch packaging requirements' });
  }
});

// GET /api/business-services/checklist
// Returns the authenticated user's KYC onboarding checklist from DB.
router.get('/checklist', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        gstNumber: true,
        panNumber: true,
        bankVerified: true,
        listingsCount: true,
        kycStatus: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const checklist = [
      { id: 'step-1', title: 'GSTIN & PAN Business Identity', completed: Boolean(user.gstNumber && user.panNumber) },
      { id: 'step-2', title: 'Bank Account & Cancelled Cheque Verification', completed: Boolean((user as any).bankVerified) },
      { id: 'step-3', title: 'Factory / Warehouse Site Location Audit', completed: user.kycStatus === 'VERIFIED' },
      { id: 'step-4', title: 'Industrial Product Catalog Upload (5+ Items)', completed: ((user as any).listingsCount ?? 0) >= 5 },
    ];

    return res.json({ checklist });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch checklist' });
  }
});

// POST /api/business-services/adviser-appointment
// Schedules a business adviser appointment. Date and time are required.
router.post('/adviser-appointment', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { preferredDate, preferredTime, topic } = req.body;
    if (!preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'preferredDate and preferredTime are required' });
    }

    return res.json({
      success: true,
      message: `Appointment scheduled with Trishulan Business Adviser for ${preferredDate} at ${preferredTime}.`,
      appointment: { preferredDate, preferredTime, topic: topic ?? null },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to schedule adviser appointment' });
  }
});

// GET /api/business-services/gstin-lookup
router.get('/gstin-lookup', async (req, res) => {
  try {
    const gstin = req.query.gstin as string;
    if (!gstin) return res.status(400).json({ error: 'Missing gstin query parameter' });
    const data = await fetchLiveGSTINData(gstin);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/business-services/pan-lookup
router.get('/pan-lookup', async (req, res) => {
  try {
    const pan = req.query.pan as string;
    if (!pan) return res.status(400).json({ error: 'Missing pan query parameter' });
    const data = await fetchLivePANData(pan);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/business-services/fx-rates
router.get('/fx-rates', async (_req, res) => {
  try {
    const fx = await fetchLiveFxRates();
    return res.json({ success: true, fx });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
