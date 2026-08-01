# Experiment 008: ML-only Vosk error localization

## Question

How accurately does raw Vosk output reveal and localize deliberately injected
Japanese mora errors, independently of the product scorer and UI?

This experiment evaluates only:

1. the pinned native Vosk Japanese model;
2. an independent conversion of Vosk's surface text to hiragana;
3. independent mora tokenization and edit alignment;
4. deterministic synthetic audio interference.

It does **not** import or execute application scoring, catalog matching,
acceptance thresholds, marker generation, or UI rendering. Experiment 007 is
the separate product-stack/integration diagnostic.

## Corpus

The source corpus contains 20 prompted Qwen3 VoiceDesign personas and eight
cases per persona: two exact controls and six deliberate pronunciation/content
changes. The generated WAV assets live under:

```text
datasets/japanese-synthetic-errors-v1/qwen3-voice-design-20/
```

The source manifest pins every WAV by SHA-256. Its labels describe the text
requested from TTS; the clips still require human listening validation.

## Measures

- **Strict position precision/recall:** exact expected-reading mora index.
- **Within-one-mora precision/recall:** one-to-one match within ±1 mora.
- **Error detection:** whether any error exists, regardless of position.
- **Exact-control transcription:** mora exact matches, empty transcripts, and
  mora error rate.
- **Injected-variant evidence:** whether the decoded reading is closer to the
  deliberately spoken variant than to the correct target.

Insertions are anchored to the following expected mora, or the final expected
mora for an insertion at the end.

## Replay

From this directory:

```bash
uv sync
uv run python3 -m unittest discover -s tests -v

# Clean speech validation (160 attempts)
uv run python3 -m ml_only_eval.evaluate \
  --augmentation clean \
  --output results/clean-only.json

# Run one condition in one fresh process.
uv run python3 -m ml_only_eval.evaluate \
  --augmentation quiet_room \
  --output results/conditions/quiet_room-a.json
```

The first run reuses or downloads the pinned `vosk-model-small-ja-0.22` archive
and verifies its size and SHA-256 before loading it.

The recorded run uses sequential decoding and a fresh Python process for each
condition stream. This Vosk/Kaldi build changed a few transcripts under
concurrency and after mixed-condition process reuse, so neither behavior is
accepted as a reproducible benchmark.

The evaluator also pins OpenMP, OpenBLAS, MKL, Apple Accelerate/vecLib, and
NumExpr thread counts to one before importing NumPy or Vosk. Two independent
160-clip café/crosstalk passes matched exactly only after this pin was applied.

## Recorded result

Conditions are accepted independently; there is no accepted merged
1,760-attempt result. Each accepted condition has two isolated runs with
identical transcripts, mora readings, predicted locations, distances, and
aggregate metrics. Diagnostic word-confidence floats are excluded because they
are not used by scoring.

| Condition | Status | Localization P / R | Detection P / R | Exact controls |
|---|---|---:|---:|---:|
| Clean | accepted | `0.584980 / 0.822222` | `0.914286 / 0.800000` | `31/40` |
| Quiet room | accepted | `0.609442 / 0.788889` | `0.872549 / 0.741667` | `27/40` |
| Café crosstalk | accepted | `0.169248 / 0.850000` | `0.772727 / 0.991667` | `5/40` |
| Street noise | accepted | `0.597561 / 0.816667` | `0.929293 / 0.766667` | `33/40` |
| HVAC hum | accepted | `0.598361 / 0.811111` | `0.919192 / 0.758333` | `32/40` |
| Strong hiss | accepted | `0.267730 / 0.838889` | `0.801370 / 0.975000` | `11/40` |
| Clipped microphone | **unstable** | `0.169031–0.169231 / 0.794444` | `0.782313 / 0.958333` | `8/40` |
| Packet dropouts | accepted | `0.362963 / 0.816667` | `0.802920 / 0.916667` | `13/40` |
| Phone bandwidth | accepted | `0.271357 / 0.900000` | `0.848921 / 0.983333` | `19/40` |
| Faster/higher | accepted | `0.490132 / 0.827778` | `0.891892 / 0.825000` | `28/40` |
| Slower/lower | accepted | `0.565217 / 0.866667` | `0.898305 / 0.883333` | `28/40` |

Clipped-microphone runs A, B, and C produced three scoring variants, so that
condition is not accepted. Faster/higher run B changed one scoring record, but
runs A and C matched exactly and form the accepted pair. The old combined file
`results/macbook-m3-vosk-small-ja-0.22.json` remains rejected and must not be
used for metrics.

## Limitations

- Vosk is a word ASR model, not a phoneme recognizer. Error locations are
  inferred from its free-decoded text rather than acoustic phoneme scores.
- The hiragana converter may choose the wrong reading for ambiguous kanji.
- Synthetic voices are not independent human speakers.
- Augmentations reuse source clips, so attempts are correlated.
- Human listening has not yet confirmed every TTS clip realizes its label.
