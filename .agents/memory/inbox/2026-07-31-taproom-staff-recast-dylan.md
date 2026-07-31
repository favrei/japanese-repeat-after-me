# Taproom staff recast to `dylan`; persona made a required flow field

Date: 2026-07-31

Follow-up to [2026-07-31-voice-persona-gender-mismatch]. The user chose to
recast rather than redraw, and asked for the spec fix at the same time, with
the framing: a character persona part must always exist — "it could be default,
but could not be NONE."

## Recast

- Auditioned `uncle_fu`, `ryan`, `aiden`, `eric`, `dylan` on two staff lines
  (the greeting and the recommending line), 10 clips, all clean at 2.88–4.40s.
  Candidates kept in `stories/taproom/audio/candidates/staff-*__*.mp3`; the
  audition manifest is `stories/taproom/audio/staff-recast-audition.json`.
- User picked `dylan`. Notable because `dylan` is documented as
  Beijing-dialect-locked and had been excluded from Japanese work on that label
  alone. It reads male and speaks clean Japanese. This extends the `sohee`
  lesson in a second direction: **preset labels are a hint, not a limit, for
  dialect as well as language.** Do not exclude a preset on a label again
  without auditioning it.
- `aiden` was ineligible in practice: it already voices the narrator, and one
  preset cannot play two characters in the same story.
- Regenerated the seven staff clips into `poc/public/audio/taproom/` with their
  existing pinned seeds, changing only `voice`. Durations 2.56–5.20s, no
  reseeds. Copied to `stories/taproom/audio/`. Learner and narrator clips are
  untouched and keep their earlier user acceptance.

## Spec change — `.agents/documents/stage-design-flow.md`

- Step 3 character card gains **Persona (required, never omitted)**: apparent
  gender, apparent age band, vocal timbre. May hold a stated default such as
  `unmarked adult, neutral mid-range`; may never be blank or "unspecified".
- Step 2b persona list now names apparent gender, and the "do not describe how
  anyone looks" rule is narrowed: clothing and composition are styling the art
  derives, but gender and age band are persona and must be stated.
- Step 7 character block copies the persona line verbatim; the Voice section
  requires casting **against persona first**, then judging language quality and
  distinctness, and recording each preset's apparent gender by ear.
- Step 9 gains a **persona agreement** check — view the art and hear the voice
  together. Per-clip listening cannot catch this class of defect: every clip
  sounds fine alone, only the pairing fails.
- Definition of done requires the Persona line and art/voice agreement.

## Tooling defect found and worked around

`generate_audio.py --only` deliberately does not rewrite the batch manifest, so
`poc/public/audio/taproom/metadata.json` kept claiming `Ono_Anna` for clips
that had become `dylan`. The shipped provenance was wrong while the
`generation-log.json` was right. Reconciled the manifest from the log by script
rather than doing a full regeneration, which would have replaced the accepted
learner and narrator clips. **A partial run silently desynchronising shipped
provenance is a real trap for the next agent** — either the tool should
reconcile the manifest on `--only`, or QA should compare the two files.

## State

- `poc` `main` is at `3a3b84d` (Vosk merge, by a parallel session). All edits
  here are uncommitted working-tree changes in both the outer repo and `poc`.
- `npm run qa` passes: art validation, typecheck, lint, build, 25/25 tests.
- One existing test pinned the staff voice to `Ono_Anna` and correctly failed
  on the recast; updated to `dylan` and extended to assert the story uses three
  distinct voices.
- **The seven new staff clips have not had a listening pass.** The taproom no
  longer clears the listening gate outright; `story.md` delivery status now
  says so.
- The café was never affected: its staff is drawn female and voiced
  `Ono_Anna`. That was luck, not a rule — nothing enforced agreement until now.
