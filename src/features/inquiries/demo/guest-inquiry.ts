import { inquirySchema } from "../domain/inquiry";
// Validation only. Never persist, transmit or retain the supplied input.
export function simulateGuestInquiry(raw: unknown) {
  const result = inquirySchema.safeParse(raw);
  if (!result.success)
    return {
      ok: false as const,
      message:
        result.error.issues[0]?.message ?? "Please review your stay details.",
    };
  return {
    ok: true as const,
    message:
      "Simulation complete. Nothing was sent or stored; no reservation was made.",
  };
}
