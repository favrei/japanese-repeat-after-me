# Bug: `generate_audio.py --only` desynchronises shipped audio provenance

Date: 2026-07-31

## What happens

`poc/tools/tts/generate_audio.py` writes two provenance files:

- `--log <path>` — the story's `generation-log.json`, which **merges** partial
  runs, so `--only` updates just the regenerated clips and preserves the rest.
- `<output-dir>/metadata.json` — the batch manifest that **ships with the app**,
  which a `--only` run deliberately does not touch at all.

The merge behaviour is correct and intentional. The consequence is not: after
any `--only` run the shipped `metadata.json` still describes the *previous*
take — wrong `voice`, `seed`, and hash — while the mp3 next to it is new. The
log is right and the shipped manifest is wrong, with nothing reporting the
disagreement.

## How it surfaced

Recasting the taproom staff from `Ono_Anna` to `dylan` regenerated seven clips
with `--only`. `stories/taproom/audio/generation-log.json` correctly said
`dylan`; `poc/public/audio/taproom/metadata.json` still said `Ono_Anna` for the
same seven ids. Nothing failed — QA, the art-pack validator, and the test suite
all passed with the manifest lying. It was found by reading the file, not by
any check.

## Workaround applied

Reconciled `metadata.json` from `generation-log.json` by script, copying
`voice`, `seed`, and hash for the changed ids and adding a note recording why.
A full regeneration would have fixed it too, but would have replaced the
learner and narrator clips that already passed the user's listening gate —
never regenerate accepted audio to repair a manifest.

## Not fixed

Two candidate fixes, neither implemented:

1. Have `--only` reconcile the shipped manifest for the ids it regenerated,
   leaving untouched entries alone — the same merge the log already does.
2. Add a QA check comparing `metadata.json` against the story's
   `generation-log.json` for every id, failing on any `voice`/`seed`/hash
   disagreement.

Option 2 catches hand-edits and drift from any cause, not just this one; option
1 removes the trap at the source. They are complementary, and both are small.

## Why it matters beyond this instance

Reference audio provenance is the record used to decide whether a clip may
become a learner target. A manifest that silently describes the wrong take
defeats that, and the failure is invisible: every automated gate passes and
every clip plays. Assume any past `--only` run left the same skew and check the
shipped manifest before trusting it.
