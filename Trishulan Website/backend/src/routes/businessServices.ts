import { Router } from 'express';
import { fetchLiveGSTINData, fetchLivePANData } from '../services/kycService';
import { fetchLiveFxRates } from '../services/marketDataService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

const defaultKycDocuments = [
  {
    id: 'doc-1',
    requirement: 'Business identity',
    requestedItem: 'Registration / tax document',
    status: 'Received',
    fileUrl: '/uploads/gstin_certificate.pdf',
    statusColor: 'emerald',
  },
  {
    id: 'doc-2',
    requirement: 'Authorized person',
    requestedItem: 'ID and role confirmation',
    status: 'Received',
    fileUrl: '/uploads/pan_card.pdf',
    statusColor: 'emerald',
  },
  {
    id: 'doc-3',
    requirement: 'Bank details',
    requestedItem: 'Cancelled cheque / statement',
    status: 'Pending Verification',
    fileUrl: undefined,
    statusColor: 'amber',
  }
];

const transportQuotes = [
  {
    id: 'tq-101',
    carrierName: 'VRL Logistics Express',
    rating: 4.8,
    mode: 'FTL (Full Truck Load)',
    vehicleType: '32 Ft Multi-Axle Container',
    estimatedTransitDays: 2,
    rateQuote: '₹48,500',
    insuranceIncluded: true,
  },
  {
    id: 'tq-102',
    carrierName: 'TCI Freight Services',
    rating: 4.6,
    mode: 'PTL (Part Truck Load)',
    vehicleType: '19 Ft Open Body Truck',
    estimatedTransitDays: 3,
    rateQuote: '₹22,000',
    insuranceIncluded: false,
  },
  {
    id: 'tq-103',
    carrierName: 'Safexpress Industrial Cargo',
    rating: 4.9,
    mode: 'Express Parcel / Door Delivery',
    vehicleType: 'Dedicated Air-Ride Van',
    estimatedTransitDays: 1,
    rateQuote: '₹62,000',
    insuranceIncluded: true,
  },
];

const shipmentControlTower = {
  activeShipments: [
    {
      id: 'shp-8801',
      trackingNo: 'TRISH-FTL-2026-99',
      origin: 'Mumbai Industrial Zone (MIDC)',
      destination: 'Pune Chakan Industrial Hub',
      carrier: 'VRL Logistics',
      status: 'IN_TRANSIT',
      statusStep: 3,
      totalSteps: 5,
      eta: 'Today, 06:00 PM',
      sharedFolderUrl: 'https://drive.trishulan.com/docs/shp-8801',
      podStatus: 'E-POD Pending Signature',
    },
    {
      id: 'shp-8802',
      trackingNo: 'TRISH-PTL-2026-42',
      origin: 'Ahmedabad GIDC',
      destination: 'Surat Textile Park',
      carrier: 'TCI Freight',
      status: 'DELIVERED',
      statusStep: 5,
      totalSteps: 5,
      eta: 'Delivered (Yesterday)',
      sharedFolderUrl: 'https://drive.trishulan.com/docs/shp-8802',
      podStatus: 'Verified & Signed POD Available',
    }
  ],
};

const packagingRequirements = [
  {
    id: 'pkg-1',
    packagingType: 'Heavy Industrial Wooden Crating (ISPM 15 Treated)',
    suitableFor: 'Heavy CNC Machinery, Export Equipment & Motors',
    moq: '5 Crates',
    leadTimeDays: 2,
    unitPrice: '₹4,500 / Crate',
    supplierName: 'Reliable Crating Solutions Ltd.',
  },
  {
    id: 'pkg-2',
    packagingType: 'Heavy-Duty Corrugated Boxes (7-Ply High GSM)',
    suitableFor: 'Spare Parts, Industrial Valves & Tools',
    moq: '100 Boxes',
    leadTimeDays: 1,
    unitPrice: '₹180 / Box',
    supplierName: 'EcoPack India Ltd.',
  }
];

// GET /api/business-services/kyc-status
router.get('/kyc-status', async (req: AuthenticatedRequest, res) => {
  try {
    const documents = defaultKycDocuments;
    const verifiedCount = documents.filter(d => d.status === 'Received').length;
    const totalCount = documents.length;
    const completionPercentage = Math.round((verifiedCount / totalCount) * 100);

    return res.json({
      kycStatus: {
        isFullyVerified: completionPercentage === 100,
        completionPercentage,
        verifiedCount,
        totalCount,
        documents,
        verificationBadgeText: completionPercentage === 100 ? 'Fully Verified Business' : 'Verification In Progress',
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch KYC status' });
  }
});

// POST /api/business-services/reupload
router.post('/reupload', async (req: AuthenticatedRequest, res) => {
  try {
    const { documentId, fileName } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: 'Missing documentId' });
    }
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
router.get('/transport-quotes', async (_req, res) => {
  try {
    return res.json({ quotes: transportQuotes, total: transportQuotes.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch transport quotes' });
  }
});

// GET /api/business-services/shipment-tower
router.get('/shipment-tower', async (_req, res) => {
  try {
    return res.json(shipmentControlTower);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch shipment control tower' });
  }
});

// GET /api/business-services/packaging-requirements
router.get('/packaging-requirements', async (_req, res) => {
  try {
    return res.json({ requirements: packagingRequirements, total: packagingRequirements.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch packaging requirements' });
  }
});

// GET /api/business-services/checklist
router.get('/checklist', async (_req, res) => {
  try {
    const checklist = [
      { id: 'step-1', title: 'GSTIN & PAN Business Identity', completed: true },
      { id: 'step-2', title: 'Bank Account & Cancelled Cheque Verification', completed: true },
      { id: 'step-3', title: 'Factory / Warehouse Site Location Audit', completed: false },
      { id: 'step-4', title: 'Industrial Product Catalog Upload (5+ Items)', completed: true },
    ];
    return res.json({ checklist });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch checklist' });
  }
});

// POST /api/business-services/adviser-appointment
router.post('/adviser-appointment', async (req: AuthenticatedRequest, res) => {
  try {
    const { preferredDate, preferredTime, topic } = req.body;
    return res.json({
      success: true,
      message: `Appointment scheduled with Trishulan Business Adviser for ${preferredDate || 'Tomorrow'} at ${preferredTime || '10:00 AM'}.`,
      appointment: { preferredDate, preferredTime, topic }
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
