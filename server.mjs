import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, extname, resolve, sep } from "node:path";

const PORT = process.env.PORT || 4321;
const HOST = "0.0.0.0";
const ROOT = resolve("./dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".mp4": "video/mp4",
};

const SECURITY = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "geolocation=(), microphone=(), camera=(), interest-cohort=()",
  "Strict-Transport-Security":
    "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
};

function cacheControl(pathname, ext) {
  if (pathname.startsWith("/_astro/") || ext === ".woff2" || ext === ".woff")
    return "public, max-age=31536000, immutable";
  if (ext === ".html") return "no-cache";
  return "public, max-age=3600";
}

async function resolveFile(pathname) {
  const candidates = [];
  const decoded = pathname;
  if (decoded.endsWith("/")) {
    candidates.push(join(ROOT, decoded, "index.html"));
  } else if (extname(decoded)) {
    candidates.push(join(ROOT, decoded));
  } else {
    candidates.push(join(ROOT, decoded));
    candidates.push(join(ROOT, decoded, "index.html"));
  }
  for (const file of candidates) {
    const full = resolve(file);
    if (full !== ROOT && !full.startsWith(ROOT + sep)) continue;
    try {
      const info = await stat(full);
      if (info.isFile()) return { full, info };
    } catch {}
  }
  return null;
}

function send(req, res, status, full, info, ext) {
  const headers = {
    ...SECURITY,
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": cacheControl(req.pathname || "", ext),
  };
  if (info) headers["Content-Length"] = info.size;
  res.writeHead(status, headers);
  if (req.method === "HEAD" || !full) {
    res.end();
    return;
  }
  createReadStream(full).pipe(res);
}

const server = createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { ...SECURITY, Allow: "GET, HEAD" });
    res.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(req.url.split("?")[0]);
  } catch {
    pathname = "/";
  }
  req.pathname = pathname;

  const match = await resolveFile(pathname);
  if (match) {
    send(req, res, 200, match.full, match.info, extname(match.full));
    return;
  }

  // 404
  const notFound = resolve(join(ROOT, "404.html"));
  req.pathname = "/404.html";
  try {
    const info = await stat(notFound);
    if (info.isFile()) {
      send(req, res, 404, notFound, info, ".html");
      return;
    }
  } catch {}
  res.writeHead(404, {
    ...SECURITY,
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  res.end(req.method === "HEAD" ? undefined : "404 Not Found");
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ./dist on http://${HOST}:${PORT}`);
});
