# Experiment 006 — Real-Corpus Vosk Baseline

## Question

Can the pinned small Japanese Vosk model complete a reproducible pipeline over
all 30 recovered recordings on the Apple M3, and how strongly do its
transcripts agree with the intended sentence targets?

## Replay

From this directory:

```bash
uv run python3 -m unittest discover -s tests -v

uv run python3 -m real_corpus_eval \
  --manifest ../../datasets/japanese-voice-v1/peter-v1-20260729-v9vatj/manifest.json \
  --output results/macbook-m3-vosk-small-ja-0.22.json
```

The first evaluation downloads the pinned model to the user's external cache,
verifies its byte size and SHA-256, and keeps it there for later runs. Model
files, package environments, and derived WAVs stay outside Git.

For every source recording the evaluator:

1. verifies the dataset manifest, byte count, and committed checksum;
2. creates one deterministic 16 kHz mono PCM WAV in a temporary directory;
3. loads the Vosk model once per batch and uses a fresh recognizer per file;
4. records raw segments, word confidence/timestamps, conversion and decoding
   time, real-time factor, and structured failures;
5. compares the transcript with all ten intended sentence targets;
6. deletes the derived WAV before continuing.

The JSON result is written atomically.

Repeatability can be checked without rerunning conversion logic:

```bash
uv run python3 -m real_corpus_eval.compare \
  results/macbook-m3-vosk-small-ja-0.22.json \
  results/macbook-m3-vosk-small-ja-0.22-repeat.json \
  --output results/macbook-m3-vosk-small-ja-0.22-repeatability.json
```

The stored candidate scores can also be replayed as a wrong-sentence rejection
test without running Vosk again:

```bash
uv run python3 -m real_corpus_eval.rejection \
  results/macbook-m3-vosk-small-ja-0.22.json \
  results/macbook-m3-vosk-small-ja-0.22-repeat.json \
  --output \
  results/macbook-m3-vosk-small-ja-0.22-wrong-sentence-rejection.json
```

## Metric boundary

`targetCharacterDistanceRate` compares the recognizer transcript with the
intended manifest prompt. It is not ASR character error rate because there is
no human literal transcript of what was actually spoken.

The closed-set precision/recall diagnostic treats the assigned sentence as the
positive target and the other nine sentences as negatives. It measures coarse
content discrimination for this one speaker/session. It is not
human-referenced sentence-acceptance or pronunciation precision/recall.

The wrong-sentence rejection test makes that diagnostic explicit. Each of the
30 real recordings is paired once with its correct sentence and once with each
of the other nine prompts, yielding 30 correct and 270 incorrect-sentence
pairs. In each fold, all three takes of one source sentence are held out.
Threshold selection also removes that sentence from the candidate side of the
training data. The held-out recordings are then scored against all ten
sentences.

Human-referenced metrics remain explicitly unavailable until the labels in
[`LABELING.md`](LABELING.md) exist.

## Recorded M3 result

Two warm-cache runs used:

- Apple M3, macOS 26.5.2, arm64;
- Python 3.11.11 through uv 0.6.9;
- FFmpeg 7.1.1;
- Vosk 0.3.44 with `vosk-model-small-ja-0.22`;
- model archive SHA-256
  `efa092d280153a77615e9e0c7d7283e93e600de3d19d3bec686c57ef19d52eac`.

Observed facts:

- 30/30 recordings converted and recognized without a pipeline failure.
- All 30 transcripts selected the correct sentence as the closest of the ten
  manifest targets.
- Only 1/30 transcripts exactly matched its normalized target. Median target
  character-distance rate was `0.384211`.
- Closed-set manifest-target average precision was `0.989394`.
- The best descriptive in-sample point had 29 true positives, no false
  positives, one false negative, precision `1.0`, recall `0.966667`, and F1
  `0.983051`. Its threshold moved from `0.307692` to `0.3` across the two
  runs, so it is not a production threshold.
- With sentence-grouped threshold selection, both runs rejected all `270/270`
  wrong-sentence pairs: rejection rate `1.0` and false-acceptance rate `0.0`.
  Of the manifest-assigned pairs, `28/30` passed: recall `0.933333`,
  precision `1.0`, and F1 `0.965517`.
- Median end-to-end conversion plus recognition time was `1.562–1.604 s` per
  recording, about `0.203–0.208×` audio duration.
- Model load took `231–251 ms`; RSS after model load was about `201 MiB`.
  Process peak RSS was `279–308 MiB`.

Repeatability:

- All 30 derived WAV SHA-256 values were identical across the two runs.
- Exact transcripts matched for 27/30 recordings; three changed by small word
  alternatives despite identical WAV bytes.
- Exact word/confidence/timestamp arrays matched for only 1/30 recordings.
- The correct top-one sentence assignment and closed-set average precision were
  stable across both runs.
- The aggregate wrong-sentence confusion matrix was stable, but the correct
  recording rejected in addition to `s09` changed from an `s02` take to an
  `s03` take.

Interpretation:

- This Vosk baseline is fast enough on the M3 and useful as a coarse
  known-sentence content signal.
- It cleanly rejected completely different sentences in this small,
  same-speaker set. This does not yet show that it can reject subtle
  pronunciation mistakes or near-miss learner speech.
- The 270 negative decisions reuse 30 recordings and draw targets from the
  same fixed catalog used during threshold fitting. They are correlated
  closed-catalog pairs, not 270 independent utterances or unseen prompts.
- Its surface transcripts are too inaccurate and too unstable to serve alone
  as a pronunciation or localized-feedback model.
- Human-referenced acceptance and error-localization precision/recall remain
  unmeasured, not zero.

Machine-readable evidence:

- `results/macbook-m3-vosk-small-ja-0.22.json`
- `results/macbook-m3-vosk-small-ja-0.22-repeat.json`
- `results/macbook-m3-vosk-small-ja-0.22-repeatability.json`
- `results/macbook-m3-vosk-small-ja-0.22-wrong-sentence-rejection.json`
