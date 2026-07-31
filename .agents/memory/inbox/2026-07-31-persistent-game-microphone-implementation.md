# Persistent game-session microphone implemented

- The selected microphone now has a game-session owner separate from each Vosk recognition attempt.
- Starting a game opens and retains the selected stream; individual learner turns attach and detach only their AudioWorklet/Vosk processing graph.
- The stream closes on game completion, explicit exit, component teardown, selected-route mute/end/loss, or a superseding game run. Pending async opens are cancelled by run identifiers.
- The UI reports `game-session mic active`; the physical Bluetooth route test remains explicitly open.
- Added a lifecycle unit test and deployment-source assertions.
- `npm run qa` passed on 2026-07-31: art/model validation, typecheck, lint, production build, 29 client tests, 2 contract tests, 7 Worker tests, and 5 integration tests (43 tests total).
- Real AirPods behavior remains for the user's local manual test; no ambient microphone capture was performed automatically.
