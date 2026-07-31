import { access, cp, mkdir, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

// Packages Sites metadata and migrations after Vite finishes compiling.
export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const drizzleSource = resolve(root, "drizzle");
      const logicalModelArchive = resolve(
        root,
        "dist",
        "client",
        "models",
        "vosk-model-small-ja-0.22.tar.gz",
      );
      const serverAssets = resolve(root, "dist", "server", "assets");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
      if (await exists(drizzleSource)) {
        await cp(drizzleSource, resolve(outputDirectory, "drizzle"), {
          recursive: true,
        });
      }

      // The service worker reconstructs this logical URL from verified chunks.
      // Keeping the source archive in a Sites build would exceed its file limit.
      await rm(logicalModelArchive, { force: true });

      // The client build owns these browser fonts. Vinext also emits duplicate
      // copies beside the Worker even though the Worker never serves them.
      if (await exists(serverAssets)) {
        const entries = await readdir(serverAssets, { withFileTypes: true });
        await Promise.all(
          entries
            .filter(
              (entry) =>
                entry.isFile() && /\.(?:woff|woff2)$/.test(entry.name),
            )
            .map((entry) => rm(resolve(serverAssets, entry.name))),
        );
      }
    },
  };
}
