# The Aster House — Hotel Inquiry Demo

A fictional boutique hotel and hospitality workspace, built as a SlinFish Software portfolio project. Explore a warm ivory, forest-green and muted-gold hotel experience, an inquiry form and a public interactive staff demonstration. Room details and rates are illustrative. An inquiry is **not** a reservation; do not submit real personal information.

## Stack and local development

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zod, Prisma 6 and PostgreSQL 17 (16+ supported). Use Node.js 22 LTS.

1. `npm ci` to install the lockfile dependencies.
2. Copy `.env.example` to ignored `.env`. Configure a dedicated development `DATABASE_URL` and generate a random `STAFF_ACCESS_TOKEN` of at least 24 characters. Never commit or publish these values.
3. `npm run db:generate` to generate Prisma client types (requires HTTPS access to `binaries.prisma.sh`).
4. For a **new local database only**, follow the original setup: create the database and run `npm run db:migrate`. No schema changes or migrations are required or performed by the Phase 1 UI work. The public demo works independently of database initialization.
5. `npm run dev`, then open the hotel website at port 3000.

## Explore

- `/`: Hotel story, rooms, imagined experiences and guest inquiry form. Room-card links preselect the requested room in the form.
- `/rooms`: Three room types with their original rates, sizes, capacities and amenities.
- `/staff/demo`: Public workspace with seven entirely invented inquiries, total/new/contacted/closed summaries, search, status filters, inquiry detail, simulated status updates and reset. All changes remain in page memory and reset on reload. No protected API, token, database, email or actual inquiry is used.
- `/staff`: Separate protected operational inquiry screen. Authorized staff provide their token to use the existing protected API. This is a development convenience, not production authentication.

Responsive layouts include visible keyboard focus, a skip link, labeled controls, textual status badges, live feedback and reduced-motion support.

## Photography and attribution

**Photography is currently blocked.** Asset access initially failed; after image downloads became reachable, source and license pages still returned an authorization response. Image authors and licensing could not be verified. No photographs or fabricated attribution claims were added. Reusable local-image slots, Next.js optimization and honest pending-asset panels are implemented. See [image slots, sources and licensing requirements](docs/IMAGES.md). The visual photography requirement must be completed before presenting this as a finished photography-led portfolio.

## Verification

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

Generate Prisma client types first if needed. Tests exercise demo operations and the existing guest use cases without PostgreSQL; the original scaffold tests remain. See [testing](docs/TESTING.md) for optional automated browser checks and remaining coverage.

## Boundaries and next steps

The public marketing website, real guest inquiry use cases, client-only demo and protected operations have separate ownership and data paths. They share presentation where useful without introducing services or a monorepo. See [architecture](docs/ARCHITECTURE.md).

Known limitations: photographs are pending verified licensing; no room availability, confirmed booking, payment, email delivery or real administrator features; public demo state is ephemeral. Token-based staff access and guest submission remain unsuitable for real customer data without the protections in [security](docs/SECURITY.md).

The suggested next phase is a separately scoped authentication/admin design: managed identity, server sessions, roles, rate limits, audit logging and retention. None is implemented in Phase 1. Do not deploy this demonstration as an operational hotel system.
