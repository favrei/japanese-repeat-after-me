# Art & voice brief — office-gig 土曜日のライブ

Requirements only. No art is chosen or produced here. Derived from the
character cards in [`story.md`](story.md) — appearance is inferred from the
persona, never restated from styling.

Design system: [`../../.agents/documents/art-system.md`](../../.agents/documents/art-system.md)

## Required pack keys (schemaVersion 2)

The pack must declare exactly these names, because the stages reference them:

- `scenes.lounge` — wide shot of the company lounge, vending machine in frame.
- `scenes.lounge-close` — tighter shot on the two standing there.
- `scenes.entrance` — the office entrance at going-home time.
- `scenes.entrance-close` — tighter, on the pair about to part.
- `characters.coworker` — label 同僚, the one other party in all four stages.

Following the café and taproom packs, each pair is two crops of a **single**
landscape/portrait plate, differing only in `focus` and `scale`. Two plates
total, four scene keys. This is the cheapest route and the right one here: each
pair is the same room minutes apart.

## Scene backgrounds

### `lounge` / `lounge-close`

- A company lounge or break area, midday, indoors. A vending machine, a counter
  or a small table, the kind of room with nothing chosen about it. Camera at
  standing height, medium distance for `lounge`; `lounge-close` pushes in on
  the space between two standing figures.
- Mood: ordinary, mildly bright. The pleasure of an unremarkable break. Nothing
  romantic — this is two colleagues finding out they like the same thing.
- Palette anchor: the approved system unchanged — newsprint paper, black and
  neutral ink. The canonical pack contract reserves deep red for UI state, so
  make the band T-shirt the darkest, highest-contrast story element instead.
  It is what the learner's first sentence points at and must remain the first
  thing the eye finds.
- Safe overlay zones: balloons occupy the upper two thirds; controls the lower
  strip. Keep the vending machine and any figure clear of both.
- Constraint: full-bleed. Lettering is optional here and should stay incidental
  — a vending-machine panel, a notice on a wall. Nothing the learner must read.

### `entrance` / `entrance-close`

- The same building's entrance or lobby, early evening, seen from inside
  looking toward the glass. Dark outside, interior light. Camera at standing
  height; `entrance-close` tightens on the pair.
- Mood: end of the week, coats on, the loosening that happens at the door.
- Continuity: same building, same day, hours later. The light is the only thing
  that should say so — the narrator's card carries the rest.
- Palette anchor: as above. Keep the T-shirt as the darkest visual anchor if it
  remains visible under a jacket; otherwise use one strong neutral-ink value
  near her so the eye still tracks the same person.
- Safe overlay zones: as above. Keep the glass doors out of the balloon band —
  a bright rectangle behind text is the worst case for readability.
- Constraint: full-bleed.

## Other-party character — the coworker

- **Persona (from the Step 3 card): woman, late 20s; warm mid-range voice,
  quick and slightly bright.** This line is the single source both the art work
  and the voice casting read. Stating it is not optional — the taproom shipped a
  male drawing with a female voice precisely because this field was missing.
- **Character (from the Step 3 card): enthusiastic about music, practical about
  people.** Her dialogue is built from these two traits, and so is her
  appearance. Every visual requirement below names the trait it serves; a
  drawing that satisfies the clothing list while contradicting the traits has
  failed, because the learner will hear one person and see another.

| Trait | What it looks like |
| --- | --- |
| Enthusiastic about music | The band T-shirt is worn *deliberately* — it is the thing she chose that morning, not a coincidence. It is the darkest, highest-contrast story element and the first thing the eye lands on, because it is what the learner's first sentence points at. |
| Enthusiastic about music | Hands and forearms read as someone who plays: short nails, no rings that would foul strings. Small, not a costume. Do **not** draw a guitar, a pick, or a strap anywhere — she says she plays; showing it makes the line redundant. |
| Practical about people | Dressed for the day, not for being looked at: the tee under an open shirt or cardigan, ID lanyard, comfortable shoes. Nothing styled, nothing corporate. |
| Practical about people | Posture is square and easy — standing on both feet, weight even, no coy angle, no over-the-shoulder look. She is talking to a colleague. |
| Practical about people | In the entrance scenes: jacket on, bag already over the shoulder. She is genuinely leaving, and the invitation happens on the way out rather than being staged. |

- Expression range needed: relaxed neutral in the lounge; a small pleased look
  when she mentions playing guitar — the *enthusiastic* trait's one visible
  moment; and a plainer, matter-of-fact face when she offers the spare ticket —
  the *practical* trait's, and the one most likely to be drawn wrong. She is
  inviting a colleague, not making a move, and if the drawing hesitates or
  angles there, it contradicts a card that says she never does.
- Register projected: friendly polite. Read as a coworker you like, not as
  service staff. The café and taproom characters are both being paid to talk to
  the learner; she is not, and that difference should be visible in how little
  she performs.
- Appears in all four scenes, and must read as standing in each.
- Constraint: adult seinen proportions, no chibi.

**The learner is never drawn**, so their persona constrains no art here. It is
still declared in the Step 3 card, because the reference clips are cast from it.

## Cover art

- One image summarising the situation in the same register: the T-shirt, the
  lounge, two people mid-conversation. The shirt remains the darkest anchor.

## Voice

Nine presets exist — `serena`, `vivian`, `uncle_fu`, `ryan`, `aiden`,
`ono_anna`, `sohee`, `eric`, `dylan`. `ryan` produced garbage on Japanese and
`eric` is dialect-locked; `dylan` is Beijing-locked but was accepted by ear for
the taproom, which is the standing lesson that **preset labels are a hint, not
a limit.**

- **Coworker — `serena`, selected by the user after the `serena`/`vivian`
  audition on 2026-08-01.** Persona first: a woman in her
  late 20s, warm, quick, slightly bright. `ono_anna` fits the persona but
  already voices the café staff, and this character must not sound like the
  waitress from another story. The audition used 「じつは私、ギターをやってる
  んですよ。」 and 「ギターがいいと、それだけで聞いちゃいますよね。」 — the two
  lines carrying her contractions, where a stiff read shows.
- **The distinctness risk in this story is coworker vs learner, not
  coworker vs narrator.** The learner is `sohee`, also read as female. Judge the
  two together on adjacent lines before accepting, not clip by clip — clip-by-
  clip listening is exactly what missed the taproom mismatch.
- **Learner — `sohee`**, the persona already shipped on the taproom's learner
  lines. Consistent across stories: the learner is the same person everywhere.
- **Narrator — `aiden`**, as in the café and the taproom. One storyteller across
  the whole app, distinct from every character.
- Voice fingerprints to preserve from the Step 3 cards: she contracts
  (やってる、聞いちゃいます、どんなの) and ends on よ/よね; the learner never
  contracts and never uses よ. If the synthesis flattens that difference, the
  gate's Pass C protection is lost in audio even though it holds in text.
- Words the synthesiser is likely to mispronounce: see the risky list below.

**`speed` does not work.** It is accepted per line, forwarded, and then ignored
by the CustomVoice path in `mlx_audio`. Do not use it to slow the learner's
shadowing clips; `instruct` is the only working delivery lever, and its effect
is real but modest (~2–5% on tempo).

## Speech-delivery intent (Step 7b)

Plain-words intent, not prompt wording. This is the **first story to ship
`instruct` direction** — the mechanism was built and accepted by ear on
2026-08-01, and this manifest now carries it. Expect tone, not drama.

Section-level direction is set in [`voices.json`](voices.json), one per
speaker; per-line direction overrides it only where the line needs something
the section cannot give.

| Bubble | Delivery |
| --- | --- |
| `gig-notice-open` | Narration. Unhurried scene-setting, no warmth. |
| `gig-notice-hello` | A greeting on noticing someone — brief, not performed. |
| `gig-notice-hello-back` | Learner. Even and plain; this one is a free ride, so it models the register. |
| `gig-notice-highschool` | Fond, slightly amused at herself. The warmest line in stage 1. |
| `gig-notice-guitar` | A small confession she is pleased to make; じつは carries it. |
| `gig-taste-open` | Narration. Quiet, marking that the break has settled. |
| `gig-taste-ask` | Genuine curiosity, casual — ふだん should sound offhand. |
| `gig-taste-agree` | Opinionated and companionable; the よね reaches for agreement. |
| `gig-taste-saturday` | The hinge of the story. Offhand, as if it just occurred to her. |
| `gig-taste-venue` | Fondly qualifying — small place, good sound. |
| `gig-join-open` | Narration. Marks the jump to evening; flatter than the others. |
| `gig-join-earlier` | Catching someone on the way out. Slight rise on けど. |
| `gig-join-spare` | Matter-of-fact, not pleading. She is offering, not asking a favour. |
| `gig-join-together` | Warm and immediate. ぜひ is the whole line. |
| `gig-join-cash` | Practical, reassuring on the second half. |
| `gig-meet-open` | Narration. The quietest of the four. |
| `gig-meet-six` | Checking, not proposing — a small rise at the end. |
| `gig-meet-east` | Easy suggestion, no emphasis. |
| `gig-meet-bye` | Closing beat, lighter and shorter than everything before it. |

**Learner speak-bubble models** — `gig-notice-shirt`, `gig-notice-rock`,
`gig-taste-why`, `gig-taste-recommend`, `gig-join-come`, `gig-join-price`,
`gig-meet-where`, `gig-meet-forward`. Each is generated on demand for a learner
who taps to hear the line, so all eight need an even, clearly spaced reading —
the learner imitates these directly. Per-line intent is in `voices.json`.

**Risky pronunciations** — check every one by ear against the `reading` field,
never against the kanji:

- Tシャツ — てぃーしゃつ. A small-ぃ mora at the head of a word; the most likely
  clip in the story to come out wrong.
- ライブハウス — らいぶはうす, four morae of loanword with no pause.
- 高校 — こうこう, not たかこう. Both long vowels must survive.
- 一枚 — いちまい, not ひとまい.
- 三千円 — さんぜんえん, with rendaku. さんせんえん is the failure to listen for.
- 当日 — とうじつ, not とうにち.
- 東口 — ひがしぐち, not とうぐち. Rendaku again, and the more likely error.
- 音 — おと, not おん, in both 「ギターの音」 lines.
- 六時 — ろくじ.
