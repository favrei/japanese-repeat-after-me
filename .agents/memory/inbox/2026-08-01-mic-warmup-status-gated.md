# Microphone warm-up is now status-gated, not timed

Peter asked whether the microphone open delay was timer-based or checkable.
Before this change it was **neither** — `startListening` flipped
`isListening` true the instant `startLocalRecognition` returned, so the UI
claimed to be recording while the device was still opening.

Real status signals now used, in `client/recognition/`:

- `MediaStreamTrack.muted` / `unmute` — the spec's "source cannot deliver
  data yet" flag. `GameMicrophoneSession.ready` and `waitUntilReady()`
  (`microphone.ts`) read it; 2000 ms is only a ceiling.
- First non-silent capture buffer — `LocalRecognitionSession` drops warm-up
  frames (digital silence) and fires `onCaptureStart` at the first buffer with
  a non-zero sample, ceiling 1200 ms (`CAPTURE_START_TIMEOUT_MS`). Dropped
  frames also stop inflating the `too-short` / `too-quiet` quality checks.
- `PracticeApp` shows マイクを準備しています / マイクを準備中 during the gap,
  and the 20 s recording cap now starts at real capture, not at graph build.

Two related fixes fell out:

- A `mute` event used to be treated as an immediate lost route, which killed
  sessions that were only warming up (Bluetooth profile switch). It now has a
  1500 ms grace (`MUTE_GRACE_MS`); `ended` is still immediate.
- `startLocalRecognition` built a **new AudioContext plus a worklet
  `addModule()` fetch on every turn** and closed it in `finish()`. That was
  the recurring per-turn latency. There is now one shared context per game
  session (`prewarmRecognitionAudio` / `releaseRecognitionAudio`), primed when
  the mic activates. A zero-gain ConstantSourceNode on its destination keeps
  the output device attached too, so speaker/headset playback does not respin
  before each line.

Not verified against real hardware in this session — no ambient capture was
run. Covered by `tests/client/microphone-route.test.mjs`.
