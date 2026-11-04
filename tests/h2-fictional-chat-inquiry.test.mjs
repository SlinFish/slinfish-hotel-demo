import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = async (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("H-2 inquiry transport is development-only and never forwards arbitrary business or contact", async () => {
  const code = await source("src/app/api/assistant/inquiry/route.ts");
  assert.match(code, /process\.env\.NODE_ENV !== "development"/);
  assert.match(code, /127\.0\.0\.1:3000\/api\/lead/);
  assert.match(code, /business: "hotel"/);
  assert.match(code, /contact: "aster-demo@example\.invalid"/);
  assert.match(code, /consent !== true/);
  assert.match(code, /response\.status === 201/);
  assert.match(code, /stored === true/);
  assert.match(code, /failure\(503,/);
});

test("H-2 form uses explicit opt-in consent and displays only confirmed stored result", async () => {
  const code = await source("src/components/fictional-chat-inquiry.tsx");
  assert.match(code, /type="checkbox"/);
  assert.match(code, /checked=\{consent\}/);
  assert.match(code, /status === "saved"/);
  assert.match(code, /response\.status === 201 && result\.stored === true/);
  assert.match(code, /name="|Fictional inquiry message/);
  assert.doesNotMatch(code, /localStorage|sessionStorage/);
  const chat = await source("src/components/hospitality-chat.tsx");
  assert.match(chat, /mode === "connected" && inquiryEnabled/);
  const home = await source("src/features/hotel/home.tsx");
  assert.match(home, /inquiryEnabled=\{process\.env\.NODE_ENV === "development"\}/);
});

test("H-2 static showcase retains offline simulation and never stages the inquiry API route", async () => {
  const build = await source("scripts/demo-build.mjs");
  assert.match(build, /<HotelHome chatMode="preview" \/>/);
  assert.match(build, /src\/components\/fictional-chat-inquiry\.tsx/);
  assert.match(build, /export function FictionalChatInquiry\(\) \{ return null; \}/);
  assert.doesNotMatch(build, /^\s*"fictional-chat-inquiry",/m);
  assert.doesNotMatch(build, /src\/app\/api\/assistant\/inquiry\/route\.ts/);
});
