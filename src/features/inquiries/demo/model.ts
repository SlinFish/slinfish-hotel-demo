import { rooms } from "@/features/rooms/catalog";
import type { InquiryStatus } from "../domain/ports";

export type DemoInquiry = Readonly<{
  id: string;
  guestName: string;
  email: string;
  roomType: "garden" | "terrace" | "family";
  checkIn: string;
  checkOut: string;
  guests: number;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}>;
export type StatusFilter = InquiryStatus | "ALL";
export const demoStatuses: readonly InquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "CLOSED",
];

// Pure operations only: no repository, transport, storage, or framework dependencies.
export function filterDemoInquiries(
  records: readonly DemoInquiry[],
  query: string,
  status: StatusFilter,
): DemoInquiry[] {
  const term = query.trim().toLocaleLowerCase("en");
  return records.filter(
    (record) =>
      (status === "ALL" || record.status === status) &&
      [
        record.guestName,
        record.email,
        record.id,
        record.roomType,
        rooms.find((room) => room.id === record.roomType)?.name ?? "",
      ].some((value) => value.toLocaleLowerCase("en").includes(term)),
  );
}

export function summarizeDemoInquiries(records: readonly DemoInquiry[]) {
  return records.reduce(
    (counts, record) => {
      counts.total += 1;
      counts[record.status] += 1;
      return counts;
    },
    { total: 0, NEW: 0, CONTACTED: 0, CLOSED: 0 },
  );
}

export function changeDemoStatus(
  records: readonly DemoInquiry[],
  id: string,
  status: InquiryStatus,
): DemoInquiry[] {
  if (!demoStatuses.includes(status)) throw new Error("Unknown inquiry status");
  if (!records.some((record) => record.id === id))
    throw new Error("Unknown demo inquiry");
  return records.map((record) =>
    record.id === id ? { ...record, status } : record,
  );
}
