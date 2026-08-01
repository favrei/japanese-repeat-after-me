# Story: office-gig — 土曜日のライブ

Filled authoring template plus the story work for a new conversation story.
Written by the agent from the user's answers; the user never edits field names
or Japanese here.

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Casting: [`voices.json`](voices.json)
Encoded: [`../../app/client/content/office-gig.ts`](../../app/client/content/office-gig.ts)

Status: **media integrated; Step 9 mechanical QA complete.** Situation,
cuts, cards, dialogue, readings, accepted variants, difficulty, separation
Passes A–E, the art & voice brief, and delivery intents are complete. The user
selected `serena` from the casting audition on 2026-08-01. The reproducible
27-line audio batch, `office` art pack, and encoded four-stage story now live
under `app/`. The full app QA suite passed, and the production preview was
checked across all four direct stage entries at 412×915 and 1440×900.

The full human listening pass over the 27 shipped clips and the user's final
visual verdict remain open. Duration, format, voice, seed, instruction, and
hash checks are mechanical evidence, not a substitute for hearing every
pronunciation against the reading.

This folder is the draft and the provenance only — see
[`../README.md`](../README.md).

## Template

| Blank | Value |
| --- | --- |
| Situation | A Friday at the office. The learner and a coworker discover they both like rock; it ends with a plan to go to Saturday's gig together. |
| Learner | Works in a Japanese office. Beginner-to-N4 です・ます. Asks the questions in this story. Never produces keigo. |
| Other party | One coworker, late 20s. Friendly polite — です・ます with 〜んですよ warmth, not service keigo. Wants company for a gig her friend dropped out of. |
| Goal | Walks away holding a time, a place, and a ticket price — not just a nice chat. |
| Length | 4 stages, 23 bubbles, 2 speak bubbles each (8 total), ~1 minute per stage. |
| Level | N4 (requested and verified — see Difficulty below). |

**Note on Step 1.** Step 1's admission test used to fail this outright: its
"the learner has a goal" bullet named "chat about hobbies" as the canonical
rejection. The user rejected that as too narrow, and Step 1 was rewritten on
2026-08-01 to ask what the learner *holds* at the end. This story is the case
that forced it: the topic is social, the outcome is concrete.

## Stage cuts (Step 2)

One stage = one change of the learner's goal state.

- **Stage 1 「気づく」** — the learner notices the coworker's band T-shirt and
  opens the topic; she turns out to play guitar. Ends when they are two music
  people talking, not two coworkers passing. 6 bubbles, 2 speak.
- **Stage 2 「好み」** — they compare taste; she mentions the band is playing
  Saturday. Ends the moment the gig exists as a fact in the room. 6 bubbles,
  2 speak.
- **Stage 3 「行きたい」** — end of the day; she has a spare ticket, the learner
  asks to come, price settled. Ends with the learner going. 6 bubbles, 2 speak.
- **Stage 4 「待ち合わせ」** — time and meeting point fixed. Ends with a plan.
  5 bubbles, 2 speak.

23 bubbles total, 8 speak.

## The cuts (Step 2b)

| Stage | `sceneId` | `castId` | Narrator line |
| --- | --- | --- | --- |
| 1 気づく | `lounge` | `coworker` | 金曜日の昼休み。休憩室で、同僚が音楽を聞いていた。 |
| 2 好み | `lounge-close` | `coworker` | 自動販売機の前に、缶コーヒーが二つ並んだ。 |
| 3 行きたい | `entrance` | `coworker` | 夕方、会社の玄関でまた会った。 |
| 4 待ち合わせ | `entrance-close` | `coworker` | 外は、もう暗くなっていた。 |

**Two plates, four crops.** Following the café's `hall`/`register` and the
taproom's `board`/`counter` pattern, `lounge`/`lounge-close` are two camera
positions on one lounge plate, and `entrance`/`entrance-close` are two on one
entrance plate. Stage 1→2 is a push-in inside one break; stage 2→3 is the story's
only real jump, midday to evening and lounge to entrance.

**The cast never changes.** One coworker across all four stages, so `castId` is
`coworker` throughout. This is the first story whose other party is not staff —
which is why `Speaker`'s `"staff"` value was renamed to `"other"` on
2026-08-01, before any of this was written.

**Narration is skip-safe.** None of the four lines asserts that the learner
spoke, was understood, or got what they asked for. Stage 3's card is the exposed
one: it runs after the learner may have failed out of stage 2, so it says only
that the two met again at the entrance — true whether or not a word was
exchanged earlier. 「音楽の話で盛り上がったあと、」 was drafted and rejected for
exactly that reason.

## Scene facts (shared — not in any card)

Everyone present can use these. They are deliberately kept out of the character
cards so the cards stay a test of what each person separately knows.

- Friday. A company lounge with a vending machine, then the office entrance at
  going-home time.
- The coworker is wearing a band T-shirt and has earphones in when the story
  opens. **Anyone can see this** — it is the only thing the learner may react to
  before she speaks.
- The gig is Saturday evening, at a small live house, 3,000 yen at the door.
- Neither has said anything about their weekend.

## Character cards (Step 3)

### Coworker — late 20s

- **Wants** — someone to come to Saturday's gig; the friend she was going with
  dropped out.
- **Knows** — the band, the venue, the time, the price, and that she has a spare
  ticket; that the learner is a coworker she sees in the lounge.
- **Cannot know** — whether the learner likes rock, is free on Saturday, or has
  ever been to a live house. Their nationality, their Japanese level, their
  budget, or what they did last weekend. Never assumes any of it.
- **Perceives** — the learner is in the lounge, and later at the entrance on
  their way out. Whether they are holding a coffee.
- **Persona** — woman, late 20s; warm mid-range voice, quick and slightly
  bright. Stated here because the art work and the voice casting both read
  apparent gender from this one line — the omission that produced the taproom's
  male-drawing/female-voice mismatch. **Confirmed by the user on 2026-08-01**
  against the alternative of recasting her male, which would have cost nothing:
  none of her lines is gender-marked — no わ, no かしら, only the neutral 私 —
  so gender lives entirely in this line, the art, and the voice.
- **Character — what the persona does to her lines: enthusiastic about music,
  practical about people.** She volunteers what she loves without first checking
  whether anyone is interested — which is why two of her stage 1 lines are
  unprompted self-disclosure. She handles the social side with no ceremony:
  she *states* the spare ticket rather than asking a favour, removes the money
  friction before it exists, and closes cleanly instead of lingering. She is
  never coy about the invitation, because for her it is not a delicate offer.
  **A line of hers that hedges, apologises, or angles is wrong**, even if it
  passes every other check.
- **Voice fingerprint** — です・ます with coworker warmth, not service keigo:
  〜んです、〜んですよ、〜んですけど, and the casual contraction やってる.
  12–20 morae. Offers rather than asking open questions; the one question she
  asks is 「ふだんはどんなの聞くんですか。」
- **Never says** — service keigo (いらっしゃいませ、かしこまりました、
  ございます); any English; any comment on the learner's Japanese; any grammar
  explanation; anything that presumes the learner's plans or tastes.

### Learner — office worker

- **Wants** — to be included: to end the day going to the gig, not having
  politely admired someone's T-shirt.
- **Knows** — that they like rock and the sound of a guitar; basic です・ます;
  that the coworker is listening to something.
- **Cannot know** — the band, the venue, the price, whether tickets remain, or
  whether she wants company. Whether she plays anything, until told.
- **Perceives** — the T-shirt, the earphones, the lounge, the entrance in the
  evening.
- **Persona** — default: unmarked adult, neutral mid-range. The learner is never
  drawn, so no art depends on this; it is stated rather than left blank because
  the learner's autoplay line is cast from it. **Confirmed unmarked by the user
  on 2026-08-01.** None of the learner's eight sentences is gender-marked, so
  any learner says them as themselves.

  The known gap this leaves: the learner's reference clips are voiced by
  `sohee`, which reads female, in all three stories. So the learner is unmarked
  in every text and female in every clip. That is an app-wide casting question
  inherited from the taproom, not something to resolve inside this story.
- **Character — what the persona does to their lines: hesitant to start, direct
  once started.** They open by asking about a thing rather than by asserting an
  opinion, never claim knowledge they do not have, and ask permission instead of
  assuming it. The hesitancy burns off across the four stages, and that arc is
  the point: stage 1 asks about a T-shirt, stage 4 says 楽しみにしています with
  nothing hedging it. **A learner line that asserts an opinion they have no
  standing for, or that knows the band, the venue, or the price before being
  told, is wrong** — this is the same constraint as the knowledge ledger,
  arrived at from the personality side.
- **Voice fingerprint** — plain polite です・ます, 10–20 morae. Opens with あの
  or じゃあ. Asks the questions in this story — five of the eight speak bubbles
  are questions, which is the inversion of the taproom, where the staff asked.
- **Never says** — かしこまりました、恐れ入ります、承知しました; plain form to a
  coworker they do not know well; music jargon beyond バンド・ロック・ギター.

## Dialogue (Step 4)

Speak bubbles are marked **speak**; everything else autoplays.

### Stage 1 — 気づく

| # | Speaker | Japanese | Meaning |
| --- | --- | --- | --- |
| 1 | coworker | あ、おつかれさまです。 | Oh — hi. |
| 2 | learner (autoplay) | おつかれさまです。 | Hi. |
| 3 | learner **speak** | そのTシャツ、何のバンドですか。 | That T-shirt — what band is it? |
| 4 | coworker | 高校のときからずっと好きなバンドなんですよ。 | It's a band I've loved since high school. |
| 5 | learner **speak** | 私もロック、好きなんです。 | I'm into rock too, actually. |
| 6 | coworker | じつは私、ギターをやってるんですよ。 | Actually, I play guitar myself. |

### Stage 2 — 好み

| # | Speaker | Japanese | Meaning |
| --- | --- | --- | --- |
| 1 | coworker | ふだんはどんなの聞くんですか。 | What do you usually listen to? |
| 2 | learner **speak** | ギターの音が好きで、よくロックを聞きます。 | I love the sound of a guitar, so I listen to a lot of rock. |
| 3 | coworker | ギターがいいと、それだけで聞いちゃいますよね。 | When the guitar's good, that alone gets you listening, right? |
| 4 | learner **speak** | じゃあ、おすすめはなんですか。 | So what would you recommend? |
| 5 | coworker | ちょうど土曜日にライブがあるんですよ。 | There's actually a gig this Saturday. |
| 6 | coworker | 小さいライブハウスなんですけど、音がいいんですよ。 | It's a small live house, but the sound's great. |

### Stage 3 — 行きたい

| # | Speaker | Japanese | Meaning |
| --- | --- | --- | --- |
| 1 | coworker | あ、さっきの話なんですけど。 | Oh — about what I was saying earlier. |
| 2 | coworker | じつは、チケットが一枚あまってるんです。 | I've actually got a spare ticket. |
| 3 | learner **speak** | 私も行ってもいいですか。 | Could I come along too? |
| 4 | coworker | ぜひ、一緒に行きましょう。 | Please do — let's go together. |
| 5 | learner **speak** | チケットはいくらですか。 | How much is the ticket? |
| 6 | coworker | 三千円ですけど、当日でいいですよ。 | Three thousand yen — you can pay on the day, though. |

### Stage 4 — 待ち合わせ

| # | Speaker | Japanese | Meaning |
| --- | --- | --- | --- |
| 1 | coworker | 土曜日、六時でいいですか。 | Saturday at six — does that work? |
| 2 | learner **speak** | じゃあ、どこで待ち合わせしますか。 | Where should we meet, then? |
| 3 | coworker | 駅の東口はどうですか。 | How about the east exit of the station? |
| 4 | learner **speak** | 楽しみにしています。 | I'm looking forward to it. |
| 5 | coworker | では、また土曜日に。 | See you Saturday, then. |

### Readings (Step 4 field, validated 2026-08-01)

Validated against the `japanese`, kana by kana, not read off the kanji. All
hiragana, loanwords phonetic with `ー` retained, per the house convention.

| id | reading |
| --- | --- |
| `gig-notice-open` | きんようびのひるやすみ。きゅうけいしつで、どうりょうがおんがくをきいていた。 |
| `gig-notice-hello` | あ、おつかれさまです。 |
| `gig-notice-hello-back` | おつかれさまです。 |
| `gig-notice-shirt` | そのてぃーしゃつ、なんのばんどですか。 |
| `gig-notice-highschool` | こうこうのときからずっとすきなばんどなんですよ。 |
| `gig-notice-rock` | わたしもろっく、すきなんです。 |
| `gig-notice-guitar` | じつはわたし、ぎたーをやってるんですよ。 |
| `gig-taste-open` | じどうはんばいきのまえに、かんこーひーがふたつならんだ。 |
| `gig-taste-ask` | ふだんはどんなのきくんですか。 |
| `gig-taste-why` | ぎたーのおとがすきで、よくろっくをききます。 |
| `gig-taste-agree` | ぎたーがいいと、それだけできいちゃいますよね。 |
| `gig-taste-recommend` | じゃあ、おすすめはなんですか。 |
| `gig-taste-saturday` | ちょうどどようびにらいぶがあるんですよ。 |
| `gig-taste-venue` | ちいさいらいぶはうすなんですけど、おとがいいんですよ。 |
| `gig-join-open` | ゆうがた、かいしゃのげんかんでまたあった。 |
| `gig-join-earlier` | あ、さっきのはなしなんですけど。 |
| `gig-join-spare` | じつは、ちけっとがいちまいあまってるんです。 |
| `gig-join-come` | わたしもいってもいいですか。 |
| `gig-join-together` | ぜひ、いっしょにいきましょう。 |
| `gig-join-price` | ちけっとはいくらですか。 |
| `gig-join-cash` | さんぜんえんですけど、とうじつでいいですよ。 |
| `gig-meet-open` | そとは、もうくらくなっていた。 |
| `gig-meet-six` | どようび、ろくじでいいですか。 |
| `gig-meet-where` | じゃあ、どこでまちあわせしますか。 |
| `gig-meet-east` | えきのひがしぐちはどうですか。 |
| `gig-meet-forward` | たのしみにしています。 |
| `gig-meet-bye` | では、またどようびに。 |

The ones that were checked rather than assumed, because each has a plausible
wrong answer: 三千円 → さんぜんえん (rendaku, not さんせんえん) · 東口 →
ひがしぐち (rendaku, not とうぐち) · 一枚 → いちまい (not ひとまい) · 当日 →
とうじつ (not とうにち) · 高校 → こうこう (both long vowels) · 音 → おと in
both ギターの音 lines, not おん · 二つ → ふたつ · 六時 → ろくじ · Tシャツ →
てぃーしゃつ, a small-ぃ mora at the head of the word.

### Accepted variants (Step 4 field)

Alternate phrasings that must also pass. This is the difficulty valve: more
variants is easier. Widest on `gig-taste-why`, the longest and most fragile
line.

| id | `accepted` |
| --- | --- |
| `gig-notice-shirt` | それ、何のバンドですか / Tシャツ、何のバンドですか / 何のバンドですか / そのTシャツ、何のバンドのですか |
| `gig-notice-rock` | 私もロックが好きです / 私もロックが好きなんです / ロック、好きなんです / 私もロック好きです |
| `gig-taste-why` | ギターの音が好きなので、よくロックを聞きます / ギターの音が好きで、ロックをよく聞きます / ギターの音が好きで、よくロックを聞いています / ギターの音が好きなので、ロックをよく聞きます |
| `gig-taste-recommend` | おすすめはなんですか / じゃあ、おすすめを教えてください / おすすめのバンドはなんですか |
| `gig-join-come` | 行ってもいいですか / 私も行っていいですか / 一緒に行ってもいいですか / 私も行きたいです |
| `gig-join-price` | いくらですか / チケット、いくらですか / チケットはおいくらですか |
| `gig-meet-where` | どこで待ち合わせしますか / 待ち合わせはどこですか / じゃあ、どこで会いますか / どこで待ち合わせますか |
| `gig-meet-forward` | 楽しみです / 楽しみにしてます |

Deliberately **not** accepted: half-sentences of `gig-taste-why` such as
「ギターの音が好きです」 alone. If that bubble turns out to fail routinely, the
fix in the calibration note is to shorten the target sentence itself, not to
accept a version that drops the second clause — a learner who says half the
line should not be told they said it.

### Naturalness pass (2026-08-01)

The first draft passed every gate and still read like a textbook. The cause is
structural, not careless: skip-safety bans the tokens that carry warmth in real
Japanese — そうなんですね、わかります、本当ですか — because each one reacts to
words a Skip can erase. The first draft removed them and replaced them with
nothing, leaving a row of clean standalone declaratives.

The fix was to rebuild the texture out of things that do not depend on the
learner having spoken:

- **Sentence-final particles instead of reactions.** よね on stage 2 bubble 3
  invites agreement without claiming any was given; よ carries her warmth across
  five lines.
- **Standalone but warm.** 「私はいつもギターの音で選びます。」 was a fact
  recited at nobody. 「ギターがいいと、それだけで聞いちゃいますよね。」 is the
  same information said like a person with an opinion — and still means the same
  thing spoken into silence.
- **Contractions and colloquial shape for her only.** 聞いちゃいます、やってる、
  どんなの. She talks like a coworker; the learner never contracts, which is also
  what keeps blind attribution clean.
- **The learner gets 〜んです.** 「私もロックが好きです。」 is textbook;
  「私もロック、好きなんです。」 is what someone actually says, and it matches
  the taproom learner's 「初めてなんです。」
- **Specifics instead of generic nouns.** 何のバンド rather than バンドの;
  高校のときから rather than 好きな; ちょうど土曜日 rather than そのバンド、
  土曜日 — which also fixed a referent problem, since she never names the band.
- **〜て linking instead of 〜ので.** 「ギターの音が好きで、よく…」 is how the
  reason is actually said; ので is the written form. It also cut the longest
  speak bubble from 24 to 20 morae.

Two changes were made purely to stop repetition once the lines loosened up:
stage 4's opener moved from どうですか to でいいですか so it would not echo her
own 駅の東口はどうですか two bubbles later, and her closer moved from じゃあ to
では so it would not collide with the learner's declared じゃあ opener.

### Skip-safety

Verified by a pessimistic run in which every learner bubble is skipped or
failed out. The surviving coworker-only sequence is:

> あ、おつかれさまです。/ 高校のときからずっと好きなバンドなんですよ。/ じつは
> 私、ギターをやってるんですよ。/ ふだんはどんなの聞くんですか。/ ギターがいい
> と、それだけで聞いちゃいますよね。/ ちょうど土曜日にライブがあるんですよ。/
> 小さいライブハウスなんですけど、音がいいんですよ。/ あ、さっきの話なんですけ
> ど。/ じつは、チケットが一枚あまってるんです。/ ぜひ、一緒に行きましょう。/
> 三千円ですけど、当日でいいですよ。/ 土曜日、六時でいいですか。/ 駅の東口はど
> うですか。/ では、また土曜日に。

That reads as a talkative coworker showing off her shirt, asking a question into
silence, mentioning a gig, offering a spare ticket, and settling a meeting with
someone who says nothing. It coheres — the same shape as the taproom's staff
serving a silent customer. Five constructions were rejected to get there:

- 「本当ですか、うれしいな。」 after stage 1's second speak bubble — reacts to
  words that may never have been said.
- 「私もギターの音で選ぶタイプなんですよ。」 in stage 2 — the も points at a
  statement Skip can dismiss. Replaced with the よね line, which invites
  agreement rather than claiming it was given.
- 「じゃあ、六時に駅の東口で。」 as stage 4's third bubble — it echoed the time
  *the learner proposed*, so in a pessimistic run she invents a number out of
  nowhere. Fixed by moving the time into her own opening bubble and leaving the
  learner to ask only about the place.
- 「音楽の話で盛り上がったあと、」 as stage 3's narrator line — asserts a
  conversation that a failed-out run never had.
- 「わかります。」 as an opener on stage 2 bubble 3 — the most natural line in
  the whole scene, and unusable: it is agreement with something unsaid. This is
  the tension the naturalness pass above is about.

## Difficulty verdict (Step 5)

- Requested level: N4
- Learner production: N4
- Listening/comprehension: N4
- Overall: **N4**
- Confidence: high
- Practice load: moderate; longest learner line 20 morae, and katakana in four
  of the eight speak bubbles

### Evidence

- Task/topic: N4 — a familiar workplace conversation with a concrete outcome to
  arrange.
- Language resources: N4 — 〜て linking a reason, 〜てもいいですか for
  permission, explanatory 〜んです, question words with plain polite verbs.
- Discourse: N4 — short explicit turns, one idea per bubble, no extended
  explanation or narrative past tense from the learner.
- Listening: N4 — 〜んです/〜んですけど throughout, one price with a counter,
  one 一枚.
- Interaction: N4 — open a topic, state a preference with a reason, ask
  permission to join, and settle a time and place.

### Boundary check

- No sustained N3 evidence: nothing requires the learner to explain a problem,
  compare alternatives, or hold a turn longer than one sentence.
- 「じつは私、ギターをやってるんですよ。」 and やってる are comprehension-side
  only; the learner never produces a contraction.
- To make this N3, the ticket would have to be a problem to solve — sold out,
  needing a swap — rather than an offer to accept.

### Practice dials

| Dial | Choice |
| --- | --- |
| Morae per speak bubble | 15, 13 / 20, 12 / 13, 11 / 14, 10. Stage 2 carries the peak; stage 4 lands soft on purpose. |
| Speak bubbles | 2 per stage, 8 total. Four stages at two each keeps every stage near a minute. |
| New patterns | One per stage at most: explanatory 〜んです (1), 〜て linking a reason (2), 〜てもいいですか as recall not novelty (3), none new in 4. |
| Recycling | 〜てもいいですか comes straight from the taproom's ここで飲んでもいいですか. ロック and よく聞きます repeat across stages 1→2 in a new slot. じゃあ opens two learner bubbles, matching the card. |
| `accepted` breadth | Widest on stage 2's 24-mora line, the longest and most fragile. |
| Phonetic fragility | Tシャツ・ロック・ギター・ライブ・ライブハウス・チケット are kept as written. The user is fixing recognition separately (2026-08-01) and asked for no defensive rewriting; these are the words the scene actually uses. |

**Calibration:** 私もロック、好きなんです。 should pass first time almost always.
ギターの音が好きで、よくロックを聞きます。 is the one bubble expected to need a
retry; if it routinely fails out, cut it to よくロックを聞きます。 rather than
touching the attempt budget.

**Deliberately omitted:** asking what the band is called. It would add a proper
noun the learner must hear once and reproduce exactly, which is a memory test,
not a speaking test.

## Character separation gate (Step 6b)

Run over the finished lines only — `speaker`, `japanese`, `translation` — with
the drafting notes above out of view. **Verdict: pass**, after one rewrite.

- **Pass A, leak scan.** No line describes its own speaker's role, teaches, or
  narrates the scene's purpose. The four narrator cards were included: none
  hands a character knowledge, and none reports something only a person in the
  room could have observed.
- **Pass B, knowledge ledger.** Every learner line traces to an autoplay bubble
  that always plays: the gig exists (stage 2 bubble 5), a ticket is spare (stage
  3 bubble 2), they are going (stage 3 bubble 4), the time is six (stage 4
  bubble 1). The coworker reacts only to what the room shows.
- **Pass C, blind attribution.** One failure and one fix. 「おすすめはなんですか。」
  landed on either speaker — a coworker could as easily ask the learner for a
  recommendation. Rewritten to 「じゃあ、おすすめはなんですか。」, where じゃあ is
  the learner's declared opener and forces attribution. Everything else splits on
  fingerprint: she carries 〜んです/〜んですよ/〜んですけど and やってる; the
  learner never contracts and never uses よ.
- **Pass D, single-speaker read-through.** The coworker reads as one person
  working toward one thing across all four stages — she wants company and keeps
  making room for it, from the T-shirt to では、土曜日に. The learner reads as
  curiosity hardening into asking to be included. Neither drifts in register.

All four passes were rerun after the Pass C rewrite.

**Rerun after the naturalness pass (2026-08-01).** Rewriting for texture changes
attribution and knowledge for every neighbouring line, so all four passes were
run again over the revised script. Still a pass, and the rewrite strengthened
two of them:

- **Pass C** got easier, not harder. The colloquial shapes are now exclusively
  hers — 聞いちゃいます、やってる、どんなの、〜よね — so the register split no
  longer rests on politeness tier alone, which was doing all the work when both
  speakers used clean です・ます.
- **Pass D** improved on the coworker's read-through: 「私はいつもギターの音で
  選びます。」 had been a fact recited at nobody, a small hole in her agenda. The
  よね line wants a response, which is what she wants for the whole story.
- **Pass B** is unchanged. No new line asserts anything she cannot know:
  高校のときから is her own history, ちょうど土曜日 is the gig she already knew
  about, and 三千円/当日 were hers from the start.
- **Pass A** is unchanged; no line acquired a self-description or an explanation
  of the scene.

### Pass E — persona alignment (new, 2026-08-01)

Added at the user's request after this story's cards were reviewed: a persona
that only casts art and voice is decoration, so the gate now checks it against
the dialogue in **both** directions. Every line must express a declared trait,
and every declared trait must reach at least one line.

**Coworker — enthusiastic about music, practical about people.**

| Line | Trait it expresses |
| --- | --- |
| あ、おつかれさまです。 | no ceremony |
| 高校のときからずっと好きなバンドなんですよ。 | volunteers what she loves, unprompted |
| じつは私、ギターをやってるんですよ。 | same, escalating — she is not gauging interest |
| ふだんはどんなの聞くんですか。 | music is how she meets people |
| ギターがいいと、それだけで聞いちゃいますよね。 | opinionated; assumes a shared standard |
| ちょうど土曜日にライブがあるんですよ。 | practical opportunism, no build-up |
| 小さいライブハウスなんですけど、音がいいんですよ。 | sound over prestige — consistent with picking by guitar |
| あ、さっきの話なんですけど。 | resumes a topic without preamble |
| じつは、チケットが一枚あまってるんです。 | states a fact rather than asking a favour |
| ぜひ、一緒に行きましょう。 | warm and immediate, no hedging |
| 三千円ですけど、当日でいいですよ。 | removes friction before it exists |
| 土曜日、六時でいいですか。 | checks rather than dictates |
| 駅の東口はどうですか。 | concrete, not vague |
| では、また土曜日に。 | closes cleanly, does not linger |

**Learner — hesitant to start, direct once started.**

| Line | Trait it expresses |
| --- | --- |
| おつかれさまです。 | minimal; mirrors rather than initiates |
| そのTシャツ、何のバンドですか。 | opens by asking about a thing, not by asserting |
| 私もロック、好きなんです。 | offers something small about themselves once it feels safe |
| ギターの音が好きで、よくロックを聞きます。 | the warming point — a reason given unprompted |
| じゃあ、おすすめはなんですか。 | defers to expertise; does not pretend to know |
| 私も行ってもいいですか。 | asks permission rather than assuming |
| チケットはいくらですか。 | practical, unembarrassed |
| じゃあ、どこで待ち合わせしますか。 | direct once started — settles a detail |
| 楽しみにしています。 | the payoff: the only unhedged line they say |

**Reverse check — traits with no line.** Every declared trait lands. Two that
were declared and did *not* land were cut from the cards rather than left as
decoration: the coworker was originally "a little self-deprecating about her
own playing", which no line supports, and the learner was "notices details
others miss", which only ever showed up in one bubble and duplicated "opens by
asking about a thing".

**Verdict: pass.** One thing this pass surfaced that no other pass would:
「ぜひ、一緒に行きましょう。」 was 「じゃあ、一緒に行きましょう。」 through the
naturalness rewrite. じゃあ is procedural — it moves the plan along. ぜひ is
warm and slightly insistent, which is the practical-but-not-cold person the card
declares. Passes A–D were indifferent between them.
