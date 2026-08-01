# The café's opening narration was silent; now voiced by `aiden`

Peter reported the first sentence — "usually the narrator part" — as broken.
It was: `cafe.ts` transitions `ordering-open` and `meal-open` carried **no
`audioSrc`**, while both taproom transitions did. `PracticeApp` deliberately
refuses a synthetic voice for narration ("a voice the story has not cast"), so
the café simply held its transition card in silence for the fallback
`holdMs` and moved on.

Cast `aiden`, the taproom's narrator, so the storyteller is one person across
the app and stays distinct from café staff `Ono_Anna`. Generated from
`app/tools/tts/generate_audio.py` (two new `Line`s, `speaker="narrator"`):

| id | seed | duration |
| --- | --- | --- |
| `ordering-open` | 1990034780 | 4.64 s |
| `meal-open` | 720458274 | 5.04 s |

This run passed `--log`, so the café finally has provenance at
`stories/cafe/audio/generation-log.json` — a new path, mirroring taproom's.
Note `--only` takes one value per flag: `--only a --only b`, not `--only a b`.

Wired into `cafe.ts`, precached in `sw.js` (cache bumped to
`conversation-app-shell-v13`), and guarded by a new contract test asserting
every stage transition ships a narration clip over 1 KB. The café batch
manifest `public/audio/qwen3/metadata.json` still lags, for the reason in
[[2026-08-01-model-clip-provenance-gap]].

**Neither clip has been listened to by a human.** `aiden` on café narration is
a casting choice made without an audition.
