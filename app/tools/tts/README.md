# Canonical audio generator

This authoring-only tool generates the nine staff autoplay clips with Qwen3-TTS on
Apple Silicon through MLX. The model remains in the Hugging Face cache; only
the compact MP3 results under `public/audio/qwen3/` ship with the application.

From this directory:

```bash
uv run python3 generate_audio.py
```

The pinned default is revision
`1c6c0ff58c43afa8df571facde2efa077efd85e2` of the 6-bit MLX conversion of
`Qwen3-TTS-12Hz-1.7B-CustomVoice`, using its native Japanese `Ono_Anna`
speaker. Use `--only ordering-welcome` to regenerate one line. Generation is
seeded, but MLX/model-version changes can still change the waveform, so listen
to every regenerated clip before release.

The model can occasionally miss its end token. The generator trims only a
near-silent tail, caps each attempt at 256 tokens, rejects implausible
post-trim durations, and tries up to five deterministic seeds. Leading audio
and internal pauses are never trimmed. This catches runaways; it does not
replace listening QA for breaths, word errors, accent, or delivery.

A complete run also writes `public/audio/qwen3/metadata.json`, repeating the
model, revision, voice, empty instruction, delivery intent, and stable seed for
every clip. A partial `--only` run deliberately leaves that batch manifest
unchanged.

For another story, pass its manifest, output folder, and generation log:

```bash
uv run python3 generate_audio.py \
  --lines ../../../stories/taproom/voices.json \
  --output-dir ../../public/audio/taproom \
  --log ../../../stories/taproom/audio/generation-log.json
```

Manifest entries may pin `voice`, `speed`, and `seed` per line. A seed chooses
a reproducible take; the voice preset carries identity. Missing seeds derive
from the line id rather than array position, so reordering lines does not
change their takes. Partial `--only` runs merge into `--log` instead of erasing
the provenance of untouched clips.

Canonical clips intentionally omit acting instructions. Qwen can turn
expressive directions into breaths or other non-verbal sounds, which are
unacceptable in pronunciation-reference audio. `--instruct` exists only for
explicit experiments whose output will be reviewed before use.

The generator needs `ffmpeg` for loudness normalization and MP3 encoding.
Qwen3-TTS is Apache-2.0; verify both model and generated-audio terms again
before commercial release.
