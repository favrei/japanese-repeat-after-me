# Microphone unit test initially failed under strip-only TypeScript

- `npm run typecheck` passed after the microphone route implementation.
- The first `npm run test:client` run failed because Node 22's
  `--experimental-strip-types` does not support a TypeScript parameter property
  in `MicrophoneRouteError`.
- The class now declares and assigns `code` explicitly so the source remains
  compatible with the repository's direct TypeScript test imports.
