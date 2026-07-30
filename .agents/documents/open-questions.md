# Open Questions

Unresolved decisions that should be discussed before they become implementation
requirements.

This file was written during cloud-era scoping and was rewritten on 2026-07-30
to separate what has since been decided from what is still genuinely open.
Canonical belief lives in the memory cells; this document is the navigation
layer over it.

## Settled since scoping

Do not reopen these without the user. Each points at its owning cell.

### The rehearsal loop

The original questions assumed a configurable number of successful repetitions
per sentence. That model is gone.

- One sentence is one dialogue bubble.
- A learner-speaking bubble is dismissed and the flow advances on **one**
  success, the **third** failed attempt, or **one** Skip press.
- Skip dismisses exactly one bubble immediately and never counts as a failure.
- There is no repetition counter, no consecutive-success requirement, no
  progress reset, and no per-difficulty repetition count.
- Difficulty is tuned in the content — length, speak-bubble count, novelty,
  recycling, `accepted` breadth, phonetic fragility — never in the fixed
  attempt budget.

See [`../memory/cells/product.md`](../memory/cells/product.md) and
[`../memory/cells/content.md`](../memory/cells/content.md).

### Reference audio

Generated locally at authoring time and bundled with the application, using the
clean native `Ono_Anna` Qwen3 preset. Browser `speechSynthesis` is a playback
fallback only, not the reference. Model, speaker, instruction text, and seed are
recorded with every clip, and every clip is judged by ear before it becomes a
learner target.

See [`../memory/cells/audio.md`](../memory/cells/audio.md).

### Reading validation

Every `reading` is verified against its `japanese` as an authoring gate, and new
stage content must survive a pessimistic run in which every learner bubble is
skipped or failed out. Authored dialogue must additionally pass the character
separation gate.

See [`stage-design-flow.md`](stage-design-flow.md),
[`character-separation-gate.md`](character-separation-gate.md), and
[`../memory/cells/content.md`](../memory/cells/content.md).

### Story art

Answered by the art-pack contract: one manifest plus one asset folder per
story, validated in QA, with crop focus, character anchoring and scale, and
provenance as manifest fields.

See [`art-system.md`](art-system.md).

## Partially answered

Evidence exists but does not close the question.

- **Is a 48 MB-class recognizer sufficient for the core loop?** The prepared
  `vosk-model-small-ja-0.22` browser archive is 49,654,706 bytes. On the M3 it
  discriminates known sentences well — closed-catalog precision `1.0`, recall
  `0.933` — but its surface transcripts are too inaccurate and unstable to
  carry pronunciation or localized feedback by themselves. Good enough as a
  coarse content check; not established as a pronunciation judge.
- **Which feedback unit should the UI highlight?** The PoC shows per-character
  kana hit/miss marks derived from transcript-string alignment. That is coarse
  guidance, explicitly not acoustic phoneme or mora judgment, and the real
  granularity policy is still open.
- **Should learner recordings be deleted after scoring?** The application does
  not retain audio. Chrome's `SpeechRecognition` path may still involve a
  network speech service, and the separate private voice corpus has its own
  retention rules.

See [`../memory/cells/recognition.md`](../memory/cells/recognition.md) and
[`../memory/cells/recordings.md`](../memory/cells/recordings.md).

## Still open

### Feedback

- How should uncertain feedback be displayed?
- Which errors should block progression?
- Should pitch accent be shown in the first version?
- How should the system distinguish bad pronunciation from bad recording
  quality?

### Recognition

- What is the maximum acceptable initial model download?
- What is the maximum acceptable memory use on Android? Browser and Android
  memory are still unmeasured, and they gate more than archive size does.
- Is reference-audio comparison stable enough across voices and devices to
  produce useful feedback?
- Should WebGPU be an optimization or a separate enhanced mode?
- What reduced feature set should be available on devices that cannot run the
  recognizer?

### Content

- What lesson-pack schema is required for imported chapters? The PoC's
  `stages.ts` shape and the art-pack manifest cover the current cases only.
- Should the application accept plain text, JSON, or both?
- Should users be able to edit readings and segmentation manually?

### Data and privacy

- Should users be able to retain recordings for self-review?
- Is anonymized learner data collection desirable for future model calibration,
  and what explicit consent would it require?
- Should progress remain local or support optional synchronization?

### Platform and hosting

- Can GPT Sites serve large model assets efficiently?
- Are the required service-worker and caching behaviors supported?
- Are the required WebAssembly MIME types and headers configurable?
- Is cross-origin isolation required by the selected runtime?
- What level of iOS support is realistic without a native wrapper?

None of the hosting assumptions have been tested. No Sites project exists.

### Validation

- Which learner population defines acceptable recognition quality?
- How many speakers and devices are required before thresholds are trusted?
- Who provides the human reference judgment for pronunciation quality?
- Which false result is more harmful: accepting a weak attempt or rejecting a
  reasonable attempt?

These questions are intentionally separated from a project plan. Their answers
determine eventual product requirements and architecture.
