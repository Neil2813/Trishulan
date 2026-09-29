import { Router } from "express";
import { fetchLiveGSTINData, fetchLivePANData } from "../services/kycService";

const router = Router();

// POST /api/kyc/verify-gstin
router.post("/verify-gstin", async (req, res) => {
  try {
    const { gstin } = req.body;
    if (!gstin) return res.status(400).json({ valid: false, error: "GSTIN is required" });

    const result = await fetchLiveGSTINData(gstin);
    if (!result.valid) return res.status(400).json(result);

    return res.json({ success: true, ...result, statusMessage: "GSTIN Verified & Authenticated" });
  } catch (err: any) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// POST /api/kyc/verify-pan
router.post("/verify-pan", async (req, res) => {
  try {
    const { pan } = req.body;
    if (!pan) return res.status(400).json({ valid: false, error: "PAN number is required" });

    const result = await fetchLivePANData(pan);
    if (!result.valid) return res.status(400).json(result);

    return res.json({ success: true, ...result, statusMessage: "PAN Taxpayer Record Authenticated" });
  } catch (err: any) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

export default router;
