# Pending: listening pass on the seven `dylan` staff clips

Date: 2026-07-31

The user ended the session before auditing the recast, with too much else in
flight. This is deferred work, not an accepted result.

## What is unverified

The seven taproom staff clips were regenerated with the `dylan` preset and are
committed and shipping, but **no human has listened to them end to end**:

`taproom-choose-welcome`, `taproom-choose-board`, `taproom-choose-two`,
`taproom-choose-bitter`, `taproom-glass-served`, `taproom-glass-later`,
`taproom-glass-counter`.

What was checked is only mechanical: durations 2.56–5.20s with no reseeds, hash
provenance recorded, `npm run qa` green at 25/25. None of that hears anything.
The user did approve `dylan` itself, but from a two-line audition
(`staff-welcome__dylan`, `staff-bitter__dylan`), not from the shipped clips.

Specific risk to listen for: `dylan` is documented as Beijing-dialect-locked and
was accepted for Japanese by ear on two short lines. The five longer shipped
lines are where a dialect artefact, a wrong pitch accent, or a mangled
katakana loanword (ペールエール) would show up if it is going to.

## Where things are

- Shipped clips: `poc/public/audio/taproom/`, mirrored in
  `stories/taproom/audio/`.
- Audition candidates for all five presets are still on disk at
  `stories/taproom/audio/candidates/staff-*__*.mp3` — gitignored, so they exist
  locally only. Re-auditioning does not require regeneration unless they are
  deleted.
- Audition manifest: `stories/taproom/audio/staff-recast-audition.json`.
- `stories/taproom/story.md` delivery status already says the story no longer
  clears the listening gate outright.

## Also still unheard

The café's nine autoplay clips have never had their complete listening pass
either. Both sets are blocked on the same human ear, and neither may become a
released learner target before then.

## Related

- [2026-07-31-voice-persona-gender-mismatch] — the chain audit that started this.
- [2026-07-31-taproom-staff-recast-dylan] — the recast and the persona spec change.
- [2026-07-31-partial-tts-run-desyncs-shipped-metadata] — provenance bug found
  while syncing, worked around but not fixed.
