import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve("_site");
const port = Number(process.env.REGISTRY_PORT ?? 4180);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid REGISTRY_PORT");
const types: Record<string, string> = {
  ".json": "application/json",
  ".zip": "application/zip",
  ".html": "text/html; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname,
    );
    const file = resolve(
      root,
      `.${pathname === "/" ? "/index.html" : pathname}`,
    );
    if (!file.startsWith(root + sep) || !(await stat(file)).isFile())
      throw new Error("Not found");
    response.setHeader(
      "Content-Type",
      types[extname(file)] ?? "application/octet-stream",
    );
    response.setHeader("Cache-Control", "no-store");
    createReadStream(file)
      .on("error", () => response.destroy())
      .pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Local registry: http://127.0.0.1:${port}/index.json`),
);
