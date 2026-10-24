import { prisma } from "@/lib/prisma";
import type {
  InquiryRepository,
  InquiryRecord,
  InquiryStatus,
} from "../domain/ports";
export const prismaInquiryRepository: InquiryRepository = {
  async create(input) {
    const record = await prisma.inquiry.create({
      data: {
        ...input,
        checkIn: new Date(input.checkIn + "T00:00:00Z"),
        checkOut: new Date(input.checkOut + "T00:00:00Z"),
      },
    });
    return { id: record.id };
  },
  async list() {
    const rows = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((r) => ({
      ...r,
      checkIn: r.checkIn.toISOString().slice(0, 10),
      checkOut: r.checkOut.toISOString().slice(0, 10),
    })) as InquiryRecord[];
  },
  async updateStatus(id, status: InquiryStatus) {
    await prisma.inquiry.update({ where: { id }, data: { status } });
  },
};
