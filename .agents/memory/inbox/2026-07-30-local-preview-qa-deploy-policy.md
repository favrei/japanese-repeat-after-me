# Local Preview and QA-Gated Deployment

## User direction

- Develop and host the application locally for routine preview.
- Do not deploy merely because a build succeeds.
- Deploy only the exact source and artifact that have completed the agreed
  automated tests and manual QA.

## Infrastructure audit

- The repository root has no canonical product frontend or site toolchain.
- Parked experiment 005 is a useful Vinext/Vite/Sites scaffold with local
  development, build, D1, WASM, WebGPU, and Sites packaging pieces.
- It is not currently a release foundation:
  - its production-like local start command fails;
  - its two rendered tests fail and still describe the starter skeleton;
  - lint and TypeScript checks fail;
  - the dashboard/API/storage contracts are inconsistent;
  - no browser, microphone, PWA, offline, model-cache, or cross-device QA
    exists;
  - no Sites project is connected;
  - no automated deployment-package privacy check or manual release gate
    exists.
- Same-Mac development preview works. Cross-device local microphone QA needs
  explicit LAN binding and trusted HTTPS; plain LAN HTTP is not sufficient.

## Minimum sufficient workflow

1. Keep the deployable site in an isolated Git project that cannot inherit the
   parent repository's private voice-data history.
2. Provide hot-reload development and a production-build local preview.
3. Provide one reproducible local QA command covering type checks, lint, unit
   tests, build, browser smoke tests, forced WASM fallback, optional WebGPU,
   and deployment-artifact privacy checks.
4. Add explicit real-device QA over trusted local HTTPS for microphone and
   runtime behavior.
5. Freeze the QA-passed commit and packaged artifact with checksums.
6. Save an immutable Sites version from that exact source state.
7. Deploy privately only after explicit QA sign-off.

CI is optional in the current minimalist phase. A trustworthy local QA command
plus a separate manual deployment action is sufficient.
