# Experiment 001: Synthetic Acoustic DTW

## Question

Can a dependency-free JavaScript matcher align two short acoustic sequences, tolerate moderate speaking-rate variation, and localize missing or replaced regions?

## Replay

```bash
node experiments/001-browser-dtw-synthetic/dtw.js \
  | tee experiments/001-browser-dtw-synthetic/results/local.json
```

Node 18 or later is sufficient. The code uses only standard JavaScript and can later be moved into a browser worker.

## Recorded run

The committed result was executed on Linux x64 with Node 22.16.0.

Observed results:

- Noise-only variation produced a low cost: `0.087370`.
- A crude rate change that preserved tone frequencies remained relatively low: `0.138072`.
- Removing synthetic unit 3 localized the worst cost to unit 3.
- Replacing synthetic unit 4 localized the worst cost to unit 4.
- Pitch-shifting the signal while changing duration produced a high false error: `0.298517`.
- Inserting a long pause increased the global score but did not localize the pause correctly.

## Interpretation

This demonstrates that DTW and local cost visualization are cheap enough to prototype in JavaScript. It does **not** demonstrate Japanese pronunciation recognition. The features are deliberately simple synthetic frequency features, and the test signals are generated tones rather than speech.

The failures are important:

- Acoustic comparison is sensitive to feature design and voice/pitch differences.
- Plain DTW can hide inserted pauses by stretching the path.
- Timing penalties need a separate duration or pause model.
- A speech representation such as log-mel, MFCC, or learned embeddings must be tested on real learner recordings.
