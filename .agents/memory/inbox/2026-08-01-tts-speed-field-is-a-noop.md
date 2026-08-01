# Manifest `speed` is a no-op on the CustomVoice path

`speed` is accepted by `generate_audio.py` per line, forwarded to
`model.generate(speed=...)`, and then never used. In mlx_audio's
`qwen3_tts.py` the only occurrences of `speed` are the signature defaults
(lines 1144, 223), a batching guard (line 230), and a docstring at line 1171
that says outright "Speech speed factor (not directly supported yet)". The
`custom_voice` branch does not pass it to `generate_custom_voice`.

So on `Qwen3-TTS-12Hz-1.7B-CustomVoice-6bit`, setting `"speed": 1.3` in a story
manifest changes nothing about the audio. Every shipped manifest uses 1.0, so
nothing is currently wrong — but the field reads like a working control and is
not one. The taproom `voices.json` note reasons explicitly about keeping speed
at 1.0, which implies someone believed it was live.

Consequence: `instruct` (see [[2026-08-01-tts-manifest-acting-direction]]) is
the only working delivery lever. Its tempo effect is modest — measured on
「お決まりになりましたら、お呼びください。」, voice `dylan`, seed 20261733,
speech span excluding lead-in and trailing pad:

- undirected: 2.22s
- "Speak quickly, as if busy behind the counter.": 2.18s (~2% shorter)
- "Speak gently and unhurriedly, with a small pause before the final phrase.":
  2.32s (~5% longer, comma pause 1.42s vs 1.34s)

All three waveforms differ, so direction does reach the model — but anyone
expecting a dramatically rushed read from `instruct` alone will be
disappointed. Each variant kept exactly one internal pause, at the comma; no
spurious pauses appeared.

Regenerating the same manifest twice produced identical sha256s, so generation
is deterministic given a pinned seed.

Unresolved: whether real time-stretching is wanted. Options would be an ffmpeg
`atempo` filter at encode time (reliable, but resamples delivery artificially)
or a different model variant. Not investigated — nobody has asked for it yet.
