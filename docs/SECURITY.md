# Security and privacy review

This project is a **demo**. It is not production-ready for real guest personal information.

Current safeguards: server-side Zod validation, narrow allowed status transitions, bearer token verification with timing-safe comparison, generic database error responses, hidden honeypot field, Prisma parameterized database access, and `.env` excluded from Git.

Required before production:

1. Replace pasted shared bearer token with real identity provider, server-managed sessions, RBAC, account recovery and staff revocation.
2. Implement rate limiting at API/edge, bot defenses, request-size limits and abuse monitoring.
3. Add appropriate CSRF protection for cookie-authenticated mutations and strict security headers/CSP.
4. Configure TLS, secret rotation, restricted database permissions, backups, encrypted storage and audited access.
5. Establish data minimization, consent/privacy notice, retention/deletion rules and access request process.
6. Add operational logging without guest PII, error reporting, alerting and incident response.
7. Add transactional email delivery with verified sender domain, queue/retries and no PII in URLs.
8. Test authorization, concurrency, validation and deployment configuration before any customer deployment.

Do not submit real personal data to public demos. Do not publish a shared staff token in the repository or browser bundle.

## Public staff demo boundary

`/staff/demo` is intentionally public. It contains seven invented records with reserved `.example` email addresses. Status changes affect only React state and reset on reload; the interface labels every action as simulated. It never receives an access token, imports a database adapter, calls protected endpoints, persists a status or sends an email. Its public seed data is safe to include in client bundles. Shared dashboard presentation has no data-fetching responsibilities.

`/staff` and `/api/staff/inquiries` keep their existing token authorization. The token is entered by authorized users only, remains in component memory and must never be embedded in source, example URLs, documentation or public bundles. This phase does not introduce production authentication or implement administrator capabilities. Existing production blockers above still apply.

## Public static distribution

Only the verified `out/` from `npm run build:demo` is suitable for the public showcase. It contains no operational `/staff` page or API routes, server functions, Prisma adapter, database configuration or staff token. Guest previews use read-only sample contact details and locally validated choices, with no network submission or browser storage. The build filters its child environment and scans publish artifacts. Keep the exported root 404 and publish only `out/`; do not apply an SPA fallback to missing operational URLs. The full server application's production limitations above remain unchanged. See CLOUDFLARE.md for verification and header details.
