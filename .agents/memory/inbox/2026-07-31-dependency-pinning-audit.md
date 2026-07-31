# Backend dependency pinning

- The new Drizzle and Cloudflare/Vitest packages were pinned to exact versions
  for repeatable local runtime behavior.
- The final `npm install` audit reported 20 transitive findings (1 low,
  6 moderate, 13 high), down from the initial 22 after lockfile resolution.
- No automatic or forced audit rewrite was run.
