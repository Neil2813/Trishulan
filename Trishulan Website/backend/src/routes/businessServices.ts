import { Router } from 'express';
import {
  fetchLiveGSTINData,
  fetchLivePANData,
  fetchLivePincodeAddressData,
  isValidPanDateOfBirth,
} from '../services/kycService';
import { fetchLiveFxRates, MarketDataUnavailableError } from '../services/marketDataService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/db';
import { Prisma } from '@prisma/client';

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
  },
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

const defaultShipmentControlTower = {
  activeShipmentsCount: 18,
  onTime: '94.2%',
  needsAction: 2,
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
    },
  ],
  currentShipment: {
    id: 'TRISH-FTL-2026-99',
    route: 'Mumbai MIDC to Pune Chakan | Road',
    milestones: [
      { name: 'Booked', done: true },
      { name: 'Picked up', done: true },
      { name: 'In transit', done: true, current: true },
      { name: 'At destination', done: false },
      { name: 'Delivered / POD', done: false },
    ],
    lastEvent: '10:42 | Checkpoint scanned: Estimated arrival today 18:00',
    sharedFolder: [
      { name: 'Rate confirmation', status: 'saved' },
      { name: 'Packing list', status: 'uploaded' },
      { name: 'Transport document (LR)', status: 'issued' },
      { name: 'Proof of delivery (POD)', status: 'pending' },
    ],
    exceptionAlert: 'Checkpoint alert: Toll plaza congestion +45 mins',
    exceptionSubtext: 'Notify buyer + seller | Carrier assigned telemetry active',
  },
  shipmentLifecycle: [
    { step: 1, label: 'Request rates' },
    { step: 2, label: 'Compare / approve' },
    { step: 3, label: 'Book carrier' },
    { step: 4, label: 'Track milestones' },
    { step: 5, label: 'Upload POD' },
    { step: 6, label: 'Reconcile freight' },
  ],
  exampleText: 'Real-time telemetry and milestone tracking with automated e-way bill reconciliation, digital LR generation, and GPS route geofencing.',
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
  },
];

// GET /api/business-services/kyc-status
// Returns the authenticated user's real KYC document list from DB (auth required).
router.get('/kyc-status', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        verifiedSeller: true,
        kycStatus: true,
        kycDocuments: true,
        gstNumber: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const documents = Array.isArray(user.kycDocuments) ? user.kycDocuments : [];
    const verifiedCount = documents.filter((document) =>
      document !== null &&
      typeof document === 'object' &&
      !Array.isArray(document) &&
      document.status === 'Received'
    ).length;
    const totalCount = documents.length;
    const isFullyVerified = user.verifiedSeller || user.kycStatus === 'VERIFIED';
    const completionPercentage = isFullyVerified
      ? 100
      : totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

    return res.json({
      kycStatus: {
        isFullyVerified,
        completionPercentage,
        verifiedCount,
        totalCount,
        documents,
        verificationBadgeText:
          isFullyVerified ? 'Fully Verified Business' : 'Verification In Progress',
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

    const { documentId, fileName } = req.body ?? {};
    if (typeof documentId !== 'string' || !documentId.trim()) {
      return res.status(400).json({ error: 'Missing documentId' });
    }
    if (fileName !== undefined && typeof fileName !== 'string') {
      return res.status(400).json({ error: 'fileName must be a string' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { kycDocuments: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const documents: Prisma.JsonObject[] = Array.isArray(user.kycDocuments)
      ? user.kycDocuments.filter(
          (document): document is Prisma.JsonObject =>
            document !== null && typeof document === 'object' && !Array.isArray(document)
        )
      : [];
    const normalizedId = documentId.trim();
    const normalizedFileName = typeof fileName === 'string' && fileName.trim()
      ? fileName.trim()
      : normalizedId;
    const existingIndex = documents.findIndex((document) => document.id === normalizedId);
    if (existingIndex >= 0) {
      documents[existingIndex] = {
        ...documents[existingIndex],
        fileName: normalizedFileName,
        status: 'Received',
      };
    } else {
      documents.push({
        id: normalizedId,
        fileName: normalizedFileName,
        status: 'Received',
        fileUrl: null,
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { kycDocuments: documents },
    });

    return res.json({
      success: true,
      message: `Re-upload for ${normalizedFileName} recorded. KYC team will review it.`,
      documentId: normalizedId,
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
    return res.json({ quotes: transportQuotes, total: transportQuotes.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch transport quotes' });
  }
});

// GET /api/business-services/shipment-tower
// Returns real active shipments from DB for the authenticated user.
router.get('/shipment-tower', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const shipments = await prisma.logisticsBooking.findMany({
      where: { userId: req.user.id, status: { not: 'DELIVERED' } },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = shipments.map((shipment) => ({
      id: shipment.id,
      trackingNo: shipment.shipmentRef || shipment.id.slice(0, 8).toUpperCase(),
      origin: shipment.origin,
      destination: shipment.destination,
      carrier: shipment.carrierName || shipment.transportMode || 'Carrier not assigned',
      status: shipment.status,
      statusStep: shipment.status === 'IN_TRANSIT' ? 3 : shipment.status === 'CONFIRMED' ? 2 : 1,
      totalSteps: 5,
      eta: shipment.transitDays ? `${shipment.transitDays} Days` : 'Not available',
      sharedFolderUrl: shipment.lrDocUrl || undefined,
      podStatus: shipment.epodUrl ? 'Verified & Signed POD Available' : 'E-POD Pending Signature',
    }));
    const activeShipment = shipments[0];
    const milestoneFields = [
      ['Booked', activeShipment?.bookedAt],
      ['Picked up', activeShipment?.pickedUpAt],
      ['In transit', activeShipment?.inTransitAt],
      ['At destination', activeShipment?.atDestinationAt],
      ['Delivered / POD', activeShipment?.deliveredAt],
    ] as const;
    const currentMilestoneIndex = milestoneFields.reduce(
      (latest, [, timestamp], index) => timestamp ? index : latest,
      -1,
    );
    const milestones = milestoneFields.map(([name], index) => ({
      name,
      done: index <= currentMilestoneIndex,
      ...(index === currentMilestoneIndex ? { current: true } : {}),
    }));

    const sharedFolder = activeShipment
      ? [
          ['Rate confirmation', activeShipment.lrDocUrl],
          ['Packing list', activeShipment.packingListUrl],
          ['Transport document', activeShipment.ewayBillUrl],
          ['Proof of delivery', activeShipment.epodUrl],
        ].map(([name, url]) => ({
          name,
          status: url ? 'uploaded' : 'pending',
        }))
      : [];

    return res.json({
      activeShipmentsCount: mapped.length,
      activeShipments: mapped,
      onTime: 'N/A',
      needsAction: shipments.filter((shipment) => Boolean(shipment.exceptionNote)).length,
      currentShipment: activeShipment
        ? {
            id: activeShipment.shipmentRef || activeShipment.id,
            route: `${activeShipment.origin} to ${activeShipment.destination} | ${activeShipment.transportMode || 'Transport'}`,
            milestones,
            lastEvent: activeShipment.exceptionNote || `Status: ${activeShipment.status}`,
            sharedFolder,
            exceptionAlert: activeShipment.exceptionNote || 'No active shipment exceptions.',
            exceptionSubtext: activeShipment.exceptionNote
              ? 'Contact the carrier and record the resolution.'
              : 'Shipment updates are provided by the carrier.',
          }
        : null,
      shipmentLifecycle: [
        { step: 1, label: 'Request rates' },
        { step: 2, label: 'Compare / approve' },
        { step: 3, label: 'Book carrier' },
        { step: 4, label: 'Track milestones' },
        { step: 5, label: 'Reconcile / close' },
      ],
      exampleText: null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch shipment control tower' });
  }
});

// GET /api/business-services/packaging-requirements
// Returns platform-level packaging options from DB.
router.get('/packaging-requirements', async (_req, res) => {
  try {
    return res.json({ requirements: packagingRequirements, total: packagingRequirements.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch packaging requirements' });
  }
});

// GET /api/business-services/checklist
// Returns the authenticated user's KYC onboarding checklist from DB.
router.get('/checklist', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const [user, listingsCount] = await Promise.all([
      prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        gstNumber: true,
        panNumber: true,
        bankVerified: true,
        verifiedSeller: true,
        kycStatus: true,
      },
      }),
      prisma.listing.count({ where: { sellerId: req.user.id } }),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const checklist = [
      { id: 'step-1', title: 'GSTIN & PAN Business Identity', completed: Boolean(user.gstNumber && user.panNumber) },
      { id: 'step-2', title: 'Bank Account & Cancelled Cheque Verification', completed: user.bankVerified },
      { id: 'step-3', title: 'Factory / Warehouse Site Location Audit', completed: user.verifiedSeller || user.kycStatus === 'VERIFIED' },
      { id: 'step-4', title: 'Industrial Product Catalog Upload (5+ Items)', completed: listingsCount >= 5 },
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

    const { preferredDate, preferredTime, topic } = req.body ?? {};
    if (typeof preferredDate !== 'string' || typeof preferredTime !== 'string' || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'preferredDate and preferredTime are required' });
    }

    const scheduledAt = new Date(`${preferredDate}T${preferredTime}`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'Appointment date and time must be in the future' });
    }

    const appointment = await prisma.businessAppointment.create({
      data: {
        userId: req.user.id,
        preferredDate: scheduledAt,
        preferredTime,
        topic: typeof topic === 'string' ? topic : null,
      },
    });
    return res.json({
      success: true,
      message: `Appointment request received for ${preferredDate} at ${preferredTime}.`,
      appointment,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to schedule adviser appointment' });
  }
});

// POST /api/business-services/corporate-request
// Persists a corporate registration or trademark consultation request.
router.post('/corporate-request', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { serviceType, companyName, entityType, details } = req.body ?? {};
    if (!['TRADEMARK', 'FIRM_REGISTRATION'].includes(serviceType)) {
      return res.status(400).json({ error: 'Invalid corporate service type' });
    }
    if (typeof companyName !== 'string' || !companyName.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (entityType !== undefined && !['MSME', 'PvtLtd', 'LLP', 'Proprietorship'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }
    if (details !== undefined && typeof details !== 'string') {
      return res.status(400).json({ error: 'Request details must be a string' });
    }

    const request = await prisma.corporateRequest.create({
      data: {
        userId: req.user.id,
        userName: req.user.name,
        companyName: companyName.trim(),
        serviceType,
        entityType: entityType || null,
        details: typeof details === 'string' ? details.trim() : '',
      },
    });
    return res.json({ success: true, request });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit corporate request' });
  }
});

// POST /api/business-services/gstin-lookup
router.post('/gstin-lookup', async (req, res) => {
  try {
    if (!(req as AuthenticatedRequest).user?.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const gstin = req.body?.gstin;
    if (typeof gstin !== 'string' || !gstin.trim()) {
      return res.status(400).json({ error: 'Missing GSTIN number' });
    }
    const data = await fetchLiveGSTINData(gstin.trim());
    if (!data.valid) return res.status(data.verificationUnavailable ? 503 : 400).json({ success: false, data });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected GSTIN lookup error', err instanceof Error ? err.name : 'UnknownError');
    return res.status(500).json({ error: 'GSTIN lookup failed unexpectedly' });
  }
});

// POST /api/business-services/pan-lookup
router.post('/pan-lookup', async (req, res) => {
  try {
    if (!(req as AuthenticatedRequest).user?.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { pan, name, dateOfBirth, consent, reason } = req.body ?? {};
    if (typeof pan !== 'string' || !pan.trim()) {
      return res.status(400).json({ error: 'Missing PAN number' });
    }
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name as printed on PAN is required' });
    }
    if (!isValidPanDateOfBirth(dateOfBirth)) {
      return res.status(400).json({ error: 'Date of birth must be a real date in DD/MM/YYYY format' });
    }
    if (consent !== true) {
      return res.status(400).json({ error: 'Explicit user consent is required for PAN verification' });
    }
    if (typeof reason !== 'string' || reason.trim().length < 20) {
      return res.status(400).json({ error: 'Verification reason must be at least 20 characters' });
    }

    const data = await fetchLivePANData(pan.trim(), {
      name: name.trim(),
      dateOfBirth,
      consent: true,
      reason: reason.trim(),
    });
    if (!data.valid) return res.status(data.verificationUnavailable ? 503 : 400).json({ success: false, data });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected PAN lookup error', err instanceof Error ? err.name : 'UnknownError');
    return res.status(500).json({ error: 'PAN lookup failed unexpectedly' });
  }
});

// GET /api/business-services/pincode-lookup
router.get('/pincode-lookup', async (req, res) => {
  try {
    const pincode = req.query.pincode;
    if (typeof pincode !== 'string' || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ success: false, error: 'Pincode must be exactly 6 digits' });
    }

    const data = await fetchLivePincodeAddressData(pincode);
    if (!data.valid) {
      return res.status(data.verificationUnavailable ? 503 : 404).json({ success: false, data });
    }
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected postal PIN lookup error', err instanceof Error ? err.name : 'UnknownError');
    return res.status(500).json({ success: false, error: 'Postal PIN lookup failed unexpectedly' });
  }
});

// GET /api/business-services/fx-rates
router.get('/fx-rates', async (_req, res) => {
  try {
    const fx = await fetchLiveFxRates();
    return res.json({ success: true, fx });
  } catch (err: any) {
    const status = err instanceof MarketDataUnavailableError ? 503 : 500;
    return res.status(status).json({ error: err.message });
  }
});

export default router;
