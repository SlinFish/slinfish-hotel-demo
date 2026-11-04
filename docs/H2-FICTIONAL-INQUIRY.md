# H-2 — Fictional chat inquiry → local AI Assistant dashboard

This phase is intentionally **local development only**. The Aster House visitor can explicitly submit a fictional inquiry from the connected hotel chat, which passes through a same-origin development-only Next.js endpoint to the AI Assistant's existing local `POST /api/lead`. That endpoint already owns SQLite inquiry persistence, 7-day retention, and the protected administrator dashboard.

## Boundaries

- **Only Hospitality** is allowed: the transport constructs `business: "hotel"`, fixed sample name `Aster Demo Guest`, and reserved contact `aster-demo@example.invalid`. The website never sends arbitrary visitor contact details to the AI Assistant in this phase.
- Consent is required, the visitor writes a fictional question (maximum 400 characters), and no transcript is sent automatically.
- The backend must return HTTP 201 **and** `stored: true` before the form says saved. Without `INQUIRY_DB_PATH`, the AI Assistant returns HTTP 200 `stored:false`, which is correctly treated as **not saved**.
- Only `NODE_ENV=development` enables the API route, and only development builds show the fictional chat inquiry action. The static public export remains offline chat + local simulated inquiry form and public fixture-only staff dashboard.
- No reservation, notifications, public dashboard, Gemini, or production storage are part of H-2.

## Local verification

First, in the Hotel Demo repository:

```powershell
npm test
npm run typecheck
npm run lint
npm run build:demo
npm run build
```

Use Node.js 22 for the Hotel Demo and Node.js 24 for the AI Assistant. For the following steps, keep `npm run dev -- --port=3001` for the Hotel Demo. Start the AI Assistant on port 3000 with `AI_PROVIDER=demo`.

### 1. Prepare a new private directory for fictional data

Use an appropriate *new* NTFS directory, following the AI Assistant README security instructions:

```powershell
cd D:\slinfish-ai-assistant-git
$demoData = Join-Path $env:LOCALAPPDATA 'SlinFishDemo'
New-Item -ItemType Directory -Path $demoData -Force | Out-Null
$account = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
icacls $demoData /inheritance:r /grant:r "${account}:(OI)(CI)F"
icacls $demoData
$env:INQUIRY_DB_PATH = Join-Path $demoData 'inquiries.sqlite'
$env:AI_PROVIDER = 'demo'
npm start
```

Confirm NTFS ACLs contain no unexpected explicit grants. Do not change ACLs of system/shared directories. Never place the DB inside either Git repository or a public/static folder.

If you have **already initialized a private fictional-demo database**, reuse its existing path instead and do not replace it.

### 2. Submit a fictional inquiry

Open `http://localhost:3001`, launch the chat and click **Send fictional inquiry**. Sample name/contact are locked. Type a fictional message, check the explicit storage-consent box, and click **Save fictional inquiry**. A successful storage response should say `Fictional inquiry saved locally`.

Test **without persistence** in a separate run: remove `INQUIRY_DB_PATH`, restart the AI Assistant, submit and confirm the UI does **not** claim storage.

### 3. Administrator verification

Use an **independent terminal**, pointed at the same private `INQUIRY_DB_PATH`:

```powershell
cd D:\slinfish-ai-assistant-git
$env:INQUIRY_DB_PATH = Join-Path (Join-Path $env:LOCALAPPDATA 'SlinFishDemo') 'inquiries.sqlite'
node scripts/admin-bootstrap.js
```

Only if no owner has been bootstrapped yet: choose a private 16–128-character passphrase at the interactive prompt. An existing owner must not be recreated. Never share credentials or paste them into chat.

Open `http://127.0.0.1:3000/admin/login` in your browser, authenticate, filter by `hotel`, and confirm the new fictional inquiry appears. Update the permitted workflow status and verify the audit history. The public `http://localhost:3001/staff/demo` **must not** show this private record.

### 4. Failure / privacy checks

- Without the consent checkbox, submission is prevented.
- No chat history or business selector is submitted.
- No configured SQLite store → no false success.
- Double-submitting after a successful save is disabled in the open form.
- Mobile chat input and inquiry UI should remain usable at 335px and 390px.
- Check the public `npm run preview:demo` continues to say offline simulation; no network inquiry is sent.

## Still pending

These local-only components do not deploy private record handling to Cloudflare. Public chat connectivity belongs to H-3 and requires the separately staged chat-only gateway. A future production-grade lead flow needs a distinct authenticated, privacy-reviewed server architecture, not the current public `/staff/demo` simulation.
