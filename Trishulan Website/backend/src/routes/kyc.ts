import { Router } from "express";
import {
  fetchLiveGSTINData,
  fetchLivePANData,
  isValidPanDateOfBirth,
} from "../services/kycService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// POST /api/kyc/verify-gstin
router.post("/verify-gstin", async (req, res) => {
  try {
    if (!(req as AuthenticatedRequest).user?.id) {
      return res.status(401).json({ valid: false, error: "Authentication required" });
    }

    const gstin = req.body?.gstin;
    if (typeof gstin !== "string" || !gstin.trim()) {
      return res.status(400).json({ valid: false, error: "GSTIN is required" });
    }

    const result = await fetchLiveGSTINData(gstin.trim());
    if (!result.valid) return res.status(result.verificationUnavailable ? 503 : 400).json(result);

    return res.json({ success: true, ...result, statusMessage: "GSTIN Verified & Authenticated" });
  } catch (err) {
    console.error("Unexpected GSTIN verification error", err instanceof Error ? err.name : "UnknownError");
    return res.status(500).json({ valid: false, error: "GSTIN verification failed unexpectedly" });
  }
});

// POST /api/kyc/verify-pan
router.post("/verify-pan", async (req, res) => {
  try {
    if (!(req as AuthenticatedRequest).user?.id) {
      return res.status(401).json({ valid: false, error: "Authentication required" });
    }

    const { pan, name, dateOfBirth, consent, reason } = req.body ?? {};
    if (typeof pan !== "string" || !pan.trim()) {
      return res.status(400).json({ valid: false, error: "PAN number is required" });
    }
    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ valid: false, error: "Name as printed on PAN is required" });
    }
    if (!isValidPanDateOfBirth(dateOfBirth)) {
      return res.status(400).json({ valid: false, error: "Date of birth must be a real date in DD/MM/YYYY format" });
    }
    if (consent !== true) {
      return res.status(400).json({ valid: false, error: "Explicit user consent is required for PAN verification" });
    }
    if (typeof reason !== "string" || reason.trim().length < 20) {
      return res.status(400).json({ valid: false, error: "Verification reason must be at least 20 characters" });
    }

    const result = await fetchLivePANData(pan.trim(), {
      name: name.trim(),
      dateOfBirth,
      consent: true,
      reason: reason.trim(),
    });
    if (!result.valid) return res.status(result.verificationUnavailable ? 503 : 400).json(result);

    return res.json({ success: true, ...result, statusMessage: "PAN Taxpayer Record Authenticated" });
  } catch (err) {
    console.error("Unexpected PAN verification error", err instanceof Error ? err.name : "UnknownError");
    return res.status(500).json({ valid: false, error: "PAN verification failed unexpectedly" });
  }
});

export default router;
