// Local filesystem preview with custom 404s, never an SPA fallback or API server.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
export function createDemoServer(directory) {
  const root = resolve(directory);
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
  return createServer(async (request, response) => {
    try {
      const headers = await readFile(resolve(root, "_headers"), "utf8");
      for (const line of headers.split("\n")) {
        const match = line.match(/^\s{2}([^:]+): (.+)$/);
        if (match) response.setHeader(match[1], match[2]);
      }
      const url = new URL(request.url, "http://localhost");
      const file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
      if (file !== root && !file.startsWith(root + sep))
        throw new Error("Outside export");
      if (!["GET", "HEAD"].includes(request.method))
        throw new Error("No mutations");
      const metadata = await stat(file);
      if (metadata.isDirectory() && !url.pathname.endsWith("/")) {
        response.writeHead(308, { Location: url.pathname + "/" + url.search });
        response.end();
        return;
      }
      const target = metadata.isDirectory()
        ? resolve(file, "index.html")
        : file;
      const body = await readFile(target);
      response.setHeader(
        "Content-Type",
        types[extname(target)] ?? "application/octet-stream",
      );
      response.writeHead(200);
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(
        await readFile(resolve(root, "404.html")).catch(() => "Not found"),
      );
    }
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT ?? 4173);
  createDemoServer(fileURLToPath(new URL("../out/", import.meta.url))).listen(
    port,
    "127.0.0.1",
    () => console.log(`Static preview listening on port ${port}`),
  );
}
