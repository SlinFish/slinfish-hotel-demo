// Exercise the actual TypeScript modules with the existing Node test runner.
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
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
      loadedModules.add(fileURLToPath(url));
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
