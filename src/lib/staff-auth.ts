import { timingSafeEqual } from "node:crypto";
export function isStaffAuthorized(request: Request) {
  const expected = process.env.STAFF_ACCESS_TOKEN;
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer /, "");
  if (!expected || !supplied || expected.length < 24) return false;
  const a = Buffer.from(expected),
    b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}
