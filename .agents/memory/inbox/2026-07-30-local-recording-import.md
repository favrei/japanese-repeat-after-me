# Local Recording Import

## Verified import

- The user explicitly authorized downloading and committing the private voice
  recordings on 2026-07-30.
- Source session: `peter-v1-20260729-v9vatj`
- Local dataset:
  `datasets/japanese-voice-v1/peter-v1-20260729-v9vatj/`
- Source archive SHA-256:
  `2834ca16aae1103582e8070a2c428cb4c280107b01858181a1bc87f1c40797e7`
- Contents: 10 sentences, 3 takes each, 30 WebM/Opus recordings.
- Audio: mono, 48 kHz Opus, 3,718,772 bytes, approximately 236.160 seconds.
- The original `manifest.json` and per-file `SHA256SUMS` are retained.
- Every recording decoded successfully and converted successfully to a
  temporary 16 kHz mono PCM WAV during validation. Derived WAV files were not
  retained.

## Handling

- These recordings contain the repository owner's voice.
- They are intentionally versioned for private testing, evaluation, and
  possible future local model work.
- The configured GitHub origin is public. Keep the recording commit local
  unless the repository is made private or the user explicitly approves
  publishing the voice data.
- Never include `datasets/` in a GPT Sites deployment.
- Do not publish, redistribute, or upload the recordings elsewhere without
  explicit user approval.

## Consolidation note

The existing `Recordings` cell and `current.md` still say that no local copy
exists. Update those canonical claims during the next dreaming pass.
