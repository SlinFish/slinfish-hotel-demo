import { z } from "zod";

// Contract for future H-3 ingress. This is NOT exposed by an API in H-3A.
export const leadSources = ["CHAT_FORM", "HOTEL_FORM", "OTHER"] as const;
export const leadStatuses = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const leadSubmissionSchema = z.strictObject({
  businessId: z.string().trim().min(1).max(64).regex(/^[a-z][a-z0-9_-]*$/),
  source: z.enum(leadSources),
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(1).max(150),
  question: z.string().trim().min(1).max(400),
  consent: z.literal(true),
  idempotencyKey: z.string().min(16).max(128).regex(/^[A-Za-z0-9_-]+$/).optional(),
  hotelStay: z.strictObject({
    roomType: z.string().trim().min(1).max(100).optional(),
    checkIn: z.iso.date().optional(),
    checkOut: z.iso.date().optional(),
    guests: z.number().int().min(1).max(8).optional(),
  }).superRefine((stay, context) => {
    if (stay.checkIn && stay.checkOut && stay.checkOut <= stay.checkIn) {
      context.addIssue({ code: "custom", path: ["checkOut"], message: "Check-out must be after check-in" });
    }
  }).optional(),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

// Allowed management actions, independent of legacy hotel booking status.
export const leadStatusTransitions: Readonly<Record<LeadStatus, readonly LeadStatus[]>> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["QUALIFIED", "LOST"],
  QUALIFIED: ["CONTACTED", "WON", "LOST"],
  WON: ["QUALIFIED"],
  LOST: ["CONTACTED"],
};

export function canTransitionLeadStatus(from: LeadStatus, to: LeadStatus): boolean {
  return leadStatusTransitions[from].includes(to);
}

export function validObservedLeadVersion(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1;
}
