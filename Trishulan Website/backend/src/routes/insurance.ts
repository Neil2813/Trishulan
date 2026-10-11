/**
 * insurance.ts — Health Insurance Access routes (Guide p. 24)
 *
 * Endpoints:
 *   GET  /api/insurance/plans        — Returns plan comparison data
 *   POST /api/insurance/lead         — Submit callback request / referral lead (auth required)
 *   GET  /api/insurance/leads        — List user's insurance enquiries (auth required)
 */

import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/db';

const router = Router();

// ────────────────────────────────────────────────────────────────────────────
// Static plan data (Guide p. 24 — Plan A / B / C)
// ────────────────────────────────────────────────────────────────────────────
const INSURANCE_PLANS = [
  {
    id: 'plan-a',
    name: 'Plan A — Basic Group Cover',
    sumInsured: '₹5 Lakh / Employee',
    coverageType: 'GROUP_EMPLOYEE',
    network: 'Basic network hospitals',
    daycarecover: true,
    waitingPeriod: '30 days (pre-existing: 48 months)',
    exclusions: 'Cosmetic surgery, dental (unless accident)',
    copay: '10% co-pay on non-network claims',
    premiumBasis: 'Per employee per annum',
    estimatedPremium: '₹4,500 – ₹6,000 / employee / year',
    bestFor: '10–50 employees | Manufacturing units | Small factories',
    highlight: false,
    badge: 'Entry Level',
  },
  {
    id: 'plan-b',
    name: 'Plan B — Comprehensive Group Cover',
    sumInsured: '₹10 Lakh / Employee',
    coverageType: 'GROUP_EMPLOYEE',
    network: 'Pan-India network (5,000+ hospitals)',
    daycarecover: true,
    waitingPeriod: 'Zero waiting period (first day cover)',
    exclusions: 'War, self-inflicted injuries',
    copay: 'No co-pay on network hospitals',
    premiumBasis: 'Per employee per annum',
    estimatedPremium: '₹9,000 – ₹14,000 / employee / year',
    bestFor: '50–500 employees | Export-oriented units | Mid-size companies',
    highlight: true,
    badge: 'Most Comprehensive',
  },
  {
    id: 'plan-c',
    name: 'Plan C — Custom Group Quote',
    sumInsured: 'Custom (₹3L – ₹25L)',
    coverageType: 'CUSTOM',
    network: 'Customisable network',
    daycarecover: true,
    waitingPeriod: 'Negotiable',
    exclusions: 'As per policy wordings',
    copay: 'Optional co-pay for lower premium',
    premiumBasis: 'Group size, age band, industry risk',
    estimatedPremium: 'Request a quote',
    bestFor: 'Business owners | OPD add-ons | Co-pay options | 500+ employees',
    highlight: false,
    badge: 'Custom Quote',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// GET /api/insurance/plans
// Returns the plan comparison matrix (Guide p. 24)
// ────────────────────────────────────────────────────────────────────────────
router.get('/plans', async (_req, res) => {
  try {
    return res.json({
      plans: INSURANCE_PLANS,
      disclaimer:
        'Trishulan facilitates secure introduction to licensed insurance intermediaries. ' +
        'Coverage details are indicative and subject to insurer underwriting. ' +
        'No medical records are collected or disclosed during the referral process.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch insurance plans' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/insurance/lead
// Submit a callback / referral request without exposing medical records.
// Body: { coverageType, employeeCount, coverageSum, contactPhone, companyName, selectedPlan, consentGranted }
// Auth required.
// ────────────────────────────────────────────────────────────────────────────
router.post('/lead', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const {
      coverageType,
      employeeCount,
      coverageSum,
      contactPhone,
      companyName,
      selectedPlan,
      consentGranted,
    } = req.body;

    if (!contactPhone) {
      return res.status(400).json({ error: 'Contact phone is required for callback scheduling' });
    }
    if (!consentGranted) {
      return res.status(400).json({
        error: 'Consent is required before sharing details with an insurance intermediary',
      });
    }
    if (!coverageType) {
      return res.status(400).json({ error: 'coverageType is required' });
    }
    if (!coverageSum) {
      return res.status(400).json({ error: 'coverageSum is required' });
    }
    if (!employeeCount || isNaN(Number(employeeCount))) {
      return res.status(400).json({ error: 'employeeCount must be a valid number' });
    }

    const lead = await prisma.healthInsuranceLead.create({
      data: {
        userId: req.user.id,
        coverageType,
        employeeCount: Number(employeeCount),
        coverageSum,
        contactPhone,
        companyName: companyName || req.user.companyName || null,
        selectedPlan: selectedPlan || null,
        consentGranted: Boolean(consentGranted),
        status: 'REQUESTED',
      },
    });

    return res.json({
      success: true,
      message: 'Your insurance enquiry has been received. A licensed advisor will contact you within 1 business day.',
      lead,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit insurance enquiry' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/insurance/leads
// List insurance enquiries for the current user (auth required)
// ────────────────────────────────────────────────────────────────────────────
router.get('/leads', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const leads = await prisma.healthInsuranceLead.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ leads });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch insurance enquiries' });
  }
});

export default router;
