# Story: missing-wallet — 消えた財布

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** All authoring
reviews and Passes A–E are complete. Voice presets are audition candidates.

## Situation

At a convenience-store register, the learner discovers their wallet is
missing. They leave the purchase safely, check the store, file a report at the
nearby kōban, and identify the recovered wallet the following day.

What changes: **the learner moves from an unexplained missing wallet to a
documented report and a verified recovery.**

| Field | Decision |
| --- | --- |
| Learner | Adult resident, N4 plain-polite Japanese; observant and factual. |
| Other parties | One convenience-store clerk; one police officer. |
| Length | 4 stages, 20 bubbles, 8 learner `speak` bubbles. |
| Working level | N4 production / N3 listening stretch. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 気づく | Purchase blocked → goods held while learner searches | `store-register` | `store-clerk` | 夜十時、駅前のコンビニのレジに列ができていた。 |
| 2 手がかり | Unknown store status → knows wallet is not there and where to report it | `store-register-close` | `store-clerk` | レジの横に、買い物かごが一つ残されていた。 |
| 3 届け出 | No official record → loss location and contact route recorded | `koban-night` | `police-officer` | コンビニを出ると、交差点の角に交番の明かりが見えた。 |
| 4 確認 | Possible match → identity checked and wallet returned | `koban-evening` | `police-officer` | 翌日の夕方、交番のカウンターに黒い財布が置かれていた。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | よるじゅうじ、えきまえのこんびにのれじにれつができていた。 | At ten at night, a line had formed at the register of a convenience store by the station. |
| 2 | れじのよこに、かいものかごがひとつのこされていた。 | One shopping basket remained beside the register. |
| 3 | こんびにをでると、こうさてんのかどにこうばんのあかりがみえた。 | Outside the store, the light of a police box was visible at the corner. |
| 4 | よくじつのゆうがた、こうばんのかうんたーにくろいさいふがおかれていた。 | The following evening, a black wallet lay on the police-box counter. |

## Scene facts

- The learner's shopping basket is visible at the register.
- The missing wallet is small and black, with a red cat sticker and a blue
  transit IC card inside. These are fictional identifiers.
- During Stage 2 the learner shows the clerk a photo of the wallet; the clerk
  does not need knowledge from a skipped learner line.
- The kōban is visible from the store corner. In Stage 3 the learner has the
  wallet photo and a blank loss form on the counter.
- In Stage 4 the recovered wallet and the learner's fictional ID are already on
  the counter, so identity verification is independent of spoken success.

## Character cards

### Store clerk

- **Wants:** keep the register moving while protecting the unpaid goods and
  giving the learner a clear next step.
- **Knows:** the purchase total, closing time, store lost-property status, and
  route to the nearby kōban.
- **Cannot know:** where the wallet was lost, its contents beyond the shown
  photo, or whether the police have it.
- **Perceives:** basket, phone photo, line, and store entrance.
- **Persona:** woman, early 20s; light clear mid-range voice, brisk.
- **Character:** efficient without being cold. She turns each problem into one
  action; sympathy speeches, curiosity, or promises about recovery are wrong.
- **Voice fingerprint:** business-polite です・ます; compact procedural lines;
  no contractions; she volunteers deadlines and directions.
- **Never says:** casual reassurance, guesses about theft, or questions about
  the learner's finances.

### Police officer

- **Wants:** collect verifiable facts, create a usable report, and return only
  the correctly identified item.
- **Knows:** report procedure, what was handed in, recovery location, and what
  the visible ID proves.
- **Cannot know:** where the learner thinks the wallet went, unreported
  contents, or who found it.
- **Perceives:** photo, form, wallet, sticker, IC card, and ID.
- **Persona:** man, mid-30s; neutral low-mid voice, patient and precise.
- **Character:** procedural and quietly reassuring. He names evidence rather
  than offering hope; suspicion, drama, or casual familiarity is wrong.
- **Voice fingerprint:** formal-polite です・ます with 届け, 場合, 確認; medium
  sentences; he asks only report questions.
- **Never says:** promises the wallet will be found, blame, legal lectures, or
  personal assumptions.

### Learner

- **Wants:** preserve the purchase, report the loss accurately, and recover the
  correct wallet.
- **Knows:** wallet appearance, likely time/place, and its distinctive contents.
- **Cannot know:** store status, police status, or whether the recovered wallet
  is theirs before identifiers match.
- **Perceives:** basket, photo, signs, form, recovered wallet, and ID.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** observant and factual under pressure. They state one checkable
  detail at a time; accusations, panic, and elaborate backstory are wrong.
- **Voice fingerprint:** plain です・ます; ありません/なくしました, concrete
  color/time/place phrases; learner asks the practical questions.
- **Never says:** 盗まれました without evidence, staff keigo, or real personal
  identifiers.

## Dialogue

### Stage 1 — 気づく

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `wallet-register-total` | O/A | お会計は千八百四十円です。 | おかいけいはせんはっぴゃくよんじゅうえんです。 | Your total is 1,840 yen. |
| `wallet-register-missing` | L/S | すみません、財布が見つかりません。 | すみません、さいふがみつかりません。 | Sorry, I can't find my wallet. |
| `wallet-register-hold` | O/A | 商品はこちらでお預かりします。 | しょうひんはこちらでおあずかりします。 | We'll hold the items here. |
| `wallet-register-return` | L/S | あとで取りに来てもいいですか。 | あとでとりにきてもいいですか。 | May I come back for them later? |
| `wallet-register-eleven` | O/A | 十一時までに、レジへお越しください。 | じゅういちじまでに、れじへおこしください。 | Please come to the register by eleven. |

### Stage 2 — 手がかり

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `wallet-search-none` | O/A | その財布は、店内には届いていません。 | そのさいふは、てんないにはとどいていません。 | That wallet hasn't been turned in here. |
| `wallet-search-description` | L/S | 黒くて、小さい財布です。 | くろくて、ちいさいさいふです。 | It's a small black wallet. |
| `wallet-search-koban` | O/A | 入口の近くに交番があります。 | いりぐちのちかくにこうばんがあります。 | There is a police box near the entrance. |
| `wallet-search-directions` | L/S | 交番までどう行けばいいですか。 | こうばんまでどういけばいいですか。 | How should I get to the police box? |
| `wallet-search-left` | O/A | 店を出て、最初の角を左です。 | みせをでて、さいしょのかどをひだりです。 | Leave the store and turn left at the first corner. |

### Stage 3 — 届け出

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `wallet-report-open` | O/A | 落とし物の届けですね。 | おとしもののとどけですね。 | You're here to report lost property. |
| `wallet-report-lost` | L/S | 財布をなくしました。 | さいふをなくしました。 | I lost my wallet. |
| `wallet-report-form` | O/A | なくした場所と時間を、この用紙に書いてください。 | なくしたばしょとじかんを、このようしにかいてください。 | Please write the place and time you lost it on this form. |
| `wallet-report-place-time` | L/S | 十時ごろ、駅前のコンビニにいました。 | じゅうじごろ、えきまえのこんびににいました。 | I was at the convenience store by the station around ten. |
| `wallet-report-contact` | O/A | 見つかった場合は、こちらからご連絡します。 | みつかったばあいは、こちらからごれんらくします。 | If it is found, we will contact you. |

### Stage 4 — 確認

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `wallet-return-found` | O/A | 駅前で、黒い財布が見つかりました。 | えきまえで、くろいさいふがみつかりました。 | A black wallet was found near the station. |
| `wallet-return-sticker` | L/S | 赤い猫のシールが付いています。 | あかいねこのしーるがついています。 | It has a red cat sticker on it. |
| `wallet-return-card` | O/A | 中には青い交通系ICカードがあります。 | なかにはあおいこうつうけいあいしーかーどがあります。 | Inside is a blue transit IC card. |
| `wallet-return-id` | L/S | こちらが身分証です。 | こちらがみぶんしょうです。 | Here is my identification. |
| `wallet-return-complete` | O/A | ご本人と確認できましたので、財布をお返しします。 | ごほんにんとかくにんできましたので、さいふをおかえしします。 | We have confirmed your identity, so we'll return the wallet. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `wallet-register-missing` | 財布がありません / 財布が見当たりません |
| `wallet-register-return` | あとで戻ってもいいですか / あとで商品を取りに来てもいいですか |
| `wallet-search-description` | 小さい黒い財布です / 黒い財布です |
| `wallet-search-directions` | 交番はどこですか / 交番までの道を教えてください |
| `wallet-report-lost` | 財布を落としました / 財布がなくなりました |
| `wallet-report-place-time` | 十時ごろ、駅前にいました / 駅前のコンビニでなくしました |
| `wallet-return-sticker` | 赤い猫のシールがあります / 猫のシールが付いた財布です |
| `wallet-return-id` | 身分証はこちらです / これが身分証です |

## Review

### Reading and naturalness

Checked risks: 千八百四十円 → せんはっぴゃくよんじゅうえん; お預かり →
おあずかり; お越し → おこし; 交番 → こうばん; 届け → とどけ; 用紙 →
ようし; 場合 → ばあい; 交通系ICカード → こうつうけいあいしーかーど;
身分証 → みぶんしょう; ご本人 → ごほんにん.

The clerk never speculates or consoles. The officer names procedure and
evidence. The learner avoids the unjustified 盗まれました and describes only
what they can verify.

### Pessimistic all-skip run

> お会計は千八百四十円です。／商品はこちらでお預かりします。／十一時までに、
> レジへお越しください。／その財布は、店内には届いていません。／入口の近くに
> 交番があります。／店を出て、最初の角を左です。／落とし物の届けですね。／
> なくした場所と時間を、この用紙に書いてください。／見つかった場合は、こちら
> からご連絡します。／駅前で、黒い財布が見つかりました。／中には青い交通系IC
> カードがあります。／ご本人と確認できましたので、財布をお返しします。

The phone photo, form, and visible ID carry the nonverbal evidence. No reply
depends on a spoken learner line.

## Difficulty verdict

- Requested level: N4
- Learner production: N4
- Listening/comprehension: N4 core / N3 stretch
- Overall: **N4 core / N3 listening stretch**
- Confidence: high for text; medium until audio exists
- Practice load: moderate; one price, compound transit-card term, and formal
  police listening

Task, learner grammar, and discourse are N4. The N3 listening stretch comes
from formal procedural phrases such as 見つかった場合, ご本人と確認, and
お返しします; none is required learner production.

## Character separation gate

- **A leak scan: pass.** No teaching, author rationale, or role explanation.
- **B knowledge ledger: pass.** Clerk uses store facts and visible photo;
  officer uses form, recovered contents, and visible ID.
- **C blind attribution: pass.** Retail deadlines, police evidence language,
  and learner descriptions remain distinct.
- **D single-speaker read-through: pass.** Clerk moves the queue and supplies a
  route; officer records then verifies; learner reports only checkable facts.
- **E persona alignment: pass.** Every line traces to efficient clerk,
  procedural officer, or observant learner; every declared trait appears.

Verdict: **pass, all five passes.** Re-run after any wording change.
