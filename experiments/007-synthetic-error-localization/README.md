# Experiment 007 — Synthetic Error Localization

## Question

Can the current local Vosk sentence gate and transcript-to-reading marker find
known Japanese mistakes across twenty prompted AI voice personas, and how much
does deterministic acoustic interference change precision and recall?

This experiment fills the main gap left by experiment 006. Experiment 006 used
real learner recordings but had no deliberately incorrect or localized human
labels. Experiment 007 supplies controlled text labels at scale. It is useful
for finding pipeline failures; it does **not** replace human learner labels.

## Corpus design

- `personas.json` defines twenty adult Qwen3-TTS VoiceDesign candidates across
  age, apparent gender, pitch, timbre, and pace.
- `cases.json` defines two exact controls and six deliberate changes: missing
  long vowel, missing small `っ` in two contexts, voicing substitution, word
  insertion, and lexical substitution.
- A full generation pass creates `20 × 8 = 160` lossless clean WAV files.
- The evaluator derives eleven deterministic conditions from each source:
  clean, quiet-room echo, competing speech, street-like noise, HVAC hum,
  strong hiss, clipping, packet dropouts, phone bandwidth, faster/higher
  speech, and slower/lower speech. The full matrix has 1,760 attempts.

Generated audio and its manifest live under ignored `datasets/`, not Git. The
twenty `weather-exact` files are persona anchor candidates for future audition,
but neither those anchors nor the deliberate-error files are approved teaching
assets until a human listens to them.

## Replay

From this directory:

```bash
uv sync
uv run python3 -m unittest discover -s tests -v

# Optional fast first pass: one persona anchor per prompt.
uv run python3 -m synthetic_error_eval.generate --anchor-only

# Resume and complete all 160 clean sources.
uv run python3 -m synthetic_error_eval.generate

# Build a local listening page for the 20 persona anchors.
uv run python3 -m synthetic_error_eval.audition

# Evaluate all eleven deterministic conditions.
uv run python3 -m synthetic_error_eval.evaluate --workers 4
```

Both generation and evaluation accept filters. For example:

```bash
uv run python3 -m synthetic_error_eval.generate \
  --only-persona ao --only-case weather-exact

uv run python3 -m synthetic_error_eval.evaluate \
  --only-persona ao --augmentation clean
```

Generation is resumable: an existing clip is reused only when its WAV checksum
matches the dataset manifest. The manifest records the exact model revision,
persona prompt, intended/spoken text, accepted seed, duration, sample rate, and
hash for every file.

## Metrics

The evaluator reports three separate questions:

1. **Sentence acceptance precision/recall.** Exact cases are synthetic
   acceptable attempts; intentionally changed cases are synthetic unacceptable
   attempts. The decision mirrors the current catalog gate and `0.30` content
   threshold.
2. **Error-detection precision/recall.** Does the current reading marker flag
   any expected character on an erroneous attempt, without flagging exact
   controls?
3. **Position-localization precision/recall.** Across normalized expected kana
   positions, how often do displayed misses overlap the text-derived ground
   truth positions?

The Python marker deliberately reproduces the current app implementation,
including direct alignment of Vosk's surface transcript against the kana
reading. It does not silently add a kanji-to-kana converter.

## Recorded M3 result

The recorded pass used 160 clean VoiceDesign sources and eleven conditions for
1,760 attempts on the Apple M3. It ran Vosk 0.3.44 with the pinned
`vosk-model-small-ja-0.22`, Python 3.11.11, NumPy 2.4.6, and FFmpeg 7.1.1.
Four recognizers shared the read-only model; an eight-source smoke comparison
matched the sequential run on every clean transcript, decision, and predicted
position.

| Metric | Clean only | All conditions |
|---|---:|---:|
| Position-localization precision | `0.121662` | `0.112618` |
| Position-localization recall | `0.911111` | `0.918182` |
| Position-localization F1 | `0.214660` | `0.200629` |
| Synthetic sentence-acceptance precision | `0.250000` | `0.252955` |
| Synthetic sentence-acceptance recall | `1.000000` | `0.972727` |
| Deliberate-error false-acceptance rate | `1.000000` | `0.957576` |
| Exact-control false-rejection rate | `0.000000` | `0.027273` |

Observed facts:

- The marker flagged an error on all `440/440` exact-control attempts. Its
  attempt-level error-detection precision was therefore exactly the error
  prevalence (`1320 / 1760 = 0.75`), despite nominal recall of `1.0`.
- Position recall was high because the marker painted many positions: 1,818
  true-positive positions came with 14,325 false-positive positions. High
  recall here is not useful localization.
- The immediate mechanical cause is representation mismatch. Vosk commonly
  emitted surface text containing kanji, while the UI compared that directly
  with the all-kana reading. The initial twenty clean weather anchors alone
  produced 120 false-positive highlighted positions, six per clip.
- Long-vowel deletion was the weakest localized class: precision `0.037016`,
  recall `0.290909`, and F1 `0.065675` across conditions.
- The coarse sentence gate accepted every one of the 120 deliberate clean
  mistakes. This is consistent with its intended role as a known-sentence
  content gate, but it confirms that the current threshold cannot be used as a
  pronunciation-correctness gate.
- Competing generated speech was the only condition that materially changed
  sentence decisions: acceptance recall for exact controls fell to `0.75`,
  while deliberate-error false acceptance fell to `0.608333`. That is damage
  from interference, not improved pronunciation discrimination.
- Quiet-room echo, HVAC hum, street-like noise, packet loss, and pitch/rate
  changes left the already-overpermissive content decision almost unchanged.
  Strong hiss, clipping, and phone bandwidth increased false position marks.

Machine-readable evidence is in
`results/macbook-m3-vosk-small-ja-0.22.json` (SHA-256
`e0b142d8be0e4a1ebe0d0224ebe317d7a74a34d5ac3f3dbe31da46dfd2a77c72`).
The ignored source corpus contains 160 WAVs, 578.8 seconds of
audio, and 26.5 MiB of data. The twenty persona anchor clips and their local
`audition.html` player remain marked `not_reviewed`.

## Limitations

- A text prompt is not an acoustic label. Human listening must confirm that
  each TTS file actually contains the intended pronunciation and no extra
  sounds before interpreting the final numbers strongly.
- VoiceDesign prompts produce synthetic variation, not twenty independent
  human speakers, and identity consistency across a persona's clips still
  needs listening review.
- Augmented attempts reuse the same source waveforms and are correlated.
- The deterministic interference set is representative, not exhaustive.
- These metrics evaluate the current Vosk/UI path. They do not prove phonetic
  diagnosis or learner-facing usefulness.
- The synthetic acceptance calculation treats every deliberate change as
  unacceptable. A human may judge some individual pronunciation deviations
  differently, so this is a stress-test label rather than product truth.
