# Recognition merged into the four-stage app

- Merged the complete `recognition/vosk-local-first` lane into the current
  four-stage café/taproom application as nested PoC merge commit `3a3b84d`
  (`Merge local Vosk recognition into four-stage app`). Its parents are current
  app commit `14cd2b6` and recognition commit `18fcf55`, so the recognition
  history is now genuinely merged rather than copied or left parked.
- Preserved the current story selector, art packs, transitions, generated
  reference audio, and bubble progression while replacing Chrome
  `SpeechRecognition` with `vosk-browser` 0.0.8, AudioWorklet PCM capture,
  local recording-quality checks, partial/final transcripts, selected-story
  catalogue matching, and the experiment-006 descriptive content threshold.
- Preserved the platform work: checksum-pinned model preparation/checking,
  ignored model artifacts, local-only privacy/error UI, service-worker model
  caching, PWA assets, secure-context handling, and loopback-host metadata.
- Production QA exposed a gap in the old recognition lane: the single
  49,654,706-byte model archive returned HTTP 404 from the Vinext production
  asset layer even though it worked in development. The prepare script now
  emits six SHA-256-verified parts (five 8 MiB parts and one 7,711,666-byte
  part) plus a manifest. The service worker caches and streams those parts as
  the single tar archive URL required by `vosk-browser`, and production model
  startup waits for service-worker control.
- Final automated QA passed in nested app `main`: café and taproom art-pack
  validation, model archive and part verification, TypeScript, lint,
  production build, and all 25/25 tests.
- Production browser QA at the isolated IPv4 loopback opened the taproom stage,
  advanced from its transition to the first learner-speaking bubble, and
  reported `data-recognition-state="ready"` with the record control enabled.
  No microphone permission was requested during automation.
- A pre-existing nested-PoC development server was already bound to IPv6
  localhost port 3000 and produced the previously documented Vite client
  `send` errors. It was not stopped. The integration production server bound
  IPv4 port 3000, so QA used `127.0.0.1` to avoid touching the existing server.
- `npm ci` reports 19 total findings (2 low, 4 moderate, 13 high). The
  production-only audit reports 5 findings (2 moderate, 3 high): the unpatched
  `vosk-browser` → `uuid` advisory and Next's transitive PostCSS/Sharp findings.
  No automated audit fix was applied.
- Prepared model files and parts exist only as ignored local artifacts under
  `poc/public/models/`; none were committed.
- Removed both clean duplicate checkouts after verifying their branches were
  ancestors of app `main`:
  `japanese-repeat-after-me-recognition` and
  `japanese-repeat-after-me-recognition-integration`.
- The nested app repository still has no configured remote, so `3a3b84d`
  remains local until a remote destination is supplied.
