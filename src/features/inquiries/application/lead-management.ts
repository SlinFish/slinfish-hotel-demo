import { prisma } from "@/lib/prisma";
import { canTransitionLeadStatus, leadStatuses, validObservedLeadVersion } from "../domain/lead-inquiry";
import type { LeadStatus } from "../domain/lead-inquiry";

export class LeadManagementError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "LeadManagementError";
  }
}

export function hotelBusinessId(): string {
  const id = process.env.HOTEL_BUSINESS_ID;
  if (!id || !/^[a-z][a-z0-9_-]{0,63}$/.test(id)) {
    throw new LeadManagementError("Hotel business is not configured", 503);
  }
  return id;
}

export async function listHotelLeads(businessId: string) {
  return prisma.leadInquiry.findMany({
    where: { businessId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
    select: {
      id: true, source: true, name: true, contact: true, question: true,
      status: true, version: true, createdAt: true, updatedAt: true,
      hotelStay: { select: { roomType: true, checkIn: true, checkOut: true, guests: true } },
    },
  });
}

export async function getHotelLead(businessId: string, id: string) {
  const lead = await prisma.leadInquiry.findFirst({
    where: { businessId, id },
    include: {
      hotelStay: true,
      statusEvents: {
        orderBy: [{ version: "desc" }],
        take: 100,
        select: { id: true, previousStatus: true, nextStatus: true, actorId: true, version: true, createdAt: true },
      },
    },
  });
  if (!lead) throw new LeadManagementError("Inquiry not found", 404);
  return lead;
}

export function parseLeadStatusChange(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new LeadManagementError("Invalid status request", 400);
  }
  const obj = raw as Record<string, unknown>;
  if (Object.keys(obj).some((key) => !["id", "status", "version"].includes(key)) ||
      typeof obj.id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(obj.id) ||
      typeof obj.status !== "string" || !leadStatuses.includes(obj.status as LeadStatus) ||
      !validObservedLeadVersion(obj.version)) {
    throw new LeadManagementError("Invalid status request", 400);
  }
  return { id: obj.id, status: obj.status as LeadStatus, version: obj.version };
}

export async function changeHotelLeadStatus(
  businessId: string,
  input: ReturnType<typeof parseLeadStatusChange>,
  actorId = "hotel-staff",
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.leadInquiry.findFirst({
      where: { id: input.id, businessId },
      select: { status: true, version: true },
    });
    if (!current) throw new LeadManagementError("Inquiry not found", 404);
    if (current.version !== input.version) {
      throw new LeadManagementError("Inquiry changed; reload before updating", 409);
    }
    if (!canTransitionLeadStatus(current.status, input.status)) {
      throw new LeadManagementError("Status transition not allowed", 422);
    }
    const updated = await tx.leadInquiry.updateMany({
      where: { id: input.id, businessId, version: input.version, status: current.status },
      data: { status: input.status, version: { increment: 1 } },
    });
    if (updated.count !== 1) {
      throw new LeadManagementError("Inquiry changed; reload before updating", 409);
    }
    await tx.leadInquiryStatusEvent.create({
      data: {
        inquiryId: input.id,
        actorId,
        previousStatus: current.status,
        nextStatus: input.status,
        version: input.version + 1,
      },
    });
    return { id: input.id, status: input.status, version: input.version + 1 };
  });
}
