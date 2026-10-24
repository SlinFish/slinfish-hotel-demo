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
