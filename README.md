# The Aster House — Hotel Inquiry Demo

A fictional boutique hotel website and inquiry management demo built for **SlinFish Software**. This is a portfolio demonstration, not an operational hotel booking system. All room details and prices are illustrative.

## Stack
Next.js App Router, React, TypeScript, Tailwind CSS, Zod, Prisma and PostgreSQL.

## Run locally
1. Install Node.js 22 LTS and PostgreSQL 16+.
2. Run `npm install`.
3. Copy `.env.example` to `.env`, change the database URL and create a long random `STAFF_ACCESS_TOKEN` (24+ characters).
4. Create the database and run `npm run db:migrate`.
5. Start with `npm run dev` and open http://localhost:3000.
6. Staff page: http://localhost:3000/staff. Paste the token from `.env` to load and manage inquiries.

## Verification
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

**Important:** This source package was created without installing dependencies or running a live PostgreSQL instance in the generation environment. Full framework/database checks must be performed after installation. See `docs/TESTING.md`.

## Scope
- Responsive home page and room catalog
- Validated inquiry submission (not reservation confirmation)
- PostgreSQL persistence via repository abstraction
- Staff API protected by a bearer token, with inquiry listing and status changes
- Simple staff UI for demo purposes
- Architecture, deployment, security and testing documentation

## Production blockers
Do **not** deploy as a real guest-facing system without proper staff authentication/session management, CSRF protections where applicable, request rate limiting, spam protection, audit logging, email notification strategy, privacy/retention policy, backup/restore and monitoring. The staff bearer-token UI is a development-only convenience. See `docs/SECURITY.md`.
