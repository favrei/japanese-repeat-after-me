# Frontend/backend separation implemented

- `poc/` now separates `app/` route shell, `client/` gameplay and bundled
  content, `shared/` payload contracts, `server/` D1/R2 logic, and `worker/`
  composition.
- Added a D1 catalog schema/migration, read-only catalog route, immutable
  versioned R2 pack route, and tested logical catalog export/restore helpers.
- `.openai/hosting.json` now declares logical `DB` and `PACKS` bindings. No
  deployment was made.
- Tests are split into client, contracts, Cloudflare server, and production
  integration suites under one `npm run qa` gate.
- Final QA passed: art validation, model validation, typecheck, lint, build,
  23 client tests, 2 contract tests, 7 workerd D1/R2 tests, and 5 integration
  tests.
