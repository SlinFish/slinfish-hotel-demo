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

## Phase 1 automated checks

Use Node 22.15+ (documented development target: Node 22 LTS). Run `npm run db:generate` before type checking if Prisma client types are missing. Client generation does not migrate or write database records.

- `npm test` preserves the original scaffold tests and adds behavioral tests against actual TypeScript modules. The test-only loader uses the existing TypeScript dependency and Node `registerHooks`; it is not shipped with the app.
- Demo tests check fixture consistency, reserved emails, room capacities, every status, case-insensitive search, combined filtering, empty results, immutable updates, summary counts, invalid changes and session reset. Server rendering with a failing fetch function verifies the demo can render without API access, and the loaded module graph excludes database/staff adapters.
- Guest use-case tests use an in-memory repository double to verify validation, normalized persistence, honeypot behavior and allowed status updates without migrations or a live database.

### Optional browser integration

Start the application with `npm run dev` (or a completed production build with `npm start`). Install Playwright outside the checkout to avoid changing the lockfile:

```bash
npm install --prefix /tmp/aster-browser --no-audit --no-fund playwright-core
PLAYWRIGHT_MODULE=/tmp/aster-browser/node_modules/playwright-core/index.mjs \
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-smoke.mjs
```

Use an installed Chromium path appropriate to your platform. `TEST_BASE_URL` optionally selects a different local server. The script checks demo interactions, reload reset, absence of API requests during demo use, native keyboard focus, room preselection, unauthorized staff denial, invalid guest request validation, and horizontal overflow at desktop/tablet/mobile widths. It does not migrate, write a real inquiry, or require staff credentials. Manual assistive-technology review, photo/crop review and broader browser coverage remain follow-up checks.

### Task 02 visual acceptance

The browser smoke script additionally exercises demo search/filter/status changes at every tested width, native guest-form validation without submitting a valid inquiry, the room navigation link, the skip link, and unauthorized staff PATCH as well as GET. Set `BROWSER_CAPTURE_DIR=/path/outside/the/checkout` to save full-page captures of each route and width. The output directory is optional; no capture files are written by default. See [ACCEPTANCE.md](ACCEPTANCE.md) for the current results and photography-specific limitations.
