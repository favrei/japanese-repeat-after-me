# Experiment 004: Vosk Japanese Local Recognition

## Question

Can the small Japanese Vosk model provide a useful, fully local sentence-verification baseline on the MacBook M3 and later in Chrome/WASM?

## Status in the execution container

**Setup blocked.** The environment had neither the `vosk` package nor the Japanese model, and external package/model downloads were unavailable. No recognition accuracy, latency, or memory result is claimed.

## Replay on macOS

Prepare a mono 16-bit PCM WAV, preferably 16 kHz:

```bash
ffmpeg -i input.m4a -ar 16000 -ac 1 -c:a pcm_s16le sample.wav
bash experiments/004-vosk-japanese-local/run_macos.sh sample.wav \
  | tee experiments/004-vosk-japanese-local/results/macbook-m3.json
```

The script creates an isolated virtual environment, installs Vosk, downloads `vosk-model-small-ja-0.22`, and runs `transcribe.py`.

## Data to record

For each learner/reference recording, retain:

- expected Japanese text and kana reading;
- recognized text;
- word confidences and timestamps when available;
- wall-clock latency;
- peak process memory;
- recording duration and device;
- whether the sentence would pass under the proposed matching rule.

## Required caution

A successful transcription does not prove pronunciation quality. This experiment only determines whether a cheap local recognizer is useful as one signal in the scoring pipeline.

Model assets and recordings are intentionally excluded from the repository. Add only redistributable test audio or a script that generates/records it.
