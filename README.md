# The Aster House — Hotel Inquiry Demo

A fictional boutique hotel and hospitality workspace, built as a SlinFish Software portfolio project. Explore a warm ivory, forest-green and muted-gold hotel experience, an inquiry form and a public interactive staff demonstration. Room details and rates are illustrative. An inquiry is **not** a reservation; do not submit real personal information.

## Public static showcase

The public presentation includes `/`, `/rooms`, `/about-demo` and `/staff/demo`. Detailed concept/image disclosures live on the About page; the footer credits [SlinFish Software](https://slinfish.github.io/portfolio/).

```bash
npm ci
npm run build:demo
npm run preview:demo
```

Publish **only `out/`** when deployment is separately authorized. This allowlisted static mode has no API, operational staff login, database or credentials. The inquiry form uses fixed sample contact details and validates a simulated submission entirely in the browser; nothing is sent or stored. The staff dashboard remains a client-only simulation. The full backend remains available through the normal build below.

See [exact Cloudflare Pages settings and security boundaries](docs/CLOUDFLARE.md). No deployment has been created.

## Stack and local development

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zod, Prisma 6 and PostgreSQL 17 (16+ supported). Use Node.js 22 LTS.

1. `npm ci` to install the lockfile dependencies.
2. Copy `.env.example` to ignored `.env`. Configure a dedicated development `DATABASE_URL` and generate a random `STAFF_ACCESS_TOKEN` of at least 24 characters. Never commit or publish these values.
3. `npm run db:generate` to generate Prisma client types (requires HTTPS access to `binaries.prisma.sh`).
4. For a **new local database only**, follow the original setup: create the database and run `npm run db:migrate`. No schema changes or migrations are required or performed by the Phase 1 UI work. The public demo works independently of database initialization.
5. `npm run dev`, then open the hotel website at port 3000.

## Explore

- `/`: Hotel story, rooms, imagined experiences and guest inquiry form (simulated in the static showcase). Room-card links preselect the requested room in the form.
- `/rooms`: Three room types with their original rates, sizes, capacities and amenities.
- `/staff/demo`: Public workspace with seven entirely invented inquiries, total/new/contacted/closed summaries, search, status filters, inquiry detail, simulated status updates and reset. All changes remain in page memory and reset on reload. No protected API, token, database, email or actual inquiry is used.
- `/about-demo`: Concept, AI imagery, illustrative room data and simulation disclosures.
- `/staff`: Full application only; separate protected operational inquiry screen. Authorized staff provide their token to use the existing protected API. This is a development convenience, not production authentication.

Responsive layouts include visible keyboard focus, a skip link, labeled controls, textual status badges, live feedback and reduced-motion support.

## AI-generated illustrative imagery

Five local JPEGs illustrate the fictional exterior, three room types and a garden breakfast. They are AI-generated illustrations, not photographs of an actual property. The About page centralizes detailed disclosures, with truthful image alternative text preserved. The full server build provides Next image optimization; the static showcase serves the existing bounded local JPEGs with lazy loading for secondary images. See [asset provenance, dimensions and delivery](docs/IMAGES.md).

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

Known limitations: images and room details are fictional; no room availability, confirmed booking, payment, email delivery or real administrator features; public demo state is ephemeral. Token-based staff access and guest submission remain unsuitable for real customer data without the protections in [security](docs/SECURITY.md).

The suggested next phase is a separately scoped authentication/admin design: managed identity, server sessions, roles, rate limits, audit logging and retention. None is implemented in Phase 1. Do not deploy this demonstration as an operational hotel system.
