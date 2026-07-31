# Cloudflare Backend Reference

Reference research for the current GPT Sites / Cloudflare backend. Canonical
project decisions remain in
[`memory/cells/backend.md`](../../memory/cells/backend.md).

Last checked: 2026-07-31.

## Project mapping

- GPT Sites packages the application as a Cloudflare Worker plus static assets,
  with optional D1 and R2 bindings.
- [`app/vite.config.ts`](../../../app/vite.config.ts) loads
  `@cloudflare/vite-plugin`, selects `worker/index.ts` as the Worker entry, and
  derives local D1/R2 binding names from `.openai/hosting.json`.
- [`app/.openai/hosting.json`](../../../app/.openai/hosting.json) currently
  declares logical bindings `DB` and `PACKS`. This activates isolated local
  D1/R2 resources now and asks Sites to provision hosted resources on a future
  deployment; no such deployment was made during the separation change.
- [`app/build/sites-vite-plugin.ts`](../../../app/build/sites-vite-plugin.ts)
  packages Sites metadata and Drizzle migrations. It is a deployment packager,
  not the local test runtime.
- [`app/worker/index.ts`](../../../app/worker/index.ts) passes `DB` and `PACKS`
  from the Worker `env` object into the backend router before falling through to
  image handling and Vinext rendering.
- [`app/server/`](../../../app/server/) contains the localized Cloudflare
  storage boundary. D1 serves the public catalog and R2 serves immutable
  versioned pack objects.

## Local and hosted consistency

- Application code uses logical binding names such as `env.DB` or
  `env.PACKS`, never concrete Cloudflare resource IDs.
- In development, the Cloudflare Vite plugin runs the Worker through
  Miniflare/workerd and supplies isolated local D1/R2 resources.
- On Sites, deployment wiring maps the same logical names to hosted resources.
- Local and hosted data are deliberately separate. The mechanism provides a
  common API and runtime model, not data synchronization.
- Business logic should not branch on “local versus cloud.” Provider-specific
  access belongs in small storage helpers.

## Implemented testing boundary

- `app/tests/client/` keeps flow, scoring, and recognition checks in fast Node
  tests.
- `app/tests/contracts/` checks provider-independent catalog and story-pack
  payloads in Node.
- `app/tests/server/` runs inside workerd through
  `@cloudflare/vitest-pool-workers`, applies generated migrations to isolated
  local D1, and exercises D1/R2 through a Worker entry.
- `app/tests/integration/` verifies the built production Worker, packaged Sites
  bindings/migration, the absence of client-to-server imports, and completion
  of downloaded story flows while backend fetches fail.
- The D1 suite also round-trips a logical catalog export/restore. It does not
  create an unauthenticated production restore route.

Future progress-sync work still needs reconnection and idempotency coverage.
The first deployment with storage still needs a small hosted smoke test for
real provisioning and persistence across a redeploy.
- After deployment, run only a small hosted smoke test for real binding
  provisioning, D1/R2 read/write, and persistence across redeploys.

## Known Sites constraints

- A deployment rejected a 49,654,706-byte asset above the observed
  26,214,400-byte per-file limit.
- A second deployment rejected a Worker above 10 MiB.
- The successful build omitted the redundant full Vosk archive, retained six
  verified model chunks, removed duplicate server fonts, and prevented the
  browser-only Vosk bundle from entering the Worker.
- Sites does not expose the underlying Cloudflare account, console, Wrangler
  administration, database export, or point-in-time recovery to this project.
  Application-owned export and forward-compatible migrations remain necessary
  if D1 is introduced.

## External references

- [GPT Sites documentation](https://learn.chatgpt.com/docs/sites)
- [Cloudflare local development](https://developers.cloudflare.com/workers/local-development/)
- [Adding local D1 and R2 data](https://developers.cloudflare.com/workers/local-development/local-data/)
- [Workers Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/)
- [Workers Vitest test APIs](https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/)
- [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [R2 Workers API](https://developers.cloudflare.com/r2/get-started/workers-api/)
- [R2 Wrangler commands](https://developers.cloudflare.com/r2/reference/wrangler-commands/)

These links are retained as references; no external documentation or code is
redistributed here.
