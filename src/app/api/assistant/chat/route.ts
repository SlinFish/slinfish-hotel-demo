import { NextRequest, NextResponse } from "next/server";

// Local development transport only. Never expose the loopback-only assistant as a
// public Hotel Demo API without a separate deployment and security review.
export const runtime = "nodejs";
const upstream = "http://127.0.0.1:3000/api/chat";
const fail = (status: number, error: string) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return fail(404, "Not found");
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return fail(403, "Origin not allowed");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return fail(415, "JSON required");
  const size = Number(request.headers.get("content-length"));
  if (Number.isFinite(size) && size > 12000) return fail(413, "Request too large");

  let input: unknown;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 12000) return fail(413, "Request too large");
    input = JSON.parse(raw);
  } catch {
    return fail(400, "Invalid JSON");
  }
  if (!input || typeof input !== "object" || Array.isArray(input) ||
    Object.keys(input).length !== 1 || !Object.hasOwn(input, "message") ||
    typeof (input as { message: unknown }).message !== "string")
    return fail(400, "Invalid request");
  const message = (input as { message: string }).message;
  if (!message.trim() || message.length > 1000) return fail(400, "Invalid message");

  const incomingContext = request.headers.get("x-chat-context");
  const incomingSequence = request.headers.get("x-chat-sequence");
  if (!incomingContext || incomingContext.length > 128 ||
    (incomingContext !== "new" && !/^[A-Za-z0-9_-]{43}$/.test(incomingContext)) ||
    (incomingContext === "new" && incomingSequence !== null) ||
    (incomingContext !== "new" && (!incomingSequence || !/^[1-6]$/.test(incomingSequence))))
    return fail(400, "Invalid conversation context");

  try {
    const response = await fetch(upstream, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
      headers: {
        "Content-Type": "application/json",
        "X-Chat-Context": incomingContext,
        ...(incomingSequence ? { "X-Chat-Sequence": incomingSequence } : {}),
      },
      body: JSON.stringify({ business: "hotel", message }),
    });
    const text = await response.text();
    if (text.length > 12000) return fail(502, "Assistant response too large");
    const result = JSON.parse(text);
    if (!result || typeof result !== "object" || typeof result.message !== "string" ||
      typeof result.handoff !== "boolean" || !["demo", "gemini"].includes(result.mode) ||
      !Array.isArray(result.sources))
      return fail(502, "Invalid assistant response");
    const headers = new Headers({ "Cache-Control": "no-store" });
    const context = response.headers.get("x-chat-context");
    const sequence = response.headers.get("x-chat-sequence");
    if (context && /^[A-Za-z0-9_-]{43}$/.test(context) && sequence && /^[1-6]$/.test(sequence)) {
      headers.set("X-Chat-Context", context);
      headers.set("X-Chat-Sequence", sequence);
    }
    return NextResponse.json(result, { status: response.status, headers });
  } catch {
    return fail(503, "Local assistant unavailable");
  }
}
