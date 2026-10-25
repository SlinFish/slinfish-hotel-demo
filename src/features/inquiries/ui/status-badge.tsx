import type { InquiryStatus } from "../domain/ports";
export const statusLabels: Record<InquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};
export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span className={`status ${status.toLowerCase()}`}>
      <span aria-hidden="true">●</span> {statusLabels[status]}
    </span>
  );
}
