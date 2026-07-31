# Story: taproom — 初めての一杯

Filled authoring template plus the story work for a new conversation story.
Written by the agent from the user's answers; the user never edits field names
or Japanese here.

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Brief: [`brief.md`](brief.md) · Encoded: [`stages.ts`](stages.ts)

Status: **implemented in the focused feature worktree** — stage cuts and
dialogue were confirmed by the user on 2026-07-31. Character cards, dialogue,
difficulty, the separation gate, audio, original art, story registration, and
the full application QA gate are complete. The implementation lives on
`feature/story-selection` in
`/Users/peter/workspaces/japanese-repeat-after-me-story-selection`; it has not
been merged into the dirty nested `app/` checkout.

## Template

| Blank | Value |
| --- | --- |
| Situation | A craft-beer taproom, learner's first visit. Tap list on a board; 8–10 beers, none familiar. |
| Learner | Traveller alone. Beginner です・ます. May openly say they don't know. Never produces keigo. |
| Other party | Taproom staff, early 20s. Brisk business-polite. Efficient — offers two concrete options rather than open questions. |
| Goal | Walks out holding a beer they chose from the staff's recommendation, not one they pointed at. |
| Length | 2 stages, ~12 bubbles, 2–3 speak bubbles each. |
| Must-say | 初めてなんです。 / おすすめはどれですか。 |

## Stage cuts (Step 2, confirmed)

One stage = one change of the learner's goal state.

- **Stage 1 「選ぶ」** — enter, staff asks the order, learner admits it is their
  first time and asks for a recommendation, staff names two beers, learner
  orders one by name. Ends the moment the order is placed and the staff turns
  to pour. 7 bubbles, 3 speak.
- **Stage 2 「一杯目」** — the beer is handed over; learner receives it, asks
  when to pay, asks whether they can drink where they are, and is settled.
  Ends with the beer in hand. 6 bubbles, 2 speak, 1 learner autoplay.

13 bubbles total, 5 speak.

## The cuts (Step 2b)

Each stage declares the shot it plays against, the other party, and the one
narrator line that covers the change. Both keys must exist in the taproom art
pack — see [`brief.md`](brief.md).

| Stage | `sceneId` | `castId` | Narrator line |
| --- | --- | --- | --- |
| 1 選ぶ | `board` | `staff` | 夜のタップルーム。ドアを開けると、黒板いっぱいにビールの名前が並んでいた。 |
| 2 一杯目 | `counter` | `staff` | タップからビールが注がれ、白い泡が静かに立ち上がった。 |

**The shot changes, the cast does not.** One person serves throughout, so
`castId` is `staff` in both. Following the café's `hall`/`register` pattern,
the two scene keys are two *camera positions*, not necessarily two images:
`board` is the wide shot that takes in the tap wall and the board; `counter`
is tighter, on the spot where the glass is set down.

**Narration must be skip-safe too.** This is the same constraint the dialogue
carries, and it bites harder here because the card runs *between* stages, after
the learner may have failed out of the order. The obvious stage-2 line —
「注文を伝えると、店員はタップの前へ歩いていった。」 ("when you gave your
order…") — asserts the learner successfully spoke, and is a lie in a
pessimistic run. The line that ships describes only the pour, which happens
either way.

Both lines were checked against the Step 2b narrator rules: neither greets or
answers anyone, neither states what a character knows or intends, neither
mentions attempts or skipping, and neither summarises the dialogue that
follows. Stage 1 opens the story from the cover, matching the café's shape of
a scene fragment plus one sentence.

## Scene facts (shared — not in any card)

Everyone present can use these. They are deliberately kept out of the character
cards so the cards stay a test of what each person separately knows.

- Evening. A standing craft-beer taproom; a counter, a tap wall, no table
  service.
- A board lists roughly ten beers. Two of them are today's recommendations.
- The shop settles the bill at the end, not per drink.
- The learner is visibly hesitating in front of the board. **Anyone can see
  this** — it is the only thing the staff may react to before the learner
  speaks.

## Character cards (Step 3)

### Staff — taproom, early 20s

- **Wants** — serve this customer correctly and quickly, and keep the counter
  moving.
- **Knows** — today's tap list and what each beer tastes like; that the shop
  bills at the end; that the counter is where people stand.
- **Cannot know** — that this is the customer's first visit, until told. Their
  nationality, name, language ability, budget, taste, or whether they have read
  the board. Never assumes any of it.
- **Perceives** — a customer standing at the counter, looking at the board,
  hesitating. Whether they are holding a glass.
- **Persona** — young man, early 20s; light mid-range voice, even and
  unhurried. Added on 2026-07-31 after the drawn staff (male) and the cast
  voice (`Ono_Anna`, female) disagreed. Both the art pack and the voice casting
  now read apparent gender from this line.
- **Voice fingerprint** — です・ます plus shop-standard set phrases
  (いらっしゃいませ、お待たせしました、ございます). 8–18 morae. Habitual
  closer: ごゆっくりどうぞ. Asks the questions; offers two concrete options
  rather than an open one.
- **Never says** — plain form to a customer; any English; any comment on the
  customer's Japanese; any grammar explanation; anything that presumes the
  customer is a tourist or a first-timer.

### Learner — traveller, alone

- **Wants** — end up with a beer they actually like, without pretending to
  understand.
- **Knows** — that they want a beer; basic です・ます; that they cannot read
  the board.
- **Cannot know** — what any beer on the board tastes like; the shop's payment
  system; whether standing there is allowed; the staff's name.
- **Perceives** — the board, the tap wall, the staff, the glasses other people
  are holding.
- **Persona** — default: unmarked adult, neutral mid-range. The learner is
  never drawn, so no art depends on this; it is stated rather than left blank
  because the learner's one autoplay line is cast from it (`sohee`).
- **Voice fingerprint** — short です・ます, 9–16 morae. Opens hesitantly with
  あの or じゃあ. Closes requests with お願いします. Asks few questions, but the
  ones that matter.
- **Never says** — かしこまりました、よろしいでしょうか、恐れ入ります、
  承知しました; beer jargon (IPA、ホップ、アロマ); long self-explanations.

## Dialogue (Step 4)

Encoded shape and `accepted` variants live in [`stages.ts`](stages.ts). Speak
bubbles are marked **speak**; everything else autoplays.

### Stage 1 — 選ぶ

| # | Speaker | Japanese | Meaning |
| --- | --- | --- | --- |
| 1 | staff | いらっしゃいませ。ご注文はお決まりですか。 | Welcome. Have you decided? |
| 2 | learner **speak** | あの、初めてなんです。 | Um — it's my first time here. |
| 3 | staff | ごゆっくりどうぞ。本日のビールはこちらのボードにございます。 | Take your time. Today's beers are on the board here. |
| 4 | learner **speak** | おすすめはどれですか。 | Which one do you recommend? |
| 5 | staff | おすすめは、ペールエールと黒ビールです。 | The recommendations are the pale ale and the dark beer. |
| 6 | staff | ペールエールは苦みが少なくて、飲みやすいですよ。 | The pale ale isn't very bitter — it's easy to drink. |
| 7 | learner **speak** | じゃあ、ペールエールをお願いします。 | I'll have the pale ale, then. |

### Stage 2 — 一杯目

| # | Speaker | Japanese | Meaning |
| --- | --- | --- | --- |
| 1 | staff | お待たせしました。こちらどうぞ。 | Thanks for waiting — here you are. |
| 2 | learner (autoplay) | ありがとうございます。 | Thank you. |
| 3 | learner **speak** | お会計は今ですか。 | Do I pay now? |
| 4 | staff | お会計は最後にまとめてお願いします。 | You can settle up all together at the end. |
| 5 | learner **speak** | ここで飲んでもいいですか。 | Is it all right to drink here? |
| 6 | staff | そちらのカウンターをご自由にお使いください。ごゆっくりどうぞ。 | Feel free to use the counter over there. Enjoy. |

### Skip-safety

Verified by a pessimistic run in which every learner bubble is skipped or
failed out. The surviving staff-only sequence is:

> いらっしゃいませ。ご注文はお決まりですか。/ ごゆっくりどうぞ。本日のビールは
> こちらのボードにございます。/ おすすめは、ペールエールと黒ビールです。/
> ペールエールは苦みが少なくて、飲みやすいですよ。/ お待たせしました。こちら
> どうぞ。/ お会計は最後にまとめてお願いします。/ そちらのカウンターをご自由に
> お使いください。ごゆっくりどうぞ。

That reads as a staff member serving a silent customer who is staring at the
board. It coheres. Three constructions were rejected to get there:

- 「初めての方には〜」 after bubble 2 — presumes knowledge the staff only has
  if the learner succeeded, and breaks the knowledge ledger too.
- 「そうなんですね」 as an acknowledgement of bubble 2 — dangles when skipped.
  Replaced with ごゆっくりどうぞ, which reacts to the *visible* hesitation
  instead of to the words.
- 「お待たせしました。ペールエールです。」 in stage 2 — names the beer the
  learner chose, so it depends on a successful bubble 7. Replaced with
  こちらどうぞ.

## Difficulty (Step 5)

| Dial | Choice |
| --- | --- |
| Morae per speak bubble | 11, 10, 16 / 9, 12. Stage 1 opens at 11 and peaks at its closer. |
| Speak bubbles | 3 in stage 1, 2 in stage 2 — the harder stage first, resolution second. |
| New patterns | Exactly one per stage: どれ as a question word (stage 1), 〜てもいいですか (stage 2). 〜なんです is taught as a fixed set phrase, not a productive pattern. |
| Recycling | From the café story: 〜はどこですか → おすすめはどれですか, and 〜をお願いします reappears in both a learner bubble and a staff bubble. |
| `accepted` breadth | Widest on bubble 7, the longest and most fragile line. |
| Phonetic fragility | ペールエール is the deliberate cost: six morae with two long vowels. Bought with five `accepted` variants and by putting 黒ビール — a native-word alternative — in the same staff line. |

**Calibration:** あの、初めてなんです。 should pass on the first attempt almost
always. じゃあ、ペールエールをお願いします。 is the one bubble expected to need
a retry; if it routinely fails out, shorten it to ペールエールをお願いします。
rather than touching the attempt budget.

**Deliberately omitted:** the size question (ハーフ / パイント). It would make a
fourth speak bubble in stage 1, which the flow calls a drill. It is the natural
content for a third stage if this story is ever extended.

## Character separation gate (Step 6b) — **PASS**

Run as a separate pass over speaker, Japanese, reading, and translation only.

1. **Leak scan** — clean. No line states its speaker's role as a reason for
   speaking, explains the scene, or teaches. The pedagogy sits in which
   sentences were chosen and in the `translation` field.
2. **Knowledge ledger** — clean after the three rejections listed under
   skip-safety. The staff never references the learner's first visit,
   nationality, or ability. The learner never displays knowledge of the
   payment system or of what the beers taste like — they ask.
3. **Blind attribution** — 12 of 13 lines attribute correctly with speaker
   labels stripped. **One ambiguity:** ありがとうございます。 could belong to
   either speaker. Accepted rather than fixed: it is a learner autoplay free
   ride, and a bare thanks being speaker-neutral is realistic, not a merged
   mind. Recorded here so the next reviewer does not rediscover it as new.
4. **Single-speaker read-through** — both hold. The staff reads as one brisk
   professional; ごゆっくりどうぞ recurring in bubbles 3 and 13 is the habitual
   closer from their card, kept on purpose. The learner reads as one hesitant
   beginner and never rises above their register.

## Delivery status

**Audio is regenerated and pending a listening pass.** Ten clips in `audio/`,
verified against `audio/generation-log.json` by SHA-256. Three distinct voices:
staff `dylan`, learner `sohee`, narrator `aiden`.

The seven staff clips were regenerated on 2026-07-31 when the staff was recast
from `Ono_Anna` (female) to `dylan` (male) to match the drawn character — see
[`brief.md`](brief.md) for the recast and its root cause. The learner and
narrator clips are untouched and keep their earlier acceptance. **The seven new
staff clips have not yet passed a listening pass**, so this story no longer
clears the listening gate outright.

**Art is done.** The registered `taproom` pack contains a cover, landscape and
portrait scene art, and neutral/positive/concerned staff states. The `board`
and `counter` shots share the scene source with separate framing, as allowed by
the brief.

**Registration is done.** The app now has a story registry and a stage library
that keeps the café story while adding both taproom stages. A directly selected
second stage begins at its own narrated transition and runs only the remainder
of that story.

**Step 9 validation is done.** `npm run qa` passed on 2026-07-31: both art
packs validated, typecheck and lint passed, the production build completed,
and all 21 tests passed. Desktop and phone browser passes covered the library,
taproom Stage 1, direct Stage 2 entry, and the completion screen.
