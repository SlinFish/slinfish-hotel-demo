import { NextResponse } from "next/server";
import { isStaffAuthorized } from "@/lib/staff-auth";
import {
  changeHotelLeadStatus, getHotelLead, hotelBusinessId,
  LeadManagementError, listHotelLeads, parseLeadStatusChange,
} from "@/features/inquiries/application/lead-management";

export const dynamic = "force-dynamic";

function failure(error: unknown) {
  if (error instanceof LeadManagementError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ error: "Inquiry service unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  if (!isStaffAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const businessId = hotelBusinessId();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const result = id ? { inquiry: await getHotelLead(businessId, id) } : { inquiries: await listHotelLeads(businessId) };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  if (!isStaffAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const businessId = hotelBusinessId();
    const input = parseLeadStatusChange(await request.json());
    const result = await changeHotelLeadStatus(businessId, input);
    return NextResponse.json({ inquiry: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    return failure(error);
  }
}
