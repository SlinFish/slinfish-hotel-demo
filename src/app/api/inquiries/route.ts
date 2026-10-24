import { NextResponse } from "next/server";
import { submitInquiry } from "@/features/inquiries/application/use-cases";
import { prismaInquiryRepository } from "@/features/inquiries/infrastructure/prisma-repository";
export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const result = await submitInquiry(prismaInquiryRepository, raw);
    if (!result.ok)
      return NextResponse.json(
        {
          error: "Please check your details",
          details: result.errors.fieldErrors,
        },
        { status: 400 },
      );
    return NextResponse.json(
      {
        message: "Inquiry received. This is not a confirmed reservation.",
        reference: result.id,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to process inquiry. Please try again later." },
      { status: 500 },
    );
  }
}
