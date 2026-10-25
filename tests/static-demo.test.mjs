import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  rm,
  mkdir,
  writeFile,
  readFile,
  access,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import "./helpers/typescript.mjs";
import { prepareDemo, demoFiles } from "../scripts/demo-build.mjs";
import { verifyDemoOutput } from "../scripts/verify-demo-output.mjs";
const { simulateGuestInquiry } =
  await import("../src/features/inquiries/demo/guest-inquiry.ts");
const root = fileURLToPath(new URL("../", import.meta.url));

test("public inquiry simulation validates dates without transport, storage or persistence", () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("No public inquiry transport permitted");
  };
  try {
    const valid = {
      guestName: "Sample Guest",
      email: "guest@example.com",
      roomType: "garden",
      checkIn: "2099-06-01",
      checkOut: "2099-06-03",
      guests: 2,
    };
    assert.deepEqual(simulateGuestInquiry(valid), {
      ok: true,
      message:
        "Simulation complete. Nothing was sent or stored; no reservation was made.",
    });
    assert.equal(
      simulateGuestInquiry({ ...valid, checkOut: valid.checkIn }).ok,
      false,
    );
    assert.equal(simulateGuestInquiry({ ...valid, guests: 9 }).ok, false);
    assert.equal(
      simulateGuestInquiry({ ...valid, checkIn: "2000-01-01" }).ok,
      false,
    );
    assert.deepEqual(Object.keys(simulateGuestInquiry(valid)).sort(), [
      "message",
      "ok",
    ]);
  } finally {
    globalThis.fetch = original;
  }
});

test("static staging excludes operational modules and private configuration", async () => {
  const stage = await mkdtemp(join(tmpdir(), "aster-stage-test-"));
  try {
    await prepareDemo(root, stage);
    for (const path of [
      ".env",
      ".env.local",
      "src/app/api",
      "src/app/staff/page.tsx",
      "src/lib",
      "src/features/inquiries/infrastructure",
      "prisma",
    ]) {
      await assert.rejects(access(join(stage, path)), { code: "ENOENT" });
    }
    assert.ok(!demoFiles.includes("src/components/inquiry-form.tsx"));
    assert.match(
      await readFile(join(stage, "src/components/inquiry-form.tsx"), "utf8"),
      /demo\/guest-inquiry-form/,
    );
    assert.doesNotMatch(
      await readFile(join(stage, "src/app/page.tsx"), "utf8"),
      /searchParams/,
    );
    for (const name of ["hero", "garden", "terrace", "family", "experience"]) {
      assert.deepEqual(
        await readFile(join(stage, `public/images/${name}.jpg`)),
        await readFile(join(root, `public/images/${name}.jpg`)),
      );
    }
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
});

test("publish verification rejects missing 404, backend routes and credential references", async () => {
  const output = await mkdtemp(join(tmpdir(), "aster-output-test-"));
  try {
    for (const path of [
      "index.html",
      "rooms/index.html",
      "about-demo/index.html",
      "staff/demo/index.html",
      "404.html",
      ...["hero", "garden", "terrace", "family", "experience"].map(
        (name) => `images/${name}.jpg`,
      ),
    ]) {
      await mkdir(join(output, path, ".."), { recursive: true });
      await writeFile(join(output, path), "fixture");
    }
    await verifyDemoOutput(output);
    await rm(join(output, "404.html"));
    await assert.rejects(verifyDemoOutput(output));
    await writeFile(join(output, "404.html"), "fixture");
    await mkdir(join(output, "api"));
    await assert.rejects(verifyDemoOutput(output), /Private\/runtime artifact/);
    await rm(join(output, "api"), { recursive: true });
    await writeFile(join(output, "staff/index.html"), "Operational login");
    await assert.rejects(verifyDemoOutput(output), /Operational staff route/);
    await rm(join(output, "staff/index.html"));
    await writeFile(join(output, "admin.html"), "Unexpected admin route");
    await assert.rejects(verifyDemoOutput(output), /Unexpected HTML route/);
    await rm(join(output, "admin.html"));
    await writeFile(join(output, "package.json"), "{}");
    await assert.rejects(
      verifyDemoOutput(output),
      /Private build configuration/,
    );
    await rm(join(output, "package.json"));
    await writeFile(join(output, "leak.js"), 'const name = "DATABASE_URL";');
    await assert.rejects(
      verifyDemoOutput(output),
      /Backend\/configuration reference/,
    );
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("footer gives a single concept disclosure, portfolio credit and About navigation", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { Footer } = await import("../src/components/footer.tsx");
  const html = renderToStaticMarkup(createElement(Footer));
  assert.match(html, /The Aster House — A fictional hotel concept/);
  assert.match(html, /Designed &amp; developed by/);
  assert.match(html, /href="https:\/\/slinfish.github.io\/portfolio\/"/);
  assert.match(html, /href="\/about-demo"/);
  assert.doesNotMatch(
    html,
    /AI-generated|illustrative rates|Protected staff access|href="\/staff"/,
  );
});
