import { env } from "cloudflare:workers";
import { applyD1Migrations } from "cloudflare:test";

// The official helper records applied migrations and is safe when setup reruns.
await applyD1Migrations(
  env.DB as never,
  env.TEST_MIGRATIONS as never,
);
