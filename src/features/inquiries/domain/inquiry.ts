import { z } from "zod";
import { rooms } from "@/features/rooms/catalog";
export const inquirySchema = z
  .object({
    guestName: z.string().trim().min(2).max(100),
    email: z.email().max(254),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    roomType: z.enum(rooms.map((room) => room.id) as [string, ...string[]]),
    checkIn: z.iso.date(),
    checkOut: z.iso.date(),
    guests: z.coerce.number().int().min(1).max(8),
    message: z.string().trim().max(1200).optional().or(z.literal("")),
    website: z.string().optional(), // honeypot; never persist
  })
  .refine((v) => v.checkOut > v.checkIn, {
    path: ["checkOut"],
    message: "Check-out must be after check-in",
  })
  .refine((v) => v.checkIn >= new Date().toISOString().slice(0, 10), {
    path: ["checkIn"],
    message: "Check-in must not be in the past",
  });
export type InquiryInput = z.infer<typeof inquirySchema>;
export const allowedStatuses = ["NEW", "CONTACTED", "CLOSED"] as const;
