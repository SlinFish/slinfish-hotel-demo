import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, win32, posix } from "node:path";
import { pathToFileURL } from "node:url";
import { request } from "node:http";
import {
  createDemoServer,
  resolveDemoRequest,
} from "../scripts/serve-demo.mjs";

const routes = {
  "/": "index.html",
  "/rooms/": "rooms/index.html",
  "/about-demo/": "about-demo/index.html",
  "/staff/demo/": "staff/demo/index.html",
};
test("Windows drive and UNC roots map public URLs to export HTML", () => {
  for (const root of [
    "C:\\Users\\Demo\\Hotel Site\\out\\",
    "c:\\Hotel #25%\\out",
    "\\\\server\\share\\Hotel Site\\out\\",
  ]) {
    for (const [url, relative] of Object.entries(routes)) {
      assert.deepEqual(resolveDemoRequest(root, url, win32), {
        file: win32.join(root, ...relative.split("/")),
        redirect: null,
      });
      if (url !== "/")
        assert.deepEqual(
          resolveDemoRequest(root, `${url.slice(0, -1)}?room=terrace`, win32),
          {
            file: win32.join(root, ...relative.split("/")),
            redirect: `${url}?room=terrace`,
          },
        );
    }
    assert.equal(
      resolveDemoRequest(root, "/images/garden%20room.jpg", win32).file,
      win32.join(root, "images", "garden room.jpg"),
    );
  }
});
test("URL resolution blocks Windows separators, drives, traversal and operational routes", () => {
  for (const paths of [win32, posix]) {
    const root = paths === win32 ? "C:\\demo\\out" : "/demo/out";
    for (const url of [
      "/../secret",
      "/%2e%2e/secret",
      "/images/%2e%2e/%2e%2e/secret",
      "/%5c..%5csecret",
      "/C:/secret",
      "/%00",
      "/%zz",
      "/.env",
      "/staff",
      "/staff/",
      "/api",
      "/api/inquiries",
      "/%61pi/staff/inquiries",
      "//outside/share",
    ])
      assert.throws(() => resolveDemoRequest(root, url, paths), undefined, url);
  }
});
async function rawGet(port, path, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = request(
      { hostname: "127.0.0.1", port, path, method },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString(),
          }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}
test("HTTP preview serves navigation/refresh with CRLF headers and a file-URL root", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "aster preview "));
  const root = join(temporary, "Hotel #25% Ω", "out");
  await mkdir(root, { recursive: true });
  for (const relative of [
    ...Object.values(routes),
    "404.html",
    "images/garden room.jpg",
  ]) {
    await mkdir(join(root, relative, ".."), { recursive: true });
    await writeFile(join(root, relative), relative);
  }
  await writeFile(
    join(root, "_headers"),
    "/*\r\n  X-Frame-Options: DENY\r\n  Content-Security-Policy: default-src 'self'; form-action 'none'\r\n",
  );
  await writeFile(join(temporary, "secret.txt"), "outside export");
  // Junctions do not require Windows symlink privilege.
  await symlink(
    temporary,
    join(root, "escape"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const server = createDemoServer(pathToFileURL(root));
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    for (const [url, relative] of Object.entries(routes)) {
      for (let repeat = 0; repeat < 2; repeat++) {
        const response = await rawGet(port, url);
        assert.equal(response.status, 200, url);
        assert.equal(response.body, relative);
        assert.equal(response.headers["x-frame-options"], "DENY");
        assert.equal(
          response.headers["content-security-policy"],
          "default-src 'self'; form-action 'none'",
        );
      }
      if (url !== "/") {
        const redirect = await rawGet(port, `${url.slice(0, -1)}?room=terrace`);
        assert.equal(redirect.status, 308);
        assert.equal(redirect.headers.location, `${url}?room=terrace`);
      }
    }
    assert.equal((await rawGet(port, "/images/garden%20room.jpg")).status, 200);
    const head = await rawGet(port, "/", "HEAD");
    assert.equal(head.status, 200);
    assert.equal(head.body, "");
    for (const url of [
      "/unknown",
      "/unknown/",
      "/staff",
      "/staff/",
      "/api/inquiries",
      "/../secret.txt",
      "/%2e%2e/secret.txt",
      "/%5c..%5csecret.txt",
      "/escape/secret.txt",
    ]) {
      const response = await rawGet(port, url);
      assert.equal(response.status, 404, url);
      assert.equal(response.body, "404.html");
      assert.equal(response.headers["x-frame-options"], "DENY");
    }
    assert.equal((await rawGet(port, "/", "POST")).status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(temporary, { recursive: true, force: true });
  }
});

test("preview reports missing policy configuration instead of disguising it as a route 404", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-preview-policy-"));
  await writeFile(join(root, "index.html"), "HOME");
  await writeFile(join(root, "404.html"), "CUSTOM404");
  const server = createDemoServer(root);
  const messages = [];
  const originalError = console.error;
  try {
    console.error = (...args) => messages.push(args.join(" "));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const response = await rawGet(server.address().port, "/");
    assert.equal(response.status, 500);
    assert.match(response.body, /Check the preview terminal/);
    assert.ok(messages.some((message) => message.includes("security headers")));
  } finally {
    console.error = originalError;
    await new Promise((resolve) => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});
