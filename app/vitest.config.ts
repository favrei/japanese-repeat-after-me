import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const migrations = await readD1Migrations(
    path.join(projectRoot, "drizzle"),
  );

  return {
    plugins: [
      cloudflareTest({
        main: "./tests/server/worker.ts",
        remoteBindings: false,
        wrangler: { configPath: "./wrangler.local.jsonc" },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    test: {
      include: ["tests/server/**/*.test.ts"],
      setupFiles: ["./tests/server/apply-migrations.ts"],
    },
  };
});
