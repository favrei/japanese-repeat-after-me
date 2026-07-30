# Real-Corpus Vosk Baseline

## Verified run

- Experiment:
  `experiments/006-real-corpus-vosk-baseline/`
- Dataset: 30 recordings, 10 intended sentences, three correlated takes each.
- Environment: Apple M3, macOS 26.5.2 arm64, Python 3.11.11, uv 0.6.9,
  FFmpeg 7.1.1, Vosk 0.3.44.
- Model: `vosk-model-small-ja-0.22`; pinned source archive SHA-256
  `efa092d280153a77615e9e0c7d7283e93e600de3d19d3bec686c57ef19d52eac`.
- Two warm-cache runs converted and recognized all 30 recordings without a
  pipeline failure.
- Every transcript selected the correct sentence as the closest of the ten
  manifest targets.
- Only 1/30 transcripts exactly matched its normalized target. Median
  target-character distance rate was `0.384211`.
- Closed-set manifest-target average precision was `0.989394`.
- The best descriptive in-sample point had precision `1.0`, recall `0.966667`,
  F1 `0.983051`, and one false negative. Its threshold changed slightly across
  the two runs and is not a production threshold.
- Median conversion-plus-recognition time was `1.562–1.604 s`, about
  `0.203–0.208×` audio duration.
- Model load was `231–251 ms`; RSS after load was about `201 MiB`; peak process
  RSS was `279–308 MiB`.

## Repeatability

- Deterministic conversion produced identical WAV SHA-256 values for 30/30
  files across the two runs.
- Exact transcripts matched for 27/30 files; three differed by small word
  alternatives despite identical WAV bytes.
- Exact word/confidence/timestamp arrays matched for only 1/30 files.
- Top-one sentence identity and closed-set average precision remained stable.

## Boundary and interpretation

- Intended manifest targets are not human literal transcripts. The recorded
  distance is target agreement, not ASR CER or pronunciation error.
- The closed-set precision/recall diagnostic uses the other nine, obviously
  different sentences as negatives. It is not human-referenced acceptance or
  pronunciation precision/recall.
- The baseline is fast enough on the M3 and useful as a coarse known-sentence
  content signal.
- Vosk surface transcripts are too inaccurate and unstable to serve alone as a
  pronunciation or localized-feedback model.
- Human-referenced acceptance and localized-error precision/recall remain
  unavailable until the labeling protocol in the experiment is applied.

## Wrong-sentence rejection extension

- Every real recording was also treated as the wrong utterance for each of the
  other nine Japanese prompts: 30 correct pairs and 270 incorrect-sentence
  pairs per run.
- Thresholds were selected with ten sentence-grouped folds. Each fold excluded
  the held-out sentence's three recordings and its candidate target from
  threshold training, then tested those recordings against all ten targets.
- Both recorded runs produced the same aggregate result: 28 true positives,
  zero false positives, two false negatives, and 270 true negatives.
- Incorrect-sentence rejection was `270/270 = 1.0`; false-acceptance rate was
  `0/270 = 0.0`.
- Manifest-pair recall was `28/30 = 0.933333`; precision was `1.0`, and F1 was
  `0.965517`.
- The false-reject set was not fully stable between runs: one `s09` take failed
  in both, while the other false reject changed from an `s02` take to an `s03`
  take.
- This is evidence for rejecting wholly different sentences from the same
  speaker/session. It is not evidence for rejecting subtle pronunciation
  mistakes, near misses, or human-rated unacceptable speech.
- The 270 negative decisions reuse 30 recordings. The candidate targets are
  from the same fixed ten-sentence catalog used during threshold fitting, so
  this is a correlated empirical pair rate, not 270 independent utterances or
  an unseen-prompt result.

## Evidence

- `experiments/006-real-corpus-vosk-baseline/results/macbook-m3-vosk-small-ja-0.22.json`
- `experiments/006-real-corpus-vosk-baseline/results/macbook-m3-vosk-small-ja-0.22-repeat.json`
- `experiments/006-real-corpus-vosk-baseline/results/macbook-m3-vosk-small-ja-0.22-repeatability.json`
- `experiments/006-real-corpus-vosk-baseline/results/macbook-m3-vosk-small-ja-0.22-wrong-sentence-rejection.json`

## Disposition

- On 2026-07-30, the user judged the model evidence promising and explicitly
  parked this lane for later review.
- Preserve experiment 006 and its recorded outputs as the current coarse
  known-sentence baseline.
- Do not treat the `270/270` closed-catalog rejection result as final
  pronunciation quality. When this lane resumes, add intentionally incorrect
  and near-miss learner recordings with human reference labels before
  calibrating acceptance or localized-feedback thresholds.
