import { listPublishedCatalog } from "./catalog";
import type { BackendEnv } from "./cloudflare";
import { servePack } from "./packs";

function methodNotAllowed(allow: string): Response {
  return Response.json(
    { code: "method_not_allowed", error: "Method not allowed." },
    { status: 405, headers: { Allow: allow } },
  );
}

function storageUnavailable(resource: "D1" | "R2"): Response {
  return Response.json(
    {
      code: "storage_unavailable",
      error: `${resource} storage is not configured.`,
    },
    { status: 503 },
  );
}

export async function handleBackendRequest(
  request: Request,
  env: BackendEnv,
): Promise<Response | null> {
  const pathname = new URL(request.url).pathname;

  if (pathname === "/api/catalog") {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return methodNotAllowed("GET, HEAD");
    }
    if (!env.DB) return storageUnavailable("D1");

    try {
      const catalog = await listPublishedCatalog(env.DB);
      return new Response(
        request.method === "HEAD" ? null : JSON.stringify(catalog),
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
            "Content-Type": "application/json; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    } catch {
      return Response.json(
        {
          code: "catalog_unavailable",
          error: "The catalog is temporarily unavailable.",
        },
        { status: 503 },
      );
    }
  }

  if (pathname.startsWith("/packs/")) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return methodNotAllowed("GET, HEAD");
    }
    if (!env.PACKS) return storageUnavailable("R2");
    return servePack(request, env.PACKS);
  }

  return null;
}
