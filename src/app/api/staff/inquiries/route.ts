import { NextResponse } from "next/server";
import { isStaffAuthorized } from "@/lib/staff-auth";
import { prismaInquiryRepository } from "@/features/inquiries/infrastructure/prisma-repository";
import { setInquiryStatus } from "@/features/inquiries/application/use-cases";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!isStaffAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(
      { inquiries: await prismaInquiryRepository.list() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }
}
export async function PATCH(request: Request) {
  if (!isStaffAuthorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, status } = await request.json();
    await setInquiryStatus(prismaInquiryRepository, id, status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request or record" },
      { status: 400 },
    );
  }
}
