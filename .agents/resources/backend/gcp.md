# GCP Backend Reference

Hypothetical future-provider reference only. GCP is not an active implementation
target. Canonical project decisions remain in
[`memory/cells/backend.md`](../../memory/cells/backend.md).

Last checked: 2026-07-31.

## Rough service mapping

| Current Cloudflare role | Possible GCP equivalent |
|---|---|
| Sites / Worker | Cloud Run |
| D1 structured state | Cloud SQL or Firestore, depending on the data model |
| R2 object storage | Cloud Storage |
| Miniflare/workerd local runtime | Local container plus service-specific test tooling |

This is a comparison, not a selected migration design. Cloud SQL and Firestore
have different data models; choosing between them requires an actual migration
question.

## Portability boundary

- The frontend, HTTP contracts, content schemas, and domain/use-case logic are
  portable.
- Cloudflare Worker entry code, D1/R2 bindings, migrations, deployment
  packaging, and provider smoke tests are not portable.
- Keep provider-specific access localized in small catalog, progress, and pack
  storage helpers.
- Do not implement a provider-neutral framework, GCP adapter, or dual-provider
  test matrix now. Add another adapter only when a provider move becomes real.

## GCP test-tool reference

- Cloud Run can run the service container locally through Docker, Cloud Code,
  or Google Cloud CLI.
- Firestore provides a local emulator if Firestore is selected.
- Each selected GCP service still requires its own adapter tests and a small
  hosted smoke test; Cloudflare's local kit does not test GCP.

## External references

- [Cloud Run overview](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run)
- [Test Cloud Run locally](https://docs.cloud.google.com/run/docs/testing/local)
- [Cloud Run container contract](https://docs.cloud.google.com/run/docs/container-contract)
- [Firestore emulator](https://docs.cloud.google.com/firestore/native/docs/emulator)

These links are retained as references; no external documentation or code is
redistributed here.
