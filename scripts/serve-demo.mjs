// Local filesystem preview with custom 404s, never an SPA fallback or API server.
import { createServer } from "node:http";
import { readFile, realpath, access } from "node:fs/promises";
import * as nativePath from "node:path";
import { fileURLToPath } from "node:url";

class NotFound extends Error {}
function isInside(root, file, paths = nativePath) {
  const relative = paths.relative(root, file);
  return (
    relative !== ".." &&
    !relative.startsWith(`..${paths.sep}`) &&
    !paths.isAbsolute(relative)
  );
}

// Decode URL segments, then join them to an absolute export root. A URL pathname
// is never passed to native resolve as an absolute Windows/drive-relative path.
export function resolveDemoRequest(
  directory,
  requestTarget,
  paths = nativePath,
) {
  if (!requestTarget.startsWith("/") || requestTarget.startsWith("//"))
    throw new NotFound("Invalid request target");
  const rawPath = requestTarget.split(/[?#]/, 1)[0];
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    throw new NotFound("Invalid URL encoding");
  }
  if (/[\\:\x00-\x1f\x7f]/.test(decoded))
    throw new NotFound("Invalid path separator");
  const segments = decoded.split("/").filter(Boolean);
  if (segments.some((segment) => segment.startsWith(".")))
    throw new NotFound("Private or traversing path");
  const route = segments.join("/").toLowerCase();
  if (
    ((route === "staff" || route.startsWith("staff/")) &&
      route !== "staff/demo" &&
      !route.startsWith("staff/demo/")) ||
    route === "api" ||
    route.startsWith("api/")
  )
    throw new NotFound("Operational route");
  const root = paths.resolve(directory);
  const index =
    !segments.length ||
    decoded.endsWith("/") ||
    !paths.extname(segments.at(-1));
  const file = paths.join(root, ...segments, ...(index ? ["index.html"] : []));
  if (!isInside(root, file, paths)) throw new NotFound("Outside export");
  const url = new URL(requestTarget, "http://localhost");
  return {
    file,
    redirect:
      index && segments.length && !rawPath.endsWith("/")
        ? `${url.pathname}/${url.search}`
        : null,
  };
}

export function createDemoServer(directory) {
  const root = nativePath.resolve(
    directory instanceof URL ? fileURLToPath(directory) : directory,
  );
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".txt": "text/plain",
    ".json": "application/json",
  };
  async function readPublicFile(file) {
    const [actualRoot, actualFile] = await Promise.all([
      realpath(root),
      realpath(file),
    ]);
    if (!isInside(actualRoot, actualFile))
      throw new NotFound("Symlink outside export");
    return readFile(actualFile);
  }
  return createServer(async (request, response) => {
    try {
      let headers;
      try {
        headers = await readPublicFile(nativePath.join(root, "_headers"));
      } catch (cause) {
        throw new Error(
          "Cannot read preview security headers; run npm run build:demo",
          { cause },
        );
      }
      for (const line of headers.toString("utf8").split(/\r?\n/)) {
        const match = line.match(/^\s{2}([^:]+): (.+)$/);
        if (match) response.setHeader(match[1].trim(), match[2].trim());
      }
      if (!["GET", "HEAD"].includes(request.method))
        throw new NotFound("No mutations");
      const { file, redirect } = resolveDemoRequest(root, request.url);
      // Read before redirecting: an unknown directory must stay a 404.
      const body = await readPublicFile(file);
      if (redirect) {
        response.writeHead(308, { Location: redirect });
        response.end();
        return;
      }
      response.writeHead(200, {
        "Content-Type":
          types[nativePath.extname(file)] ?? "application/octet-stream",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      const missing =
        error instanceof NotFound || ["ENOENT", "ENOTDIR"].includes(error.code);
      response.writeHead(missing ? 404 : 500, {
        "Content-Type": "text/html; charset=utf-8",
      });
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      if (missing)
        response.end(
          await readPublicFile(nativePath.join(root, "404.html")).catch(
            () => "Not found",
          ),
        );
      else {
        console.error("Static preview error:", error.message);
        response.end(
          "Unable to serve the static export. Check the preview terminal.",
        );
      }
    }
  });
}
if (
  process.argv[1] &&
  nativePath.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const directory = fileURLToPath(new URL("../out/", import.meta.url));
  // Fail clearly at startup instead of disguising a wrong export root as a 404.
  for (const file of [
    "index.html",
    "rooms/index.html",
    "about-demo/index.html",
    "staff/demo/index.html",
    "404.html",
    "_headers",
  ]) {
    try {
      await access(nativePath.join(directory, file));
    } catch {
      throw new Error(
        `Static export is missing ${nativePath.join(directory, file)}. Run npm run build:demo first.`,
      );
    }
  }
  const port = Number(process.env.PORT ?? 4173);
  createDemoServer(directory).listen(port, "127.0.0.1", () =>
    console.log(
      `Static preview listening on port ${port}\nServing export: ${directory}`,
    ),
  );
}
