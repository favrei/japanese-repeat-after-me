# TTS full run metadata condition fixed

2026-08-01. The first complete `office-gig` 27-line generation wrote every
MP3 and the provenance log, but not the shipped `metadata.json`. The generator
guard was `if not args.lines and not args.only`; `--lines` is now required, so
that condition can never be true.

Fixed the guard to `if not args.only`, matching the documented contract: a
complete batch writes `metadata.json`, while partial `--only` runs leave it
unchanged. The audio takes themselves completed with 27 clips and zero
duration-guard suspects.

Two harmless environment checks also failed during the same media pass because
system Python and the TTS environment did not include Pillow. Chroma-key
processing succeeded with the skill helper under `uv run --with pillow`.
