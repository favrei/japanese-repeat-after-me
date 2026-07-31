# Stable turn layout, replay, and success hold

- Gave the conversation practice panel fixed desktop and mobile footprints so autoplay and speak turns no longer resize the scene.
- Added a replay control to every dialogue bubble in `autoplay` mode, covering both staff and learner autoplay turns.
- Correct learner attempts now retain the successful bubble and feedback for 500 ms before advancing.
- Development QA mode bypasses microphone setup, allowing synthetic browser flow checks without microphone capture.
- `npm run qa` passed: build, typecheck, lint, art/model validation, and all 43 tests.
- Chrome QA confirmed identical autoplay/speak geometry: desktop panel 157.995 px and scene 616.571 px; mobile panel 237.995 px and scene 689.905 px. Replay restarted both staff and learner autoplay without changing bubbles. A success remained visible with feedback at 299 ms and had advanced after the 500 ms hold.
- Browser QA gotchas: the café stage test id is `select-stage-ordering`, not `select-stage-cafe-ordering`; the browser evaluate sandbox did not expose usable timing or `MutationObserver` APIs, so the timing check used immediate post-click state plus a later observation.
- Local development preview was started at `http://localhost:3000/` and intentionally left running for user testing.
