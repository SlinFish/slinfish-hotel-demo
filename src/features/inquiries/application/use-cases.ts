import { inquirySchema, allowedStatuses } from "../domain/inquiry";
import type { InquiryRepository, InquiryStatus } from "../domain/ports";

export async function submitInquiry(repo: InquiryRepository, raw: unknown) {
  const result = inquirySchema.safeParse(raw);

  if (!result.success) {
    return {
      ok: false as const,
      errors: result.error.flatten(),
    };
  }

  if (result.data.website) {
    return {
      ok: true as const,
      id: "received",
    };
  }

  const data = {
    guestName: result.data.guestName,
    email: result.data.email,
    phone: result.data.phone,
    roomType: result.data.roomType,
    checkIn: result.data.checkIn,
    checkOut: result.data.checkOut,
    guests: result.data.guests,
    message: result.data.message,
  };

  const created = await repo.create(data);

  return {
    ok: true as const,
    id: created.id,
  };
}

export async function setInquiryStatus(
  repo: InquiryRepository,
  id: string,
  status: string,
) {
  if (!id || !allowedStatuses.includes(status as InquiryStatus)) {
    throw new Error("Invalid status update");
  }

  await repo.updateStatus(id, status as InquiryStatus);
}
