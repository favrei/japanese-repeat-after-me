# Café Stage Redesign

The first full application of
[`stage-design-flow.md`](stage-design-flow.md) to the bundled café story. It
replaces the original burger-and-beer script while preserving the fixed
two-stage linear progression and existing bubble IDs.

## Situation and stage cuts

A solo adult customer visits a quiet independent Japanese café and leaves
having ordered a house-blend coffee, requested a receipt, and paid by card.

1. **Ordering** ends when the customer places the coffee order.
2. **Payment** begins after the visit and ends when the register interaction is
   complete.

Each stage contains two learner `speak` bubbles. The first is deliberately easy;
the second either extends or recycles the same request pattern.

## Shared scene facts

- It is late afternoon in a quiet independent café.
- One staff member can see one customer; no companion is present.
- The café recommends a house-blend coffee.
- Payment happens at the register, which accepts cash and cards.

## Character cards

### Staff

- **Wants:** move one customer through ordering and payment without rushing
  them.
- **Knows:** the menu, current recommendation, register location, and accepted
  payment methods.
- **Cannot know:** what the learner wants to order, whether they need a
  receipt, how they will pay, their nationality, or their Japanese level.
- **Perceives:** a customer entering, pausing over the menu, approaching the
  register, and leaving.
- **Voice fingerprint:** business-polite Japanese using です・ます and light
  service honorifics; concise statements; asks the ordering question; often
  closes with ～ください or a service greeting.
- **Never says:** casual forms toward the customer, “sir,” grammar
  explanations, or anything about being a café employee.

### Learner

- **Wants:** obtain the menu, order the recommended coffee, request a receipt,
  and pay by card.
- **Knows:** their own preferences and payment method; learns the house
  recommendation and payment options only when the staff says them.
- **Cannot know:** the café layout, recommendation, or payment methods before
  hearing them.
- **Perceives:** the staff member, menu area, coffee counter, and register.
- **Voice fingerprint:** short beginner-safe です・ます requests; relies on
  お願いします; answers rather than leading the service interaction.
- **Never says:** かしこまりました, 承知しました, よろしいでしょうか, staff-side
  honorifics, or narration about being a learner.

## Finished dialogue

### Stage 1 — Ordering / ご注文

| ID | Speaker | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- | --- |
| `ordering-welcome` | staff | autoplay | いらっしゃいませ。 | いらっしゃいませ。 | Welcome. |
| `ordering-question` | staff | autoplay | ご注文はお決まりですか。 | ごちゅうもんはおきまりですか。 | Are you ready to order? |
| `ordering-menu` | learner | speak | メニューをお願いします。 | めにゅーをおねがいします。 | A menu, please. |
| `ordering-second` | staff | autoplay | 本日のおすすめは、ブレンドコーヒーです。 | ほんじつのおすすめは、ぶれんどこーひーです。 | Today’s recommendation is the house blend. |
| `ordering-ready` | staff | autoplay | お決まりになりましたら、お呼びください。 | おきまりになりましたら、およびください。 | Please call me when you’re ready. |
| `ordering-order` | learner | speak | ブレンドコーヒーをお願いします。 | ぶれんどこーひーをおねがいします。 | The house blend, please. |
| `ordering-thanks` | staff | autoplay | ありがとうございます。 | ありがとうございます。 | Thank you. |

Accepted variants:

- `ordering-menu`: メニューお願いします / メニューを見せてください
- `ordering-order`: コーヒーをお願いします / ブレンドをお願いします

### Stage 2 — Payment / お会計

| ID | Speaker | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- | --- |
| `meal-arrives` | staff | autoplay | お会計は、レジでお願いします。 | おかいけいは、れじでおねがいします。 | Please pay at the register. |
| `meal-restroom` | learner | speak | レシートをお願いします。 | れしーとをおねがいします。 | A receipt, please. |
| `meal-payment-options` | staff | autoplay | 現金とカードが使えます。 | げんきんとかーどがつかえます。 | You can pay by cash or card. |
| `meal-serve` | learner | speak | カードでお願いします。 | かーどでおねがいします。 | By card, please. |
| `meal-thanks` | staff | autoplay | ありがとうございました。 | ありがとうございました。 | Thank you very much. |
| `meal-return` | staff | autoplay | またお越しくださいませ。 | またおこしくださいませ。 | Please come again. |

Accepted variants:

- `meal-restroom`: レシートください / 領収書をお願いします
- `meal-serve`: クレジットカードでお願いします / カードで払います

The legacy `meal-*` IDs remain intentionally unchanged because bubble IDs are
stable test and navigation selectors even though this stage is now payment,
not meal placement.

## Difficulty

- Stage 1 uses the reusable `Xをお願いします` request twice. The menu request
  is about 11 morae; the coffee request is about 16 and gets short accepted
  variants to offset the katakana and long vowels.
- Stage 2 first recycles `Xをお願いします`, then introduces only
  `Xでお願いします`. Both targets are roughly 11–13 morae. Accepted variants
  cover the fragile loanwords レシート and カード.
- There are two learner-speaking bubbles per stage and no learner autoplay
  lines. All bundled autoplay audio therefore belongs to the visible staff
  character.

## Skip-safety and character-separation verdict

Pessimistic autoplay-only run:

> いらっしゃいませ。 → ご注文はお決まりですか。 → 本日のおすすめは、
> ブレンドコーヒーです。 → お決まりになりましたら、お呼びください。 →
> ありがとうございます。 → お会計は、レジでお願いします。 → 現金とカードが
> 使えます。 → ありがとうございました。 → またお越しくださいませ。

This remains a coherent staff service sequence when every learner bubble is
skipped or failed out. No staff line quotes, confirms, or relies on a learner
utterance.

The finished lines passed all four
[`character-separation-gate.md`](character-separation-gate.md) passes:

- **Leak scan:** every line performs a real service or customer action; no
  character explains the lesson or their role.
- **Knowledge ledger:** staff uses only café facts; learner uses only stated
  wants and information already heard.
- **Blind attribution:** service honorifics identify the staff, while short
  お願いします requests identify the learner.
- **Single-speaker read-through:** the staff remains concise and
  service-oriented; the learner remains a beginner making concrete requests.

Verdict: **pass**.

## Art and voice brief

### Scene and cover

- Quiet independent Japanese café, late afternoon, first-person customer
  viewpoint, with the counter and register visually credible in the same room.
- Adult, observational seinen slice-of-life treatment using newsprint, ink, and
  neutral screentone; the application alone supplies the deep-red accent.
- Full-bleed landscape and portrait compositions with the balloon-safe area
  opposite the staff character.
- No embedded menu, price, payment, dialogue, signage, or UI text.
- Cover should summarise a solitary café visit rather than burgers, beer, or a
  companion.

### Other-party character

- Quietly attentive café staff member in their late twenties or early thirties,
  realistic adult proportions, simple shirt and dark apron.
- Neutral, subtle positive, and mildly concerned states only.
- No learner sprite, childlike features, exaggerated reaction, or text.

### Voice and delivery

- Staff: adult Japanese woman, regionally neutral, clear medium pace,
  business-polite and routine rather than theatrical.
- All autoplay bubbles use this one visible staff voice. Learner lines are
  spoken by the learner and do not require a second autoplay voice.
- Delivery is even and practical. Greetings may be slightly warm; the order
  question has a natural questioning rise; all other lines are routine service
  statements.
- Pronunciation risks: 本日, ブレンドコーヒー, お会計, レジ, 現金, カード.
- Generate with the clean pinned native `Ono_Anna` preset and no acting
  instruction. Keep the model revision, voice, empty instruction, and
  per-line seed with the assets, then perform listening QA before release.

The existing café art pack already matches this brief and may be retained if it
passes the responsive composite review. The dialogue audio must be regenerated
because every previous clip except the voice identity targets obsolete text.
