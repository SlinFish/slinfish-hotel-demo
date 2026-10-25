import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  access,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);

test("typecheck generates a missing Prisma client before checking strictly typed inquiry rows", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "aster-clean-types-"));
  try {
    await mkdir(join(fixture, "prisma"));
    const schema = (
      await readFile(join(root, "prisma/schema.prisma"), "utf8")
    ).replace(
      /provider\s*=\s*"prisma-client-js"/,
      '$&\n  output = "../generated"',
    );
    await writeFile(join(fixture, "prisma/schema.prisma"), schema);
    const { scripts } = JSON.parse(
      await readFile(join(root, "package.json"), "utf8"),
    );
    await writeFile(
      join(fixture, "package.json"),
      JSON.stringify({
        private: true,
        scripts: { typecheck: scripts.typecheck },
      }),
    );
    await writeFile(
      join(fixture, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
        },
        include: ["rows.ts"],
      }),
    );
    const source =
      'import { PrismaClient } from "./generated/index.js";\nconst prisma = new PrismaClient();\nexport async function ids() { const rows = await prisma.inquiry.findMany(); return rows.map(row => row.id); }\n';
    await writeFile(join(fixture, "rows.ts"), source);
    await symlink(
      join(root, "node_modules"),
      join(fixture, "node_modules"),
      process.platform === "win32" ? "junction" : "dir",
    );
    const options = {
      cwd: fixture,
      encoding: "utf8",
      timeout: 60000,
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://unused:unused@127.0.0.1:1/unavailable",
        PRISMA_HIDE_UPDATE_MESSAGE: "1",
      },
    };
    const compile = () =>
      spawnSync(
        process.execPath,
        [require.resolve("typescript/bin/tsc"), "--noEmit"],
        options,
      );
    const before = compile();
    assert.notEqual(before.status, 0);
    assert.match(
      before.stdout + before.stderr,
      /TS7006/,
      "Missing client must reproduce the implicitly-any row symptom",
    );
    const generated = process.env.npm_execpath
      ? spawnSync(
          process.execPath,
          [process.env.npm_execpath, "run", "typecheck"],
          options,
        )
      : spawnSync("npm", ["run", "typecheck"], {
          ...options,
          shell: process.platform === "win32",
        });
    assert.equal(
      generated.status,
      0,
      generated.error?.message ?? generated.stdout + generated.stderr,
    );
    await access(join(fixture, "generated/index.d.ts"));
    await writeFile(
      join(fixture, "rows.ts"),
      source.replace("row.id", "row.notAnInquiryField"),
    );
    const invalid = compile();
    assert.notEqual(invalid.status, 0);
    assert.match(
      invalid.stdout + invalid.stderr,
      /TS2339/,
      "Generated rows must remain concrete types rather than any",
    );
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
