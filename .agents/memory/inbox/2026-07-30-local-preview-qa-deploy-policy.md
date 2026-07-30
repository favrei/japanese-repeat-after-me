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

## Single-user simplification

- The user is currently the only application user.
- Do not create separate development and production branches, a staging site,
  environment-promotion machinery, multiple user roles, or a separate QA
  database.
- Use one deployable codebase and this flow:

  `develop locally → run QA → preview the exact build locally over trusted
  HTTPS → approve → deploy that exact build privately`

- QA and deployment remain separate actions even though there are no separate
  development and deployment environments. Deployment must still be an
  explicit action after QA, and it must use the exact QA-passed artifact
  without rebuilding it.
- Retain the deployment-package privacy check for recordings, datasets,
  secrets, and training artifacts.
- Prefer browser-local storage plus export/import if that satisfies the
  product. Keep hosted storage only when cross-device synchronization or
  another proven server-side requirement justifies it.

## Repo-wide agent debugging permission

- Every coding agent in this repository may start or reuse the local client
  host, open the client, inspect it, and debug it without asking for separate
  permission each time.
- Headless debugging may use OpenCLI or conventional frameworks such as
  Playwright, Puppeteer, or direct CDP tooling.
- Agents with real-browser control may use it for visual, interaction,
  permission, WebGPU, audio, and browser-specific checks.
- Automated checks should prefer fake or synthetic media. This permission does
  not itself authorize ambient recording, private-data upload, publication, or
  deployment.
- Starting and testing the client does not satisfy or bypass the explicit
  deployment gate.

## Development-only navigation and capture harness

- During development and QA, give coding agents programmatic navigation to
  every application screen and relevant UI state.
- Support viewport and full-page screenshot capture so agents can preserve
  evidence, compare regressions, and debug visual or interaction failures.
- Make the harness usable through both headless frameworks and agents with
  real-browser control.
- Keep any debug routes, navigation controls, deterministic fixtures, state
  seeding, and capture hooks behind an explicit development/QA flag.
- Disable the harness for deployment and exclude its private debug surfaces
  and fixtures from the production artifact where practical.
- Extend the deployment-artifact check to reject accidentally packaged
  development-only fixtures, captured screens, or private debug data.
