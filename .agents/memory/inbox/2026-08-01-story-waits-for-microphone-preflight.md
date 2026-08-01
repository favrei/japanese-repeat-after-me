# The story now makes no sound until the microphone route has settled

Peter: "we should wait until the mic of my airpods being configured, and
survived the status check, before move on, so the user should not hear the
broken sound."

Root cause: `beginStage` called `configureMicrophone()` and let playback start
in the same tick. Opening a capture device renegotiates the audio route — a
Bluetooth headset drops from music profile to headset profile — so the opening
narration was playing exactly while the AirPods switched, and broke up.

`client/components/PracticeApp.tsx`:

- New `MicPreflight` = `"checking" | "waiting" | "ready"`, resting at `ready`
  so QA mode and insecure origins gate nothing.
- `runMicrophonePreflight()` awaits `configureMicrophone`, then
  `settleMicrophoneRoute()` — `GameMicrophoneSession.waitUntilReady()` (the
  track-muted gate) plus `prewarmRecognitionAudio()`, which also attaches the
  output device. Both waits are bounded, so a device that never reports ready
  cannot strand the learner.
- **Both playback effects** (interlude narration and autoplay dialogue) return
  early unless `micPreflight === "ready"`, with `micPreflight` in their deps so
  they start themselves when it flips.
- The panel gets a preflight card: マイクを じゅんびしています / マイクを
  えらんでください, the route drawer (extracted to a `microphoneDrawer` const so
  the speaking turn and this card share it), and
  `data-testid="start-without-microphone"` so a denied or missing microphone
  never blocks the story.
- `selectMicrophone` also settles the route, so choosing a device is what
  releases a held-back story.

Measured with Playwright + fake devices: **zero** audio or speechSynthesis
events between entering the stage and choosing a device; first clip at 7.9 s,
immediately after the choice. Not yet verified against real AirPods — that is
still the only test that counts.
