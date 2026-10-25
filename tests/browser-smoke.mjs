// Optional integration check. Uses externally installed Playwright; see docs/TESTING.md.
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [],
    demoApiRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      demoApiRequests.push(request.url());
  });
  await page.goto(`${base}/staff/demo`);
  await page.getByRole("heading", { name: "Guest inquiries." }).waitFor();
  const total = page.locator(".summary-card").nth(0).locator("strong");
  const newCount = page.locator(".summary-card").nth(1).locator("strong");
  assert.equal(await total.textContent(), "7");
  assert.equal(await newCount.textContent(), "3");
  await page.getByLabel("Search inquiries").fill("mira");
  await page.getByText("1 of 7 inquiries", { exact: true }).waitFor();
  await page
    .getByRole("combobox", { name: "Inquiry status", exact: true })
    .selectOption("CONTACTED");
  await page
    .getByText("Mira Rowan: status changed to Contacted. Simulated only.", {
      exact: true,
    })
    .waitFor();
  assert.equal(await newCount.textContent(), "2");
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("NEW");
  await page.getByRole("heading", { name: "No matching inquiries" }).waitFor();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByText("7 of 7 inquiries", { exact: true }).waitFor();
  await page.getByRole("button", { name: /Theo Linden/ }).click();
  await page.getByRole("heading", { name: "Theo Linden" }).waitFor();
  await page.getByRole("button", { name: "Reset demo" }).click();
  assert.equal(await newCount.textContent(), "3");
  await page
    .getByRole("combobox", { name: "Inquiry status", exact: true })
    .selectOption("CLOSED");
  await page.reload();
  await page.getByText("7 of 7 inquiries", { exact: true }).waitFor();
  assert.equal(await newCount.textContent(), "3");
  assert.equal(
    await page
      .getByRole("combobox", { name: "Inquiry status", exact: true })
      .inputValue(),
    "NEW",
  );
  assert.deepEqual(
    demoApiRequests,
    [],
    "Public demo must never request an API",
  );
  // Native controls remain reachable by keyboard; no custom pointer-only widgets.
  await page.getByLabel("Search inquiries").focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement?.tagName),
    "SELECT",
  );
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/rooms", "/staff/demo", "/staff"]) {
      const response = await page.goto(`${base}${route}`);
      assert.equal(response.status(), 200, route);
      assert.equal(await page.locator("h1").count(), 1, route);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Horizontal overflow at ${width}: ${route}`,
      );
    }
  }
  await page.goto(`${base}/?room=terrace#inquiry`);
  assert.equal(await page.getByLabel("Preferred room").inputValue(), "terrace");
  await page.goto(`${base}/staff`);
  assert.equal(await page.getByText("Mira Rowan", { exact: true }).count(), 0);
  assert.equal(
    (await page.request.get(`${base}/api/staff/inquiries`)).status(),
    401,
  );
  assert.equal(
    (
      await page.request.post(`${base}/api/inquiries`, {
        data: { email: "invalid" },
      })
    ).status(),
    400,
  );
  assert.deepEqual(errors, [], "Browser runtime errors");
  console.log(
    "PASS: demo state, search/filter, detail selection, reset/reload, no API access, keyboard focus, room selection, protected API denial, invalid guest validation, and desktop/tablet/mobile layout.",
  );
} finally {
  await browser.close();
}
