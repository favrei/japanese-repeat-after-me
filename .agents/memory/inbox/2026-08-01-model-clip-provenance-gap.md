# The nine model clips are shipped but not fully provenanced

Two gaps left open by the partial TTS runs that produced the speak-bubble model
clips, neither of which blocks the UI work:

1. **Café seeds are unrecorded.** The four `qwen3` model clips
   (`ordering-menu`, `ordering-order`, `meal-restroom`, `meal-serve`) were
   generated with `--only` and no `--log`, and `tools/tts/README.md` states a
   partial run *deliberately* leaves `public/audio/qwen3/metadata.json`
   unchanged. So that manifest still documents nine autoplay clips while
   thirteen ship. Seeds derive from the line id, so a re-run with `--log`
   would recover provenance; only a complete run rewrites the manifest, and
   that would regenerate the user-approved autoplay clips too. The taproom
   five are fine — `stories/taproom/audio/generation-log.json` has their
   seeds, durations, and sha256, voiced `sohee`.

2. **No human has listened to any of the nine.** They are now learner-facing
   reference audio, which the project gate says must pass a listening pass
   before shipping. Note also that `meal-restroom.mp3` holds
   「レシートをお願いします。」 and `meal-serve.mp3` holds
   「カードでお願いします。」 — the ids are inherited from neighbouring
   staff lines and do not describe their contents.

The integration test was left honest about this rather than forced green: it
asserts the manifest covers the autoplay batch and comments why, and checks the
model clips separately by file and service-worker precache.
