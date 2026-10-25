// Exercise the actual TypeScript modules with the existing Node test runner.
import { createRequire, registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
// Load the real Next Link through native CommonJS before installing the TS hooks.
// Node 22.16 can otherwise fail in its ESM/CJS bridge when Link requires helpers.
createRequire(import.meta.url)("next/link");
const root = new URL("../../", import.meta.url);
export const loadedModules = new Set();
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "next/link") return next("next/link.js", context);
    const candidate = specifier.startsWith("@/")
      ? new URL(`src/${specifier.slice(2)}`, root)
      : specifier.startsWith(".") && context.parentURL
        ? new URL(specifier, context.parentURL)
        : null;
    if (candidate?.protocol === "file:") {
      for (const suffix of ["", ".ts", ".tsx"]) {
        const name = fileURLToPath(candidate) + suffix;
        if (existsSync(name) && /\.tsx?$/.test(name))
          return { url: pathToFileURL(name).href, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith("file:") && /\.tsx?$/.test(url)) {
      // Keep module-boundary assertions effective on Windows as well as POSIX.
      loadedModules.add(fileURLToPath(url).replaceAll("\\", "/"));
      const result = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      });
      return {
        format: "module",
        source: result.outputText,
        shortCircuit: true,
      };
    }
    return next(url, context);
  },
});
