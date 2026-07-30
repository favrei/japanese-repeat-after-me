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
