import test from "node:test";
import assert from "node:assert/strict";
import "./helpers/typescript.mjs";
const { submitInquiry, setInquiryStatus } =
  await import("../src/features/inquiries/application/use-cases.ts");
const tomorrow = (days) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const valid = () => ({
  guestName: "Sample Guest",
  email: "sample@guest.example",
  roomType: "garden",
  checkIn: tomorrow(2),
  checkOut: tomorrow(4),
  guests: "2",
  message: "A fictional test inquiry",
  website: "",
});
function repository() {
  const created = [],
    updated = [];
  return {
    created,
    updated,
    async create(input) {
      created.push(input);
      return { id: "test-reference" };
    },
    async list() {
      return [];
    },
    async updateStatus(id, status) {
      updated.push({ id, status });
    },
  };
}
test("valid inquiry persists normalized input and excludes the honeypot", async () => {
  const repo = repository();
  assert.deepEqual(await submitInquiry(repo, valid()), {
    ok: true,
    id: "test-reference",
  });
  assert.equal(repo.created.length, 1);
  assert.equal(repo.created[0].guests, 2);
  assert.ok(!("website" in repo.created[0]));
});
test("invalid inquiry data never reaches persistence", async () => {
  for (const change of [
    { email: "invalid" },
    { roomType: "not-a-room" },
    { guests: 9 },
    { checkOut: tomorrow(1) },
    { checkIn: "2000-01-01" },
    { guestName: "x" },
    { message: "x".repeat(1201) },
  ]) {
    const repo = repository();
    assert.equal(
      (await submitInquiry(repo, { ...valid(), ...change })).ok,
      false,
    );
    assert.equal(repo.created.length, 0);
  }
});
test("honeypot returns a harmless acknowledgment without storing data", async () => {
  const repo = repository();
  assert.deepEqual(
    await submitInquiry(repo, { ...valid(), website: "bot.example" }),
    { ok: true, id: "received" },
  );
  assert.equal(repo.created.length, 0);
});
test("protected inquiry use case preserves allowed status validation", async () => {
  const repo = repository();
  await setInquiryStatus(repo, "test-reference", "CONTACTED");
  assert.deepEqual(repo.updated, [
    { id: "test-reference", status: "CONTACTED" },
  ]);
  await assert.rejects(() =>
    setInquiryStatus(repo, "test-reference", "BOOKED"),
  );
  await assert.rejects(() => setInquiryStatus(repo, "", "NEW"));
  assert.equal(repo.updated.length, 1);
});
