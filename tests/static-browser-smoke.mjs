import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4173";
const captureDir = process.env.BROWSER_CAPTURE_DIR;
if (captureDir) await mkdir(captureDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
try {
  const page = await browser.newPage();
  const errors = [],
    apiRequests = [],
    clientScripts = new Set(),
    internalLinks = new Set();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      apiRequests.push(request.url());
  });
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/rooms/", "/about-demo/", "/staff/demo/"]) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200);
      assert.doesNotMatch(
        await response.text(),
        /STAFF_ACCESS_TOKEN|DATABASE_URL|postgres(?:ql)?:\/\//,
      );
      await page.reload();
      assert.equal(await page.locator("h1").count(), 1);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow: ${route} at ${width}`,
      );
      for (const src of await page
        .locator("script[src]")
        .evaluateAll((nodes) => nodes.map((node) => node.src)))
        clientScripts.add(src);
      for (const href of await page
        .locator("a[href]")
        .evaluateAll((nodes) => nodes.map((node) => node.href))) {
        const url = new URL(href);
        if (url.origin === new URL(base).origin) internalLinks.add(url.href);
      }
      if (route === "/" || route === "/rooms/") {
        const expected =
          route === "/"
            ? ["hero", "garden", "terrace", "family", "experience"]
            : ["garden", "terrace", "family"];
        const images = page.locator("img.hotel-photo");
        assert.equal(await images.count(), expected.length);
        for (let index = 0; index < expected.length; index++) {
          const image = images.nth(index);
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element) => element.decode());
          assert.equal(
            new URL(await image.getAttribute("src"), base).pathname,
            `/images/${expected[index]}.jpg`,
          );
          assert.match(await image.getAttribute("alt"), /AI-generated/);
          assert.equal(
            await image.evaluate(
              (element) => getComputedStyle(element).objectFit,
            ),
            "cover",
          );
        }
        const text = await page.locator("body").innerText();
        assert.doesNotMatch(
          text,
          /AI-generated|Fictional rooms|illustrative rates|No real property|Protected staff access/i,
        );
        await page
          .getByRole("link", { name: "About this demo", exact: true })
          .waitFor();
        await page
          .getByText("The Aster House — A fictional hotel concept", {
            exact: true,
          })
          .waitFor();
        assert.equal(
          await page
            .getByRole("link", { name: "SlinFish Software", exact: true })
            .getAttribute("href"),
          "https://slinfish.github.io/portfolio/",
        );
      }
      if (route === "/about-demo/") {
        const text = await page.locator("main").innerText();
        for (const phrase of [
          "fictional hotel concept",
          "AI-generated illustrations",
          "prices are illustrative",
          "No real accommodation",
          "simulated",
        ])
          assert.ok(text.includes(phrase), phrase);
      }
      if (route === "/staff/demo/") {
        await page.getByLabel("Search inquiries").fill("mira");
        await page.getByText("1 of 7 inquiries", { exact: true }).waitFor();
        await page
          .getByRole("combobox", { name: "Inquiry status", exact: true })
          .selectOption("CLOSED");
        await page
          .getByText("Mira Rowan: status changed to Closed. Simulated only.", {
            exact: true,
          })
          .waitFor();
        await page
          .getByRole("combobox", { name: "Status", exact: true })
          .selectOption("NEW");
        await page
          .getByRole("heading", { name: "No matching inquiries" })
          .waitFor();
        await page.getByRole("button", { name: "Reset demo" }).click();
        await page.reload();
        await page.getByText("7 of 7 inquiries", { exact: true }).waitFor();
        assert.equal(
          await page
            .getByRole("combobox", { name: "Inquiry status", exact: true })
            .inputValue(),
          "NEW",
        );
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      if (captureDir)
        await page.screenshot({
          path: resolve(
            captureDir,
            `${route === "/" ? "home" : route.slice(1, -1).replaceAll("/", "-")}-${width}.png`,
          ),
          fullPage: true,
        });
    }
  }
  await page.goto(base + "/rooms/");
  await page
    .getByRole("link", { name: "Explore a stay in the Terrace Suite" })
    .click();
  await page.waitForURL(
    (url) =>
      url.pathname === "/" &&
      url.searchParams.get("room") === "terrace" &&
      url.hash === "#inquiry",
  );
  const form = page.getByRole("form", { name: "Booking inquiry form" });
  assert.equal(await form.getByLabel("Preferred room").inputValue(), "terrace");
  for (const name of ["Full name", "Email address", "Anything we should know?"])
    assert.ok(
      await form.getByLabel(name).evaluate((element) => element.readOnly),
    );
  assert.equal(
    await form.getByLabel("Email address").inputValue(),
    "guest@example.com",
  );
  await form.getByLabel("Arrival date").fill("2099-06-01");
  await form.getByLabel("Departure date").fill("2099-06-03");
  await form.getByRole("button", { name: "Preview inquiry" }).click();
  await page
    .getByText(
      "Simulation complete. Nothing was sent or stored; no reservation was made.",
      { exact: true },
    )
    .waitFor();
  await form.getByLabel("Departure date").fill("2099-06-01");
  await form.getByRole("button", { name: "Preview inquiry" }).click();
  await page
    .getByText("Check-out must be after check-in", { exact: true })
    .waitFor();
  assert.deepEqual(apiRequests, []);
  assert.equal(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
    0,
  );
  assert.deepEqual(await page.context().cookies(), []);
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#main-content");
  for (const path of [
    "/staff",
    "/staff/",
    "/staff/index.html",
    "/api/inquiries",
    "/api/staff/inquiries",
    "/api/admin/staff",
    "/.env",
    "/package.json",
    "/prisma/schema.prisma",
    "/missing-route",
  ])
    assert.equal((await page.request.get(base + path)).status(), 404, path);
  for (const src of clientScripts) {
    const response = await page.request.get(src);
    assert.equal(response.status(), 200);
    assert.doesNotMatch(
      await response.text(),
      /STAFF_ACCESS_TOKEN|DATABASE_URL|PrismaClient|\/api\/(?:inquiries|staff|admin)|postgres(?:ql)?:\/\//,
    );
  }
  for (const href of internalLinks) {
    const response = await page.request.get(href);
    assert.equal(response.status(), 200, `Broken link: ${href}`);
    const url = new URL(href);
    if (url.hash) {
      await page.goto(href);
      assert.ok(
        await page
          .locator(
            `[id=${JSON.stringify(decodeURIComponent(url.hash.slice(1)))}]`,
          )
          .count(),
        `Missing anchor: ${href}`,
      );
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: static routes/refresh, branding/About, images, simulation privacy, dashboard interactions, keyboard, responsive layouts, internal links, forbidden route 404s and client artifact checks.",
  );
} finally {
  await browser.close();
}
