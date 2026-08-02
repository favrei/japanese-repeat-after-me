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

## Story status

| Story | Authoring | Production / app |
| --- | --- | --- |
| Café | Legacy provenance assets only | Implemented in `app/client/content/cafe.ts` |
| [初めての一杯 / Taproom](taproom/story.md) | Complete | Shipped |
| [土曜日のライブ / Office Gig](office-gig/story.md) | Complete | Media integrated; mechanical QA complete |
| [終電を逃した夜 / Missed the Last Train](missed-last-train/story.md) | Complete | Not started |
| [消えた財布 / The Missing Wallet](missing-wallet/story.md) | Complete | Not started |
| [引っ越しの日 / Moving Day](moving-day/story.md) | Complete | Not started |
| [町のクリニック / The Neighborhood Clinic](neighborhood-clinic/story.md) | Complete | Not started |
| [中古の自転車 / The Secondhand Bicycle](secondhand-bicycle/story.md) | Complete | Not started |
| [山で雨 / Rain on the Mountain](rain-on-mountain/story.md) | Complete | Not started |
| [温泉旅館の一泊 / A Night at an Onsen Inn](onsen-inn/story.md) | Complete | Not started |
| [商店街の夏祭り / The Shopping-Street Festival](shopping-street-festival/story.md) | Complete | Not started |
| [二人の料理教室 / Partners in a Cooking Class](cooking-class/story.md) | Complete | Not started |
| [プレゼン前夜 / The Night Before the Presentation](presentation-eve/story.md) | Complete | Not started |

The ten-story slate and detached validation evidence are in
[`AUTHORING-REPORT.md`](AUTHORING-REPORT.md). “Complete” in the authoring column
means the story pack passed the content gates; it does not mean art, audio, app
encoding, or browser QA exists.

`stories/taproom/stages.ts` and a mirrored copy of the taproom MP3s used to sit
here, left over from when the application was a separate nested checkout. Both
had already drifted from what ships — the copied `stages.ts` had no `audioSrc`
on any line — which is the reason for the rule above. Removed 2026-08-01.
