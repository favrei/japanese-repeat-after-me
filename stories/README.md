# stories/

**The idea, not the implementation.**

A folder here holds why a story is the way it is, and the provenance of what
was made from it. It holds no code the application loads and no asset the
application serves. If a file here has a counterpart under `app/`, the one
under `app/` is the only real one and this copy is a bug.

```
stories/<story>/
  story.md      the authored draft — situation, stage cuts, character cards,
                dialogue tables, skip-safety proof, difficulty reasoning
  brief.md      what the art and the voices must be (requirements only)
  voices.json   the line manifest the TTS tool reads: text, casting, seed,
                delivery intent
  audio/
    generation-log.json   what was actually generated, and with which seed
    candidates/           auditions that lost, kept so the choice is checkable
```

What lives under `app/` instead:

| Thing | Where |
| --- | --- |
| The encoded story the app loads | `app/client/content/<story>.ts`, registered in `stories.ts` |
| The shared stage/bubble types | `app/shared/story.ts` |
| Shipped audio | `app/public/audio/<story>/` (the café is `qwen3/`) |
| Art packs | `app/art-packs/<pack>.json` |

Authoring flow: [`../.agents/documents/stage-design-flow.md`](../.agents/documents/stage-design-flow.md).
Step 8 encodes into `app/`; nothing is encoded here.

`stories/taproom/stages.ts` and a mirrored copy of the taproom MP3s used to sit
here, left over from when the application was a separate nested checkout. Both
had already drifted from what ships — the copied `stages.ts` had no `audioSrc`
on any line — which is the reason for the rule above. Removed 2026-08-01.
