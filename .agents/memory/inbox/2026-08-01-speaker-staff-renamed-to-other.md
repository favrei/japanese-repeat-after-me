# `Speaker` "staff" renamed to "other"; multi-party is not a restructure

2026-08-01. Authoring office-gig, whose other party is a coworker, surfaced
`Speaker = "staff" | "learner"` in `app/shared/story.ts`. The user asked where
that limitation came from, having never specified it.

Origin: commit `d0bd4bd` (2026-07-30), "Initial two-stage cafe conversation
PoC", author `morpho` — the first commit in the repository. The café was the
only story, its other party was literally café staff, and the role was frozen
into the type and carried forward untouched. Never a design decision about who
a story's other party may be.

Renamed to `Speaker = "other" | "learner"`, matching the flow doc's own
vocabulary. 18 lines across 4 files: `app/shared/story.ts`,
`app/client/content/cafe.ts` (9), `taproom.ts` (7), `app/tests/client/flow.test.mjs`
(1). `npm run qa` green after: 31 client, 4 contract, 5 integration, plus
art-pack validation.

Not affected, deliberately:

- `castId: "staff"` in `taproom.ts` and `characters.staff` in
  `art-packs/taproom.json` — a different namespace, the art pack's character
  key, and still correct.
- The TTS manifest's free-form `speaker` field, whose default remains "staff" in
  `generate_audio.py`. It is provenance metadata, not the app's type. The
  office-gig manifest sets `"speaker": "coworker"` explicitly, and the café's
  extracted manifest still records "staff" by default — harmless but
  inconsistent, and worth cleaning if anyone touches that file.

**Multi-party is cheaper than it looks**, checked while answering the user's
follow-up. The art pack already holds `characters` as a map, so several are
representable today. What is hardcoded to one:

- `PracticeStage.castId` — one per stage, so the cast can change between stages
  but not within one;
- `PracticeApp.tsx:1407` resolves a single `activeCharacter` and sets the
  figure's height/bottom CSS vars once per stage;
- mood and dim apply to "the" character.

The balloon tail already reads `character.anchor`, which is per-character and
would just work. So the data change is one optional `castId` on
`DialogueBubble`, defaulting to the stage's; the real work is rendering two
figures at once, per-character CSS vars, dimming the non-speaker, and deciding
what happens when both characters anchor left. Roughly 50 lines plus CSS, and
about double the art per pack. Not built — no story needs it yet.
