# stories/ holds the idea, app/ holds the implementation

2026-08-01. The user set the principle after asking why `stories/taproom/`
duplicated shipped content: **`stories/<story>/` is the draft and the
provenance; it contains no code the app loads and no asset the app serves.**
If a file there has a counterpart under `app/`, the `app/` one is the only real
one.

## Removed (all stale duplicates of shipped content)

- `stories/taproom/stages.ts` — dead. Nothing imported it; the app loads
  `app/client/content/taproom.ts` via `stories.ts`. It had already drifted:
  **zero `audioSrc` fields** on any of its 15 lines, no `stages`/`flow` on its
  exported `STORY`, and locally re-declared copies of the `PracticeStage` /
  `DialogueBubble` types because at authoring time those only existed on an
  unmerged branch in a sibling worktree. That reason died with the flatten.
- The 10 autoplay MP3s directly under `stories/taproom/audio/` — byte-identical
  (`cmp`) to `app/public/audio/taproom/`, and drifted the same way: the 5
  learner model clips added 2026-08-01 exist only under `app/public/`.

Kept as provenance: `audio/generation-log.json`, `audio/candidates/` (21
auditions), `audio/staff-recast-audition.json`, `story.md`, `brief.md`,
`voices.json`.

## Café casting extracted from the generator

`app/tools/tts/generate_audio.py` carried the café's 15 lines as a hardcoded
`LINES` tuple — the same violation, the other direction: the idea lived inside
the implementation. Extracted verbatim to `stories/cafe/voices.json`, which is
now the café's first authored file. Verified faithful before deleting `LINES`:
same ids, same order, same text/intent/speaker, and `seed_for()` resolves to
the same seed for every line. Staff and learner lines now pin `Ono_Anna`
explicitly instead of inheriting the tool's `--voice` default — same resolved
voice, no take changes.

`--lines` and `--output-dir` are now **required**, and `DEFAULT_OUTPUT_DIR`
(which pointed at the café's `public/audio/qwen3/`) is gone. The tool now knows
about no story in particular. Bare `uv run python3 generate_audio.py` no longer
works; both stories' full invocations are in `app/tools/tts/README.md`.

Note the café still ships to `public/audio/qwen3/` while taproom uses
`public/audio/taproom/`. Historical, documented, not worth a migration.

## Written

- `stories/README.md` — the boundary, the per-story layout, and a table of what
  lives under `app/` instead.
- `.agents/documents/stage-design-flow.md` — new "Where the files go" block
  under *Before writing anything*. The flow doc had never said where the draft,
  brief, or manifest go, which is how the duplication happened; Step 8 already
  said `app/client/content/`.
- `stories/taproom/story.md` — pointers now target
  `app/client/content/taproom.ts`; the Status paragraph no longer claims the
  work sits unmerged in `japanese-repeat-after-me-story-selection`.

## Still open

- `.agents/memory/cells/content.md:201` describes taproom's `stages.ts`. Cells
  are read-only outside a dream; that line is now wrong and needs a dream pass.
- `stories/cafe/` has only `audio/` and the new `voices.json` — no `story.md`,
  no `brief.md`. The café predates the flow. Reconstructing them was not asked
  for.

## Verified

`npm run qa` green (contracts 4/4, integration 5/5).
