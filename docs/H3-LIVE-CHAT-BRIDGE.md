# H-3 Cloudflare Pages bridge — staged, NOT enabled

The main Cloudflare Pages site is a static export. To make its embedded Hospitality widget genuinely interactive, this branch adds a narrowly scoped Cloudflare Pages Function at `/api/assistant/chat`. It forwards to the **separately deployed public hotel-chat-only service** from the SlinFish AI Assistant repo, not to its private administrator server.

The static chat stays **offline preview by default**. The build script only emits a connected widget when `PUBLIC_HOTEL_CHAT_ENABLED=1` is explicitly set in the Cloudflare Pages build environment. The usual `npm run build:demo` with that flag absent remains an offline showcase.

## Required private Pages environment bindings

- `PUBLIC_HOTEL_CHAT_UPSTREAM`: exact public HTTPS origin of deployed chat-only service, e.g. `https://your-chat-service.example` (example only; no URL has been provisioned).
- `PUBLIC_CHAT_BRIDGE_TOKEN`: same random secret configured server-side, **private binding only**, never committed, never `NEXT_PUBLIC_*`.
- `PUBLIC_HOTEL_CHAT_ENABLED`: the literal value `1` (build-time switch) only after verifying the backend and ingress controls.

Use Cloudflare Pages Git integration; Pages Functions belong at the **repository root** `functions/` (outside the static `out/` folder). The static asset build remains `npm ci && npm run build:demo`, output `out`. Cloudflare Pages recognizes root `functions/` in Git-connected builds. Deploying a Pages Function consumes Workers/Pages Functions quota; verify plan limits before enabling. The function validates input and Origin and relays only the hotel-chat response. It will return a safe 503 when private bindings are absent; it does not enable Gemini, inquiry writes, staff actions or public admin access.

## Recommended deployment order

1. Verify **both repositories'** dedicated tests and builds locally.
2. Deploy the separate, auth-guarded AI chat-only service with the shared secret and confirm its `/health` route.
3. Configure the matching private secret and HTTPS upstream in Cloudflare Pages. Add Cloudflare rate-limiting/abuse protections for the chat route and monitor service usage.
4. Create a **preview deployment**, confirm `/api/assistant/chat` handling and CSP, test context, reset, mobile, 429/503, missing bindings and offline fallback.
5. Only then set `PUBLIC_HOTEL_CHAT_ENABLED=1` for the production build and publish through an approved merge/deploy.

## Review boundary

No public deployment has been made from this branch. The existing `/staff/demo` and guest inquiry simulation remain completely isolated. Real customer personal data must not be entered. Gemini remains deferred. The public chat can only answer the two fictional hotel FAQ topics and approved follow-up expressions.

Official Cloudflare documentation: https://developers.cloudflare.com/pages/functions/get-started/ and https://developers.cloudflare.com/pages/functions/routing/
