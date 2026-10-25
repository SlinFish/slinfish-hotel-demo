import test from "node:test";
import assert from "node:assert/strict";
import { loadedModules } from "./helpers/typescript.mjs";
const { createDemoInquiries } =
  await import("../src/features/inquiries/demo/data.ts");
const {
  filterDemoInquiries,
  summarizeDemoInquiries,
  changeDemoStatus,
  demoStatuses,
} = await import("../src/features/inquiries/demo/model.ts");
const { rooms } = await import("../src/features/rooms/catalog.ts");

test("fictional fixtures are consistent and exercise every status and room", () => {
  const records = createDemoInquiries();
  assert.ok(records.length >= 5 && records.length <= 10);
  assert.equal(new Set(records.map((r) => r.id)).size, records.length);
  assert.deepEqual(
    new Set(records.map((r) => r.status)),
    new Set(demoStatuses),
  );
  assert.deepEqual(
    new Set(records.map((r) => r.roomType)),
    new Set(rooms.map((r) => r.id)),
  );
  for (const record of records) {
    const room = rooms.find((room) => room.id === record.roomType);
    assert.match(record.email, /@guest\.example$/);
    assert.ok(record.checkIn < record.checkOut);
    assert.ok(record.createdAt <= record.checkIn);
    assert.ok(record.guests >= 1 && record.guests <= room.occupancy);
  }
});
test("search is trimmed and case insensitive across names, emails, references and rooms", () => {
  const records = createDemoInquiries();
  for (const term of ["  MIRA  ", "mira.rowan@guest.example", "demo-001"]) {
    assert.deepEqual(
      filterDemoInquiries(records, term, "ALL").map((r) => r.id),
      ["DEMO-001"],
    );
  }
  assert.equal(filterDemoInquiries(records, "terrace", "ALL").length, 2);
  assert.equal(filterDemoInquiries(records, "Terrace Suite", "ALL").length, 2);
  assert.equal(
    filterDemoInquiries(records, "   ", "ALL").length,
    records.length,
  );
  assert.deepEqual(filterDemoInquiries(records, "no match", "ALL"), []);
});
test("status filtering combines with search and handles empty results", () => {
  const records = createDemoInquiries();
  assert.equal(filterDemoInquiries(records, "garden", "NEW").length, 1);
  assert.equal(filterDemoInquiries(records, "Mira", "CLOSED").length, 0);
  for (const status of demoStatuses)
    assert.ok(
      filterDemoInquiries(records, "", status).every(
        (r) => r.status === status,
      ),
    );
  assert.deepEqual(filterDemoInquiries([], "", "ALL"), []);
});
test("status simulation updates one record immutably and summary follows", () => {
  const records = createDemoInquiries();
  Object.freeze(records);
  records.forEach(Object.freeze);
  const changed = changeDemoStatus(records, "DEMO-001", "CONTACTED");
  assert.equal(records[0].status, "NEW");
  assert.equal(changed[0].status, "CONTACTED");
  assert.deepEqual(changed.slice(1), records.slice(1));
  assert.deepEqual(summarizeDemoInquiries(changed), {
    total: 7,
    NEW: 2,
    CONTACTED: 3,
    CLOSED: 2,
  });
  assert.deepEqual(summarizeDemoInquiries([]), {
    total: 0,
    NEW: 0,
    CONTACTED: 0,
    CLOSED: 0,
  });
  assert.throws(
    () => changeDemoStatus(records, "real-record", "NEW"),
    /Unknown demo/,
  );
  assert.throws(
    () => changeDemoStatus(records, "DEMO-001", "CONFIRMED"),
    /Unknown inquiry status/,
  );
});
test("a new demo session restores fixtures without sharing mutable state", () => {
  const first = createDemoInquiries();
  first[0].guestName = "Changed by visitor";
  first[0].status = "CLOSED";
  const fresh = createDemoInquiries();
  assert.equal(fresh[0].guestName, "Mira Rowan");
  assert.equal(fresh[0].status, "NEW");
});
test("public dashboard can render with transport and credentials unavailable", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("Public demo must not call a network service");
  };
  try {
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { DemoDashboard } =
      await import("../src/features/inquiries/demo/dashboard.tsx");
    const html = renderToStaticMarkup(createElement(DemoDashboard));
    assert.match(html, /Mira Rowan/);
    assert.match(html, /DEMO MODE/);
    assert.match(html, /reset on reload/);
    assert.doesNotMatch(html, /STAFF_ACCESS_TOKEN|\/api\/staff/);
    assert.ok(
      ![...loadedModules].some((path) =>
        /infrastructure|lib\/prisma|lib\/staff-auth|app\/api/.test(path),
      ),
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});
