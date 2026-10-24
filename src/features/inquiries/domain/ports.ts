import type { InquiryInput } from "./inquiry";
export type InquiryStatus = "NEW" | "CONTACTED" | "CLOSED";
export type InquiryRecord = Omit<InquiryInput, "website"> & {
  id: string;
  status: InquiryStatus;
  createdAt: Date;
};
export interface InquiryRepository {
  create(input: Omit<InquiryInput, "website">): Promise<{ id: string }>;
  list(): Promise<InquiryRecord[]>;
  updateStatus(id: string, status: InquiryStatus): Promise<void>;
}
