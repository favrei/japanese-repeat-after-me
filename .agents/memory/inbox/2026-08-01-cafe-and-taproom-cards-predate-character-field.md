# Café and taproom cards predate the Character field and Pass E

2026-08-01. The Character card field and the gate's Pass E were added today —
see [[2026-08-01-persona-versus-character-and-pass-e]]. Both are now required by
`.agents/documents/stage-design-flow.md` and
`.agents/documents/character-separation-gate.md`, and both were applied to
office-gig only.

The two shipped stories do not conform:

- **Taproom** (`stories/taproom/story.md`) has full cards with Wants / Knows /
  Cannot know / Perceives / Persona / Voice fingerprint / Never says, but no
  Character field, so no trait table exists for either speaker and Pass E has
  never been run over its 13 bubbles. Its `brief.md` character block is a
  styling list, not a trait → appearance table.
- **Café** has no `story.md` at all. It predates the authoring flow entirely;
  `stories/cafe/` holds only `voices.json` (extracted from the TTS tool today)
  and `audio/generation-log.json`.

Nothing is broken — both stories ship and pass QA. The gap is that the two
existing characters were never checked for the defect Pass E is for: a persona
that never reaches the dialogue, or a drawing that asserts a trait the script
never earned.

Not fixed, and not urgent. Doing it would mean writing Character fields
retroactively for the taproom staff and both learners, running Pass E over
existing shipped lines, and reconstructing a café `story.md` from the encoded
content. The user has not asked, and the flow is explicitly a draft that
existing content is not obliged to be rebuilt against.

Worth deciding once, though: whether new gates apply retroactively to shipped
stories or only forward. Same question already open for the café's missing
draft — see [[2026-08-01-stories-folder-holds-idea-not-implementation]].
