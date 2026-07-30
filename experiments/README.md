# Experiments

This directory contains executable spikes and their recorded results. An experiment is kept even when it fails, because the failure may define a platform constraint or invalidate an assumption.

## Rules

Each experiment should contain:

- a narrowly stated question;
- executable source code;
- exact replay commands;
- committed machine-readable output;
- the environment used for the recorded run;
- a distinction between observed facts and interpretation;
- known limitations.

Model files, virtual environments, generated audio, and package caches are not committed.

## Current experiments

| ID | Question | Recorded status | Main observation |
|---|---|---|---|
| [001](001-browser-dtw-synthetic/) | Can Chrome execute a dependency-free acoustic DTW matcher and localize synthetic changes? | Mixed success | Missing and replaced units were localized; rate changes preserving pitch were tolerated. Extra pauses were barely penalized, and pitch-shifted resampling produced a false high error. |
| [002](002-browser-microphone-capture/) | Can an automated headless Chrome session acquire and process microphone input? | Blocked in the execution container | Chrome navigation was blocked by administrator policy before microphone acquisition. The same harness is retained for replay on macOS. |
| [003](003-kana-mora-alignment/) | Can expected and recognized kana be aligned into visible mora-level insertions, deletions, and substitutions? | Success | The baseline correctly localized the included missing long vowel, missing small っ, insertion, and substitution cases. Long-vowel spelling normalization remains incomplete. |
| [004](004-vosk-japanese-local/) | Can the 48 MB Vosk Japanese model provide a cheap local recognition baseline? | Setup blocked in the execution container | Package and model downloads were unavailable. A macOS replay harness is included; no recognition-quality claim is made yet. |
| [006](006-real-corpus-vosk-baseline/) | Can the native Vosk baseline process all 30 recovered real recordings, and how strongly do transcripts agree with the intended targets? | Functionality passed; quality mixed | All 30 files ran and selected the correct target sentence in the ten-sentence closed set, but only one transcript exactly matched its target and 3/30 transcripts changed across identical repeat inputs. Human acceptance/localization precision and recall remain unlabeled. |

Experiment 005 is a parked device-runtime Sites prototype preserved in its own
local Git repository. It is not a validated result and is intentionally absent
from the parent repository.

## Replay order on the MacBook M3

```bash
# From the repository root
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r experiments/requirements.txt

python experiments/001-browser-dtw-synthetic/run_local.py \
  --chrome "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

python experiments/003-kana-mora-alignment/align.py

bash experiments/004-vosk-japanese-local/run_macos.sh
```

Experiment 002 has both automated and manual replay instructions in its own README because real microphone permission is easier to verify interactively.

Experiment 006 uses its own `uv` project:

```bash
cd experiments/006-real-corpus-vosk-baseline
uv run python3 -m unittest discover -s tests -v
uv run python3 -m real_corpus_eval \
  --manifest ../../datasets/japanese-voice-v1/peter-v1-20260729-v9vatj/manifest.json \
  --output results/macbook-m3-vosk-small-ja-0.22.json
```
