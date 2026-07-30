# Experiment 003: Kana/Mora Alignment

## Question

Given an expected kana reading and a recognized kana string, can a small deterministic aligner produce visible insertion, deletion, and substitution markers?

## Replay

```bash
python3 experiments/003-kana-mora-alignment/align.py \
  | tee experiments/003-kana-mora-alignment/results/local.json
```

No third-party packages are required.

## Recorded run

The experiment was executed with Python 3 in the execution container.

Observed cases:

- Exact sentence: distance 0.
- `きょう` pronounced/recognized as `きょ`: deletion localized to `う`.
- `きって` recognized as `きて`: deletion localized to small `っ`.
- Extra `は` in `ねこはがいます`: insertion localized before `が`.
- `たべます` versus `たべません`: represented as an insertion plus substitution.

## Interpretation

This is sufficient for visualizing differences after a recognizer emits kana. It is not pronunciation assessment by itself: recognition errors and pronunciation errors remain indistinguishable.

The tokenizer is intentionally incomplete. It joins small kana such as `ょ` to the preceding symbol, but it does not yet normalize katakana, alternative long-vowel spellings, numerals, kanji readings, punctuation variants, or ASR-specific tokens.
