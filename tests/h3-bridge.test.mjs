import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const code = await readFile(new URL("../functions/api/assistant/chat.js", import.meta.url), "utf8");
const { onRequestPost, onRequest } = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
const token = "test-only-private-bridge-token-long-enough";
const url = "https://hotel.example/api/assistant/chat";
const upstream = "https://chat.example";
const env = { PUBLIC_HOTEL_CHAT_UPSTREAM: upstream, PUBLIC_CHAT_BRIDGE_TOKEN: token };
const request = (body, headers = {}) => new Request(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": "https://hotel.example", "X-Chat-Context": "new", ...headers },
  body: JSON.stringify(body),
});
test("bridge fails closed when no upstream secret or host is configured", async () => {
  const result = await onRequestPost({ request: request({ message: "How do I book a room?" }), env: {} });
  assert.equal(result.status, 503);
});
test("bridge refuses cross-origin, business overrides and invalid context", async () => {
  const wrongOrigin = await onRequestPost({ request: request({ message: "Hello" }, { Origin: "https://other.example" }), env });
  assert.equal(wrongOrigin.status, 403);
  const business = await onRequestPost({ request: request({ business: "auto", message: "Hello" }), env });
  assert.equal(business.status, 400);
  const sequence = await onRequestPost({ request: request({ message: "Hello" }, { "X-Chat-Sequence": "1" }), env });
  assert.equal(sequence.status, 400);
  const method = onRequest();
  assert.equal(method.status, 405);
});
test("bridge forwards hotel-only question, private secret and context; no client secret", async () => {
  const previous = globalThis.fetch;
  let called = false;
  globalThis.fetch = async (dest, init) => {
    called = true;
    assert.equal(dest, upstream + "/v1/hotel/chat");
    assert.equal(init.headers["X-Bridge-Token"], token);
    assert.deepEqual(JSON.parse(init.body), { message: "How do I book a room?" });
    assert.equal(init.headers["X-Chat-Context"], "new");
    return Response.json({
      message: "Leave your dates and guest count. Staff will confirm availability and rates.",
      handoff: false, mode: "demo", sources: ["hotel:booking"],
    }, { headers: { "X-Chat-Context": "x".repeat(43), "X-Chat-Sequence": "1" } });
  };
  try {
    const response = await onRequestPost({ request: request({ message: "How do I book a room?" }), env });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Chat-Context"), "x".repeat(43));
    assert.equal(response.headers.get("X-Chat-Sequence"), "1");
    const result = await response.json();
    assert.equal(result.mode, "demo");
    assert.equal(JSON.stringify(result).includes(token), false);
    assert.equal(called, true);
  } finally {
    globalThis.fetch = previous;
  }
});
