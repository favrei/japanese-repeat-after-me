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

## Metric boundary

`targetCharacterDistanceRate` compares the recognizer transcript with the
intended manifest prompt. It is not ASR character error rate because there is
no human literal transcript of what was actually spoken.

The closed-set precision/recall diagnostic treats the assigned sentence as the
positive target and the other nine sentences as negatives. It measures coarse
content discrimination for this one speaker/session. It is not
human-referenced sentence-acceptance or pronunciation precision/recall.

Human-referenced metrics remain explicitly unavailable until the labels in
[`LABELING.md`](LABELING.md) exist.
