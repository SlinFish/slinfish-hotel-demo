# Cloudflare Pages static showcase

This configuration is prepared and validated locally. **No deployment has been created.** Do not connect a repository or enable automatic deployment until publication is authorized.

## Exact Pages settings

| Setting                          | Value                                                                     |
| -------------------------------- | ------------------------------------------------------------------------- |
| Repository                       | `SlinFish/slinfish-hotel-demo`                                            |
| Production branch, when approved | `codex/hotel-public-demo-deployment` (or a separately approved successor) |
| Framework preset                 | **None** — this is a static export, not a Next.js server deployment       |
| Root directory                   | Repository root; leave blank                                              |
| Build command                    | `npm ci && npm run build:demo`                                            |
| Build output directory           | `out`                                                                     |
| Build environment                | `NODE_VERSION=22.23.4`; `SKIP_DEPENDENCY_INSTALL=1`                       |
| Runtime secrets / bindings       | **None**                                                                  |
| Functions / Workers / database   | **None**                                                                  |

Set the same non-secret build settings for any intentionally enabled preview environment. `SKIP_DEPENDENCY_INSTALL=1` avoids a second automatic install because the build command already uses the lockfile. Do not add `DATABASE_URL`, `STAFF_ACCESS_TOKEN`, or `NEXT_PUBLIC_*` credentials. Do not use the normal `npm run build` or publish `.next`, `.demo-build`, the repository root, or `public` for this deployment.

Cloudflare Pages' free static hosting is sufficient within its published plan limits. This setup needs no paid Workers, database, KV, R2, email or image service. No deployment CLI or adapter dependency is required.

## Two independent build modes

- `npm run build` / `npm start`: preserved full application, including the operational inquiry form, protected staff API and `/staff` entry screen. This mode is not the public static artifact.
- `npm run build:demo`: creates a separate `.demo-build/` project from the explicit allowlist in `scripts/demo-build.mjs`. It exports only `/`, `/rooms/`, `/about-demo/` and `/staff/demo/`, plus Next static assets and a custom 404. Publish only `out/`.

The shared `HotelHome` and `InquiryFields` preserve appearance across modes. The static project substitutes the form module with `features/inquiries/demo/guest-inquiry-form.tsx`; its sample name, email and message are read-only. Dates, room preference and guest count remain interactive. Submission validates locally and returns an honest simulation result without fetch, email, database writes or browser persistence. The operational form is retained in the original checkout and is never copied into staging.

The public staff dashboard continues using only its fictional fixtures and React state. Protected staff links have been removed from public navigation. The source API routes, authentication helper, Prisma adapter and schema remain unchanged in the full application.

## Exclusion and verification boundaries

Staging uses an explicit file allowlist, not a copy of the checkout with a few routes hidden. It does not contain `src/app/api`, operational `/staff/page.tsx`, `src/lib`, inquiry infrastructure, Prisma schema, `.env` files or private configuration. Adding future backend files does not automatically publish them.

Next runs in the staging directory with a small toolchain-only environment; application secrets and arbitrary `NEXT_PUBLIC_*` variables are not forwarded. Only dependencies are linked for compilation. No dependency installation, Prisma generation or migration is invoked by `build:demo` itself. It builds without database connectivity or staff credentials.

Before copying to `out/`, `verify-demo-output.mjs` requires all four public pages, all five JPEGs and `404.html`. It rejects operational routes, unexpected HTML pages, runtime/private directories, publish symlinks, source maps, private config files and known application credential/backend references in textual artifacts. A failed build clears stale `out/` rather than leaving a previous artifact available for accidental publication. Generated staging and publish directories are ignored by Git and excluded from regular lint/typecheck discovery.

The exported root `404.html` is essential: Cloudflare Pages uses a homepage fallback for missing routes when no top-level 404 exists. Keep this file, and do **not** add an SPA `/* /index.html 200` rewrite. Missing `/staff`, `/api/*`, private files and unknown URLs must remain missing. Static trailing-slash directories support direct navigation and refresh. No Pages Functions or `_worker.js` are included.

`out/_headers` adds framing restrictions, content-type protection, restricted device permissions and a CSP with same-origin resources and `form-action 'none'`. Next's inline hydration scripts/styles require the documented inline allowances; no third-party scripts are added. These rules do not turn the exported files into a server application. The local preview applies the same header file; Cloudflare's actual host behavior still needs checking after an authorized deployment.

## Images

All five existing JPEGs are copied byte-for-byte. Static `next/image` uses `unoptimized: true` because Pages has no Next image optimizer. Existing bounded source sizes (about 1.34 MiB combined), lazy loading of secondary images, reserved containers and proportional cover cropping remain. There is no `/_next/image` dependency, image API bill or externally hosted image request. The normal server build retains responsive Next image optimization. Detailed AI-image/fictional-property disclosures are centralized at `/about-demo`; descriptive, truthful alt text remains on every image.

## Local verification

```bash
npm run typecheck
npm test
npm run lint
npm run build
npm run build:demo
npm run preview:demo
```

The preview binds loopback port 4173 by default (`PORT` overrides it), serves only `out/`, and returns custom 404s rather than an SPA fallback. It is a local filesystem preview, not a complete Cloudflare emulator.

Use an externally installed Playwright runtime, as described in TESTING.md:

```bash
PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs \
CHROMIUM_PATH=/path/to/chromium \
BROWSER_CAPTURE_DIR=/path/outside/checkout \
node tests/static-browser-smoke.mjs
```

The static browser suite checks all four pages and refreshes at 1440, 768 and 390px, image loading, footer credits, About disclosures, inquiry simulation/privacy, staff interactions/reset, keyboard navigation, internal links/anchors, missing backend/private routes, and delivered JavaScript. The existing server browser suite remains separate and still checks protected API denial.

## Validation record — 2026-10-25

- Typecheck, lint, full server build and static demo build passed.
- All 20 Node tests passed, including all original tests and new simulation/staging/output-boundary checks.
- Full application and static browser suites passed on Chromium at desktop/tablet/mobile widths. Static requests to operational staff/API/private paths returned 404; interactive public actions issued no API requests, cookies or browser storage writes.
- All five source images remain unchanged. Captures are local artifacts under `/workspace/acceptance/static-showcase/` and `/workspace/acceptance/branding-full/`, outside Git.
- No migrations, Phase 2 implementation, merge or deployment were performed.

After publication is separately approved, verify the actual Pages URL for route refresh, 404 status codes, security headers, asset delivery and interactive behavior. Do not enable operational endpoints or add credentials to remedy static preview issues.

References: [Pages build image/settings](https://developers.cloudflare.com/pages/configuration/build-image/), [serving pages and 404 behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/). Official documentation was consulted during preparation.
