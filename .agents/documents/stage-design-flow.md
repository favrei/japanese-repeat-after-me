# Stage Design Flow

A repeatable flow for authoring a new conversation stage: story, dialogue, and
difficulty. Follow it in order when the user asks to add a stage, a chapter, a
new scene or situation, or to extend the café example with another story.

A **stage** is one conversation scene the learner rehearses aloud: an ordered
list of bubbles ending when the learner's goal in that scene is reached, plus
the narrated cut that opens it. The café (`ordering`, `meal`) is only the worked
example, not the product identity.

This document covers **story, dialogue, transitions, and difficulty**. It does
**not** cover art. It ends by writing an art & voice *brief* — required
backgrounds, design language, characters, persona, voice — which the separate
art work consumes. The cut belongs here rather than to the art work: which shot
and which other party a stage plays against is a story decision, and the pack
supplies the plates for it.
See [`../memory/cells/visual-design.md`](../memory/cells/visual-design.md) and
[`art-system.md`](art-system.md).

This is a draft. Revise it as stage authoring teaches us more.

## Before writing anything

1. Read [`../memory/current.md`](../memory/current.md) and the cells it links,
   at minimum [`../memory/cells/product.md`](../memory/cells/product.md) for
   flow rules and [`../memory/cells/visual-design.md`](../memory/cells/visual-design.md)
   for frame limits.
2. Read `poc/app/stages.ts` for the live data shape and the café example.
3. Do not change flow logic, state handling, or test selectors. A stage is
   content; the progression rules are fixed and owned by the product cell.

Fixed rules you author *inside*, never around:

- One sentence is one bubble.
- A learner `speak` bubble advances on one success, on the third failure, or on
  one Skip press.
- The flow is linear. There is no branching and no conditional reply.

## Step 1 — Choose the situation

Accept a situation only if all four hold:

- **Immediately useful.** The learner would say these exact sentences within
  days of arriving. This is spoken recall, not a grammar syllabus.
- **The learner has a goal.** Order food, buy a ticket, check in, ask a
  pharmacist, report a lost item. "Chat about hobbies" fails: no goal, no
  natural sentence set.
- **The other party is predictable.** Real staff say near-identical lines every
  time. If the other party's replies are unpredictable, a linear script lies.
- **It closes.** The goal is reached in 2–4 stages, roughly 20 bubbles total.

Write one line naming the situation, the place, and what the learner walks away
having accomplished.

## Step 2 — Cut it into stages

One stage = **one change of the learner's goal state**. Ordering ends when the
order is placed; the meal stage begins when the food arrives. Cut where a real
person would wait, not where the sentence count is convenient.

Per stage:

- 5–9 bubbles.
- 2–3 learner `speak` bubbles. One is thin; four is a drill, not a scene.
- Open on the other party, so the learner hears the register before producing.
- Close on a beat of resolution — the acknowledgement, the goal met.

## Step 2b — Write the cut between stages

A stage cut is a **scene change**, and the app makes it visible: it stops on a
transition card, changes background and other party underneath it, and lets the
narrator speak. Nothing crosses that break implicitly, so every cut has to be
authored. Skipping this is what made the café read as abrupt.

Per stage — including the first, which opens the story from the cover — decide:

- **The shot** (`sceneId`). Which background this stage plays against. Two
  stages may share one; say so deliberately rather than by omission.
- **The other party** (`castId`). Who the learner is talking to here. A new
  stage is where the cast may change; within a stage it may not.
- **The narrator's line** (`transition`). One sentence carrying the time, place,
  or movement that the dialogue itself cannot state.

The scene and cast keys must exist in the story's art pack. Both are named
entries in the manifest, not pack-wide constants — see
[`art-system.md`](art-system.md).

### Rules for the narrator

The narrator is the storyteller, not a person in the room. They are the one
voice allowed to know the writer's intent — which is exactly why they are easy
to misuse:

- **Never a character.** The narrator does not greet, answer, instruct, or react
  to anyone. If a line could be said *to* someone in the scene, it belongs in a
  bubble.
- **Only what the story can show.** No line may state what a character knows,
  intends, or is about to do. The card runs before the stage, so anything it
  reveals is a spoiler the dialogue then has to redundantly repeat.
- **No flow narration.** Never explain the app: not attempts, not skipping, not
  "now you will practise". The card is inside the story.
- **Cover the change, not the dialogue.** Say what moved — a seat left, a
  counter reached, an hour passed. Do not summarise the scene you are about to
  play.
- **Skip-safe, like every other-party line — and more exposed.** The card runs
  *between* stages, after the learner may have skipped or failed out of the
  previous stage's last speak bubble. No line may assert that the learner
  spoke, was understood, or got what they asked for. 「注文を伝えると、店員は
  タップの前へ歩いていった。」 reads naturally and is false in a pessimistic
  run; 「タップからビールが注がれた。」 is true either way. Describe what the
  scene does, not what the learner achieved.
- **Second person for the learner.** The app calls the learner あなた; the
  narrator matches it, and never names them or assigns them a nationality,
  budget, or reaction.
- One sentence, with `japanese`, `reading`, and `translation` like any bubble.
  Narration is read, not spoken by the learner, and is never scored.

## Step 3 — Cast and persona

Decide, in words, before any dialogue:

- **Other party:** role, approximate age, register used toward the learner
  (business polite, plain polite, brusque), and one trait that shapes word
  choice (rushed, elderly, over-helpful).
- **Learner persona:** who the learner *is* in this scene — traveller with a
  companion, resident alone, parent with a child. This decides politeness
  level, pronoun use, and whether a line like "for her" is even possible.
- **Voice per speaker:** perceived age, speed, politeness, regional neutrality.

These three feed Step 7 verbatim. Do not describe how anyone *looks* here;
appearance is derived by the art work from the persona stated.

### Character cards (required)

You are one writer voicing every person in the scene, which reliably collapses
them into one mind. Write a card per speaker — **including the learner**, the
most frequently forgotten character — before writing any line:

- **Wants** — the goal in this scene, one line.
- **Knows** — what this person knows entering the scene.
- **Cannot know** — stated explicitly: the other party's plans, and the
  learner's nationality, name, itinerary, budget, or level unless the scene
  shows it.
- **Perceives** — what anyone present can observe in the room. Only these facts
  may be reacted to.
- **Voice fingerprint** — politeness tier as concrete grammar
  (尊敬語・謙譲語 / です・ます / plain), typical sentence length, one habitual
  word or opener, and who asks the questions.
- **Never says** — a short banned list. A beginner learner never produces
  かしこまりました or よろしいでしょうか; café staff never explain grammar.

Scene facts everyone shares go in one separate list, not into any card. The
cards are what [Step 6b](#step-6b--character-separation-gate-required) checks
the finished dialogue against, so vague cards make the gate unrunnable.

The narrator gets **no card**: they have no wants, know everything, and are
present in no room. That asymmetry is the point — write them from the Step 2b
rules instead. If the cast changes between stages, each other party is a
separate character with a separate card, never one card wearing two roles.

## Step 4 — Write the dialogue

Order of work: write the learner's `speak` bubbles first, then write the other
party's lines *around* them. The speak bubbles are the product; everything else
is scaffolding.

### Bubble roles

- Other-party `autoplay`: carries listening load and supplies the cue the
  learner answers.
- Learner `autoplay`: a free ride. Use it to model rhythm and register right
  before a demanding speak bubble, and to carry awkward connective sentences
  that are not worth rehearsing.
- Learner `speak`: what the learner must produce. Every one must be a sentence
  worth owning for life.

### Hard constraints

- **Skip-safe.** Every other-party line must still make sense if the preceding
  learner bubble was skipped or failed out. Never write a reply that quotes or
  depends on what the learner actually said.
- **Self-contained.** A speak bubble must be sayable from its own text. No
  "yes, that one" pointing back at an earlier turn.
- **Natural spoken register**, not textbook. Say it aloud; if a real customer
  would not, rewrite it.
- **Consistent politeness** with the Step 3 persona, across the whole stage.
- **In character, never about the character.** A line does the thing; it never
  states the speaker's role as a reason for speaking, explains the scene, or
  teaches. 「私は店員ですので……」 and 「これは丁寧な言い方です。」 are both the
  writer talking, not the character. Pedagogy lives in the `translation` field
  and in which sentence you chose — never in a character's mouth.
- **No borrowed knowledge.** Each line may use only what its speaker's card
  says they know or perceive. Nobody knows the learner's nationality, name, or
  plans because the writer does.
- **Scene lettering is allowed; UI text is separate.** Signage, boards, menus,
  and labels may be drawn into the art where the setting calls for them. What
  the learner must read or act on still lives in UI text, and speech still
  lives in balloons.

### Fields (see `poc/app/stages.ts`)

- `japanese` — the target sentence. One sentence, normal punctuation.
- `reading` — full kana reading. **Validate it.** AI-generated readings are the
  known failure point; the reading becomes the pronunciation target and the
  alignment string for hit/miss feedback.
- `translation` — the meaning as an English speaker would say it, not a gloss.
- `accepted` — realistic alternate phrasings that must also pass: the
  particle-dropped spoken form, a shorter idiomatic variant, a common synonym.
  This is a difficulty valve, not an afterthought.
- `id` — `<stage-id>-<slug>`, stable and unique. Tests key on ids; never
  renumber existing ones.

## Step 5 — Control difficulty

The attempt budget is fixed at three failures, so **difficulty lives in the
content**. Tune these dials, roughly in this order:

1. **Length.** Count morae in the `reading`. Early stages ~8–14 morae per speak
   bubble; later ~15–25. Past ~30 it is a memory test, not a speaking test.
2. **Speak-bubble count** per stage: 2 easy, 3 harder.
3. **Structural novelty.** At most one new pattern per stage. Everything else
   should be a structure the learner has already produced.
4. **Recycling.** Deliberately repeat an earlier stage's phrase in a new slot.
   Recall through reuse is the whole mechanism.
5. **`accepted` breadth.** More variants is easier. Widen it when a bubble is
   long or phonetically fragile.
6. **Phonetic fragility.** These inflate false rejections under a coarse
   recognizer — use them on purpose and pay for them with `accepted` variants:
   katakana loanwords, long vowels, small っ, numbers with counters, minimal
   pairs, and long chains of any of the above.

**Calibration target:** the first speak bubble of a stage should usually pass on
the first attempt. Failing out at three should read as mercy, not as the normal
exit. If a bubble is expected to fail out routinely, it is too long, too novel,
or too fragile — fix the content, not the flow.

## Step 6 — Where to notice

Review the draft against this list before encoding:

- An other-party reply that only makes sense after a *successful* learner turn.
- A speak bubble whose purpose at that moment is unclear to the learner.
- Two new patterns stacked into one stage.
- Register drift — casual toward staff, or heavy keigo from a tourist.
- A `reading` that disagrees with the `japanese`; numbers, counters, rendaku,
  and 何 readings are the usual culprits.
- A translation that teaches the English rather than the Japanese meaning.
- Culture: what the other party would actually say. A Japanese server does not
  say "sir".
- A stage that ends mid-transaction with nothing accomplished.

## Step 6b — Character separation gate (required)

Run [`character-separation-gate.md`](character-separation-gate.md) over the
finished lines before encoding. It is the one check aimed at the failure this
flow is most exposed to: a single writer voicing several people produces
characters who share one mind, and lines in which the writer's reasoning
surfaces inside a character's mouth.

Run it as a separate reading pass over `speaker`, `japanese`, `reading`, and
`translation` only, with your drafting notes and rationale out of view — the
point is to lose the author's memory of what each line was *meant* to do. Four
passes: leak scan, knowledge ledger, blind attribution with the speaker labels
stripped, and a single-speaker read-through per character. It is pass/fail for
the whole stage set; on any failure, fix the content and rerun all four.

Include the transition lines in the leak scan and the knowledge ledger, and
exclude them from blind attribution — they are attributable by design. The
failure to look for is the reverse of the usual one: a narrator line that hands
a character knowledge, or that says something only a character in the room could
have observed.

Never resolve a gate failure by changing flow rules. Record the verdict in the
Step 9 inbox note.

## Step 7 — Art and voice brief

Write requirements only. Do not generate, choose, or describe finished art.
This brief is the handoff to the art work.

```markdown
## Art & voice brief — <stage set name>

### Scene backgrounds — one block per sceneId from Step 2b
- Place, time of day, indoor or outdoor, camera framing and distance
- Mood in one line
- Palette anchor within the approved system (newsprint paper, black and
  neutral ink, exactly one deep red accent); name any story-specific
  deviation and why
- Safe overlay zones where balloons and controls must stay readable
- Continuity with the other shots: same establishment, hour, and weather
  unless the narrator's line says otherwise
- Constraint: full-bleed. Signage and lettering are allowed where the setting
  calls for them; name any text the scene should show

### Other-party characters — one block per castId from Step 2b
- Role, approximate age, build, clothing appropriate to the role
- Expression range needed across the stages
- Register they project, taken from Step 3 rather than from styling
- Which scenes they appear in, and that they must read as standing in each
- Constraint: adult seinen proportions, no chibi

### Cover art
- One image summarising the situation, in the same register

### Voice
- Per speaker: perceived age, speed, politeness level, regional neutrality
- Voice fingerprint from the Step 3 card, so two characters are not
  synthesised as the same person
- Learner reference-line voice, if it differs
- Narrator: state the delivery intent and audition a distinct voice just as for
  the characters. Leave `audioSrc` unset only while casting is unresolved;
  once a clip passes the listening gate, bundle it and set `audioSrc`. Never
  invent an uncast narrator through browser `speechSynthesis`.
- Words the synthesiser is likely to mispronounce
```

## Step 7b — Speech-delivery intent (TTS prompt inputs)

**Unresolved: how to prompt the synthesiser well is not yet established.** The
current authoring-time path is Qwen3-TTS CustomVoice via `mlx-audio` on Metal
with the native Japanese speaker `Ono_Anna`, but the useful instruction levers,
their wording, and how strongly they bind have not been tested. Treat this
section as capture, not as a solved recipe.

So the flow's job here is to record the *intent* in plain words, in the stage's
own terms, and leave the prompt wording to whoever generates audio:

- **Per speaker:** the voice line from the brief above, plus the one persona
  trait that should be audible (rushed, elderly, over-helpful).
- **Per bubble that gets generated audio:** delivery in one short line — flat
  and routine, warm greeting, apologetic, questioning rise, brisk. Most café
  staff lines are routine; say so rather than leaving it blank.
- **Pace and pauses:** mark any line the learner is expected to shadow, where a
  slower, evenly spaced reading matters more than natural speed.
- **Risky pronunciations:** list the words expected to come out wrong —
  counters, numbers, katakana loanwords, place and product names, 何 readings.
  These are the same items flagged in Step 5 and Step 6; carry the list over.

When audio is actually generated, record alongside the clips: the model and
version, the speaker, the exact instruction text used, and the seed. The
existing generator pins a model snapshot, `mlx-audio` version, and a per-line
stable seed so a single line can be regenerated byte-identically — keep that
property. Without the recorded prompt text, a later re-tune cannot tell whether
a bad clip came from the prompt, the model, or the sentence.

Until the prompt approach is settled:

- Do not block stage authoring on it. Write the intent, generate with whatever
  is current, and listen.
- Judge every clip by ear before it becomes a reference the learner imitates. A
  mispronounced reference teaches the mistake.
- If a line cannot be made to sound right, prefer changing the sentence over
  shipping wrong audio, and note why in the inbox.
- Bundled clips are the reference; browser `speechSynthesis` remains only a
  playback fallback, not an authoring target.

## Step 8 — Encode

Add the stages to `poc/app/stages.ts` in the existing shape: `PracticeStage`
with `id`, `number`, `title`, `jpTitle`, `sceneId`, `castId`, `transition`, and
ordered `bubbles`. All three of `sceneId`, `castId`, and `transition` are
required — a stage cannot be encoded without its cut. `FLOW` derives itself; do
not hand-maintain it. Do not touch `flow.ts` or `scoring.ts` — if a stage
appears to require a flow change, stop and raise it with the user.

The transition is content, not flow: it is a break between bubbles, never an
attempt, a scored step, or something the learner must pass. Skipping a card
does not consume the one bubble Skip dismisses.

## Step 9 — Validate

- Read every bubble aloud in sequence. It must sound like one conversation.
- Read each transition line in place, before its stage. It must explain the
  change without pre-empting the dialogue that follows.
- Re-verify each `reading` against its `japanese`, transitions included.
- Confirm every `sceneId` and `castId` resolves in the story's art pack, and
  walk each cut in the browser to see the background and character actually
  change.
- Listen to every generated clip. Check pronunciation against the `reading`,
  not against the kanji, and confirm the delivery matches the Step 7b intent.
- Simulate a pessimistic run: skip or fail out *every* learner bubble and
  confirm the remaining dialogue still coheres.
- Re-run the character separation gate if any line changed after Step 6b.
- Run the PoC QA command from `poc/README.md`; existing tests stay green.
- Write an inbox note under `.agents/memory/inbox/` recording the new stage set,
  its difficulty intent, the gate verdict, and anything unresolved. Do not edit
  memory cells.

## Definition of done

- Situation, stage cuts, and personas stated in prose, with a character card
  per speaker including the learner.
- Every stage — the first included — names its shot, its other party, and its
  narrator line, and every key resolves in the art pack.
- Every bubble has validated `japanese`, `reading`, and `translation`; every
  speak bubble has considered `accepted` variants.
- Skip-safety verified by the pessimistic run.
- Character separation gate run over the finished lines and passed, with its
  verdict recorded.
- Difficulty dials chosen deliberately, not by accident.
- Art & voice brief written; no art produced here.
- Speech-delivery intent recorded per speaker and per generated bubble, and the
  model, speaker, instruction text, and seed recorded with any audio produced.
- Flow logic, state handling, and test selectors unchanged.
