import { NextRequest, NextResponse } from "next/server";

// H-2: local-only fictional inquiry transport. Do not expose to the public
// without a separate production authorization, privacy and storage review.
export const runtime = "nodejs";
const upstream = "http://127.0.0.1:3000/api/lead";
const failure = (status: number, error: string) =>
  NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return failure(404, "Not found");
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return failure(403, "Origin not allowed");
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json")
    return failure(415, "JSON required");
  if (request.headers.get("content-encoding")) return failure(415, "Unsupported encoding");

  let input: unknown;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 12000) return failure(413, "Request too large");
    input = JSON.parse(raw);
  } catch {
    return failure(400, "Invalid JSON");
  }

  if (!input || typeof input !== "object" || Array.isArray(input) ||
      Object.keys(input).length !== 2 ||
      !Object.hasOwn(input, "question") || !Object.hasOwn(input, "consent"))
    return failure(400, "Invalid inquiry");

  const { question, consent } = input as { question: unknown; consent: unknown };
  if (typeof question !== "string" || !question.trim() || question.length > 400 ||
      !question.isWellFormed() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/.test(question) ||
      consent !== true)
    return failure(400, "Invalid inquiry or consent");

  try {
    const response = await fetch(upstream, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business: "hotel",
        name: "Aster Demo Guest",
        contact: "aster-demo@example.invalid",
        question,
        consent: true,
      }),
    });
    const result: unknown = await response.json();
    if (response.status === 201 && result && typeof result === "object" &&
        (result as { stored?: unknown }).stored === true &&
        typeof (result as { inquiryId?: unknown }).inquiryId === "string") {
      return NextResponse.json(
        { stored: true, message: "Fictional inquiry saved locally. No reservation or notification was created." },
        { status: 201, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (response.ok)
      return failure(503, "Inquiry storage is not configured. Nothing was saved.");
    if (response.status === 429) return failure(429, "Too many inquiries. Please try later.");
    return failure(503, "Inquiry was not confirmed saved.");
  } catch {
    return failure(503, "Unable to confirm inquiry storage. Check the local assistant.");
  }
}
