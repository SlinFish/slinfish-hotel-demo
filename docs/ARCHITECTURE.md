# Architecture

## Guiding principles

Feature-first organization with Clean Architecture boundaries. Domain contracts and use cases should not depend on Prisma, Next.js or browser components. Framework-specific adapters live in infrastructure and delivery layers.

```
src/app/                       Next.js delivery routes and pages
src/components/                Shared presentation components
src/features/rooms/            Room catalog and types
src/features/inquiries/domain/ Validation rules, types, repository port
src/features/inquiries/application/ Use cases
src/features/inquiries/infrastructure/ Prisma repository adapter
src/lib/                        Shared technical utilities
prisma/                         Persistence schema
```

## Request path

Browser inquiry form → POST /api/inquiries → submitInquiry use case → InquiryRepository port → Prisma adapter → PostgreSQL.

Staff UI → authenticated staff API → repository. Do not import Prisma into domain or UI components.

## Extension points

- Replace hardcoded room catalog with `RoomRepository` and CMS integration.
- Replace token-based demo staff access with managed auth and role permissions.
- Add email notifications via an event/outbox integration after persistence succeeds.
- Add room inventory, availability rules and payment flows only if converting inquiry to actual booking.
- Introduce service-specific modules when business logic justifies it; do not prematurely split into microservices.

## Public staff demonstration (Phase 1)

`/staff/demo` → `features/inquiries/demo/dashboard.tsx` → pure demo model + fictional fixture factory. This path never imports the Prisma adapter, operational use cases, staff authentication or API handlers. The model performs immutable search/filter, count and simulated status operations. Each mount starts a fresh fixture copy; React memory is the sole state store. No fetch, local storage, cookies, token or database access is part of this workflow.

The protected `/staff` retains its existing authenticated API path. Only the presentational `StatusBadge` and type-only domain status contract are shared between dashboards. Demo reset/status operations cannot reach the real inquiry repository. The public demo is intentionally separate from operational data access; a future authenticated application can reuse presentation without inheriting demo data or simulated actions.

Marketing pages share `Header`, `Footer`, `RoomCard` and `HotelPhoto`. The room catalog preserves all identifiers, prices, capacities and features. A validated room query selects the preferred inquiry room without altering server validation. Photography metadata is separate from business room data; see IMAGES.md for the local AI-generated asset inventory and disclosures.

## Static showcase boundary

`npm run build:demo` prepares an explicit allowlist in `.demo-build/`, substitutes the operational inquiry form with a client-only simulation and exports only the four public pages to `out/`. `features/hotel/home.tsx` shares marketing presentation; `components/inquiry-fields.tsx` shares fields without transport. The static form has fixed sample contact fields and no persistence. Operational routes, infrastructure, Prisma and environment files are never staged. A post-build verifier rejects private/backend artifacts and requires a real 404 page. The normal Next server build retains all backend capabilities. See CLOUDFLARE.md for deployment settings and the source-versus-output distinction.
