# Story: secondhand-bicycle — 中古の自転車

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** Registration
language was checked against current National Police Agency and Tokyo bicycle-
registration sources. Local fees, documents, and procedures vary, so the story
teaches questions and omits a universal fee claim. All authoring gates pass.

## Situation

The learner visits a used-bicycle shop for a daily station commute. They narrow
two choices, adjust and test-ride one, identify a weak rear brake, confirm the
repair is included, buy it, and complete the shop's theft-prevention
registration process.

What changes: **a vague need for transport becomes one inspected, adjusted,
registered bicycle and a retained registration card.**

| Field | Decision |
| --- | --- |
| Learner | Adult resident, N4/N3 plain-polite Japanese; comparison-driven. |
| Other party | One used-bicycle shop owner through all stages. |
| Length | 4 stages, 20 bubbles, 8 learner `speak` bubbles. |
| Working level | N4 core / N3 stretch. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 選ぶ | Broad commuting need → two visible options compared | `bike-shop-front` | `bike-shop-owner` | 土曜日の午後、中古自転車店の前に二台の自転車が並んでいた。 |
| 2 試す | Static comparison → fit and brake condition experienced | `test-ride-area` | `bike-shop-owner` | 店の前の試乗スペースに、白い線が引かれていた。 |
| 3 決める | Concern about repair/cost → included work and handover time understood | `bike-workbench` | `bike-shop-owner` | 店内の作業台に、青い自転車が立てかけられていた。 |
| 4 登録 | Purchased bicycle → ID checked and registration-card purpose understood | `bike-shop-door` | `bike-shop-owner` | 一時間後、整備を終えた自転車が店の入口に置かれていた。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | どようびのごご、ちゅうこじてんしゃてんのまえににだいのじてんしゃがならんでいた。 | On Saturday afternoon, two bicycles stood outside a used-bicycle shop. |
| 2 | みせのまえのしじょうすぺーすに、しろいせんがひかれていた。 | A white line marked the test-ride area outside the shop. |
| 3 | てんないのさぎょうだいに、あおいじてんしゃがたてかけられていた。 | A blue bicycle leaned against the workbench inside. |
| 4 | いちじかんご、せいびをおえたじてんしゃがみせのいりぐちにおかれていた。 | An hour later, the serviced bicycle stood at the shop entrance. |

## Scene facts

- The learner is looking in the clearly marked commuting-bicycle section.
- Two used bicycles are inspected and tagged: the left has a large basket; the
  right is three kilograms lighter and priced at 18,000 yen.
- The saddle lever, test area, rear brake feel, and workbench are visible.
- The shop is an authorized registration location in this fictional setting.
  A fictional ID and registration card are on the counter.

## Character cards

### Bicycle shop owner

- **Wants:** match the learner to a safe bicycle, state its condition honestly,
  service it, and complete the required shop paperwork.
- **Knows:** weights, price, component condition, included service, handover
  time, and local registration procedure.
- **Cannot know:** commute length, fit preference, or brake feel before the
  learner tests it; no assumptions about cycling skill.
- **Perceives:** both bicycles, basket, saddle, test ride, brake, ID, and card.
- **Persona:** man, late 40s; dry clear mid-low voice, moderately paced.
- **Character:** mechanically candid and anti-salesy. He compares measurable
  facts and names work before promises; hype, pressure, or hiding a defect is
  wrong.
- **Voice fingerprint:** plain-polite shop Japanese; weights, prices, component
  nouns, ～できます/含まれています; he volunteers specifications.
- **Never says:** “perfect for you,” vague quality claims, guesses about the
  learner, or universal registration fees/documents.

### Learner

- **Wants:** buy a light, correctly fitted, safe bicycle for a short daily
  commute and understand its paperwork.
- **Knows:** commute length, preferred fit, and test-ride brake sensation.
- **Cannot know:** exact weight difference, repair inclusion, handover time, or
  registration process before asking.
- **Perceives:** tags, components, test area, price, ID, and card.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** comparison-driven and safety-conscious. They turn preference
  into measurable questions and report a defect without bargaining theater;
  impulse buying or vague approval is wrong.
- **Voice fingerprint:** plain です・ます; duration, comparative もう少し,
  permission, sensation 気がします, inclusion, and procedure questions.
- **Never says:** aggressive discount demands, expert jargon they do not know,
  or personal identity details aloud.

## Dialogue

### Stage 1 — 選ぶ

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `bicycle-choose-two` | O/A | 通勤用なら、この二台が乗りやすいです。 | つうきんようなら、このにだいがのりやすいです。 | For commuting, these two are easy to ride. |
| `bicycle-choose-commute` | L/S | 駅まで毎日十五分ぐらい乗ります。 | えきまでまいにちじゅうごふんぐらいのります。 | I'll ride about fifteen minutes to the station each day. |
| `bicycle-choose-basket` | O/A | 左の自転車は、かごが大きいです。 | ひだりのじてんしゃは、かごがおおきいです。 | The bicycle on the left has a large basket. |
| `bicycle-choose-lighter` | L/S | もう少し軽い自転車はありますか。 | もうすこしかるいじてんしゃはありますか。 | Do you have a slightly lighter bicycle? |
| `bicycle-choose-three-kilos` | O/A | 右の自転車は、三キロ軽いです。 | みぎのじてんしゃは、さんきろかるいです。 | The bicycle on the right is three kilograms lighter. |

### Stage 2 — 試す

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `bicycle-test-saddle` | O/A | サドルは、このレバーで調整できます。 | さどるは、このればーでちょうせいできます。 | You can adjust the saddle with this lever. |
| `bicycle-test-lower` | L/S | もう少し低くしてもいいですか。 | もうすこしひくくしてもいいですか。 | May I lower it a little more? |
| `bicycle-test-area` | O/A | 店の前で試乗できます。 | みせのまえでしじょうできます。 | You can test-ride it outside the shop. |
| `bicycle-test-brake` | L/S | 後ろのブレーキが少し弱い気がします。 | うしろのぶれーきがすこしよわいきがします。 | The rear brake feels a little weak. |
| `bicycle-test-adjust` | O/A | ブレーキは、購入前に調整します。 | ぶれーきは、こうにゅうまえにちょうせいします。 | We'll adjust the brake before purchase. |

### Stage 3 — 決める

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `bicycle-decide-price` | O/A | 価格は一万八千円です。 | かかくはいちまんはっせんえんです。 | The price is 18,000 yen. |
| `bicycle-decide-included` | L/S | ブレーキの調整も入っていますか。 | ぶれーきのちょうせいもはいっていますか。 | Is the brake adjustment included? |
| `bicycle-decide-service` | O/A | 点検と調整は、価格に含まれています。 | てんけんとちょうせいは、かかくにふくまれています。 | Inspection and adjustment are included in the price. |
| `bicycle-decide-this-one` | L/S | この自転車にします。 | このじてんしゃにします。 | I'll take this bicycle. |
| `bicycle-decide-hour` | O/A | 点検後、一時間ほどでお渡しできます。 | てんけんご、いちじかんほどでおわたしできます。 | We can hand it over about an hour after inspection. |

### Stage 4 — 登録

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `bicycle-register-id` | O/A | 防犯登録には、身分証が必要です。 | ぼうはんとうろくには、みぶんしょうがひつようです。 | Identification is required for the theft-prevention registration. |
| `bicycle-register-this-id` | L/S | この身分証で大丈夫ですか。 | このみぶんしょうでだいじょうぶですか。 | Is this identification acceptable? |
| `bicycle-register-card` | O/A | 登録カードは、お客様の控えです。 | とうろくかーどは、おきゃくさまのひかえです。 | The registration card is your copy. |
| `bicycle-register-when` | L/S | このカードは、いつ使いますか。 | このかーどは、いつつかいますか。 | When will I use this card? |
| `bicycle-register-procedures` | O/A | 住所変更や譲渡などの手続きで使います。 | じゅうしょへんこうやじょうとなどのてつづきでつかいます。 | You use it for procedures such as an address change or transfer. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `bicycle-choose-commute` | 毎日、駅まで乗ります / 駅まで十五分ぐらいです |
| `bicycle-choose-lighter` | もっと軽い自転車はありますか / 少し軽いものはありますか |
| `bicycle-test-lower` | サドルをもう少し下げてもいいですか / 少し低くできますか |
| `bicycle-test-brake` | 後ろのブレーキが弱いです / ブレーキが少し弱く感じます |
| `bicycle-decide-included` | ブレーキの調整は料金に入っていますか / 調整代も含まれていますか |
| `bicycle-decide-this-one` | これにします / この青い自転車を買います |
| `bicycle-register-this-id` | これで大丈夫ですか / この身分証を使えますか |
| `bicycle-register-when` | 登録カードは何に使いますか / このカードは必要ですか |

## Review

### Reading and factual check

Checked: 中古 ちゅうこ; 二台 にだい; 通勤用 つうきんよう; 十五分
じゅうごふん; 調整 ちょうせい; 試乗 しじょう; 購入 こうにゅう; 一万八千
円 いちまんはっせんえん; 含まれる ふくまれる; 防犯登録
ぼうはんとうろく; 身分証 みぶんしょう; 控え ひかえ; 譲渡 じょうと.

Current police sources establish that bicycle owners are required to register
and that registration records/cards matter for later procedures. Tokyo's
officially designated registration operator lists the bicycle, official ID,
and ownership evidence for a transferred used bicycle, but details are local.
The story therefore places registration at an authorized shop, asks whether
the shown ID works, and avoids teaching one national fee or document list.

### Pessimistic all-skip run

> 通勤用なら、この二台が乗りやすいです。／左の自転車は、かごが大きいです。／
> 右の自転車は、三キロ軽いです。／サドルは、このレバーで調整できます。／店の前
> で試乗できます。／ブレーキは、購入前に調整します。／価格は一万八千円です。／
> 点検と調整は、価格に含まれています。／点検後、一時間ほどでお渡しできます。／
> 防犯登録には、身分証が必要です。／登録カードは、お客様の控えです。／住所変更
> や譲渡などの手続きで使います。

All shop lines derive from tags, inspection, and local procedure rather than
learner claims.

## Difficulty verdict

- Requested level: N4/N3
- Learner production: N4 core / N3 stretch
- Listening/comprehension: N4 core / N3 stretch
- Overall: **N4 core / N3 stretch**
- Confidence: high for text; registration details must be localized at release
- Practice load: moderate; prices, weights, shop compounds, and one sensory
  hedge

Comparison, permission, and purchase are N4. Reporting a defect with 気がする,
asking what is included, and understanding registration/transfer sustain the
limited N3 stretch.

## Character separation gate

- **A: pass.** The owner compares, services, and explains procedure; no sales or
  grammar lesson leaks in.
- **B: pass.** Every specification is tagged, visible, tested, or procedural.
- **C: pass.** Mechanically exact specification language belongs to the owner;
  duration, preference, sensation, and choice belong to the learner.
- **D: pass.** Owner remains candid and anti-salesy; learner remains comparative
  and safety-conscious.
- **E: pass.** Every declared trait appears, and no line introduces hype,
  bargaining theater, or expertise absent from the cards.

Verdict: **pass, all five passes.**

## Sources

- [National Police Agency guidance on bicycle registration](https://www.npa.go.jp/laws/notification/seian/seiki/bouhantouroku.pdf)
- [Tokyo Metropolitan Police: bicycle registration](https://www.keishicho.metro.tokyo.lg.jp/kurashi/higai/guard/bicycle.html)
- [Tokyo Bicycle Security Registration Association: transferred bicycles](https://bouhan-net.com/regist/presented/)
