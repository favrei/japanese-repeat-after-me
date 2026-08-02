# Story: missed-last-train — 終電を逃した夜

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** Situation, cuts,
cards, dialogue, readings, accepted variants, difficulty, naturalness,
all-skip coherence, character-separation Passes A–E, and the art/voice brief
are complete. Voice presets in `voices.json` are audition candidates, not
approved casts. No application code, art, or audio has been produced.

## Situation (Step 1)

Late on a Friday night, the learner reaches a city station just after the last
train. They confirm the service has ended, take a taxi toward their
neighborhood, help the driver identify the exact stopping place, pay, and
arrive safely.

What the learner holds at the end that they did not hold at the start: **a safe
ride home, completed without pretending to understand the route or payment
details.**

| Field | Decision |
| --- | --- |
| Learner | Adult resident, N4 plain-polite Japanese; tired but methodical. |
| Other parties | A station attendant, then one taxi driver through the rest of the story. |
| Length | 4 stages, 20 dialogue bubbles, 8 learner `speak` bubbles. |
| Working level | N4 production / N3 listening stretch. |

The situation is immediately reusable, has a concrete outcome, gives both
other parties narrow role-driven replies, and closes in four physical beats.

## Stage cuts (Steps 2 and 2b)

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 終電 | Uncertain service → knows the last train has gone and where the taxi rank is | `empty-platform` | `station-attendant` | 金曜日の深夜、駅のホームから人影が消えていた。 |
| 2 行き先 | No accepted ride → driver has the destination and the learner has a time estimate | `taxi-rank` | `taxi-driver` | 駅前のタクシー乗り場に、空車が一台止まった。 |
| 3 道案内 | Broad destination → exact turn and stopping building are shared | `taxi-interior` | `taxi-driver` | タクシーは、夜の大通りを住宅街へ向かって走っていた。 |
| 4 到着 | Approaching destination → fare settled and learner safely outside | `destination-corner` | `taxi-driver` | 窓の外に、交差点のコンビニが見えてきた。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | きんようびのしんや、えきのほーむからひとかげがきえていた。 | Late Friday night, the station platform had emptied. |
| 2 | えきまえのたくしーのりばに、くうしゃがいちだいとまった。 | An available taxi pulled up at the rank outside the station. |
| 3 | たくしーは、よるのおおどおりをじゅうたくがいへむかってはしっていた。 | The taxi travelled along the avenue toward a residential neighborhood. |
| 4 | まどのそとに、こうさてんのこんびにがみえてきた。 | The convenience store at the intersection came into view. |

Every transition describes visible state only. The destination pin described
below lets the driver depart even in an all-skip run; no card asserts that a
learner line succeeded.

## Scene facts

- It is late Friday night; the platform is empty and the departure display has
  stopped changing.
- The station attendant knows the service status, first-train time, exits, and
  taxi-rank location.
- At the taxi rank, the learner holds a phone with a fictional destination pin
  open. The driver can see it before the taxi moves.
- The pin is near fictional 桜町駅, in a residential area with two apartment
  buildings and a convenience store at the final intersection.
- The taxi accepts cards and has a visible payment terminal.

## Character cards (Step 3)

### Station attendant

- **Wants:** clear the closed platform and give stranded passengers one usable
  next step.
- **Knows:** tonight's service is over; the first train is at 5:12; the taxi
  rank is outside the east exit.
- **Cannot know:** the learner's destination, budget, reason for travelling, or
  whether they will choose a taxi.
- **Perceives:** an adult passenger, an empty platform, and the stopped display.
- **Persona:** man, late 40s; calm low-mid voice, measured and clear.
- **Character:** economical and watchful. Every line removes one uncertainty;
  a joke, personal question, or elaborate apology is wrong for him.
- **Voice fingerprint:** business-polite です・ます; short operational
  sentences; no filler; he volunteers times and directions rather than asking
  social questions.
- **Never says:** casual forms, personal advice about money, grammar
  explanations, or anything about why the learner missed the train.

### Taxi driver

- **Wants:** establish the exact destination, drive there safely, and close the
  fare without friction.
- **Knows:** the local roads, the visible destination pin, an approximate
  journey time, the fare, and the terminal's payment methods.
- **Cannot know:** which building entrance the learner prefers until it becomes
  visible; the learner's budget, home life, or reason for travelling late.
- **Perceives:** the phone pin, roads, convenience store, two apartment
  buildings, and payment terminal.
- **Persona:** woman, early 50s; steady husky mid-low voice, unhurried.
- **Character:** locally experienced and unflappable. She converts the map into
  landmarks and keeps the ride moving; a chatty, startled, or intrusive line
  is wrong for her.
- **Voice fingerprint:** plain-polite です・ます; compact observations ending in
  ですね when confirming visible facts; she asks only route-critical questions.
- **Never says:** service-counter keigo, guesses about the learner, comments on
  nightlife, or reassurance that depends on a skipped line.

### Learner

- **Wants:** get home without guessing about transport, route, or payment.
- **Knows:** their intended destination and the final landmark; that the last
  train may have gone.
- **Cannot know:** the first-train time, taxi-rank location, journey time, exact
  fare, or whether cards are accepted before being told.
- **Perceives:** the display, signs, phone map, road landmarks, buildings, fare,
  and payment terminal.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** tired but methodical. They ask one concrete question at a time
  and give short usable directions; a long explanation, panic, or staff-side
  keigo is wrong.
- **Voice fingerprint:** plain です・ます; short requests built on ありますか,
  どこですか, どのくらい, and ください; the learner asks nearly every question.
- **Never says:** かしこまりました, よろしいでしょうか, elaborate apologies,
  or any personal address from the real learner.

## Dialogue (Step 4)

`O/A` = other party autoplay; `L/S` = learner speak.

### Stage 1 — 終電

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `last-train-ended` | O/A | 終電は先ほど出ました。 | しゅうでんはさきほどでました。 | The last train left a short while ago. |
| `last-train-any-left` | L/S | もう電車はありませんか。 | もうでんしゃはありませんか。 | Are there no more trains? |
| `last-train-first` | O/A | 始発は五時十二分です。 | しはつはごじじゅうにふんです。 | The first train is at 5:12. |
| `last-train-taxi-rank` | L/S | タクシー乗り場はどこですか。 | たくしーのりばはどこですか。 | Where is the taxi rank? |
| `last-train-east-exit` | O/A | 東口を出て、すぐ右側です。 | ひがしぐちをでて、すぐみぎがわです。 | Go out the east exit; it is immediately on your right. |

### Stage 2 — 行き先

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `destination-ask` | O/A | 行き先をお願いします。 | いきさきをおねがいします。 | Your destination, please. |
| `destination-sakuramachi` | L/S | 桜町駅の近くまでお願いします。 | さくらまちえきのちかくまでおねがいします。 | Near Sakuramachi Station, please. |
| `destination-pin` | O/A | 画面の住所は、桜町二丁目ですね。 | がめんのじゅうしょは、さくらまちにちょうめですね。 | The address on the screen is Sakuramachi 2-chome. |
| `destination-how-long` | L/S | ここからどのくらいかかりますか。 | ここからどのくらいかかりますか。 | About how long will it take from here? |
| `destination-twenty` | O/A | この時間なら、二十分ほどです。 | このじかんなら、にじゅっぷんほどです。 | At this hour, about twenty minutes. |

### Stage 3 — 道案内

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `directions-fork` | O/A | この先で、道が二つに分かれます。 | このさきで、みちがふたつにわかれます。 | The road splits in two up ahead. |
| `directions-store` | L/S | あのコンビニを右に曲がってください。 | あのこんびにをみぎにまがってください。 | Please turn right at that convenience store. |
| `directions-two-buildings` | O/A | 右側にマンションが二軒並んでいます。 | みぎがわにまんしょんがにけんならんでいます。 | There are two apartment buildings side by side on the right. |
| `directions-second-building` | L/S | 二軒目のマンションの前で止めてください。 | にけんめのまんしょんのまえでとめてください。 | Please stop in front of the second apartment building. |
| `directions-entrance` | O/A | 建物の入口に車を寄せますね。 | たてもののいりぐちにくるまをよせますね。 | I'll pull up by the building entrance. |

### Stage 4 — 到着

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `arrival-fare` | O/A | 料金は四千二百円です。 | りょうきんはよんせんにひゃくえんです。 | The fare is 4,200 yen. |
| `arrival-card` | L/S | カードで払えますか。 | かーどではらえますか。 | Can I pay by card? |
| `arrival-terminal` | O/A | カードは、この端末にお願いします。 | かーどは、このたんまつにおねがいします。 | Please use this terminal for the card. |
| `arrival-thanks` | L/S | 遅い時間にありがとうございました。 | おそいじかんにありがとうございました。 | Thank you for the late-night ride. |
| `arrival-belongings` | O/A | お忘れ物のないよう、ご注意ください。 | おわすれもののないよう、ごちゅういください。 | Please make sure you haven't left anything behind. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `last-train-any-left` | もう電車はないですか / 次の電車はありませんか |
| `last-train-taxi-rank` | タクシー乗り場はどちらですか / タクシーはどこから乗れますか |
| `destination-sakuramachi` | 桜町駅までお願いします / この住所までお願いします |
| `destination-how-long` | どのくらい時間がかかりますか / 何分ぐらいですか |
| `directions-store` | コンビニのところを右に曲がってください / あのコンビニで右に曲がってください |
| `directions-second-building` | 二軒目の前で止めてください / あのマンションの前でお願いします |
| `arrival-card` | クレジットカードで払えますか / カードは使えますか |
| `arrival-thanks` | ありがとうございました / 助かりました、ありがとうございます |

## Review (Steps 5–6)

### Reading and naturalness

All transition and dialogue readings were checked against the written
Japanese. Specific risk checks:

- 始発 → しはつ; 終電 → しゅうでん; 東口 → ひがしぐち.
- 五時十二分 → ごじじゅうにふん; 二十分 → にじゅっぷん.
- 二丁目 → にちょうめ; 二軒 / 二軒目 → にけん / にけんめ.
- 四千二百円 → よんせんにひゃくえん.
- 大通り → おおどおり; 住宅街 → じゅうたくがい; 端末 → たんまつ.

The naturalness pass removed explanatory or over-polite learner lines. The
attendant speaks in clipped operational facts; the driver uses visible
landmarks and one soft confirming ですね/ね; the learner uses ordinary taxi
requests. Payment deliberately recycles the café's card language in a new
slot.

### Pessimistic all-skip run

With every learner bubble absent, the surviving sequence remains coherent:

> 終電は先ほど出ました。／始発は五時十二分です。／東口を出て、すぐ右側です。／
> 行き先をお願いします。／画面の住所は、桜町二丁目ですね。／この時間なら、二十分
> ほどです。／この先で、道が二つに分かれます。／右側にマンションが二軒並んでい
> ます。／建物の入口に車を寄せますね。／料金は四千二百円です。／カードは、この
> 端末にお願いします。／お忘れ物のないよう、ご注意ください。

The visible phone pin supplies the destination independently of speech. No
other-party line quotes, agrees with, or claims success for a learner line.

## Difficulty verdict

- Requested level: N4
- Learner production: N4
- Listening/comprehension: N4 core / N3 stretch
- Overall: **N4 core / N3 listening stretch**
- Confidence: high for text; medium until delivery is auditioned
- Practice load: moderate; counters, a fictional place name, and one long
  direction line

### Evidence

- **Task/topic:** N4 — familiar transport, location, time, and payment.
- **Language resources:** N4 — requests, existence, duration, location, and
  simple sequential directions.
- **Discourse:** N4 — one idea per learner turn and explicit visible referents.
- **Listening:** N3 stretch only in natural operational phrases such as
  お忘れ物のないよう、ご注意ください and number/counter density.
- **Interaction:** N4 — repair uncertainty, give a destination, direct a turn,
  and close a fare.

No learner line requires sustained N3 grammar. The longest line is a memory and
counter burden, not evidence of a higher language level; its two shorter
accepted variants reduce the recognition load.

## Character separation gate (Step 6b)

Detached review used only speaker, Japanese, reading, and translation.

- **Pass A — leak scan: pass.** No character explains the lesson, their role,
  or why a phrase is useful. Transitions only set visible time and movement.
- **Pass B — knowledge ledger: pass.** The attendant uses service data; the
  driver uses the visible pin, road, buildings, fare, and terminal. Neither
  borrows skipped speech or private learner facts.
- **Pass C — blind attribution: pass.** Operational announcements belong to the
  attendant; landmark confirmations and ですね belong to the driver; questions
  and direct requests belong to the learner.
- **Pass D — single-speaker read-through: pass.** The attendant removes
  uncertainty in three facts. The driver moves from destination to landmarks
  to fare. The learner consistently asks or directs without overexplaining.
- **Pass E — persona alignment: pass.** Every attendant line expresses
  economical watchfulness; every driver line expresses local, unflappable
  procedure; every learner line expresses tired method. No declared trait is
  left decorative.

Verdict: **pass, all five passes.** Re-run all five if any line changes.
