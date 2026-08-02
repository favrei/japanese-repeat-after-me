# Story: onsen-inn — 温泉旅館の一泊

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** Ryokan and onsen
behavior was checked against current Japan National Tourism Organization
(JNTO) guidance. Facility-specific rules always override this fictional scene.
All authoring gates pass; voice casts remain candidates.

## Situation

The learner spends one night at a mountain onsen ryokan. They check meal and
bath times, settle room clothing and valuables, clarify the bath's washing,
towel, and phone rules, then arrange luggage storage and the station shuttle at
checkout.

What changes: **an unfamiliar traditional stay becomes a completed night with
the local rules understood and the onward trip arranged.**

| Field | Decision |
| --- | --- |
| Learner | Adult traveler, N4 plain-polite Japanese; respectful and question-first. |
| Other parties | One ryokan attendant; one bath attendant. |
| Length | 4 stages, 20 bubbles, 8 learner `speak` bubbles. |
| Working level | N4 production / N3 service-listening stretch. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 到着 | Reservation only → meals and bath hours established | `ryokan-entrance` | `ryokan-attendant` | 夕方、山あいの旅館の玄関に明かりがともっていた。 |
| 2 部屋 | Room entered → yukata fit and valuables plan settled | `tatami-room` | `ryokan-attendant` | 畳の部屋に、浴衣と小さなタオルが置かれていた。 |
| 3 温泉 | Bath located → washing, towel, and phone rules understood | `bath-entrance` | `bath-attendant` | 廊下の奥で、温泉の暖簾が揺れていた。 |
| 4 出発 | Stay complete → luggage held and shuttle departure known | `ryokan-morning` | `ryokan-attendant` | 翌朝、玄関に荷物と送迎車の時刻表が並んでいた。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | ゆうがた、やまあいのりょかんのげんかんにあかりがともっていた。 | In the evening, lights glowed at the entrance of a mountain inn. |
| 2 | たたみのへやに、ゆかたとちいさなたおるがおかれていた。 | A yukata and a small towel lay in the tatami room. |
| 3 | ろうかのおくで、おんせんののれんがゆれていた。 | At the end of the corridor, the onsen curtain moved gently. |
| 4 | よくあさ、げんかんににもつとそうげいしゃのじこくひょうがならんでいた。 | The next morning, luggage and a shuttle timetable stood by the entrance. |

## Scene facts

- The fictional reservation is identified by number 3072, not a real name.
- Dinner is at 7 p.m., breakfast at 8 a.m., and this facility's bath closes at
  11 p.m.
- Three yukata sizes are visible; the room has a safe.
- The bath entrance displays this facility's rules and lockers. The small towel
  stays out of the bathwater; phones stay in the locked locker.
- Checkout is 10 a.m.; the inn holds luggage and operates a 10:30 shuttle in
  this fictional schedule.

## Character cards

### Ryokan attendant

- **Wants:** orient the guest through meals, room, valuables, checkout, and
  onward transport without making the customs feel like a test.
- **Knows:** reservation, schedule, room equipment, luggage service, and shuttle.
- **Cannot know:** clothing fit, bath familiarity, onward preference, or comfort
  unless asked.
- **Perceives:** booking number, yukata shelf, safe, luggage, and timetable.
- **Persona:** woman, early 40s; warm clear mid-range voice, measured.
- **Character:** anticipatory but never ceremonial. She supplies the next
  practical fact before it becomes awkward; cultural speeches, flattery, or
  assumptions about foreignness are wrong.
- **Voice fingerprint:** hospitality keigo, ご利用いただけます/お預かりします;
  medium sentences; she volunteers times and locations.
- **Never says:** mystical claims, stereotypes, tips demands, or rules belonging
  to another facility.

### Bath attendant

- **Wants:** keep the shared bath clean, private, and easy to use.
- **Knows:** posted washing, towel, locker, and phone rules for this bath.
- **Cannot know:** learner's body, tattoo status, health, or prior experience.
- **Perceives:** towel, phone, signs, lockers, and washing area.
- **Persona:** man, late 60s; soft low voice, slow and plain.
- **Character:** unobtrusive and rule-specific. He names only the action in
  front of the guest; embarrassment, joking, or moralizing is wrong.
- **Voice fingerprint:** plain-polite; ～前に, ～外に, ～に入れてください;
  shortest other-party lines.
- **Never says:** comments on nudity or bodies, universal tattoo claims, health
  advice, or folklore.

### Learner

- **Wants:** use the room and bath correctly and leave without transport or
  luggage uncertainty.
- **Knows:** reservation number, own clothing fit, valuables, luggage, and train
  plan.
- **Cannot know:** facility times, bath rules, storage, or shuttle schedule.
- **Perceives:** every prop and sign referenced.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** respectful and question-first. They ask facility-specific
  questions instead of performing memorized etiquette; entitlement or anxious
  over-apology is wrong.
- **Voice fingerprint:** plain です・ます; 何時まで, 替えてもらえますか,
  どこに, ～てもいいですか; practical questions.
- **Never says:** assumes every onsen has the same policy, service keigo, or
  comments on other bathers.

## Dialogue

### Stage 1 — 到着

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `onsen-arrival-reservation` | O/A | ご予約の番号をお願いします。 | ごよやくのばんごうをおねがいします。 | Your reservation number, please. |
| `onsen-arrival-number` | L/S | 予約番号は三〇七二です。 | よやくばんごうはさんぜろななにです。 | My reservation number is 3072. |
| `onsen-arrival-meals` | O/A | 夕食は七時、朝食は八時です。 | ゆうしょくはしちじ、ちょうしょくははちじです。 | Dinner is at seven, and breakfast is at eight. |
| `onsen-arrival-bath-hours` | L/S | 温泉は何時まで入れますか。 | おんせんはなんじまではいれますか。 | Until what time can I use the onsen? |
| `onsen-arrival-eleven` | O/A | 夜十一時までご利用いただけます。 | よるじゅういちじまでごりよういただけます。 | You may use it until eleven tonight. |

### Stage 2 — 部屋

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `onsen-room-sizes` | O/A | 浴衣は、棚の中に三つのサイズがあります。 | ゆかたは、たなのなかにみっつのさいずがあります。 | There are three yukata sizes in the cupboard. |
| `onsen-room-larger` | L/S | 大きいサイズに替えてもらえますか。 | おおきいさいずにかえてもらえますか。 | Could I have a larger size? |
| `onsen-room-dinner-place` | O/A | 夕食は一階の食事処です。 | ゆうしょくはいっかいのしょくじどころです。 | Dinner is in the dining room on the first floor. |
| `onsen-room-valuables` | L/S | 貴重品はどこに置けばいいですか。 | きちょうひんはどこにおけばいいですか。 | Where should I leave my valuables? |
| `onsen-room-safe` | O/A | 貴重品は、部屋の金庫に入れてください。 | きちょうひんは、へやのきんこにいれてください。 | Please put your valuables in the room safe. |

### Stage 3 — 温泉

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `onsen-bath-wash` | O/A | 湯船に入る前に、体を洗ってください。 | ゆぶねにはいるまえに、からだをあらってください。 | Please wash before entering the bath. |
| `onsen-bath-towel-question` | L/S | このタオルは、湯船に入れてもいいですか。 | このたおるは、ゆぶねにいれてもいいですか。 | May I put this towel in the bath? |
| `onsen-bath-towel-out` | O/A | タオルは、湯船の外に置いてください。 | たおるは、ゆぶねのそとにおいてください。 | Please keep the towel outside the bathwater. |
| `onsen-bath-phone-question` | L/S | 携帯電話を持って入ってもいいですか。 | けいたいでんわをもってはいってもいいですか。 | May I bring my phone inside? |
| `onsen-bath-locker` | O/A | 携帯電話は、鍵のかかるロッカーに入れてください。 | けいたいでんわは、かぎのかかるろっかーにいれてください。 | Please put your phone in a locked locker. |

### Stage 4 — 出発

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `onsen-departure-checkout` | O/A | チェックアウトは十時です。 | ちぇっくあうとはじゅうじです。 | Checkout is at ten. |
| `onsen-departure-luggage` | L/S | 荷物を午後まで預かってもらえますか。 | にもつをごごまであずかってもらえますか。 | Could you hold my luggage until the afternoon? |
| `onsen-departure-hold` | O/A | 荷物はフロントでお預かりします。 | にもつはふろんとでおあずかりします。 | We'll hold your luggage at reception. |
| `onsen-departure-shuttle` | L/S | 駅までの送迎車は何時に出ますか。 | えきまでのそうげいしゃはなんじにでますか。 | What time does the shuttle to the station leave? |
| `onsen-departure-ten-thirty` | O/A | 次の便は十時半に出発します。 | つぎのびんはじゅうじはんにしゅっぱつします。 | The next shuttle departs at 10:30. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `onsen-arrival-number` | 予約番号は三〇七二です / 三〇七二で予約しています |
| `onsen-arrival-bath-hours` | お風呂は何時までですか / 温泉は何時まで使えますか |
| `onsen-room-larger` | 大きい浴衣に替えてもらえますか / もう一つ大きいサイズはありますか |
| `onsen-room-valuables` | 貴重品はどこに入れますか / 金庫はありますか |
| `onsen-bath-towel-question` | タオルを湯船に入れてもいいですか / このタオルは中に持って入れますか |
| `onsen-bath-phone-question` | 携帯は持ち込めますか / スマホはどこに置きますか |
| `onsen-departure-luggage` | 荷物を預かってもらえますか / 午後まで荷物を置けますか |
| `onsen-departure-shuttle` | 送迎車は何時ですか / 駅行きの車は何時に出ますか |

## Review

### Reading and etiquette check

Checked: 旅館 りょかん; 山あい やまあい; 浴衣 ゆかた; 三〇七二
さんぜろななに; 夕食 ゆうしょく; 朝食 ちょうしょく; 一階 いっかい;
食事処 しょくじどころ; 貴重品 きちょうひん; 金庫 きんこ; 湯船 ゆぶね;
送迎車 そうげいしゃ; 十時半 じゅうじはん.

JNTO guidance supports the script's narrow bath rules: wash before entering,
keep towels and hair out of the water, leave phones/cameras outside, and follow
the facility's own posted policy. JNTO also describes ryokan meals, yukata,
tatami, and staff explanation as common rather than universal. The script asks
local questions and avoids tattoos, bathing duration, or health claims.

### Pessimistic all-skip run

> ご予約の番号をお願いします。／夕食は七時、朝食は八時です。／夜十一時までご
> 利用いただけます。／浴衣は、棚の中に三つのサイズがあります。／夕食は一階の
> 食事処です。／貴重品は、部屋の金庫に入れてください。／湯船に入る前に、体を
> 洗ってください。／タオルは、湯船の外に置いてください。／携帯電話は、鍵の
> かかるロッカーに入れてください。／チェックアウトは十時です。／荷物はフロント
> でお預かりします。／次の便は十時半に出発します。

All lines are schedule, visible equipment, posted rule, or facility service;
none depends on learner speech.

## Difficulty verdict

- Requested level: N4
- Learner production: N4
- Listening/comprehension: N4 core / N3 service stretch
- Overall: **N4 core / N3 listening stretch**
- Confidence: high for text; local-policy recheck required at release
- Practice load: moderate; hospitality keigo, counters, and facility nouns

Learner asks concrete time, permission, location, size, and storage questions.
Staff honorifics and compact ryokan terms create receptive stretch without
raising production beyond N4.

## Character separation gate

- **A: pass.** Attendants state this inn's services and rules, never lecture on
  Japanese culture.
- **B: pass.** Reservation, schedule, shelf, safe, signs, lockers, luggage, and
  timetable support every fact.
- **C: pass.** Anticipatory hospitality keigo belongs to the ryokan attendant;
  short rule-specific lines belong to bath attendant; questions belong learner.
- **D: pass.** Each voice keeps its agenda and cadence through the stay.
- **E: pass.** Practical anticipation, unobtrusive specificity, and respectful
  questioning all reach dialogue; no undeclared ceremony or embarrassment.

Verdict: **pass, all five passes.**

## Sources

- [JNTO: How to Best Enjoy Japan's Onsen](https://www.japan.travel/en/guide/how-to-best-enjoy-onsen/)
- [JNTO: Japanese Ryokan Guide](https://www.japan.travel/en/guide/japanese-ryokan/)
- [JNTO: Manners and Etiquette](https://www.japan.travel/en/guide/understanding-and-mastering-japanese-manners-and-etiquette/)
