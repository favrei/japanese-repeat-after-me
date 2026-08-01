# TTS manifests now carry acting direction

`app/tools/tts/generate_audio.py` previously sent no delivery direction to the
model at all. `deliveryIntent` was parsed off the manifest and written into
metadata but never passed to `model.generate`; `--instruct` was a single global
CLI flag defaulting to `None`. So every canonical clip was undirected, which is
why delivery sounded flat.

Added a three-level direction resolution: line `instruct` → `sections[...]` via
a line's `section` → story-level `instruct` → `--instruct` → none. An explicit
empty string opts a line out of inherited direction. A `section` not declared in
`sections` raises `SystemExit` at load. `--log` and `metadata.json` now record
the resolved direction per clip, not the CLI flag.

`deliveryIntent` was deliberately NOT wired up as direction. It was authored as
a reviewer note, and promoting it would have silently changed every existing
take. Directing a line requires the new `instruct` field.

Verified:
- Precedence table exercised on a synthetic manifest; all five cases correct.
- Undeclared-section guard fires.
- A/B on one line, same pinned seed 20261733, voice `dylan`: undirected 2.32s,
  "speak quickly" 2.32s, "gently and unhurriedly with a small pause" 2.48s —
  three distinct sha256s, so `instruct` demonstrably reaches the model.
- Regenerated `taproom-choose-welcome` and `taproom-choose-firsttime` from the
  untouched taproom manifest: byte-identical to the shipped MP3s. The feature is
  backward compatible.
- `npm run test:contracts` passes (4/4).

Model context: the pinned `Qwen3-TTS-12Hz-1.7B-CustomVoice-6bit` has
`tts_model_type: custom_voice`, whose generate path takes `instruct` as optional
style on top of a preset speaker — speaker identity comes from a separate
speaker embedding, so directing a line does not recast the voice. No new voice
or model download was needed. VoiceDesign is the wrong variant here: it requires
`instruct` to describe a voice from scratch and has no preset speaker, so
identity would drift between clips.

Open risk, unresolved: the README warning still stands that Qwen can render
expressive directions as breaths or non-verbal sounds. The A/B clips were not
listened to by a human. No shipped manifest has been given direction yet.

In-sentence controls remain impossible — text goes to the tokenizer raw, no
SSML, no `[pause]`, no timing tags. Only punctuation nudges prosody.
