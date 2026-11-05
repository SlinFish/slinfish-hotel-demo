import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import "./helpers/typescript.mjs";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const { canTransitionLeadStatus } = await import("../src/features/inquiries/domain/lead-inquiry.ts");

test("H-3B lead management reads are scoped to configured business", async () => {
  const service = await read("src/features/inquiries/application/lead-management.ts");
  assert.match(service, /where: \{ businessId \}/);
  assert.match(service, /where: \{ businessId, id \}/);
  assert.match(service, /where: \{ id: input\.id, businessId/);
  assert.match(service, /HOTEL_BUSINESS_ID/);
  assert.doesNotMatch(service, /businessId\s*=\s*request/);
});

test("H-3B transitions require observed version, legal transition and audit event", async () => {
  const service = await read("src/features/inquiries/application/lead-management.ts");
  assert.match(service, /validObservedLeadVersion\(obj\.version\)/);
  assert.match(service, /canTransitionLeadStatus\(current\.status, input\.status\)/);
  assert.match(service, /prisma\.\$transaction/);
  assert.match(service, /updateMany/);
  assert.match(service, /version: \{ increment: 1 \}/);
  assert.match(service, /leadInquiryStatusEvent\.create/);
  assert.equal(canTransitionLeadStatus("NEW", "CONTACTED"), true);
  assert.equal(canTransitionLeadStatus("NEW", "WON"), false);
});

test("H-3B API requires staff authorization on both read and write", async () => {
  const route = await read("src/app/api/staff/leads/route.ts");
  assert.equal((route.match(/isStaffAuthorized\(request\)/g) || []).length, 2);
  assert.match(route, /parseLeadStatusChange\(await request\.json\(\)\)/);
  assert.match(route, /Cache-Control/);
  assert.doesNotMatch(route, /request\.headers\.get\(["']x-business/);
});
