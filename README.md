# Japanese conversation flow PoC

A single-user Android Chrome PWA for validating the UX and progression of one
two-stage Japanese café conversation.

## Confirmed flow

- Open the app and start one continuous conversation.
- Stage 1 contains six dialogue bubbles; stage 2 follows automatically with
  three more.
- One sentence is one bubble.
- Staff lines and the two specified learner autoplay lines play automatically.
- Three learner bubbles ask the user to speak.
- One successful attempt advances.
- The first and second failed attempts keep the current bubble active.
- The third failed attempt advances.
- One Skip tap immediately dismisses exactly the current bubble. It never
  counts as a failure.
- The final bubble leads to a finished screen, from which the loop can restart.

The presentation uses an approved manga-storybook frame: a comic balloon per
sentence, speaker chips and tails, skewed progress cells, burst feedback
(ピンポン！ / ざんねん…), and a placeholder scene/character layer. The café
is only an example story — the scene background and the staff character are
swappable slots that user-uploaded art will fill later. The frame (header,
progress, balloon, panel, feedback) stays constant across stories.

A failed attempt overlays the target reading with approximate per-kana
hit/miss marks (green hit, red wavy-underlined miss). They come from
transcript-to-target string alignment, not acoustic phoneme scoring — coarse
guidance, not ground truth.

The app does not store recordings. Chrome may use a network speech service for
the temporary PoC recognizer.

Autoplay uses pre-generated Qwen3-TTS clips rather than browser
`speechSynthesis`. The clips are generated locally on Apple Silicon through
MLX, bundled with the PWA, and cached for offline playback. Browser TTS remains
only as a playback-error fallback. See `tools/tts/` for the authoring command;
model weights are never shipped with the app.

## Local workflow

```bash
npm run dev
npm run qa
```

Add `?qa=1` to a development URL to expose synthetic success, near-miss, and
failure buttons for flow testing without microphone input.

## Android USB preview

The Android SDK is not used to build the app. Platform Tools only bridge the
phone's localhost origin to the Mac:

```bash
adb devices -l
adb reverse tcp:3000 tcp:3000
npm run qa
npm run start
```

Then open `http://localhost:3000` in Android Chrome and allow microphone access.
The real microphone, service-worker, and installation path still requires a
connected phone. Local QA is not deployment approval.
