# Hosting config path

- A deployment inspection initially tried `.openai/hosting.json` at the repository root and failed because the Sites configuration is under `app/.openai/hosting.json`.
- Re-reading the nested configuration confirmed the existing Sites project ID and its `DB`/`PACKS` logical bindings.
