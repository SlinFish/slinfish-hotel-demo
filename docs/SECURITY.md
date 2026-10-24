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
