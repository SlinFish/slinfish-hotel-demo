# H-2 — Fictional inquiry → existing AI Assistant admin (local only)

## Scope and safety boundary

The Aster House embedded chat has an optional **Leave an inquiry** form. Submitting it requires separately entered fictional name, contact, inquiry text and affirmative consent. The form never copies the conversation or submits automatically, and never makes a reservation.

In full Next.js **development mode**, the form posts to `/api/assistant/inquiry`. This endpoint:
- Requires an exact same-origin browser request with JSON, bounded payload and explicit consent.
- Enforces `business: "hotel"` server-side, forwarding only these four validated fields plus the fixed business to `http://127.0.0.1:3000/api/lead`.
- Returns success only when the AI Assistant responds HTTP 201 with `stored: true` and a server-generated inquiry ID.
- Reports the distinct `stored: false` validation-only case when persistence is unconfigured.
- Doesn't expose upstream credentials, cookies, admin access, or the hotel's existing PostgreSQL APIs.
- Returns 404 when `NODE_ENV` is not `development`.

The public static build includes only the client form, in `preview` mode. **It does not fetch or save anything**, even if a visitor fills in its fields. The public `/staff/demo` remains fictional client-side fixtures. The local AI Assistant's protected `/admin` is the only dashboard for saved H-2 inquiries.

This is a development proof of workflow, **not a public deployment**. Never submit real personal information. The existing AI Assistant storage is capped at 200 inquiries and retains data for seven days. It does not notify staff or send email. Connection failures can leave a write outcome uncertain; check the dashboard before attempting to submit again.

## Local setup (Windows PowerShell)

AI Assistant requires Node.js 24. Use a private **existing directory outside both Git repositories** and restrict its Windows NTFS permissions to your account before storing even fictional contact details. The path below is only an example—adapt it to your private directory.

```powershell
cd D:\slinfish-ai-assistant-git
$env:AI_PROVIDER = "demo"
$env:INQUIRY_DB_PATH = "D:\private-slinfish-demo\inquiries.sqlite"
npm start
```

**Important**: The directory must exist before startup and must have suitable private ACLs. Do not use a public/shared directory or place the database under a repository. The database file is created by the server on first startup if configured correctly. Without `INQUIRY_DB_PATH` the API explicitly returns `stored: false`—this is not a successful saved inquiry.

To create the single local admin owner on a new database, use an interactive private terminal with the same `INQUIRY_DB_PATH`:

```powershell
node scripts/admin-bootstrap.js
```

Follow the interactive secure passphrase prompts; never share, log or commit the passphrase. If the owner already exists, do not bootstrap again.

Hotel Demo requires Node.js 22. Start in a **second** terminal:

```powershell
cd D:\slinfish-hotel-demo
git fetch origin
git switch -c feature/h2-hospitality-inquiry --track origin/feature/h2-hospitality-inquiry
npm run typecheck
npm test
npm run lint
npm run build:demo
npx next dev -p 3001
```

At `http://localhost:3001`, open **Ask the hotel assistant → Leave an inquiry**. Use invented information such as `Sample Guest`, `guest@example.invalid` and `Please tell me about a fictional stay.`; affirm consent. A successfully stored test inquiry displays **Fictional inquiry saved locally for administrator review**.

Then visit `http://127.0.0.1:3000/admin/login`, sign in with the separately bootstrapped owner credentials, and open the existing inquiry dashboard. The new `hotel` inquiry should appear. Confirm its detail and workflow changes using the existing allowed status transitions. Do not use the public `/staff/demo` dashboard for this—those records are unrelated simulations.

For the public static boundary, run `npm run preview:demo` after `build:demo`. The same form must report **Offline simulation only**, with no network request or stored record.

## Still outside H-2

Public Node hosting, TLS, origin configuration, browser/edge rate limiting, real customer privacy and retention controls, production auth, live Gemini, staff email notifications and a production authoritative inquiry store are **not included**. They require an explicit H-3 design and verification before the live hotel website can offer real AI/inquiry connectivity.
