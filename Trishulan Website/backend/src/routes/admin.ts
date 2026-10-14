import { CorporateStatus, LogisticsStatus, Prisma, RFQStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../lib/adminAuth";
import { prisma } from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();
router.use(requireAdmin);

const ticketStatuses = ["OPEN", "WAITING_ON_REPLY", "RESOLVED", "CLOSED"] as const;
const ticketPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const insuranceStatuses = ["REQUESTED", "HANDED_OFF", "CONTACTED", "CLOSED"] as const;
const appointmentStatuses = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

function respondToError(res: import("express").Response, error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }
  console.error(message, error instanceof Error ? error.name : "UnknownError");
  return res.status(500).json({ error: message });
}

router.get("/overview", async (_req: AuthenticatedRequest, res) => {
  try {
    const [
      users,
      buyers,
      sellers,
      verifiedSellers,
      listings,
      publishedListings,
      rfqs,
      openRfqs,
      pendingKyc,
      openTickets,
      insuranceFollowUps,
      activeShipments,
      shipmentExceptions,
      openCorporateRequests,
      pendingAppointments,
      listingRows,
      kycQueue,
      tickets,
      insuranceLeads,
      shipments,
      corporateRequests,
      appointments,
      rfqRows,
      accounts,
      auditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.user.count({ where: { role: "SELLER", verifiedSeller: true } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { isPublished: true } }),
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: { in: ["OPEN", "IN_NEGOTIATION"] } } }),
      prisma.user.count({ where: { role: "SELLER", verifiedSeller: false } }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "WAITING_ON_REPLY"] } } }),
      prisma.healthInsuranceLead.count({ where: { status: { in: ["REQUESTED", "HANDED_OFF"] } } }),
      prisma.logisticsBooking.count({ where: { status: { not: "DELIVERED" } } }),
      prisma.logisticsBooking.count({ where: { exceptionNote: { not: null } } }),
      prisma.corporateRequest.count({ where: { status: { not: "COMPLETED" } } }),
      prisma.businessAppointment.count({ where: { status: { in: ["SCHEDULED", "CONFIRMED"] } } }),
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { seller: { select: { companyName: true, verifiedSeller: true } } },
      }),
      prisma.user.findMany({
        where: { role: "SELLER", verifiedSeller: false },
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
          gstNumber: true,
          kycStatus: true,
          kycDocuments: true,
          verifiedSeller: true,
          updatedAt: true,
        },
      }),
      prisma.supportTicket.findMany({
        where: { status: { in: ["OPEN", "WAITING_ON_REPLY"] } },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        take: 50,
        include: { user: { select: { name: true, email: true, companyName: true } } },
      }),
      prisma.healthInsuranceLead.findMany({
        where: { status: { not: "CLOSED" } },
        orderBy: { createdAt: "asc" },
        take: 50,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.logisticsBooking.findMany({
        where: { OR: [{ status: { not: "DELIVERED" } }, { exceptionNote: { not: null } }] },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, companyName: true } } },
      }),
      prisma.corporateRequest.findMany({
        where: { status: { not: "COMPLETED" } },
        orderBy: { createdAt: "asc" },
        take: 50,
        include: { user: { select: { name: true, email: true, phone: true } } },
      }),
      prisma.businessAppointment.findMany({
        where: { status: { in: ["SCHEDULED", "CONFIRMED"] } },
        orderBy: { preferredDate: "asc" },
        take: 50,
        include: { user: { select: { name: true, email: true, phone: true, companyName: true } } },
      }),
      prisma.rFQ.findMany({
        where: { status: { in: ["OPEN", "IN_NEGOTIATION"] } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { buyer: { select: { name: true, email: true, companyName: true } }, _count: { select: { quotes: true } } },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isAdmin: true,
          companyName: true,
          subscriptionTier: true,
          verifiedSeller: true,
          kycStatus: true,
          createdAt: true,
        },
      }),
      prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    ]);

    const safeInsuranceLeads = insuranceLeads.map((lead) => ({
      ...lead,
      contactPhone: lead.consentGranted ? lead.contactPhone : "",
    }));

    return res.json({
      summary: {
        users,
        buyers,
        sellers,
        verifiedSellers,
        listings,
        publishedListings,
        unpublishedListings: listings - publishedListings,
        rfqs,
        openRfqs,
        pendingKyc,
        openTickets,
        insuranceFollowUps,
        activeShipments,
        shipmentExceptions,
        openCorporateRequests,
        pendingAppointments,
      },
      queues: {
        listings: listingRows,
        kyc: kycQueue,
        tickets,
        insurance: safeInsuranceLeads,
        shipments,
        corporateRequests,
        appointments,
        rfqs: rfqRows,
        accounts,
        auditLogs,
      },
    });
  } catch (error) {
    return respondToError(res, error, "Failed to load administrator overview");
  }
});

router.patch("/kyc/:userId", async (req: AuthenticatedRequest, res) => {
  const input = z.union([
    z.object({
      status: z.enum(["PENDING", "UNDER_REVIEW", "VERIFIED"]),
    }).strict(),
    z.object({
      documentId: z.string().trim().min(1),
      documentStatus: z.enum(["RECEIVED", "NEEDS_REVIEW"]),
      reason: z.string().trim().max(500).optional(),
    }).strict(),
  ]).safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Invalid KYC update" });

  try {
    const update = input.data;
    const existingUser = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, role: true, kycDocuments: true },
    });
    if (!existingUser) return res.status(404).json({ error: "Seller account not found" });
    if (existingUser.role !== "SELLER") return res.status(409).json({ error: "KYC review is only available for seller accounts" });
    if ("documentId" in update) {
      const documentExists = Array.isArray(existingUser.kycDocuments) && existingUser.kycDocuments.some(
        (document) => document !== null
          && typeof document === "object"
          && !Array.isArray(document)
          && document.id === update.documentId,
      );
      if (!documentExists) return res.status(404).json({ error: "KYC document not found" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const documents: Prisma.JsonObject[] = Array.isArray(existingUser.kycDocuments)
        ? existingUser.kycDocuments.filter(
            (document): document is Prisma.JsonObject =>
              document !== null && typeof document === "object" && !Array.isArray(document),
          )
        : [];
      let kycStatus: string;
      let verifiedSeller: boolean;
      let nextDocuments = documents;
      let auditDetails: Prisma.InputJsonObject;
      if ("documentId" in update) {
        let documentFound = false;
        nextDocuments = documents.map((document) => {
          if (document.id !== update.documentId) return document;
          documentFound = true;
          return update.documentStatus === "NEEDS_REVIEW"
            ? {
                ...document,
                status: "Needs review",
                issueExplanation: update.reason || "Please upload a clear, complete copy so our team can verify this document.",
              }
            : { ...document, status: "Received", issueExplanation: "" };
        });
        if (!documentFound) throw new Error("KYC document not found");
        kycStatus = update.documentStatus === "NEEDS_REVIEW" ? "PENDING" : "UNDER_REVIEW";
        verifiedSeller = false;
        auditDetails = {
          documentId: update.documentId,
          documentStatus: update.documentStatus,
          reason: update.reason || "",
        };
      } else {
        kycStatus = update.status;
        verifiedSeller = update.status === "VERIFIED";
        if (verifiedSeller) {
          nextDocuments = documents.map((document) => {
            return { ...document, status: "Received", issueExplanation: "" };
          });
        }
        auditDetails = { status: update.status };
      }
      const user = await tx.user.update({
        where: { id: req.params.userId },
        data: { kycStatus, verifiedSeller, kycDocuments: nextDocuments },
        select: { id: true, kycStatus: true, verifiedSeller: true },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: "documentId" in update ? "KYC_DOCUMENT_REVIEWED" : "KYC_STATUS_UPDATED",
          targetType: "USER",
          targetId: user.id,
          details: auditDetails,
        },
      });
      return user;
    });
    return res.json({ success: true, user: result });
  } catch (error) {
    return respondToError(res, error, "Failed to update KYC status");
  }
});

router.patch("/tickets/:id", async (req: AuthenticatedRequest, res) => {
  const input = z.object({
    status: z.enum(ticketStatuses).optional(),
    priority: z.enum(ticketPriorities).optional(),
    assignedAgent: z.string().trim().max(120).nullable().optional(),
  }).strict().refine((data) => Object.keys(data).length > 0).safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Invalid support ticket update" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.update({ where: { id: req.params.id }, data: input.data });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: "SUPPORT_TICKET_UPDATED",
          targetType: "SUPPORT_TICKET",
          targetId: ticket.id,
          details: input.data as Prisma.InputJsonObject,
        },
      });
      return ticket;
    });
    return res.json({ success: true, ticket: result });
  } catch (error) {
    return respondToError(res, error, "Failed to update support ticket");
  }
});

router.patch("/insurance-leads/:id", async (req: AuthenticatedRequest, res) => {
  const input = z.object({ status: z.enum(insuranceStatuses) }).strict().safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Invalid insurance referral status" });

  try {
    const existingLead = await prisma.healthInsuranceLead.findUnique({
      where: { id: req.params.id },
      select: { id: true, consentGranted: true },
    });
    if (!existingLead) return res.status(404).json({ error: "Insurance referral not found" });
    if (input.data.status === "HANDED_OFF" && !existingLead.consentGranted) {
      return res.status(409).json({ error: "Cannot hand off an insurance referral without recorded consent" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.healthInsuranceLead.update({
        where: { id: req.params.id },
        data: { status: input.data.status },
        select: { id: true, status: true },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: "INSURANCE_REFERRAL_UPDATED",
          targetType: "INSURANCE_LEAD",
          targetId: lead.id,
          details: { status: input.data.status },
        },
      });
      return lead;
    });
    return res.json({ success: true, lead: result });
  } catch (error) {
    return respondToError(res, error, "Failed to update insurance referral");
  }
});

router.patch("/shipments/:id", async (req: AuthenticatedRequest, res) => {
  const input = z.object({
    status: z.nativeEnum(LogisticsStatus).optional(),
    exceptionNote: z.string().trim().max(1000).nullable().optional(),
  }).strict().refine((data) => Object.keys(data).length > 0).safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Invalid shipment update" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const milestoneDate = input.data.status ? new Date() : undefined;
      const shipment = await tx.logisticsBooking.update({
        where: { id: req.params.id },
        data: {
          ...input.data,
          ...(input.data.status === "CONFIRMED" ? { bookedAt: milestoneDate } : {}),
          ...(input.data.status === "IN_TRANSIT" ? { inTransitAt: milestoneDate } : {}),
          ...(input.data.status === "DELIVERED" ? { deliveredAt: milestoneDate } : {}),
        },
        select: { id: true, status: true, exceptionNote: true },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: "SHIPMENT_UPDATED",
          targetType: "LOGISTICS_BOOKING",
          targetId: shipment.id,
          details: {
            ...(input.data.status ? { status: input.data.status } : {}),
            ...(input.data.exceptionNote !== undefined ? { exceptionNote: input.data.exceptionNote ?? "" } : {}),
          },
        },
      });
      return shipment;
    });
    return res.json({ success: true, shipment: result });
  } catch (error) {
    return respondToError(res, error, "Failed to update shipment");
  }
});

router.patch("/corporate-requests/:id", async (req: AuthenticatedRequest, res) => {
  const input = z.object({ status: z.nativeEnum(CorporateStatus) }).strict().safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Invalid corporate request status" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.corporateRequest.update({
        where: { id: req.params.id },
        data: { status: input.data.status },
        select: { id: true, status: true },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: "CORPORATE_REQUEST_UPDATED",
          targetType: "CORPORATE_REQUEST",
          targetId: request.id,
          details: { status: input.data.status },
        },
      });
      return request;
    });
    return res.json({ success: true, request: result });
  } catch (error) {
    return respondToError(res, error, "Failed to update corporate request");
  }
});

router.patch("/appointments/:id", async (req: AuthenticatedRequest, res) => {
  const input = z.object({ status: z.enum(appointmentStatuses) }).strict().safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Invalid appointment status" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const appointment = await tx.businessAppointment.update({
        where: { id: req.params.id },
        data: { status: input.data.status },
        select: { id: true, status: true },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: "ADVISER_APPOINTMENT_UPDATED",
          targetType: "BUSINESS_APPOINTMENT",
          targetId: appointment.id,
          details: { status: input.data.status },
        },
      });
      return appointment;
    });
    return res.json({ success: true, appointment: result });
  } catch (error) {
    return respondToError(res, error, "Failed to update adviser appointment");
  }
});

router.patch("/rfqs/:id", async (req: AuthenticatedRequest, res) => {
  const input = z.object({ status: z.nativeEnum(RFQStatus) }).strict().safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Invalid RFQ status" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const rfq = await tx.rFQ.update({
        where: { id: req.params.id },
        data: { status: input.data.status },
        select: { id: true, status: true },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: "RFQ_STATUS_UPDATED",
          targetType: "RFQ",
          targetId: rfq.id,
          details: { status: input.data.status },
        },
      });
      return rfq;
    });
    return res.json({ success: true, rfq: result });
  } catch (error) {
    return respondToError(res, error, "Failed to update RFQ");
  }
});

router.patch("/listings/:id", async (req: AuthenticatedRequest, res) => {
  const input = z.object({ isPublished: z.boolean() }).strict().safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "isPublished must be a boolean" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.update({
        where: { id: req.params.id },
        data: { isPublished: input.data.isPublished },
        select: { id: true, isPublished: true },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user!.id,
          action: input.data.isPublished ? "LISTING_PUBLISHED" : "LISTING_UNPUBLISHED",
          targetType: "LISTING",
          targetId: listing.id,
          details: { isPublished: input.data.isPublished },
        },
      });
      return listing;
    });
    return res.json({ success: true, listing: result });
  } catch (error) {
    return respondToError(res, error, "Failed to update marketplace listing");
  }
});

export default router;
