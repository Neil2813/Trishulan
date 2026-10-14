import { Router } from "express";
import { prisma } from "../lib/db";

const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    const member = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        companyName: true,
        role: true,
        verifiedSeller: true,
      },
    });

    if (!member) {
      return res.status(404).json({ error: "Digital ID not found" });
    }

    return res.json(member);
  } catch (error) {
    return next(error);
  }
});

export default router;
