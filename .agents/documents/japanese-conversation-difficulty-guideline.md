# Japanese Conversation Difficulty Guideline

An authoring and review standard for labeling a scripted conversation `N5`,
`N4`, `N3`, `N2`, or `N1`.

**Status:** project guideline, researched 2026-08-01. The labels are
**JLPT-anchored estimates for conversation content**, not official JLPT
speaking scores.

Use this document in two directions:

1. **Authoring:** “Write an N4 conversation for this situation.”
2. **Assessment:** “What level is this conversation, and why?”

This document complements [`stage-design-flow.md`](stage-design-flow.md).
That flow still controls stage size, mora length, recognition fragility,
skip-safety, character separation, and the application data shape. This
guideline controls the Japanese-language level of the content.

## The essential limitation

The Japanese-Language Proficiency Test (JLPT) tests language knowledge,
reading, and listening. It does **not** contain a conversation or composition
test. Its official N1-N5 summaries therefore describe comprehension, not the
ability to produce or negotiate spoken Japanese.

The project uses a transparent hybrid:

- official JLPT descriptions anchor vocabulary, grammar, reading burden, and
  listening burden;
- the Japan Foundation's JF Standard anchors production and interaction;
- the project's examples and decision rules turn those sources into a
  repeatable conversation-content review.

Always call the result a **conversation difficulty estimate**. Never say that
a script “passes JLPT N4 speaking,” because no such JLPT test exists.

## What the official sources establish

### JLPT levels

The official summary describes the progression this way:

| Level | Official comprehension emphasis | Conversation implication for this project |
| --- | --- | --- |
| N5 | Some basic Japanese; short, slowly spoken exchanges on regularly encountered daily or classroom topics | Very short, direct, formulaic turns about concrete needs |
| N4 | Basic Japanese; familiar daily passages and daily-life conversations when spoken slowly | Predictable daily exchanges with simple reasons, choices, and plans |
| N3 | Everyday Japanese to a certain degree; coherent daily conversation at near-natural speed | Connected everyday or routine workplace talk, including explanations and straightforward opinions |
| N2 | Everyday Japanese plus a wider variety of settings; coherent material at nearly natural speed | Longer connected turns, indirect requests, comparison, justification, negotiation, and reliable register control |
| N1 | Japanese in a broad variety of circumstances; logical or abstract content and natural-speed material | Nuanced professional or abstract discussion, implicit intent, flexible style, and sustained argument |

N3 is explicitly the bridge between basic N4/N5 and the broader real-life
Japanese of N1/N2. A dialogue close to that boundary should be reported as,
for example, `N4 core / N3 stretch`, not forced into false precision.

### The current JLPT-to-CEFR reference

Beginning with the December 2025 test, a passing JLPT score report can show a
Common European Framework of Reference for Languages (CEFR) level for
reference:

| JLPT result | CEFR reference shown for a passing result |
| --- | --- |
| N5, 80 or higher | A1 |
| N4, 90 or higher | A2 |
| N3, 95-103 / 104 or higher | A2 / B1 |
| N2, 90-111 / 112 or higher | B1 / B2 |
| N1, 100-141 / 142 or higher | B2 / C1 |

This link covers the **linguistic and reception** competence tested by JLPT.
It excludes CEFR production and interaction. The table is useful as an anchor,
not as an official conversion from a conversation to a JLPT level.

For this project, the interaction anchors are therefore:

| Project label | Interaction anchor, used cautiously |
| --- | --- |
| N5 | A1-like |
| N4 | A2-like |
| N3 | transition from strong A2 to B1 |
| N2 | transition from strong B1 to B2 |
| N1 | transition from strong B2 to C1 |

### Why there are no official vocabulary, kanji, or grammar counts here

The JLPT organizers stopped publishing the old Test Content Specifications
after the 2010 revision. Their explanation is that communicative task
performance matters in addition to memorizing lists of vocabulary, kanji, and
grammar.

Consequences:

- do not use an unofficial claim such as “N4 equals exactly 1,500 words” as a
  pass/fail rule;
- do not promote a conversation because it contains one supposedly advanced
  grammar form;
- use official sample questions to calibrate receptive difficulty and item
  form, not as a complete syllabus;
- judge what the language asks the learner to understand and do.

### What the official JLPT speaking Can-do table contributes

The JLPT Can-do speaking list comes from self-evaluations by successful
examinees, including examinees near each passing line. It is useful evidence,
but it is neither a syllabus nor a guarantee.

The progression in its examples is informative:

- easier end: introduce oneself, answer simple personal questions, use common
  phrases in shops or stations, and talk about hobbies;
- middle: join familiar daily conversation, arrange a meeting, explain wants
  and conditions, give directions, or discuss plans with friends or coworkers;
- harder end: change between polite and casual Japanese, explain causes,
  discuss current topics, and present a logical opinion in debate.

The percentage bands overlap heavily between adjacent N levels. That overlap
is evidence for reporting boundary cases honestly.

## The five project level profiles

Each profile describes the **highest sustained burden**, not every form that
may appear once.

### N5 - survival phrases in a fully predictable exchange

**Task and topic**

- immediate, concrete needs: greeting, identity, time, place, price, a simple
  purchase, or a classroom instruction;
- one visible situation with almost no background information;
- the answer is usually a name, number, object, yes/no, or one memorized
  preference.

**Language and discourse**

- isolated words, fixed expressions, and very short clauses;
- basic copula and common verb/adjective forms;
- simple particles and question words;
- connection mainly with `と`, `も`, `そして`, or a direct sequence of turns;
- little or no ellipsis that requires inference.

**Listening and interaction**

- slow, clear, directly addressed speech;
- repetition or rephrasing may be needed;
- the other person carries the interaction;
- no register switching, negotiation, hidden refusal, or abstract opinion.

**Typical learner can-do:** provide or request one concrete piece of
information in a memorized pattern.

### N4 - simple daily life with a reason or choice

**Task and topic**

- familiar daily activities: meals, shopping, transport, schedules, health,
  weather, simple workplace arrangements, and weekend plans;
- short predictable transactions or social exchanges;
- one uncomplicated constraint, preference, reason, or choice.

**Language and discourse**

- basic sentence patterns plus common inflections;
- short clause linking for time, reason, contrast, permission, desire, or
  intention;
- examples include `～ませんか`, `～たい`, `～てもいい`, `～から/ので`,
  `～たあとで`, `～と思う`, and simple comparisons;
- usually one main idea per sentence and an explicit referent.

**Listening and interaction**

- slow to moderate, clear standard Japanese;
- can answer simple questions and respond to simple statements;
- can propose, accept, decline simply, ask for clarification, and settle a
  time or place;
- polite `です・ます` is stable, but nuanced style switching is not required.

**Typical learner can-do:** complete a short familiar exchange and add a
simple reason, condition, preference, or plan.

### N3 - connected everyday or routine workplace conversation

**Task and topic**

- familiar everyday and workplace matters that require several connected
  facts;
- explain a small problem, give a reason, compare options, describe experience,
  or state a straightforward opinion;
- handle a mildly unexpected but ordinary development.

**Language and discourse**

- multiple clauses with clear relations among time, reason, condition, and
  result;
- a mix of basic and intermediate patterns rather than a chain of memorized
  phrases;
- connected turns using forms such as `～ことになっている`, `～ようにする`,
  `～てしまう`, `～ば/なら`, reported speech, and relative clauses when they
  serve the task;
- can link points into a short linear explanation.

**Listening and interaction**

- clear near-natural speed on familiar topics;
- can initiate, maintain, and close a simple conversation;
- can confirm understanding, explain a problem, and give a reason for an
  opinion;
- some hesitation or request for repetition remains natural.

**Typical learner can-do:** keep a familiar conversation going without every
turn being prepackaged.

### N2 - flexible everyday and professional coordination

**Task and topic**

- a broad range of everyday, public, academic, or workplace matters;
- negotiate priorities, compare tradeoffs, explain consequences, make an
  indirect request, or justify a recommendation;
- follow another speaker's position across a longer exchange.

**Language and discourse**

- connected paragraphs or several substantial turns;
- embedded clauses, nominalization, passive/causative choices, concessive
  relations, hypothetical consequences, and controlled indirectness;
- some complex sentence forms, but not complexity for display;
- vocabulary can carry policy, process, risk, evidence, or professional detail
  beyond immediate daily needs.

**Listening and interaction**

- nearly natural speed in everyday and varied settings;
- can take and yield turns, confirm shared understanding, clarify a position,
  and help a discussion advance;
- uses polite, neutral, and casual choices appropriately in common situations;
- errors should not normally cause misunderstanding.

**Typical learner can-do:** explain and defend a practical position while
adapting to the other speaker.

### N1 - nuanced, abstract, or high-stakes professional discussion

**Task and topic**

- abstract, unfamiliar, specialized, or socially delicate issues;
- analyze causes, implications, exceptions, evidence, and competing values;
- negotiate nuance or interpret a position that is partly implicit.

**Language and discourse**

- sustained, well-structured reasoning with subordinate points and a clear
  conclusion;
- flexible paraphrase, qualification, emphasis, stance, and idiomatic or
  colloquial expression where appropriate;
- precise vocabulary for subtle distinctions;
- complex forms support meaning rather than merely making the sentence long.

**Listening and interaction**

- natural speed across a wide range of settings;
- follows relationships, logical structure, essential points, attitude, and
  implications;
- responds flexibly with indirect suggestion, tact, humor, or controlled
  disagreement;
- can maintain a discussion without the topic or wording being simplified.

**Typical learner can-do:** develop a precise, nuanced position and integrate
it naturally into a complex exchange.

## Authored calibration examples

These are original project examples, not JLPT questions. They isolate the
dominant difference among levels; real stories may be longer.

### N5 example - buy water

| Speaker | Japanese | Reading | Natural English |
| --- | --- | --- | --- |
| Clerk | いらっしゃいませ。 | いらっしゃいませ。 | Welcome. |
| Learner | この水をください。 | このみずをください。 | This water, please. |
| Clerk | 百二十円です。 | ひゃくにじゅうえんです。 | That will be 120 yen. |
| Learner | はい、どうぞ。 | はい、どうぞ。 | Here you are. |

**Why N5:** one concrete purchase, fixed expressions, a demonstrative, a
number, the copula, and no explanation or inference.

### N4 example - order with a dietary restriction

| Speaker | Japanese | Reading | Natural English |
| --- | --- | --- | --- |
| Staff | ご注文はお決まりですか。 | ごちゅうもんはおきまりですか。 | Are you ready to order? |
| Learner | 野菜のカレーをお願いします。 | やさいのかれーをおねがいします。 | The vegetable curry, please. |
| Learner | 肉が食べられないので、肉は入れないでください。 | にくがたべられないので、にくはいれないでください。 | I cannot eat meat, so please leave it out. |
| Staff | わかりました。 | わかりました。 | Certainly. |

**Why N4:** a familiar transaction, a simple request, ability/constraint,
reason with `ので`, and `～ないでください`. Every reference is explicit and
the exchange remains predictable.

### N3 example - report a lost item

| Speaker | Japanese | Reading | Natural English |
| --- | --- | --- | --- |
| Station staff | どうしましたか。 | どうしましたか。 | What happened? |
| Learner | 電車に傘を忘れてしまったようです。 | でんしゃにかさをわすれてしまったようです。 | It seems I left my umbrella on the train. |
| Station staff | 何時ごろ、どの電車に乗りましたか。 | なんじごろ、どのでんしゃにのりましたか。 | Around what time, and which train did you take? |
| Learner | 十時ごろ、新宿行きの電車に乗りました。 | じゅうじごろ、しんじゅくゆきのでんしゃにのりました。 | Around ten, I took a train bound for Shinjuku. |
| Learner | 傘は終点に届いているかもしれません。 | かさはしゅうてんにとどいているかもしれません。 | The umbrella may have reached the terminal station. |

**Why N3:** the learner explains a small problem, supplies connected time and
route details, marks an unintended result with `～てしまう`, and expresses an
uncertain conclusion with `～かもしれない`.

### N2 example - request an urgent repair

| Speaker | Japanese | Reading | Natural English |
| --- | --- | --- | --- |
| Resident | 先週からエアコンの調子が悪く、修理していただけないかと思ってご連絡しました。 | せんしゅうからえあこんのちょうしがわるく、しゅうりしていただけないかとおもってごれんらくしました。 | The air conditioner has not been working properly since last week, so I am calling to ask whether you could repair it. |
| Manager | 確認には伺えますが、部品が必要な場合は、交換まで数日かかる可能性があります。 | かくにんにはうかがえますが、ぶひんがひつようなばあいは、こうかんまですうじつかかるかのうせいがあります。 | We can come inspect it, but if parts are needed, replacement may take several days. |
| Resident | 暑さで仕事に支障が出ているため、応急処置だけでも早めにお願いできないでしょうか。 | あつさでしごとにししょうがでているため、おうきゅうしょちだけでもはやめにおねがいできないでしょうか。 | The heat is affecting my work, so could you at least arrange a temporary fix soon? |

**Why N2:** indirect requests, respectful role-sensitive language, a
condition and consequence, service-process vocabulary, and negotiation of an
interim alternative.

### N1 example - discuss a tourism policy

| Speaker | Japanese | Reading | Natural English |
| --- | --- | --- | --- |
| Resident | 観光客の増加は地域経済に貢献する一方、生活環境への負担も看過できません。 | かんこうきゃくのぞうかはちいきけいざいにこうけんするいっぽう、せいかつかんきょうへのふたんもかんかできません。 | Although increased tourism contributes to the local economy, its burden on residents' living environment cannot be overlooked. |
| Official | 規制を一律に強化するのではなく、混雑の度合いに応じて対策を変える仕組みが現実的だと考えています。 | きせいをいちりつにきょうかするのではなく、こんざつのどあいにおうじてたいさくをかえるしくみがげんじつてきだとかんがえています。 | Rather than tighten restrictions uniformly, we believe a system that adjusts measures according to congestion would be realistic. |
| Resident | 効果を検証できるよう、住民への影響を継続的に測る指標も設けるべきでしょう。 | こうかをけんしょうできるよう、じゅうみんへのえいきょうをけいぞくてきにはかるしひょうももうけるべきでしょう。 | We should also establish indicators that continuously measure the impact on residents so the policy's effectiveness can be evaluated. |

**Why N1:** abstract public policy, competing values, qualification,
proportional response, evaluation criteria, precise stance, and a structured
recommendation.

## Repeatable assessment test

Run this after drafting and whenever someone asks, “What level is this
conversation, and why?”

### Step 1 - identify what is being rated

Record:

- situation and topic;
- speaker roles and relationship;
- which lines the learner must **understand**;
- which lines the learner must **produce**;
- assumed speed: slow, clear moderate, near-natural, or natural;
- whether the conversation is rehearsed, semi-predictable, or open-ended.

Do not rate text alone if delivery changes the burden. The same wording can be
N4 listening at a slow clear pace and N3 listening at near-natural speed with
ordinary reductions.

### Step 2 - rate five dimensions independently

Assign one N level to each dimension using the profiles above.

| Dimension | Question to answer |
| --- | --- |
| Task/topic | How concrete, familiar, predictable, abstract, or specialized is the purpose? |
| Language resources | What vocabulary, grammar, clause embedding, and precision are needed? |
| Discourse | Are turns isolated, simply linked, linearly explained, argued, or nuanced across several points? |
| Listening | What speed, density, ellipsis, inference, register, and speaker relationship must be understood? |
| Interaction | Must the learner only respond, or also maintain, repair, negotiate, adapt register, and manage implicit intent? |

Use the **lowest level that fully explains the sustained evidence**. One hard
word, one long sentence, or one advanced form is not enough to raise a whole
conversation.

### Step 3 - rate comprehension and production separately

Produce at least these two findings:

- **listening/comprehension level:** the hardest language the learner must
  understand to follow the scene and respond correctly;
- **learner-production level:** the hardest language the learner must say.

Role asymmetry matters. Natural service staff may use formulaic honorific
language that a beginner only needs to recognize. Report that honestly, for
example:

> Learner production: N4. Ambient listening: N3 because of staff register.
> Overall practice label: N4 core / N3 listening stretch.

Do not silently call the whole scene N4 if understanding an N3 line is
essential to the learner's next action.

### Step 4 - choose the sustained level

A level is **sustained** when both conditions hold:

1. at least three of the five dimensions are at that level or higher; and
2. the features occur across the conversation or in an essential turn, not in
   a decorative outlier.

Then apply these rules:

- If comprehension and production agree, use that level.
- If they differ by one level, use `<lower> core / <higher> stretch` and name
  the source of the stretch.
- If they differ by two or more levels, the conversation is mixed-level and
  must not receive a single label without revision.
- If one essential learner `speak` line is above the requested ceiling, the
  production target fails even when every other line is easier.
- Report a confidence of `high`, `medium`, or `low`. Boundary cases, missing
  audio, and dependence on an unofficial grammar classification lower
  confidence.

### Step 5 - check for false difficulty

Do not confuse language level with these separate burdens:

- a long reading-memory target;
- difficult pronunciation or phonetic recognition;
- rare proper nouns or product names;
- specialist facts explained in otherwise simple language;
- unnatural textbook wording;
- dense kanji that is fully visible while only speech is being assessed.

Record them under **practice load**, not as automatic JLPT-level evidence. A
35-mora N4 sentence may be a bad rehearsal target without becoming N2.

### Step 6 - return the verdict in this format

```markdown
## Difficulty verdict

- Requested level: N4
- Learner production: N4
- Listening/comprehension: N4
- Overall: N4
- Confidence: high
- Practice load: moderate; one 24-mora learner line

### Evidence

- Task/topic: N4 - familiar restaurant order with one dietary constraint.
- Language resources: N4 - request, potential form, reason, and prohibition.
- Discourse: N4 - short explicit turns; no extended explanation.
- Listening: N4 - predictable staff question and clear daily vocabulary.
- Interaction: N4 - order, explain a constraint, and request a change.

### Boundary check

- No sustained N3 evidence.
- The formulaic expression お決まりですか does not raise the level by itself.
- To make it N3, require explanation and alternatives after a problem.
```

## Worked assessment: the N4 restaurant example

Question: **What is the level of the restaurant conversation above, and why?**

Verdict: **N4, high confidence.**

| Dimension | Rating | Evidence |
| --- | --- | --- |
| Task/topic | N4 | Familiar restaurant order with one dietary constraint |
| Language resources | N4 | A simple request, potential form, `ので`, and `～ないでください` |
| Discourse | N4 | Explicit short turns with one idea at a time |
| Listening | N4 | Predictable staff question and clear daily vocabulary |
| Interaction | N4 | Order an item, explain a constraint, and request a simple change |

The polite staff expression `お決まりですか` does not raise the exchange by
itself because it is formulaic and the situation makes its function clear. To
create an N3 version, introduce an unavailable ingredient or mistaken order
and require the learner to explain the problem and compare alternatives.

## Authoring gate for a requested level

When the user requests an `Nx` conversation:

1. Write the situation and Can-do first: what must the learner accomplish?
2. Draft learner `speak` lines before the surrounding lines, following the
   stage design flow.
3. Run the five-dimension assessment on the draft.
4. Confirm every essential learner line is at or below the requested
   production level.
5. Confirm essential listening is at or below that level, or label and justify
   a one-level stretch.
6. Remove decorative advanced forms that do not serve character, task, or
   naturalness.
7. Validate readings and translations.
8. Run the existing mora-length, phonetic-fragility, skip-safety, character
   separation, and art/voice gates separately.
9. Record the final verdict and its evidence with the authored story.

### Tightening or raising a draft

To make a conversation **easier**, change these in order:

1. make the task more predictable and concrete;
2. make referents and intent explicit;
3. shorten the learner's plan to one idea per turn;
4. replace embedded or concessive relations with direct sentences;
5. slow and clarify the other party's delivery;
6. broaden accepted learner variants;
7. reduce memory and phonetic load.

To make it **harder without becoming artificial**:

1. introduce a real complication or competing goal;
2. require an explanation, comparison, or justified decision;
3. make the learner connect several facts across turns;
4. add natural indirectness, register choice, or implied intent;
5. broaden the topic from concrete action to consequence, policy, or values;
6. increase delivery toward natural speed only when audio remains clear.

Never raise a level by sprinkling in rare kanji, obsolete grammar, or long
sentences that a real person would not say.

## Research sources

Primary sources were preferred throughout.

- [JLPT: N1-N5 Summary of Linguistic Competence Required for Each Level](https://www.jlpt.jp/e/about/levelsummary.html)
  - official reading and listening descriptions and N3's bridging role.
- [JLPT FAQ](https://www.jlpt.jp/e/faq/)
  - confirms that the test has no conversation or composition section;
    explains why official vocabulary, kanji, and grammar specification lists
    are no longer published; points to official samples and workbooks.
- [JLPT Can-do Self-Evaluation List](https://www.jlpt.jp/e/about/candolist.html)
  and [Speaking table](https://www.jlpt.jp/e/about/candolist_speaking.html)
  - survey-based examples of what successful examinees believe they can do;
    explicitly not a syllabus or guarantee.
- [JLPT: Indication of the CEFR Level for Reference](https://www.jlpt.jp/e/about/cefr_reference.html)
  - current score ranges, introduction from the December 2025 JLPT, and the
    explicit exclusion of production and interaction.
- [JLPT official sample questions](https://www.jlpt.jp/e/samples/forlearners.html)
  - one example of each item type by level; useful for receptive calibration,
    not a complete syllabus.
- [JF Standard overview](https://www.jfstandard.jpf.go.jp/summaryen/ja/render.do)
  - task-based Can-do framework, A1-C2 levels, and the separation of receptive,
    productive, and interactive activities.
- [JF Standard for Japanese-Language Education Guidebook for Users](https://www.jfstandard.jpf.go.jp/pdf/web_whole_en.pdf)
  - interaction characteristics by level and the qualitative spoken-language
    dimensions of range, accuracy, fluency, interaction, and coherence.
- [Agency for Cultural Affairs: Reference Framework for Japanese-Language Education](https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/92664201_01.pdf)
  - Japanese-language proficiency by A1-C2 and by separate activities,
    including spoken interaction.

## Maintenance rule

Recheck the official JLPT CEFR page when score-report policy changes. Revise
the project examples and decision rules only when actual authored
conversations expose a repeatable ambiguity; do not replace the rubric with an
unofficial word-count list.
