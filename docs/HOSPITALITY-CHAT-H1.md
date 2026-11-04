# H-1 Hospitality chat integration (development branch)

The Aster House homepage now contains a Hospitality-only chat widget. Other SlinFish businesses are never selectable from the hotel interface.

## Two deliberately separate execution modes

1. **Full Next.js development app**: the widget posts to same-origin `/api/assistant/chat`. This development-only route fixes `business: "hotel"` server-side and forwards to `http://127.0.0.1:3000/api/chat`. The existing AI Assistant process supplies grounded answers, context handles and limits. This route returns 404 outside `NODE_ENV=development` and is not a publicly deployable adapter. It does not forward browser cookies, credentials, or arbitrary endpoints.
2. **Static public showcase** (`npm run build:demo`): the staging-only page passes `chatMode="preview"`; the widget never performs a fetch and clearly explains that each exchange is offline simulation. The existing inquiry form and staff fixtures remain client-only. No backend or real conversation is claimed on the public static website.

The local widget sends only the visitor's fictional question and manages the opaque context/sequence in tab memory. No chat history or contact details are sent to the assistant. Reset clears the local topic immediately; the upstream short-lived context expires naturally. The proxy has no production authentication, public abuse protection or deployed backend integration. Do not submit personal data or expose this as a real hotel support service.

## Local manual check (Windows)

Use Node.js 22 for the Hotel Demo and Node.js 24 for the separate AI Assistant. These are separate processes and directories.

Terminal A (AI Assistant):

```powershell
cd D:\slinfish-ai-assistant-git
$env:AI_PROVIDER = 'demo'
npm start
```

Terminal B (Hotel Demo):

```powershell
cd D:\slinfish-hotel-demo
npm ci
npm run typecheck
npm test
npm run lint
npm run build:demo
npm run dev -- -p 3001
```

Open http://localhost:3001 for the Hotel Demo. Port 3000 belongs to the separate AI Assistant.

With both running, test these fictional questions in the homepage chat:
- "How do I book a room?" → approved dates/guest-count response.
- "What details should I provide?" → same approved response.
- "What about check-in?" → approved 2 PM sample check-in reply.
- Reset chat, then "What details should I provide?" → safe handoff because topic was cleared.
- Close and reopen the panel; do not send real contact details.

To verify the public-static boundary separately:

```powershell
npm run build:demo
npm run preview:demo
```

The static chat explicitly says offline simulation and makes no network requests. The existing public staff demo and guest inquiry form remain simulations.

## Unfinished H-2 / H-3 work

A publicly reachable, secured AI Assistant service, controlled routing, abuse protection, CSP updates and production deployment are **not** included. Neither an AI-powered public chat nor inquiry-to-admin workflow has been deployed. Any connection to a real inquiry store and admin dashboard requires a separate review and must not be confused with public `/staff/demo` fixtures. Live Gemini is deferred.
