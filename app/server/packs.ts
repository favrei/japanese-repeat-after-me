import type { R2BucketLike, R2ObjectLike } from "./cloudflare";

const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function contentTypeFor(path: string): string {
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".mp3")) return "audio/mpeg";
  if (path.endsWith(".woff2")) return "font/woff2";
  return "application/octet-stream";
}

export function packKeyFromPath(pathname: string): string | null {
  if (!pathname.startsWith("/packs/") || pathname.length > 512) return null;
  const segments = pathname.slice(1).split("/");
  if (segments.length < 4 || segments.some((part) => !SAFE_SEGMENT.test(part))) {
    return null;
  }
  return segments.join("/");
}

function notModified(request: Request, object: R2ObjectLike): boolean {
  const value = request.headers.get("if-none-match");
  if (!value) return false;
  const candidates = value.split(",").map((candidate) => candidate.trim());
  return candidates.includes("*") || candidates.includes(object.httpEtag);
}

export async function servePack(
  request: Request,
  bucket: R2BucketLike,
): Promise<Response> {
  const key = packKeyFromPath(new URL(request.url).pathname);
  if (!key) {
    return Response.json(
      { code: "invalid_pack_path", error: "Invalid versioned pack path." },
      { status: 400 },
    );
  }

  const object =
    request.method === "HEAD" ? await bucket.head(key) : await bucket.get(key);
  if (!object) {
    return Response.json(
      { code: "pack_not_found", error: "Pack object not found." },
      { status: 404 },
    );
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);
  headers.set("Content-Length", String(object.size));
  headers.set("X-Content-Type-Options", "nosniff");
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", contentTypeFor(key));
  }

  if (notModified(request, object)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(request.method === "HEAD" ? null : (object.body ?? null), {
    status: 200,
    headers,
  });
}
