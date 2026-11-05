import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import "./helpers/typescript.mjs";

const { leadSubmissionSchema, leadStatusTransitions, canTransitionLeadStatus, validObservedLeadVersion } =
  await import("../src/features/inquiries/domain/lead-inquiry.ts");
const source = async (file) => readFile(new URL("../" + file, import.meta.url), "utf8");
const validLead = () => ({
  businessId: "hotel",
  source: "CHAT_FORM",
  name: "  Sample Guest ",
  contact: "guest@example.invalid",
  question: "  Fictional stay inquiry  ",
  consent: true,
  idempotencyKey: "sample-request-0001",
});

test("H-3A validates a minimal hotel chat lead without fabricated booking fields", () => {
  const result = leadSubmissionSchema.safeParse(validLead());
  assert.equal(result.success, true);
  assert.equal(result.data.name, "Sample Guest");
  assert.equal(result.data.question, "Fictional stay inquiry");
  assert.equal(result.data.hotelStay, undefined);
});

test("H-3A rejects missing consent, spoofed fields, oversized data and invalid identifiers", () => {
  const invalid = [
    { consent: false }, { consent: undefined }, { businessId: "../hotel" },
    { question: "x".repeat(401) }, { name: " " },
    { source: "UNKNOWN" }, { idempotencyKey: "short" },
    { status: "WON" }, { createdAt: "2020-01-01" },
    { hotelStay: { guests: 9 } },
    { hotelStay: { checkIn: "2027-01-04", checkOut: "2027-01-03" } },
  ];
  for (const patch of invalid) {
    assert.equal(leadSubmissionSchema.safeParse({ ...validLead(), ...patch }).success, false, JSON.stringify(patch));
  }
});

test("H-3A allows genuinely optional stay details but checks ordered dates", () => {
  const result = leadSubmissionSchema.safeParse({
    ...validLead(), hotelStay: { checkIn: "2027-01-03", checkOut: "2027-01-05", guests: 2 },
  });
  assert.equal(result.success, true);
});

test("H-3A lead status transitions are restricted and versions are positive safe integers", () => {
  assert.deepEqual(leadStatusTransitions.NEW, ["CONTACTED", "LOST"]);
  assert.equal(canTransitionLeadStatus("NEW", "CONTACTED"), true);
  assert.equal(canTransitionLeadStatus("NEW", "WON"), false);
  assert.equal(canTransitionLeadStatus("CONTACTED", "CONTACTED"), false);
  for (const version of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, "2", null]) {
    assert.equal(validObservedLeadVersion(version), false);
  }
  assert.equal(validObservedLeadVersion(1), true);
});

test("H-3A Prisma migration is additive and includes scoped uniqueness, audit and stay integrity", async () => {
  const migration = await source("prisma/migrations/20261105150000_h3a_lead_inquiry_schema/migration.sql");
  const schema = await source("prisma/schema.prisma");
  assert.match(migration, /CREATE TABLE "LeadInquiry"/);
  assert.match(migration, /CREATE TABLE "LeadHotelStay"/);
  assert.match(migration, /CREATE TABLE "LeadInquiryStatusEvent"/);
  assert.match(migration, /"LeadInquiry_businessId_idempotencyKey_key"/);
  assert.match(migration, /"LeadInquiryStatusEvent_inquiryId_version_key"/);
  assert.match(migration, /"LeadHotelStay_dates_ordered"/);
  assert.doesNotMatch(migration, /(?:DROP|ALTER|TRUNCATE) TABLE "Inquiry"/);
  assert.match(schema, /model Inquiry \{/);
  assert.match(schema, /model LeadInquiry \{/);
  assert.match(schema, /model LeadHotelStay \{/);
  assert.match(schema, /model LeadInquiryStatusEvent \{/);
});
