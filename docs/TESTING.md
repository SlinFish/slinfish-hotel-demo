# Testing plan

## Commands
`npm install`
`npm run db:migrate`
`npm run typecheck`
`npm run lint`
`npm test`
`npm run build`

## Test cases to add or verify before production
- Inquiry valid/invalid dates, email, guest counts, message length and room type.
- API 400 for malformed inquiry; 201 for accepted inquiry; 500 for unavailable database.
- Staff API 401 without token, 200 with valid token, 400 on invalid status.
- Database persistence and status transitions in a dedicated test database.
- Responsive mobile/tablet/desktop layouts, keyboard navigation, labels, color contrast.
- E2E inquiry form and staff workflow with Playwright against isolated test DB.
- Rate-limit and security regression tests after production security controls are added.

`tests/structure.test.mjs` runs with Node built-in test runner without installing dependencies; it checks the scaffold and architecture contracts, not runtime behavior. Full checks need npm packages and PostgreSQL.
