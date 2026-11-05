import { NextRequest, NextResponse } from "next/server";

// Strictly local development bridge to the existing SlinFish demo inquiry store.
// Public static builds cannot include this route; production returns 404.
export const runtime = "nodejs";
const upstream = "http://127.0.0.1:3000/api/lead";
const fail = (status: number, error: string) =>
  NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

function validText(value: unknown, limit: number, multiline = false): value is string {
  return typeof value === "string" && value.length <= limit && value.trim().length > 0 &&
    value.isWellFormed() && !(multiline
      ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/
      : /[\u0000-\u001f\u007f-\u009f]/).test(value);
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return fail(404, "Not found");
  const origin = request.headers.get("origin");
  // Browsers send Origin on cross-origin requests; require the hotel's own origin.
  if (origin !== request.nextUrl.origin) return fail(403, "Origin not allowed");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
    return fail(415, "JSON required");
  if (request.headers.get("content-encoding") && request.headers.get("content-encoding") !== "identity")
    return fail(415, "Unsupported encoding");
  const size = Number(request.headers.get("content-length"));
  if (Number.isFinite(size) && size > 12000) return fail(413, "Request too large");
  let data: unknown;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 12000) return fail(413, "Request too large");
    data = JSON.parse(raw);
  } catch { return fail(400, "Invalid JSON"); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return fail(400, "Invalid inquiry");
  const value = data as Record<string, unknown>;
  const fields = ["name", "contact", "question", "consent"];
  if (Object.keys(value).length !== fields.length || Object.keys(value).some((key) => !fields.includes(key)) ||
    !validText(value.name, 100) || !validText(value.contact, 150) ||
    !validText(value.question, 400, true) || value.consent !== true)
    return fail(400, "Invalid fictional inquiry or consent");

  try {
    const response = await fetch(upstream, {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business: "hotel",
        name: value.name,
        contact: value.contact,
        question: value.question,
        consent: true,
      }),
    });
    const raw = await response.text();
    if (raw.length > 4000) return fail(502, "Invalid assistant response");
    const result: unknown = JSON.parse(raw);
    if (!result || typeof result !== "object" || Array.isArray(result)) return fail(502, "Invalid assistant response");
    const answer = result as Record<string, unknown>;
    if (response.status === 201 && answer.stored === true && typeof answer.inquiryId === "string") {
      return NextResponse.json({
        stored: true,
        inquiryId: answer.inquiryId,
        message: "Fictional inquiry saved locally. No notification or reservation was made.",
      }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }
    if (response.status === 200 && answer.stored === false)
      return NextResponse.json({
        stored: false,
        message: "Inquiry validated but storage was not configured. Nothing was sent.",
      }, { status: 200, headers: { "Cache-Control": "no-store" } });
    if (response.status === 429) return fail(429, "Too many inquiry attempts");
    if (response.status === 400) return fail(400, "Invalid inquiry");
    return fail(503, "Inquiry storage unavailable");
  } catch {
    // A connection failure can happen after an upstream commit. Never claim a write failed.
    return fail(503, "Unable to confirm inquiry storage");
  }
}
