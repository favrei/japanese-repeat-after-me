# office-gig 土曜日のライブ drafted through Step 7b

2026-08-01. Third story, first authored under the restructured `stories/` rule
and the first whose other party is not staff. `stories/office-gig/` holds
`story.md`, `brief.md`, `voices.json`, and `audio/audition.json` +
`audio/candidates/`.

**Situation.** A learner working in a Japanese office spends one Friday getting
from "my coworker likes music" to a fixed plan to attend a gig on Saturday.
Requested by the user as "discussing rock'n'roll music with my coworker", N4,
originally five stages; cut to four when the user chose to respect the flow's
2–4 stage rule. 23 bubbles, 8 speak, ~1 minute per stage.

**Cuts.** 気づく `lounge` / 好み `lounge-close` / 行きたい `entrance` /
待ち合わせ `entrance-close`, one `coworker` throughout. Two art plates, four
crops, following the café's and taproom's shared-plate pattern.

**Confirmed by the user:** the four cuts, the dialogue (after one naturalness
rewrite), the coworker as a woman in her late 20s over the free alternative of
recasting her male, and the learner staying gender-unmarked.

**Gates passed.** Skip-safety by pessimistic run — five constructions were cut,
the expensive one being a stage 4 line where she proposed a meeting time the
*learner* had suggested, which she would be inventing from nowhere in a failed
run. Character separation A–E, rerun twice (after a Pass C fix and after the
naturalness rewrite). Difficulty N4 across production, listening, and overall,
high confidence, longest learner line 20 morae.

**Notable content decisions.** The band is never named — a proper noun the
learner must hear once and reproduce exactly is a memory test, not a speaking
test. 〜てもいいですか is deliberate recall from the taproom rather than a new
pattern. None of the Japanese is gender-marked on either side: no わ, no かしら,
only the neutral 私, so the coworker could be recast male with zero text
changes.

**Not started, deliberately.** The user deferred all media: "for the multimedia
including the mp3 and images, we will leave for later." Five casting auditions
were generated before that instruction and remain unheard in
`audio/candidates/` — `serena` and `vivian` on two lines each, plus a `sohee`
learner reference for the adjacency check. Casting is unresolved and
`voices.json` pins no seeds yet.

**Remaining work:** kana readings for all 27 lines (not drafted; the known
failure point), Step 8 encode to `app/client/content/office-gig.ts`, the
`office` art pack, audio generation and the listening pass, Step 9 validation.
Encoding is blocked on the art pack only for *registration* — `validate:art`
and the story-pack contract test resolve `sceneId`/`castId` against
`app/art-packs/<id>.json`.
