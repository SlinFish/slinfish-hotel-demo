import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const file = async (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("H-2 inquiry is opt-in and does not scrape or transmit chat history", async () => {
  const chat = await file("src/components/hospitality-chat.tsx");
  const form = await file("src/components/hospitality-inquiry-form.tsx");
  assert.match(chat, /Leave an inquiry/);
  assert.match(chat, /HospitalityInquiryForm mode=\{mode\}/);
  assert.match(form, /consent: true/);
  assert.match(form, /mode === "preview"/);
  assert.match(form, /stored === true/);
  assert.match(form, /response\.status === 201/);
  assert.doesNotMatch(form, /\/api\/assistant\/chat|entries\.map|localStorage|sessionStorage/);
});

test("H-2 inquiry route remains local-only and fixes business to hotel", async () => {
  const route = await file("src/app/api/assistant/inquiry/route.ts");
  assert.match(route, /NODE_ENV !== "development"/);
  assert.match(route, /origin !== request\.nextUrl\.origin/);
  assert.match(route, /business: "hotel"/);
  assert.match(route, /consent !== true/);
  assert.match(route, /response\.status === 201 && answer\.stored === true/);
  assert.doesNotMatch(route, /DATABASE_URL|STAFF_ACCESS_TOKEN|GEMINI_API_KEY/);
});

test("static showcase stages only a preview form, without API backend", async () => {
  const build = await file("scripts/demo-build.mjs");
  assert.match(build, /"hospitality-inquiry-form"/);
  assert.match(build, /<HotelHome chatMode=\\"preview\\"/);
  assert.doesNotMatch(build, /"src\/app\/api\/assistant\/inquiry\/route\.ts"/);
});
