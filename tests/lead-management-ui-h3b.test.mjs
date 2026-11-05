import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("H-3B staff page includes distinct AI lead management without replacing bookings", async () => {
  const page = await source("src/app/staff/page.tsx");
  assert.match(page, /LeadManagementPanel/);
  assert.match(page, /prismaInquiryRepository|\/api\/staff\/inquiries/);
  assert.match(page, /key=\{token\}/);
});

test("H-3B panel uses authenticated lead endpoints and version-aware status updates", async () => {
  const panel = await source("src/features/inquiries/ui/lead-management-panel.tsx");
  assert.match(panel, /\/api\/staff\/leads/);
  assert.match(panel, /Authorization/);
  assert.match(panel, /version: detail\.version/);
  assert.match(panel, /statusEvents/);
  assert.match(panel, /transitions\[detail\.status\]/);
  assert.doesNotMatch(panel, /localStorage|sessionStorage/);
});
