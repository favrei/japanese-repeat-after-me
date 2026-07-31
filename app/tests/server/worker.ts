import { handleBackendRequest } from "../../server/router";
import type { BackendEnv } from "../../server/cloudflare";

const worker = {
  async fetch(request: Request, env: BackendEnv): Promise<Response> {
    return (
      (await handleBackendRequest(request, env)) ??
      Response.json(
        { code: "not_found", error: "Route not found." },
        { status: 404 },
      )
    );
  },
};

export default worker;
