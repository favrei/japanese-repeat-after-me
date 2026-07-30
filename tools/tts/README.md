# Canonical audio generator

This authoring-only tool generates the six autoplay clips with Qwen3-TTS on
Apple Silicon through MLX. The model remains in the Hugging Face cache; only
the compact MP3 results under `public/audio/qwen3/` ship with the PoC.

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

Canonical clips intentionally omit acting instructions. Qwen can turn
expressive directions into breaths or other non-verbal sounds, which are
unacceptable in pronunciation-reference audio. `--instruct` exists only for
explicit experiments whose output will be reviewed before use.

The generator needs `ffmpeg` for loudness normalization and MP3 encoding.
Qwen3-TTS is Apache-2.0; verify both model and generated-audio terms again
before commercial release.
