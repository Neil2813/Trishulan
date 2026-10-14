import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export function isAdminEmailAllowed(email: string): boolean {
  const allowedEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(email.trim().toLowerCase());
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.id) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (!req.user.isAdmin || !isAdminEmailAllowed(req.user.email)) {
    res.status(403).json({ error: "Administrator access required" });
    return;
  }
  next();
}
