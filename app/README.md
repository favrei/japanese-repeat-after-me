# Japanese conversation story application

A client-first Android Chrome PWA with a four-stage library across two Japanese
conversation stories, inside a reusable seinen manga story frame. Downloaded
gameplay remains self-contained; a thin Cloudflare Worker backend now owns the
catalog and versioned pack delivery boundaries.

## Source boundary

- `app/` is the Next/Vinext route shell.
- `client/` owns the story library, gameplay, playback, recognition, scoring,
  and art presentation. It never imports `server/`.
- `shared/` owns story-pack and catalog payload contracts.
- `server/` owns D1 catalog queries, logical catalog backup/restore, R2 pack
  reads, and backend HTTP routing.
- `worker/` composes the backend router with Vinext rendering and asset
  handling.

The two bundled stories remain the offline source of truth for the current
application. The new backend routes do not sit on the practice-session path:
`GET /api/catalog` reads current published catalog rows from D1, while
`GET /packs/:id/:version/*` reads immutable objects directly from R2. Publishing
remote packs and syncing progress are later slices.

## Confirmed flow

- Open the app and select any of the four stages.
- The library groups two café stages and two taproom stages by story.
- Selecting stage 1 continues automatically into stage 2. Selecting stage 2
  practises only that stage.
- Every stage opens on a narrated transition card, including the first, so a
  scene is never entered mid-sentence.
- One sentence is one bubble.
- Each story contains thirteen bubbles. The café has four learner-speaking
  bubbles; the taproom has five.
- One successful attempt advances.
- The first and second failed attempts keep the current bubble active.
- The third failed attempt advances.
- One Skip tap immediately dismisses exactly the current bubble. It never
  counts as a failure.
- The final bubble leads to a finished screen, from which the loop can restart.

The café and taproom are validated art packs, not layout special cases. The
application owns the responsive frame, balloon, controls, progress, feedback,
transitions, and motion. A validated pack supplies its cover, one or more named
scenes in both orientations, one or more named characters with their three
states, composition metadata, and generation provenance.
See [`art-system/README.md`](art-system/README.md) for the submission contract.

## Scene transitions

A stage is a scene, so it declares the shot it plays against (`sceneId`), the
other party in it (`castId`), and the narrator's line that opens it
(`transition`). Between stages the story stops on that card: the background and
the other party swap underneath it, the narrator speaks, and the card releases
itself after a short hold — or immediately on つづける or スキップ. Skipping a
card is not skipping a bubble; the one-success / three-failures / one-Skip
bubble rules are untouched.

Narration ships without audio for now: no narrator voice has been cast, and
falling back to browser `speechSynthesis` for it would put an uncast voice in
the story. `StageTransition.audioSrc` is the slot for a clip once that decision
is made.

A failed attempt overlays the target reading with approximate per-kana
hit/miss marks. They come from
transcript-to-target string alignment, not acoustic phoneme scoring — coarse
guidance, not ground truth.

Recognition follows the local-first design. The browser captures PCM through
an AudioWorklet and runs `vosk-model-small-ja-0.22` locally in a Web Worker.
The recognizer is used as a coarse known-sentence content gate, not as precise
pronunciation diagnosis. Recording-quality failures ask for a retry and do not
consume one of the three speaking attempts. The app does not store or upload
recordings.

Before first capture, the app requests microphone permission, lists the inputs
Chrome exposes, and asks the learner to select one when more than one is
available. Capture requests that exact browser `deviceId`, displays whether the
active track matches it, and stops an attempt when the selected input
disconnects or becomes muted. This browser evidence does not close the
Bluetooth hardware test: AirPods capture and avoidance of built-in-microphone
fallback remain open until verified on macOS Chrome and Android Chrome.

Autoplay uses pre-generated Qwen3-TTS clips rather than browser
`speechSynthesis`. The clips are generated locally on Apple Silicon through
MLX, bundled with the PWA, and cached for offline playback. Browser TTS remains
only as a playback-error fallback. See `tools/tts/` for the authoring command;
model weights are never shipped with the app. The exact model, revision, voice,
instruction, and per-line seed are recorded in each story's audio metadata:
`public/audio/qwen3/metadata.json` for the café and
`public/audio/taproom/metadata.json` for the taproom.

## Local workflow

```bash
npm run model:prepare
npm run db:migrate:local
npm run dev
npm run qa
```

`npm run qa` keeps one top-level gate while its tests are separated by
ownership:

- `test:client` covers gameplay, recognition quality, and scoring in Node.
- `test:contracts` covers shared catalog and story-pack payloads in Node.
- `test:server` uses Cloudflare's Vitest integration, workerd, local D1, and
  local R2. It applies the generated migration before testing queries, pack
  metadata/ETags, and catalog backup/restore.
- `test:integration` checks the production build, Worker composition, packaged
  Sites bindings/migrations, and the backend-unavailable gameplay boundary.

The local runtime uses the logical bindings in `.openai/hosting.json`: `DB` for
D1 and `PACKS` for R2. Local tests are isolated and do not contact production.
The first catalog migration is generated from `db/schema.ts`; generate and
apply it to the persistent local development database with:

```bash
npm run db:generate
npm run db:migrate:local
```

`server/catalog.ts` contains tested logical export/restore functions, but they
are deliberately not public HTTP routes. A protected production operator path
must be chosen before cloud restore is enabled.

`model:prepare` downloads the official Japanese Vosk ZIP, verifies its pinned
SHA-256, converts it to the tar layout required by `vosk-browser`, and writes
the ignored archive plus verified production-size parts under `public/models/`.
The service worker streams those parts as the single archive `vosk-browser`
expects. The roughly 48 MB model is kept out of Git and the initial PWA shell,
then cached separately after first use.

Add `?qa=1` to a development URL to expose synthetic success, near-miss, and
failure buttons for flow testing without microphone input.

Add `?art=cafe` or `?art=taproom` to inspect that art pack, responsive scenes,
character continuity, and composition contract.

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
The first Android run should verify model initialization, memory pressure,
AudioWorklet capture, recognition latency, service-worker caching, and PWA
installation. It should also close the explicitly open Bluetooth route test
only after input identity and captured signal are independently confirmed.
Local QA is not deployment approval.
