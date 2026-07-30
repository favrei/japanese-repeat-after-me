# Café stage redesign complete

- Applied the upgraded stage-design flow to the bundled café story and recorded
  the character cards, finished dialogue, difficulty, skip-safety proof,
  four-pass separation-gate verdict, and art/voice brief in
  `.agents/documents/cafe-stage-redesign.md`.
- Replaced the burger/beer/companion script with two goal-state stages:
  ordering a house-blend coffee, then requesting a receipt and paying by card.
  Both stages have two short learner `speak` bubbles; existing bubble IDs and
  all flow semantics remain stable.
- Implemented in `../japanese-repeat-after-me-art-system` on
  `design/art-pack-system`. Preserved the pre-existing art system first as
  commit `51cbcdb`, then committed the stage/audio revision as `e37d5c4`.
- The existing café art pack matches the new brief, so it was retained. Nine
  staff autoplay clips were regenerated with the pinned Qwen3-TTS model and
  clean `Ono_Anna` voice. Provenance and accepted seeds are in
  `public/audio/qwen3/metadata.json`.
- Qwen produced two runaway attempts (17.04 seconds and a 1,024-token
  non-ending line). The generator now caps attempts at 256 tokens, rejects
  implausible durations, retries deterministic seeds, and records the accepted
  seed. Final clips are 1.56–3.62 seconds.
- Pinned local Vosk transcribed all nine final clips with the intended content;
  it made expected surface errors around honorific prefixes/endings. This is a
  content sanity check, not listening QA.
- `npm run qa` passes art validation, typecheck, lint, build, and all 13 tests.
- Production-browser QA passed at phone and wide-desktop sizes: real autoplay
  advanced, every Skip moved exactly one bubble through all 13 bubbles and the
  stage boundary, completion appeared, art loaded at full dimensions, and no
  horizontal overflow was present.
- The obsolete `ordering-menu.mp3` was removed from the branch and preserved
  recoverably at `/private/tmp/ordering-menu-obsolete-20260730.mp3`.
- Remaining human gate: listen to every regenerated clip and visually approve
  the retained art/frame. No merge to nested PoC `main` and no deployment
  occurred.
