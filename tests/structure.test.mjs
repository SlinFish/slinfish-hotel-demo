import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");
test("clean architecture layers exist", () => {
  for (const f of [
    "src/features/inquiries/domain/inquiry.ts",
    "src/features/inquiries/domain/ports.ts",
    "src/features/inquiries/application/use-cases.ts",
    "src/features/inquiries/infrastructure/prisma-repository.ts",
    "src/app/api/inquiries/route.ts",
  ])
    assert.ok(existsSync(new URL("../" + f, import.meta.url)), f);
});
test("domain does not depend on Next or Prisma", () => {
  for (const f of [
    "src/features/inquiries/domain/inquiry.ts",
    "src/features/inquiries/domain/ports.ts",
  ])
    assert.doesNotMatch(read(f), /from ['"](?:next|@prisma|@\/lib\/prisma)/);
});
test("secrets are ignored", () => assert.match(read(".gitignore"), /^\.env$/m));
test("inquiry workflow distinguishes inquiries from reservations", () =>
  assert.match(
    read("src/app/api/inquiries/route.ts"),
    /not a confirmed reservation/,
  ));
test("staff endpoints check authorization", () => {
  const s = read("src/app/api/staff/inquiries/route.ts");
  assert.match(s, /isStaffAuthorized\(request\)/);
  assert.match(s, /status\s*:\s*401/);
});
test("documentation exists", () => {
  for (const f of [
    "README.md",
    "docs/ARCHITECTURE.md",
    "docs/SECURITY.md",
    "docs/TESTING.md",
    "docs/ROADMAP.md",
  ])
    assert.ok(read(f).length > 100);
});
