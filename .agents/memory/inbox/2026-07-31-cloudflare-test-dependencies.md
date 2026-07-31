# Cloudflare backend test dependencies

- `poc/` now uses `drizzle-orm` and `drizzle-kit` for the D1 schema and generated
  migration, plus Vitest and `@cloudflare/vitest-pool-workers` for backend
  tests inside the local Workers runtime.
- Installation completed successfully.
- `npm` reported 22 transitive audit findings (1 low, 8 moderate, 13 high);
  no automatic or forced audit rewrite was run because that could make
  unrelated dependency changes.
