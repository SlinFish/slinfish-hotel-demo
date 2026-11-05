# H-3A — Additive generalized lead schema

This branch **does not connect the Hotel Demo to PostgreSQL for AI inquiries yet**. It introduces schema and domain contracts only. Existing `Inquiry` and `InquiryStatus` remain unchanged. Public static export must still produce only fictional preview pages.

## Tables

- `LeadInquiry`: normalized business/source/name/contact/question, explicit consent timestamp, workflow status, version, per-business optional idempotency key, retention expiry. Application services will be responsible for tenant authorization, bounded retention, deduplication checks and transactions; a string `businessId` by itself does not establish tenancy.
- `LeadHotelStay`: one optional child row for stay preferences. Every field is optional. No invented room/date data is required for chat leads.
- `LeadInquiryStatusEvent`: append-only *by application contract* management history, unique inquiry/version, with actor identity. Database owners can still modify rows; this is not a tamper-proof ledger.

The migration adds tables, types, indexes, foreign keys and check constraints, and does not alter historical `Inquiry` rows. The optional idempotency key is a uniqueness guard only; preventing stale-retry mismatches requires a future application service and payload fingerprint. Lifecycle logic, a protected API and staff UI are explicitly future H-3B/H-3C work.

## Verify without applying a database migration

```powershell
cd D:\slinfish-hotel-demo
git fetch origin
git switch -c feature/h3a-lead-inquiry-schema --track origin/feature/h3a-lead-inquiry-schema

npx prisma validate
npm run typecheck
npm test
npm run lint
npm run build:demo
```

The expected test count is the previous 28 plus five focused H-3A tests: **33**. The commands above use a Prisma schema and generated client but **do not apply migrations**. A passing static build does not prove the PostgreSQL DDL runs.

## Database migration gate — later, only on disposable PostgreSQL

1. Back up relevant data if the testing database contains anything worth keeping; do not point at a live/shared database.
2. Configure `DATABASE_URL` to a dedicated disposable PostgreSQL database and verify its host/database name first.
3. Run `npx prisma migrate status` and compare against the repository's migration history. Inspect the new SQL and run `npx prisma migrate deploy` only on the disposable database.
4. Validate table/constraint creation, legacy record preservation, and a failed malformed insertion. Test rollback through a database backup, not a destructive migration against production.
5. Only after successful database verification should H-3A be merged.

Never run `prisma migrate dev` or `migrate reset` against production. The AI Assistant's existing SQLite file remains untouched.
