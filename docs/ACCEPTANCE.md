# Task 02 visual acceptance — 2026-10-25

Base: Phase 1 commit `e0a4e3cedb8235ebc0970f4ac15392d4c936557e` on `codex/feature-hotel-ui-public-demo`. Work is isolated on `codex/hotel-photography-acceptance`.

## Outcome

Functional and responsive acceptance checks pass. Photography acceptance is blocked: no licensed photograph has been approved or added. The five image slots, pending-asset panels and fictional-hotel disclaimer remain intact. Source/license access evidence and precise affected assets are recorded in [IMAGES.md](IMAGES.md).

Desktop (1440px), tablet (768px) and mobile (390px) Chromium captures were reviewed. The existing layouts have no horizontal page overflow at these widths. The only production-code correction replaces decorative diagonal-arrow characters, which rendered as missing-glyph boxes in this environment, with a shared accessible SVG. No layout redesign, room-data change or feature rewrite was needed.

| Acceptance area       | Result and evidence                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero layout           | Layout reviewed at all three widths; actual photo cropping remains blocked                                                                                                    |
| Room cards            | Existing proportions and responsive stacking reviewed; photo crop/color consistency unassessed                                                                                |
| Navigation            | Room navigation link visible and functional at all tested widths                                                                                                              |
| Inquiry form          | Layout reviewed; empty fields and invalid email blocked by native validation without sending a request; valid-shaped sample inputs pass browser validation without submission |
| Demo dashboard        | Search, combined status filtering, empty state, detail selection, simulated updates, reset and reload restoration pass; interactions exercised at all three widths            |
| Keyboard access       | Native search-to-select tab order and skip-to-content activation verified; labels and visible focus reviewed                                                                  |
| Protected staff       | Unauthenticated GET and PATCH return 401; no guest records are rendered in the staff shell                                                                                    |
| Public-demo isolation | No `/api/` requests during demo use at any tested width; client-only state remains separate from operational repositories                                                     |
| Fictional identity    | Hotel disclaimer, invented records, example email addresses and simulated-action notices preserved                                                                            |

The `/staff` HTML entry screen remains publicly reachable, as in Phase 1. Its inquiry data and operations require authorization. This task preserves that boundary; it does not add route-level login or change authentication. The browser checks do not submit a valid guest inquiry, use a staff token or alter database records. The production build only generates the Prisma client; no database migrations are run.

## Verification

- `npm run typecheck`: passed.
- `npm test`: 16 passed, 0 failed, 0 skipped.
- `npm run lint`: passed.
- `npm run build`: passed.
- Existing browser smoke suite, extended within the acceptance scope: passed before and after the icon correction.
- Manual Chromium visual review: completed for the existing UI at 1440, 768 and 390 pixels; photography-specific acceptance remains blocked.

## Captures and reproduction

Before captures are retained outside the checkout at `/workspace/acceptance/task02/before/`; final captures at `/workspace/acceptance/task02/after/`. Each set contains the homepage, rooms and public demo at the tested widths. Final browser captures also include the protected staff entry screen. They document the icon correction and preserved layout, **not a completed photography change**. Captures are local review artifacts, not large binaries committed to Git.

With a running local build, use the browser command in [TESTING.md](TESTING.md) and set `BROWSER_CAPTURE_DIR` to an output directory to reproduce full-page captures. The smoke script uses externally installed Playwright and adds no application dependency.

Remaining concerns: source/licensing access and all five photography slots; photo crop/quality/rights review; broader cross-browser and assistive-technology testing; the previously documented production authentication and data-handling limitations. No merge, deployment, migration, schema change, or Phase 2 work is included.
