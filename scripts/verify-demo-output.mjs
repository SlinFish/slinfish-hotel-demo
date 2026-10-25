import assert from "node:assert/strict";
import { readdir, readFile, access } from "node:fs/promises";
import { join, relative } from "node:path";
export async function verifyDemoOutput(output) {
  const required = [
    "index.html",
    "rooms/index.html",
    "about-demo/index.html",
    "staff/demo/index.html",
    "404.html",
    ...["hero", "garden", "terrace", "family", "experience"].map(
      (name) => `images/${name}.jpg`,
    ),
  ];
  for (const path of required) await access(join(output, path));
  const publicHtml = new Set([
    "index.html",
    "rooms/index.html",
    "about-demo/index.html",
    "staff/demo/index.html",
    "404.html",
    "404/index.html",
    "_not-found/index.html",
  ]);
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      const path = relative(output, absolute).replaceAll("\\", "/");
      assert.ok(!entry.isSymbolicLink(), `Unexpected publish symlink: ${path}`);
      assert.ok(
        !/(^|\/)(?:api|functions|node_modules|prisma|src|\.next|\.git)(?:\/|$)|(^|\/)\.env|_worker\.js|\.map$/.test(
          path,
        ),
        `Private/runtime artifact: ${path}`,
      );
      assert.ok(
        !path.startsWith("staff/") ||
          path === "staff/demo" ||
          path.startsWith("staff/demo/"),
        `Operational staff route: ${path}`,
      );
      if (path.endsWith(".html"))
        assert.ok(publicHtml.has(path), `Unexpected HTML route: ${path}`);
      assert.ok(
        !/^(?:package(?:-lock)?\.json|tsconfig\.json|next\.config\..+)$/.test(
          path,
        ),
        `Private build configuration: ${path}`,
      );
      if (entry.isDirectory()) await inspect(absolute);
      else if (/\.(?:html|js|json|txt|rsc)$/.test(path)) {
        const text = await readFile(absolute, "utf8");
        assert.doesNotMatch(
          text,
          /STAFF_ACCESS_TOKEN|DATABASE_URL|PrismaClient|postgres(?:ql)?:\/\/|\/api\/(?:inquiries|staff|admin)/,
          `Backend/configuration reference in ${path}`,
        );
        if (path.endsWith(".html"))
          assert.doesNotMatch(
            text,
            /href=["']\/staff\/?["']/,
            `Operational navigation in ${path}`,
          );
      }
    }
  }
  await inspect(output);
}
