// Cloudflare Pages Function: public, hotel-only, no browser-visible secrets.
// This route is NOT the protected administrator or inquiry API.
const error = (status, message) =>
  Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
const validHandle = (value) => typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return error(403, "Origin not allowed");
  if (request.headers.get("Content-Type")?.split(";")[0].toLowerCase() !== "application/json")
    return error(415, "JSON required");
  if (request.headers.get("Content-Encoding")) return error(415, "Unsupported encoding");
  const api = env.PUBLIC_HOTEL_CHAT_UPSTREAM;
  const token = env.PUBLIC_CHAT_BRIDGE_TOKEN;
  if (typeof api !== "string" || !/^https:\/\/[A-Za-z0-9.-]+$/.test(api) ||
    typeof token !== "string" || token.length < 32)
    return error(503, "Hotel assistant is not available");
  let input;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 12000) return error(413, "Too large");
    input = JSON.parse(raw);
  } catch { return error(400, "Invalid JSON"); }
  if (!input || typeof input !== "object" || Array.isArray(input) ||
    Object.keys(input).length !== 1 || typeof input.message !== "string" ||
    input.message.length > 1000 || !input.message.trim()) return error(400, "Invalid question");
  const handle = request.headers.get("X-Chat-Context");
  const sequence = request.headers.get("X-Chat-Sequence");
  if (!handle || !(handle === "new" || validHandle(handle)) ||
    (handle === "new" && sequence !== null) ||
    (handle !== "new" && (!sequence || !/^[1-9][0-9]{0,2}$/.test(sequence))))
    return error(400, "Invalid context");
  try {
    const response = await fetch(api + "/v1/hotel/chat", {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
      headers: {
        "Content-Type": "application/json",
        "X-Bridge-Token": token,
        "X-Chat-Context": handle,
        ...(sequence ? { "X-Chat-Sequence": sequence } : {}),
        "X-Client-IP": request.headers.get("CF-Connecting-IP") || "unknown",
      },
      body: JSON.stringify({ message: input.message }),
    });
    if (!response.ok) return error(response.status === 429 ? 429 : 503,
      response.status === 429 ? "Too many requests" : "Hotel assistant is not available");
    const raw = await response.text();
    if (raw.length > 12000) return error(502, "Invalid assistant response");
    const result = JSON.parse(raw);
    if (!result || typeof result !== "object" || typeof result.message !== "string" ||
      typeof result.handoff !== "boolean" || result.mode !== "demo" ||
      !Array.isArray(result.sources) ||
      result.sources.some((s) => typeof s !== "string" || !s.startsWith("hotel:")))
      return error(502, "Invalid assistant response");
    const headers = new Headers({ "Cache-Control": "no-store" });
    const nextHandle = response.headers.get("X-Chat-Context");
    const nextSequence = response.headers.get("X-Chat-Sequence");
    if (validHandle(nextHandle) && /^[1-9][0-9]{0,2}$/.test(nextSequence ?? "")) {
      headers.set("X-Chat-Context", nextHandle);
      headers.set("X-Chat-Sequence", nextSequence);
    }
    return Response.json(result, { headers });
  } catch { return error(503, "Hotel assistant is not available"); }
}
export function onRequest() { return error(405, "Method not allowed"); }
