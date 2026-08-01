# Canonical audio generator

This authoring-only tool turns a story's line manifest into clips with
Qwen3-TTS on Apple Silicon through MLX. The model remains in the Hugging Face
cache; only the compact MP3 results under `public/audio/` ship with the
application.

The tool knows about no story in particular. Every run names the manifest it
reads, where the clips land, and the log it writes — the story's casting lives
in `stories/<story>/voices.json`, never in this file. From this directory:

```bash
uv run python3 generate_audio.py \
  --lines ../../../stories/cafe/voices.json \
  --output-dir ../../public/audio/qwen3 \
  --log ../../../stories/cafe/audio/generation-log.json
```

```bash
uv run python3 generate_audio.py \
  --lines ../../../stories/taproom/voices.json \
  --output-dir ../../public/audio/taproom \
  --log ../../../stories/taproom/audio/generation-log.json
```

The café ships under `public/audio/qwen3/` for historical reasons; later
stories use `public/audio/<story>/`.

The pinned default is revision
`1c6c0ff58c43afa8df571facde2efa077efd85e2` of the 6-bit MLX conversion of
`Qwen3-TTS-12Hz-1.7B-CustomVoice`, whose native Japanese `Ono_Anna` speaker is
the fallback when a manifest line pins no voice. Use `--only ordering-welcome`
to regenerate one line. Generation is seeded, but MLX/model-version changes can
still change the waveform, so listen to every regenerated clip before release.

The model can occasionally miss its end token. The generator trims only a
near-silent tail, caps each attempt at 256 tokens, rejects implausible
post-trim durations, and tries up to five deterministic seeds. Leading audio
and internal pauses are never trimmed. This catches runaways; it does not
replace listening QA for breaths, word errors, accent, or delivery.

A complete run also writes `metadata.json` beside the clips in
`--output-dir`, repeating the model, revision, voice, resolved instruction,
delivery intent, and stable seed for every clip. A partial `--only` run
deliberately leaves that batch manifest unchanged.

Manifest entries may pin `voice`, `speed`, and `seed` per line. A seed chooses
a reproducible take; the voice preset carries identity. Missing seeds derive
from the line id rather than array position, so reordering lines does not
change their takes. Partial `--only` runs merge into `--log` instead of erasing
the provenance of untouched clips.

## Acting direction

A manifest carries its own delivery direction, so a story reads less flat
without any code change. Direction is free English prose describing how a line
is said; it is never spoken. Three levels, most specific winning:

```jsonc
{
  "instruct": "Calm, natural Japanese service speech.",   // whole story
  "sections": {
    "rush": "Speak quickly, as if busy behind the counter." // named group
  },
  "lines": [
    { "id": "a", "text": "…", "section": "rush" },
    { "id": "b", "text": "…", "instruct": "Warm, slowing on the last word." },
    { "id": "c", "text": "…", "instruct": "" }             // opt back out
  ]
}
```

Resolution is line → section → story → `--instruct` → none. An explicit empty
string opts a line out of every inherited direction; omitting the field lets it
inherit. A `section` that is not declared in `sections` fails the run rather
than silently going undirected. The resolved text — not the CLI flag — is what
`--log` and `metadata.json` record per clip.

`deliveryIntent` stays a reviewer note and is still never sent to the model; a
line that should actually be directed needs `instruct`. Manifests written
before this feature resolve to no direction, so their takes are unchanged.

Direction is not free. Qwen can turn expressive directions into breaths or
other non-verbal sounds, which are unacceptable in pronunciation-reference
audio, and a directed take changes pace enough to land on a different accepted
seed. Listen to every directed clip before release, and keep directions about
manner, not content — the model may otherwise speak the direction itself.

The generator needs `ffmpeg` for loudness normalization and MP3 encoding.
Qwen3-TTS is Apache-2.0; verify both model and generated-audio terms again
before commercial release.
