# H-3 — Unified hotel inquiry architecture (design, not implemented)

## Decision
Use PostgreSQL as the **long-term system of record for deployed hotel inquiries**, and the Hotel Demo's protected staff workspace as the client-facing administration interface. Keep the reusable SlinFish AI Assistant independently deployable; do not hardwire it to the Aster House's Prisma schema. Its SQLite fictional-demo store and local administrator are retained unchanged during migration. No production connectivity is authorized by this document.

## Verified baseline (2026-11-05)
- Hotel repository: Prisma PostgreSQL `Inquiry` requires guestName, email, roomType, checkIn, checkOut, guests. Its `/api/inquiries` and bearer-token protected `/api/staff/inquiries` routes are not in the Cloudflare static export; `/staff/demo` displays fictional fixtures only.
- AI Assistant: `/api/lead` stores `business,name,contact,question,consent` in SQLite when `INQUIRY_DB_PATH` is set; otherwise it returns `stored:false`. Current local admin protects all four fictional businesses via loopback origin checks, sessions, CSRF, audit statuses and a seven-day, 200-record store.
- H-2: local Hotel Demo development-only proxy forwards explicit fictitious inquiry to AI Assistant SQLite; public static site remains an offline preview.
- Both systems have separate status vocabularies and security boundaries. Do not call local AI admin APIs through a browser-facing public proxy or expose its session cookies.

## Proposed domain model
Do **not** force generic AI leads into a booking schema by making up dates/rooms. Introduce a separate generalized `LeadInquiry` model backed by PostgreSQL:
- `id` opaque server-generated primary key; `businessId` validated tenant identifier; `source` enum such as `CHAT_FORM`, `HOTEL_FORM` (if migrated), `OTHER`; `name`; `contact`; `question`; `consentedAt`; `status`; `version`; `createdAt`/`updatedAt`; `expiresAt`; optional `hotelStay` extension with roomType, checkIn, checkOut, guests.
- For a single-hotel H-3 local prototype, businessId may be fixed to `hotel`. For a later multi-business product, use a real `Business` table, keyed ownership and tenant-scoped repository queries; validating a business ID in a request is **not** authorization.
- Do not copy AI chat history into the record without a separate explicit customer choice. Do not include unnecessary personal data or credentials in audit events.
- Add idempotency for retry ambiguity, a bounded body and rate limits; redact logs and set no-store.
- Separate `InquiryStatusEvent` with actor, previous/next status, version and timestamp; allow only approved transitions with optimistic concurrency checks. Define a migration mapping for historical Hotel `NEW/CONTACTED/CLOSED` and AI `new/contacted/qualified/won/lost/legacy_closed` before importing any old records. Closed is not automatically Won.

## H-3 implementation stages

### H-3A — Schema and domain
Add generalized `LeadInquiry` and source extension tables/types through an additive Prisma migration; keep legacy Hotel `Inquiry` unchanged while proving compatibility. Implement tests for validation, foreign-key constraints/tenant scope, status transitions, optimistic versioning, duplicate submission, and no data loss. Start with fictional data only. Never delete or migrate the existing SQLite file automatically.

### H-3B — Protected local staff read/write
Add Hotel Demo server-side repository and staff API for `LeadInquiry` backed by PostgreSQL; implement authentication/session and CSRF protections suitable for a later hosted service instead of extending the current bearer token input as-is. Staff UI differentiates chat-origin leads from booking inquiries, supports filters, detail, status, audit, empty/error states. Keep `/staff/demo` fixtures and its static build unchanged.

### H-3C — AI service boundary
Specify an authenticated server-to-server submission contract (versioned payload, business identity bound to server-side client credential, idempotency key, validation, status codes, rate limits). Reusable AI Assistant uses a pluggable inquiry sink: existing SQLite for local demo, PostgreSQL ingestion through private authenticated service for hotel deployment. **Do not** move ownership of PostgreSQL into the public browser or make AI admin credentials available to the Hotel Demo. Production secrets stay server-side.

### H-3D — End-to-end migration trial
Under local development with disposable PostgreSQL, send one fictional hotel chat inquiry and one hotel booking inquiry. Confirm both appear in the protected Hotel Demo staff workspace as distinct record types. Test authorization, cross-tenant denial, idempotent retry, no chat-history leakage, error cases, and preservation of original AI Assistant SQLite demo and four business sectors.

## Deployment boundaries and decision gates
- The current website is a **static Cloudflare Pages export**. It cannot execute Next.js API routes, protected staff SSR, or Prisma at runtime. H-3 local success does not mean the public site is connected. H-4 must choose hosted API, database, secrets, network, CORS/CSRF, session policy, backups and monitoring.
- The AI Assistant admin is intentionally loopback-only. Do not proxy its `/admin` APIs to the public Internet.
- Data retention and consent must be designed for real customer data and local law; the seven-day/200-inquiry SQLite policy is not a production retention plan.
- Before merging H-3 implementation, require unit/integration tests, protected access tests, migration reversibility/backup review, static export verification, and manual local end-to-end proof.
- No customer data migration or public production deployment in H-3 design scope.

## Non-goals
No fresh AI-provider work, no chatbot conversation rewrite, no duplicative production inquiry databases, no automatic staff messaging, no public deployment, no new product verticals.
