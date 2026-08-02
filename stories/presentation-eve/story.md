# Story: presentation-eve — プレゼン前夜

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** All authoring
gates pass. This is deliberately the advanced story in the slate: N3 core with
an N2 professional-coordination stretch.

## Situation

The night before a ten-minute client presentation, the learner and a coworker
narrow the deck, distinguish provisional from confirmed data, and rehearse to
time. The next morning, the learner answers a bounded cost question and commits
to a written follow-up where the facts are not yet confirmed.

What changes: **an unfinished, overlong deck becomes a timed presentation with
one client question answered and one explicitly scoped follow-up.**

| Field | Decision |
| --- | --- |
| Learner | Adult project lead, N3/N2 polite professional Japanese; calm integrator. |
| Other parties | Data-focused coworker; client project manager. |
| Length | 4 stages, 20 bubbles, 8 learner `speak` bubbles. |
| Working level | N3 core / N2 stretch. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 絞る | Unfinished broad deck → three priorities and slide allocation agreed | `office-screen-wide` | `presentation-coworker` | 夜、会議室のモニターに未完成の資料が映っていた。 |
| 2 数字 | Mixed data status → provisional values clearly separated from confirmed data | `office-screen-chart` | `presentation-coworker` | スライドの中央に、作業時間のグラフが大きく表示された。 |
| 3 練習 | Twelve-minute run → ten-minute run with terminology and Q&A time fixed | `office-rehearsal` | `presentation-coworker` | 時計の針が九時を回り、机に発表用のメモが並んだ。 |
| 4 質問 | Prepared deck → bounded cost answer and written follow-up commitment | `client-meeting` | `client-manager` | 翌朝、顧客の会議室に同じ資料が映し出された。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | よる、かいぎしつのもにたーにみかんせいのしりょうがうつっていた。 | At night, an unfinished deck was displayed on the meeting-room monitor. |
| 2 | すらいどのちゅうおうに、さぎょうじかんのぐらふがおおきくひょうじされた。 | A work-time chart filled the center of the slide. |
| 3 | とけいのはりがくじをまわり、つくえにはっぴょうようのめもがならんだ。 | The clock passed nine, and presentation notes lined the table. |
| 4 | よくあさ、こきゃくのかいぎしつにおなじしりょうがうつしだされた。 | The next morning, the same deck appeared in the client's meeting room. |

## Scene facts

- The presentation is a fictional software rollout proposal. It has a ten-
  minute slot, client concern about introduction timing, and cost detail that
  can move to an appendix.
- The chart contains confirmed data through last month and provisional numbers
  for the current month. Labels and status are visible to both coworkers.
- The first rehearsal takes twelve minutes and retains two specialist terms.
- Contract notes visible to the learner establish that a delay within one month
  has no added charge. Two months or more requires case-specific confirmation.
- The learner never invents the unconfirmed answer; they promise a written
  response by the next day including assumptions.

## Character cards

### Presentation coworker

- **Wants:** make the deck accurate, defensible, and short enough to present.
- **Knows:** audience concern, data status, slide content, rehearsal timing, and
  specialist terms.
- **Cannot know:** final client question or unconfirmed commercial consequence.
- **Perceives:** monitor, chart labels, clock, notes, and appendix.
- **Persona:** woman, early 30s; crisp mid-low voice, quick and controlled.
- **Character:** analytical and unsentimental about slides. She cuts, labels,
  and times evidence rather than defending authorship; vague praise, ownership
  anxiety, or deference to bad content is wrong.
- **Voice fingerprint:** neutral professional です・ます; exact time/status nouns;
  compact declaratives; she names constraints, rarely asks.
- **Never says:** “my slide,” ungrounded confidence, client mind-reading, or
  criticism of the learner personally.

### Client manager

- **Wants:** understand cost exposure if the client's own rollout is delayed and
  obtain a written statement of assumptions.
- **Knows:** their schedule may slip by two months and what written clarity they
  require.
- **Cannot know:** vendor policy beyond the presentation and contract note.
- **Perceives:** slide, people, and written materials.
- **Persona:** man, late 50s; deep neutral voice, deliberate and concise.
- **Character:** skeptical but fair. He tests consequence, adds one real
  scenario, and requests evidence; hostility, trick questions, or praise are
  wrong.
- **Voice fingerprint:** formal-polite; 場合/影響/可能性/前提条件; short dense
  questions and requests, no filler.
- **Never says:** catches the learner out, invents vendor facts, or negotiates
  unrelated terms.

### Learner

- **Wants:** turn the evidence into a short client-centered explanation, then
  answer only within known bounds.
- **Knows:** contract note, project priorities, and what the coworker identifies
  on screen.
- **Cannot know:** unconfirmed current data or two-month commercial consequence.
- **Perceives:** all deck, chart, clock, and contract evidence referenced.
- **Persona:** default unmarked adult, 30s–40s; neutral mid-range voice, composed.
- **Character:** calm integrator. They turn constraints into proposals and mark
  uncertainty explicitly; bluffing, over-apology, or abstract corporate filler
  is wrong.
- **Voice fingerprint:** professional です・ます; ～ませんか proposals,
  condition-result, 暫定値/明記, bounded commitments; learner links facts but
  keeps each turn to one claim.
- **Never says:** definitely where evidence is provisional, buzzword strings,
  staff keigo, or promises beyond authority.

## Dialogue

### Stage 1 — 絞る

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `presentation-scope-ten` | O/A | 明日の説明は、十分しかありません。 | あしたのせつめいは、じゅっぷんしかありません。 | We have only ten minutes for tomorrow's presentation. |
| `presentation-scope-three` | L/S | 一番伝えたい点を、三つに絞りませんか。 | いちばんつたえたいてんを、みっつにしぼりませんか。 | Shall we narrow it to the three most important points? |
| `presentation-scope-timing` | O/A | 顧客は、導入時期を最も気にしています。 | こきゃくは、どうにゅうじきをもっともきにしています。 | The client is most concerned about the rollout timing. |
| `presentation-scope-first` | L/S | では、最初にスケジュールを説明します。 | では、さいしょにすけじゅーるをせつめいします。 | Then I'll explain the schedule first. |
| `presentation-scope-appendix` | O/A | 費用の詳細は、補足資料に移します。 | ひようのしょうさいは、ほそくしりょうにうつします。 | We'll move the cost details to the appendix. |

### Stage 2 — 数字

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `presentation-data-last-month` | O/A | このグラフは、先月までのデータです。 | このぐらふは、せんげつまでのでーたです。 | This chart contains data through last month. |
| `presentation-data-current` | L/S | 今月の数字も入れたほうがいいと思います。 | こんげつのすうじもいれたほうがいいとおもいます。 | I think we should include this month's figures too. |
| `presentation-data-unconfirmed` | O/A | 今月分は、まだ確定していません。 | こんげつぶんは、まだかくていしていません。 | This month's figures aren't final yet. |
| `presentation-data-provisional` | L/S | 暫定値だと明記して、傾向だけ示しませんか。 | ざんていちだとめいきして、けいこうだけしめしませんか。 | Shall we label them provisional and show only the trend? |
| `presentation-data-note` | O/A | 注記を付けて、確定値とは分けて表示します。 | ちゅうきをつけて、かくていちとはわけてひょうじします。 | We'll add a note and display them separately from the final figures. |

### Stage 3 — 練習

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `presentation-rehearse-twelve` | O/A | 今の説明は、十二分かかりました。 | いまのせつめいは、じゅうにふんかかりました。 | That presentation took twelve minutes. |
| `presentation-rehearse-example` | L/S | 事例を一つ減らせば、二分短くできます。 | じれいをひとつへらせば、にふんみじかくできます。 | If we remove one example, we can shorten it by two minutes. |
| `presentation-rehearse-jargon` | O/A | 専門用語が二か所残っています。 | せんもんようごがにかしょのこっています。 | Two specialist terms remain. |
| `presentation-rehearse-client-language` | L/S | 顧客向けの言い方に変えましょう。 | こきゃくむけのいいかたにかえましょう。 | Let's change them into client-friendly language. |
| `presentation-rehearse-questions` | O/A | 最後に質問の時間を二分取ります。 | さいごにしつもんのじかんをにふんとります。 | We'll leave two minutes for questions at the end. |

### Stage 4 — 質問

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `presentation-question-impact` | O/A | 導入が遅れた場合、費用への影響はありますか。 | どうにゅうがおくれたばあい、ひようへのえいきょうはありますか。 | If rollout is delayed, will it affect the cost? |
| `presentation-question-one-month` | L/S | 一か月以内の遅れなら、追加費用は発生しません。 | いっかげついないのおくれなら、ついかひようははっせいしません。 | A delay of up to one month will not incur an additional charge. |
| `presentation-question-two-months` | O/A | 二か月以上遅れる可能性もあります。 | にかげついじょうおくれるかのうせいもあります。 | There is also a possibility of a delay of two months or more. |
| `presentation-question-followup` | L/S | 条件を確認して、明日回答します。 | じょうけんをかくにんして、あしたかいとうします。 | I'll confirm the conditions and respond tomorrow. |
| `presentation-question-written` | O/A | 書面には、前提条件も含めてください。 | しょめんには、ぜんていじょうけんもふくめてください。 | Please include the assumptions in the written response. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `presentation-scope-three` | 重要な点を三つに絞りませんか / 三つのポイントにまとめませんか |
| `presentation-scope-first` | 最初にスケジュールから説明します / まず導入時期を説明します |
| `presentation-data-current` | 今月のデータも入れたほうがいいと思います / 今月分も入れませんか |
| `presentation-data-provisional` | 暫定値と書いて、傾向だけ見せませんか / 確定前だと明記しませんか |
| `presentation-rehearse-example` | 事例を一つ減らすと、二分短くなります / 例を一つ削りましょう |
| `presentation-rehearse-client-language` | 顧客に分かりやすい言い方に変えましょう / 専門用語を言い換えましょう |
| `presentation-question-one-month` | 一か月以内なら、追加費用はありません / 一か月までの遅れは追加料金なしです |
| `presentation-question-followup` | その場合は、条件を確認して明日までに回答します / 明日までに書面で回答します |

## Review

### Reading and naturalness

Checked: 未完成 みかんせい; 十分 じゅっぷん; 三つ みっつ; 絞る しぼる;
顧客 こきゃく; 導入時期 どうにゅうじき; 費用 ひよう; 補足資料
ほそくしりょう; 作業時間 さぎょうじかん; 確定 かくてい; 暫定値
ざんていち; 明記 めいき; 傾向 けいこう; 注記 ちゅうき; 十二分
じゅうにふん; 二分 にふん; 二か所 にかしょ; 前提条件 ぜんていじょうけん;
書面 しょめん.

The draft removed generic business filler (検討します, シナジー, 認識を
合わせる) in favor of decisions tied to visible evidence. The learner never
claims the two-month answer is known.

### Pessimistic all-skip run

> 明日の説明は、十分しかありません。／顧客は、導入時期を最も気にしています。／
> 費用の詳細は、補足資料に移します。／このグラフは、先月までのデータです。／今月
> 分は、まだ確定していません。／注記を付けて、確定値とは分けて表示します。／今の
> 説明は、十二分かかりました。／専門用語が二か所残っています。／最後に質問の
> 時間を二分取ります。／導入が遅れた場合、費用への影響はありますか。／二か月以上
> 遅れる可能性もあります。／書面には、前提条件も含めてください。

Coworker facts are visible deck/timing evidence. Client questions remain
coherent unanswered and never assume a learner claim.

## Difficulty verdict

- Requested level: N3/N2
- Learner production: N3 core / N2 stretch
- Listening/comprehension: N2
- Overall: **N3 core / N2 stretch**
- Confidence: high
- Practice load: high but controlled; eight connected professional targets,
  each one claim

N3 covers connected workplace coordination, timing, clear proposals, and
straightforward conditions. N2 stretch is sustained by provisional-vs-confirmed
evidence, audience adaptation, consequence, bounded commitment, and formal
assumption language. No line is difficult only because it is long.

## Character separation gate

- **A: pass.** Coworker edits evidence, client tests consequence, learner makes
  decisions; no productivity lecture or corporate-author voice.
- **B: pass.** Every constraint is visible in deck, chart, clock, contract note,
  or client's own schedule.
- **C: pass.** Crisp evidence declaratives belong coworker; consequence questions
  belong client; integrative proposals and bounded commitments belong learner.
- **D: pass.** Coworker stays unsentimental, client skeptical/fair, learner calm
  and explicit about uncertainty.
- **E: pass.** Every declared trait reaches dialogue; no praise, hostility,
  ownership anxiety, bluffing, or buzzwords appear.

Verdict: **pass, all five passes.**
