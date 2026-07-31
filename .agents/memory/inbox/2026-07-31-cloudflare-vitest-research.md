# Cloudflare Workers test harness research

- Cloudflare's current recommendation is `@cloudflare/vitest-pool-workers`
  with Vitest 4.1 or newer for Worker unit/integration tests.
- Tests run locally in workerd through Miniflare and expose real local D1/R2
  bindings with per-test-file storage isolation.
- D1 migrations can be read in the Node-side Vitest config with
  `readD1Migrations()` and applied inside the Worker test runtime with
  `applyD1Migrations()`.
- Official references were added to
  `.agents/resources/backend/cloudflare.md`; checked 2026-07-31.
