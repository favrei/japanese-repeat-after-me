# Story: cooking-class — 二人の料理教室

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** All authoring
gates pass. The recipe is fictional vegetable curry; it is conversation
scaffolding, not a standalone cooking or food-safety guide.

## Situation

At an evening cooking class, the learner is paired with a regular participant
to make vegetable curry. They divide work, clarify sizes and sequence, adjust
the pot without guessing, plate the dish, and obtain the recipe for later.

What changes: **two strangers with ingredients become a working pair with a
finished dish and a reusable recipe.**

| Field | Decision |
| --- | --- |
| Learner | Adult first-time participant, N4 plain-polite Japanese; curious and sequence-minded. |
| Other party | One regular class participant throughout. |
| Length | 4 stages, 20 bubbles, 8 learner `speak` bubbles. |
| Working level | N4. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 分担 | Unpaired ingredients → jobs and spice amount shared | `class-counter` | `cooking-partner` | 平日の夜、調理台に二人分の材料が並んでいた。 |
| 2 下ごしらえ | Whole vegetables → sizes and preparation order agreed | `class-cutting` | `cooking-partner` | まな板の上に、玉ねぎとにんじんが置かれていた。 |
| 3 鍋 | Simmering uncertainty → water, roux sequence, and seasoning checked | `class-stove` | `cooking-partner` | 鍋の中で、野菜のスープが静かに煮えていた。 |
| 4 仕上げ | Cooked pot → plated dish, photo opportunity, and recipe obtained | `class-plating` | `cooking-partner` | 白い皿の横に、教室のレシピカードが置かれていた。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | へいじつのよる、ちょうりだいにふたりぶんのざいりょうがならんでいた。 | On a weeknight, ingredients for two were arranged on the worktop. |
| 2 | まないたのうえに、たまねぎとにんじんがおかれていた。 | An onion and carrots lay on the cutting board. |
| 3 | なべのなかで、やさいのすーぷがしずかににえていた。 | The vegetable broth simmered quietly in the pot. |
| 4 | しろいさらのよこに、きょうしつのれしぴかーどがおかれていた。 | A class recipe card lay beside a white plate. |

## Scene facts

- The class recipe and all ingredients are visible to both people; it makes two
  servings of vegetable curry.
- One participant cuts vegetables; the other prepares sauce. The recipe uses a
  small amount of chili, thin onion slices, and roughly two-centimeter carrots.
- The recipe says to stop the heat before adding roux. A class instructor exists
  offscreen but is not a speaking character.
- A photo table and class download site are posted visibly.

## Character cards

### Cooking partner

- **Wants:** finish the class recipe smoothly with an unfamiliar partner while
  keeping the work genuinely shared.
- **Knows:** only the same visible recipe, room layout, and site that the learner
  can inspect; they have attended before but are not the instructor.
- **Cannot know:** learner's spice tolerance, preferred task, or cooking skill.
- **Perceives:** ingredients, recipe, cuts, pot, taste, plating area, and signs.
- **Persona:** man, early 30s; warm light mid-range voice, relaxed.
- **Character:** collaborative and recipe-faithful. He offers a task and reads
  the next visible instruction without acting like a teacher; showing off,
  correcting personality, or inventing technique is wrong.
- **Voice fingerprint:** friendly polite です・ます; concrete kitchen verbs;
  sentence-final ね once at division; medium-short lines, few questions.
- **Never says:** “the right Japanese way,” expert claims, personal food
  assumptions, or praise that depends on a skipped learner line.

### Learner

- **Wants:** contribute equally, clarify sequence and quantities, and leave with
  a reproducible recipe.
- **Knows:** chosen task and what they see/taste at the station.
- **Cannot know:** partner's spice tolerance, recipe sizes, water correction,
  plating convention, or download route before checking.
- **Perceives:** every object and sign referenced.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** curious and sequence-minded. They ask before changing the food
  and propose one next step at a time; silent guessing, self-deprecation, or
  classroom deference is wrong.
- **Voice fingerprint:** plain です・ます; role statement, どのくらい,
  ～ておきましょう, ～たほうがいいですか, permission and request forms.
- **Never says:** 先生 to the partner, vague これでいいですか without a referent,
  or claims expertise.

## Dialogue

### Stage 1 — 分担

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `cooking-divide-vegetables` | O/A | 私は野菜を切りますね。 | わたしはやさいをきりますね。 | I'll cut the vegetables. |
| `cooking-divide-sauce` | L/S | じゃあ、私はソースを作ります。 | じゃあ、わたしはそーすをつくります。 | Then I'll make the sauce. |
| `cooking-divide-two` | O/A | 材料は二人分あります。 | ざいりょうはふたりぶんあります。 | We have ingredients for two servings. |
| `cooking-divide-spicy` | L/S | 辛いものは大丈夫ですか。 | からいものはだいじょうぶですか。 | Are you okay with spicy food? |
| `cooking-divide-chili` | O/A | 唐辛子は、少しだけ使います。 | とうがらしは、すこしだけつかいます。 | We'll use only a little chili. |

### Stage 2 — 下ごしらえ

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `cooking-prep-onion` | O/A | 玉ねぎは薄く切ります。 | たまねぎはうすくきります。 | We slice the onion thinly. |
| `cooking-prep-carrot-size` | L/S | にんじんはどのくらいの大きさに切りますか。 | にんじんはどのくらいのおおきさにきりますか。 | How large should I cut the carrots? |
| `cooking-prep-two-centimeters` | O/A | にんじんは、二センチぐらいです。 | にんじんは、にせんちぐらいです。 | About two centimeters for the carrots. |
| `cooking-prep-first` | L/S | 先に全部切っておきましょう。 | さきにぜんぶきっておきましょう。 | Let's cut everything first. |
| `cooking-prep-plate` | O/A | 切った野菜は、この皿に分けて置きます。 | きったやさいは、このさらにわけておきます。 | We'll keep the cut vegetables separated on this plate. |

### Stage 3 — 鍋

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `cooking-pot-water-low` | O/A | 鍋の水が少なくなっています。 | なべのみずがすくなくなっています。 | The water in the pot is getting low. |
| `cooking-pot-add-water` | L/S | 水を少し足したほうがいいですか。 | みずをすこしたしたほうがいいですか。 | Should we add a little water? |
| `cooking-pot-roux` | O/A | ルーは、火を止めてから入れます。 | るーは、ひをとめてからいれます。 | We add the roux after turning off the heat. |
| `cooking-pot-taste` | L/S | 味見してもいいですか。 | あじみしてもいいですか。 | May I taste it? |
| `cooking-pot-salt` | O/A | 塩は足さなくても大丈夫です。 | しおはたさなくてもだいじょうぶです。 | We don't need to add any salt. |

### Stage 4 — 仕上げ

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `cooking-finish-plate` | O/A | ご飯を左、カレーを右に盛ります。 | ごはんをひだり、かれーをみぎにもります。 | We plate the rice on the left and curry on the right. |
| `cooking-finish-more` | L/S | もう少しカレーをかけてもいいですか。 | もうすこしかれーをかけてもいいですか。 | May I add a little more curry? |
| `cooking-finish-photo` | O/A | 写真は、あちらの台で撮れます。 | しゃしんは、あちらのだいでとれます。 | You can take photos at the counter over there. |
| `cooking-finish-recipe` | L/S | レシピを送ってもらえますか。 | れしぴをおくってもらえますか。 | Could you send me the recipe? |
| `cooking-finish-download` | O/A | 教室のサイトからダウンロードできます。 | きょうしつのさいとからだうんろーどできます。 | You can download it from the class website. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `cooking-divide-sauce` | 私はソースを作ります / じゃあ、ソースを作ります |
| `cooking-divide-spicy` | 辛いものは食べられますか / 辛くても大丈夫ですか |
| `cooking-prep-carrot-size` | にんじんはどのくらいに切りますか / にんじんは何センチですか |
| `cooking-prep-first` | 全部先に切りましょう / 先に野菜を切っておきましょう |
| `cooking-pot-add-water` | 水を足しますか / もう少し水を入れたほうがいいですか |
| `cooking-pot-taste` | 味を見てもいいですか / 少し食べてもいいですか |
| `cooking-finish-more` | カレーをもう少しかけてもいいですか / もう少しかけます |
| `cooking-finish-recipe` | レシピをもらえますか / レシピはどこで見られますか |

## Review

### Reading and naturalness

Checked: 平日 へいじつ; 調理台 ちょうりだい; 二人分 ふたりぶん; 材料
ざいりょう; 唐辛子 とうがらし; 玉ねぎ たまねぎ; 薄く うすく; 二センチ
にせんち; 鍋 なべ; 煮える にえる; 味見 あじみ; 塩 しお; 盛る
もる; 撮れる とれる.

The partner never becomes an instructor: every factual line is on the shared
recipe or visible room sign. The learner's progression from dividing work to
requesting the recipe is practical rather than classroom-like.

### Pessimistic all-skip run

> 私は野菜を切りますね。／材料は二人分あります。／唐辛子は、少しだけ使います。／
> 玉ねぎは薄く切ります。／にんじんは、二センチぐらいです。／切った野菜は、この
> 皿に分けて置きます。／鍋の水が少なくなっています。／ルーは、火を止めてから
> 入れます。／塩は足さなくても大丈夫です。／ご飯を左、カレーを右に盛ります。／
> 写真は、あちらの台で撮れます。／教室のサイトからダウンロードできます。

Shared recipe and signs support every partner line; none assumes learner work.

## Difficulty verdict

- Requested level: N4
- Learner production: N4
- Listening/comprehension: N4
- Overall: **N4**
- Confidence: high
- Practice load: moderate; one long size question and several loanwords

The story sustains familiar food, size, sequence, permission, suggestion, and
simple condition language. No connected explanation or unexpected negotiation
raises it to N3.

## Character separation gate

- **A: pass.** Partner cooks rather than teaches; no author or curriculum voice.
- **B: pass.** Every fact comes from the shared recipe, visible pot, taste, or
  posted photo/download information.
- **C: pass.** Partner owns recipe-faithful declaratives; learner owns division,
  questions, suggestions, and requests.
- **D: pass.** Partner stays collaborative, learner stays curious and sequence-
  minded from first task through recipe retrieval.
- **E: pass.** Every declared trait reaches a line; no expertise, correction
  performance, or self-deprecation appears.

Verdict: **pass, all five passes.**
