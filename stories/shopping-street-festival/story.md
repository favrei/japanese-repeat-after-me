# Story: shopping-street-festival — 商店街の夏祭り

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** All authoring
gates pass. This is the first shortlisted story where the learner temporarily
speaks from the service side of a public interaction.

## Situation

The learner volunteers at a shopping-street summer festival. They learn the
ring-toss stall workflow, restock prizes, explain the game to a visitor, and
help close the stall safely when rain begins.

What changes: **a first-time volunteer becomes able to run one simple public
station and close it with the team.**

| Field | Decision |
| --- | --- |
| Learner | Adult neighborhood volunteer, N4 plain-polite Japanese; earnest and organized. |
| Other parties | Stall leader; adult visitor. |
| Length | 4 stages, 22 bubbles, 10 learner `speak` bubbles. |
| Working level | N4. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 役割 | Unassigned newcomer → job, materials, and handover time known | `festival-stall-open` | `stall-leader` | 夕方、商店街の通りに祭りの提灯が並んでいた。 |
| 2 補充 | Prize supply running low → warehouse route and quantity settled | `festival-stall-shelf` | `stall-leader` | 景品の棚に、空いた場所が増えていた。 |
| 3 受付 | Knows workflow → independently explains price, throwing line, and prize pickup | `festival-stall-customer` | `festival-visitor` | 通りが暗くなるころ、輪投げの前に新しい列ができた。 |
| 4 片づけ | Stall operating in rain → paper goods protected and cleanup route assigned | `festival-stall-rain` | `stall-leader` | 夜、提灯の下に細い雨が落ち始めた。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | ゆうがた、しょうてんがいのとおりにまつりのちょうちんがならんでいた。 | In the evening, festival lanterns lined the shopping street. |
| 2 | けいひんのたなに、あいたばしょがふえていた。 | Empty spaces had spread across the prize shelf. |
| 3 | とおりがくらくなるころ、わなげのまえにあたらしいれつができた。 | As the street grew dark, a new line formed at the ring-toss stall. |
| 4 | よる、ちょうちんのしたにほそいあめがおちはじめた。 | At night, fine rain began falling beneath the lanterns. |

## Scene facts

- The stall has a visible payment box, prize shelf, throwing line, exit desk,
  and posted price of 300 yen per round.
- Small prizes are down to twenty; the shopping-street warehouse is visible at
  the far end and two boxes are sufficient.
- The visitor is an adult standing with one visible child; only the adult speaks.
- Rain begins lightly. Paper prizes, wet cardboard, rubbish bags, and warehouse
  route are visible; no emergency is implied.

## Character cards

### Stall leader

- **Wants:** make a new volunteer useful quickly, keep supplies moving, and
  close the paper-heavy stall before rain damages it.
- **Knows:** role, price, materials, change time, stock, warehouse, and closing
  sequence.
- **Cannot know:** learner's experience or preferred task before asking; no
  assumptions about language level.
- **Perceives:** all stall equipment, shelf, rain, and cleanup materials.
- **Persona:** man, early 50s; strong warm mid-low voice, brisk and audible.
- **Character:** community-practical and momentum-driven. He assigns one clear
  action, then moves on; bossiness, sentimental volunteering speeches, or panic
  about rain are wrong.
- **Voice fingerprint:** plain-polite です・ます; concrete counts and locations;
  no keigo performance; he initiates every operational stage.
- **Never says:** “because you are new/foreign,” vague encouragement, or
  criticism of a skipped learner response.

### Festival visitor

- **Wants:** understand how the game works before joining the line with the child.
- **Knows:** only what the signs and visible stall show.
- **Cannot know:** price interpretation, throwing boundary, or prize pickup
  process without asking.
- **Perceives:** price board, rings, line, prizes, child, and exit desk.
- **Persona:** woman, mid-30s; bright neutral mid-range voice, conversational.
- **Character:** task-focused and unembarrassed about asking. She asks exactly
  the rule needed next; small talk, praise, or testing the learner is wrong.
- **Voice fingerprint:** polite questions ending できますか/どこから/どこで;
  short rising turns; all questions, no procedural assertions.
- **Never says:** assumes an answer, addresses the learner as a language student,
  or speaks for the child beyond the visible wish to play.

### Learner

- **Wants:** perform the assigned role accurately, get missing supplies, serve a
  visitor, and close cleanly.
- **Knows:** only what the leader has shown and what is visible at the stall.
- **Cannot know:** workflow, change time, stock need, or visitor questions before
  each scene.
- **Perceives:** all referenced props and weather.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** earnest and organized. They turn uncertainty into a task
  question, then give short public instructions; overfriendly patter, guessing,
  or staff keigo is wrong.
- **Voice fingerprint:** plain です・ます; 何時/何箱/どこ, ～ましょうか,
  instructions with ～てください, and simple cleanup commitments.
- **Never says:** いらっしゃいませ theatrically, apologizes for being new, or
  improvises prices and prizes.

## Dialogue

### Stage 1 — 役割

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `festival-role-assignment` | O/A | 今日は、輪投げの受付をお願いします。 | きょうは、わなげのうけつけをおねがいします。 | Please handle the ring-toss desk today. |
| `festival-role-flow` | L/S | 初めてなので、仕事の流れを教えてください。 | はじめてなので、しごとのながれをおしえてください。 | It's my first time, so please explain the workflow. |
| `festival-role-table` | O/A | 料金箱と景品は、この机にあります。 | りょうきんばことけいひんは、このつくえにあります。 | The payment box and prizes are on this table. |
| `festival-role-change` | L/S | 何時に交代しますか。 | なんじにこうたいしますか。 | What time do I switch with someone? |
| `festival-role-six` | O/A | 六時に次の人と交代します。 | ろくじにつぎのひととこうたいします。 | You'll switch with the next person at six. |

### Stage 2 — 補充

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `festival-stock-twenty` | O/A | 小さい景品が、あと二十個です。 | ちいさいけいひんが、あとにじゅっこです。 | There are twenty small prizes left. |
| `festival-stock-fetch` | L/S | 倉庫から持ってきましょうか。 | そうこからもってきましょうか。 | Shall I bring more from the warehouse? |
| `festival-stock-warehouse` | O/A | 倉庫は、通りの奥にあります。 | そうこは、とおりのおくにあります。 | The warehouse is at the far end of the street. |
| `festival-stock-how-many` | L/S | 何箱必要ですか。 | なんはこひつようですか。 | How many boxes do we need? |
| `festival-stock-two-boxes` | O/A | 二箱あれば足ります。 | ふたはこあればたります。 | Two boxes will be enough. |

### Stage 3 — 受付

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `festival-customer-open` | O/A | このゲームは、まだできますか。 | このげーむは、まだできますか。 | Is this game still open? |
| `festival-customer-price` | L/S | はい、一回三百円です。 | はい、いっかいさんびゃくえんです。 | Yes, it's 300 yen per round. |
| `festival-customer-where-throw` | O/A | 輪は、どこから投げますか。 | わは、どこからなげますか。 | Where do we throw the rings from? |
| `festival-customer-line` | L/S | この線の後ろから投げてください。 | このせんのうしろからなげてください。 | Please throw from behind this line. |
| `festival-customer-where-prize` | O/A | 景品は、どこで受け取りますか。 | けいひんは、どこでうけとりますか。 | Where do we collect the prize? |
| `festival-customer-exit` | L/S | 出口の係の人から受け取ってください。 | でぐちのかかりのひとからうけとってください。 | Please collect it from the attendant at the exit. |

### Stage 4 — 片づけ

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `festival-clean-close` | O/A | 雨が強くなる前に、屋台を閉めます。 | あめがつよくなるまえに、やたいをしめます。 | We'll close the stall before the rain gets heavier. |
| `festival-clean-what` | L/S | 私は何を片づければいいですか。 | わたしはなにをかたづければいいですか。 | What should I put away? |
| `festival-clean-paper` | O/A | 紙の景品を、奥の箱に入れてください。 | かみのけいひんを、おくのはこにいれてください。 | Put the paper prizes in the box at the back. |
| `festival-clean-cardboard` | L/S | 濡れた段ボールは別にします。 | ぬれただんぼーるはべつにします。 | I'll separate the wet cardboard. |
| `festival-clean-bags` | O/A | ごみ袋は、商店街の倉庫にあります。 | ごみぶくろは、しょうてんがいのそうこにあります。 | The rubbish bags are in the shopping-street warehouse. |
| `festival-clean-carry` | L/S | 片づけが終わったら、倉庫まで運びます。 | かたづけがおわったら、そうこまではこびます。 | When cleanup is finished, I'll carry everything to the warehouse. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `festival-role-flow` | 初めてなので、やり方を教えてください / 仕事の順番を教えてください |
| `festival-role-change` | 交代は何時ですか / 何時まで受付をしますか |
| `festival-stock-fetch` | 倉庫から持ってきますか / 景品を取りに行きましょうか |
| `festival-stock-how-many` | 何箱持ってきますか / 箱はいくつ必要ですか |
| `festival-customer-price` | 一回三百円です / 三百円で一回できます |
| `festival-customer-line` | 線の後ろから投げてください / ここから投げてください |
| `festival-customer-exit` | 景品は出口で受け取ってください / 出口の人からもらってください |
| `festival-clean-what` | 何を片づけますか / 私は何をすればいいですか |
| `festival-clean-cardboard` | 濡れた箱は別にします / 段ボールを分けます |
| `festival-clean-carry` | 終わったら倉庫へ運びます / あとで倉庫まで持っていきます |

## Review

### Reading and naturalness

Checked: 商店街 しょうてんがい; 提灯 ちょうちん; 輪投げ わなげ; 受付
うけつけ; 料金箱 りょうきんばこ; 景品 けいひん; 二十個 にじゅっこ;
倉庫 そうこ; 何箱 なんはこ; 二箱 ふたはこ; 一回三百円
いっかいさんびゃくえん; 係 かかり; 片づけ かたづけ; 濡れた ぬれた;
段ボール だんぼーる; ごみ袋 ごみぶくろ.

The leader speaks only operations; visitor asks three clean questions; learner
shifts from trainee questions to confident service instructions without
becoming a scripted shop clerk.

### Pessimistic all-skip run

> 今日は、輪投げの受付をお願いします。／料金箱と景品は、この机にあります。／
> 六時に次の人と交代します。／小さい景品が、あと二十個です。／倉庫は、通りの
> 奥にあります。／二箱あれば足ります。／このゲームは、まだできますか。／輪は、
> どこから投げますか。／景品は、どこで受け取りますか。／雨が強くなる前に、屋台
> を閉めます。／紙の景品を、奥の箱に入れてください。／ごみ袋は、商店街の倉庫に
> あります。

Leader facts come from visible operations; visitor questions remain plausible
even unanswered. No one claims the learner performed a task.

## Difficulty verdict

- Requested level: N4
- Learner production: N4
- Listening/comprehension: N4
- Overall: **N4**
- Confidence: high
- Practice load: moderate; counters and the shift into public instruction

The story sustains concrete assignments, counts, locations, simple conditions,
and service instructions. ～れば in two targets is common N4/N3-border language
but does not sustain an N3 burden.

## Character separation gate

- **A: pass.** No volunteering speech or cultural explanation leaks in.
- **B: pass.** Every operational fact, visitor question, and weather action is
  supported by visible stall state.
- **C: pass.** Leader owns assignments/counts, visitor owns rising rule
  questions, learner owns clarification then instructions.
- **D: pass.** Leader drives momentum, visitor stays task-focused, learner grows
  operationally without personality drift.
- **E: pass.** Every declared trait reaches dialogue; no bossiness, praise,
  small talk, or improvised rule appears.

Verdict: **pass, all five passes.**
