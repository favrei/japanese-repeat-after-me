# Story: neighborhood-clinic — 町のクリニック

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** The medical
communication shape was checked against Japan Ministry of Health, Labour and
Welfare (MHLW) foreign-patient materials. The script is language practice, not
medical advice; actual instructions must come from the treating professionals
and the medicine label. All authoring gates pass. Casts remain candidates.

## Situation

The learner visits a neighborhood clinic without an appointment for a sore
throat, fever, and mild cough. They register, give the nurse the relevant
symptom and allergy facts, ask the doctor about testing, and confirm the
prescribed medicine instructions at a pharmacy.

What changes: **an unexplained illness becomes a professionally assessed visit
with written, clarified medication instructions.**

| Field | Decision |
| --- | --- |
| Learner | Adult resident, N4 plain-polite Japanese; concise and safety-conscious. |
| Other parties | Receptionist, nurse, doctor, pharmacist. |
| Length | 4 stages, 22 bubbles, 9 learner `speak` bubbles. |
| Working level | N4 production / N3 listening stretch. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 受付 | Unregistered walk-in → identity and questionnaire route established | `clinic-reception` | `receptionist` | 午前、町のクリニックの受付に問診票が並んでいた。 |
| 2 症状 | Unstructured complaint → onset, temperature, cough, and allergy status recorded | `clinic-intake` | `nurse` | 受付のカウンターに、書き終えた問診票が置かれていた。 |
| 3 診察 | Symptoms recorded → examination observation and test plan understood | `exam-room` | `doctor` | 診察室の机に、体温の記録と問診票が置かれていた。 |
| 4 薬 | Medicine received → frequency, timing, and drowsiness precaution understood | `pharmacy-counter` | `pharmacist` | 夕方、薬局のカウンターに薬の袋が置かれていた。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | ごぜん、まちのくりにっくのうけつけにもんしんひょうがならんでいた。 | In the morning, medical questionnaires were arranged at the neighborhood clinic reception. |
| 2 | うけつけのかうんたーに、かきおえたもんしんひょうがおかれていた。 | A completed medical questionnaire lay on the reception counter. |
| 3 | しんさつしつのつくえに、たいおんのきろくともんしんひょうがおかれていた。 | The temperature record and questionnaire lay on the examination-room desk. |
| 4 | ゆうがた、やっきょくのかうんたーにくすりのふくろがおかれていた。 | In the evening, a medicine bag rested on the pharmacy counter. |

## Scene facts

- The clinic accepts walk-ins in this fictional scene and displays Japanese and
  English questionnaires.
- The learner has a fictional insurance card and ID; no real identity appears.
- The nurse has measured a temperature of 38°C. The learner has had a sore
  throat since the previous night, a mild cough, and no known medicine allergy.
- The doctor performs the visible throat examination and chooses a nonspecific
  infection test. No diagnosis is claimed in the script.
- The pharmacist has the actual fictional prescription and written directions;
  all medication statements refer only to that item.

## Character cards

### Receptionist

- **Wants:** register the walk-in with the documents and questionnaire they can
  actually use.
- **Knows:** intake process, accepted documents, and available language forms.
- **Cannot know:** symptoms, diagnosis, insurance coverage result, or medicine.
- **Perceives:** person at desk, cards, forms, and appointment list.
- **Persona:** woman, late 30s; clear neutral mid-range voice, brisk but calm.
- **Character:** administratively exact and solution-first. She offers the next
  form, never medical interpretation; diagnosis questions or emotional comfort
  are wrong.
- **Voice fingerprint:** business-polite; 受診, 保険証, 用紙; short intake
  prompts, no conversational filler.
- **Never says:** medical advice, cost promises, or assumptions about language
  ability beyond the requested form.

### Nurse

- **Wants:** record the minimum safety-relevant symptom facts for the doctor.
- **Knows:** measured temperature, questionnaire fields, and what must be passed
  on.
- **Cannot know:** diagnosis, test result, or treatment decision.
- **Perceives:** thermometer reading, questionnaire, and learner's observable
  ability to answer.
- **Persona:** man, late 20s; light low-mid voice, patient and evenly paced.
- **Character:** attentive and systematic. He moves through onset, measurement,
  associated symptom, and allergy; rushing, guessing, or reassurance is wrong.
- **Voice fingerprint:** plain clinical です・ます; direct symptom questions;
  medium-short lines, no service keigo.
- **Never says:** “just a cold,” promises, or anything about a test or medicine.

### Doctor

- **Wants:** examine the stated problem and explain the immediate next test.
- **Knows:** recorded symptoms, visible throat finding, and chosen test.
- **Cannot know:** test result before it exists or how the learner will respond
  to medicine not yet prescribed.
- **Perceives:** throat, chart, and instruments.
- **Persona:** woman, early 50s; low steady voice, concise and authoritative.
- **Character:** evidence-bound and spare. She says what she observes and what
  happens next; speculative diagnosis or teaching performance is wrong.
- **Voice fingerprint:** clinical plain-polite; ～ので and 念のため; short
  instructions, no hedging chatter.
- **Never says:** definitive diagnosis without results, blame, or generic
  lifestyle advice.

### Pharmacist

- **Wants:** make the written dose and safety precaution correctly understood.
- **Knows:** the actual prescription, label, frequency, timing, and listed
  drowsiness precaution.
- **Cannot know:** whether the learner will experience drowsiness or how quickly
  symptoms will improve.
- **Perceives:** medicine bag, label, and instruction sheet.
- **Persona:** man, early 40s; warm low-mid voice, deliberate and clear.
- **Character:** repetition-friendly and safety-first. He chunks dose and
  precaution without promising efficacy; sales language or improvisation is
  wrong.
- **Voice fingerprint:** polite です・ます; numbers and condition-result phrasing;
  slowest other-party cadence in the story.
- **Never says:** guaranteed recovery, unlisted side effects, or instructions
  that contradict the label.

### Learner

- **Wants:** receive care while making onset, symptoms, allergy status, test,
  and medicine instructions explicit.
- **Knows:** appointment status, symptoms, onset, and known allergy history.
- **Cannot know:** clinic procedure, examination finding, test need, dose, or
  precautions before professionals state them.
- **Perceives:** forms, thermometer, exam, prescription, and label.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** concise and safety-conscious. They state facts without self-
  diagnosis and ask direct clarification; minimizing, exaggeration, or guessing
  is wrong.
- **Voice fingerprint:** plain です・ます; symptom nouns, いつから, 必要ですか,
  何回, ありますか; learner asks only personally relevant questions.
- **Never says:** a self-diagnosis, asks for a specific drug, or omits allergy
  information for convenience.

## Dialogue

### Stage 1 — 受付

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `clinic-reception-first` | O/A | 初めての受診ですか。 | はじめてのじゅしんですか。 | Is this your first visit? |
| `clinic-reception-walkin` | L/S | 予約はしていませんが、診てもらえますか。 | よやくはしていませんが、みてもらえますか。 | I don't have an appointment; can I be seen? |
| `clinic-reception-documents` | O/A | 保険証と身分証をお願いします。 | ほけんしょうとみぶんしょうをおねがいします。 | Your insurance card and identification, please. |
| `clinic-reception-english` | L/S | 英語の問診票はありますか。 | えいごのもんしんひょうはありますか。 | Do you have an English medical questionnaire? |
| `clinic-reception-form` | O/A | 英語の用紙もご用意しています。 | えいごのようしもごよういしています。 | We also have an English form available. |

### Stage 2 — 症状

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `clinic-intake-symptoms` | O/A | 今日はどのような症状ですか。 | きょうはどのようなしょうじょうですか。 | What symptoms do you have today? |
| `clinic-intake-throat` | L/S | 昨日の夜から、喉が痛いです。 | きのうのよるから、のどがいたいです。 | My throat has hurt since last night. |
| `clinic-intake-temperature` | O/A | 体温は三十八度です。 | たいおんはさんじゅうはちどです。 | Your temperature is 38 degrees. |
| `clinic-intake-cough` | L/S | 咳も少し出ます。 | せきもすこしでます。 | I also have a slight cough. |
| `clinic-intake-allergy-question` | O/A | 薬のアレルギーはありますか。 | くすりのあれるぎーはありますか。 | Do you have any medicine allergies? |
| `clinic-intake-no-allergy` | L/S | 薬のアレルギーはありません。 | くすりのあれるぎーはありません。 | I don't have any medicine allergies. |
| `clinic-intake-pass-on` | O/A | 体温と症状を医師に伝えます。 | たいおんとしょうじょうをいしにつたえます。 | I'll pass your temperature and symptoms to the doctor. |

### Stage 3 — 診察

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `clinic-exam-open-mouth` | O/A | 喉を見ますので、口を開けてください。 | のどをみますので、くちをあけてください。 | I'll examine your throat, so please open your mouth. |
| `clinic-exam-swallow` | L/S | 飲み込むと、特に痛いです。 | のみこむと、とくにいたいです。 | It especially hurts when I swallow. |
| `clinic-exam-red` | O/A | 喉が赤く腫れています。 | のどがあかくはれています。 | Your throat is red and swollen. |
| `clinic-exam-test-question` | L/S | 何か検査が必要ですか。 | なにかけんさがひつようですか。 | Is any testing necessary? |
| `clinic-exam-test` | O/A | 念のため、感染症の検査をします。 | ねんのため、かんせんしょうのけんさをします。 | As a precaution, we'll test for infection. |

### Stage 4 — 薬

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `clinic-pharmacy-purpose` | O/A | こちらは、喉の痛みを和らげる薬です。 | こちらは、のどのいたみをやわらげるくすりです。 | This medicine relieves throat pain. |
| `clinic-pharmacy-frequency` | L/S | 一日に何回飲みますか。 | いちにちになんかいのみますか。 | How many times a day should I take it? |
| `clinic-pharmacy-dose` | O/A | 朝昼晩の三回、食後に飲んでください。 | あさひるばんのさんかい、しょくごにのんでください。 | Take it three times—morning, noon, and night—after meals. |
| `clinic-pharmacy-drowsy` | L/S | 眠くなることはありますか。 | ねむくなることはありますか。 | Can it make me drowsy? |
| `clinic-pharmacy-driving` | O/A | 眠気が出た場合は、運転しないでください。 | ねむけがでたばあいは、うんてんしないでください。 | If you become drowsy, do not drive. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `clinic-reception-walkin` | 予約がなくても診てもらえますか / 予約していませんが、大丈夫ですか |
| `clinic-reception-english` | 英語の用紙はありますか / 問診票は英語でも書けますか |
| `clinic-intake-throat` | 昨日の夜から喉が痛みます / 喉が昨日から痛いです |
| `clinic-intake-cough` | 少し咳も出ます / 咳があります |
| `clinic-intake-no-allergy` | アレルギーはありません / 薬のアレルギーはないです |
| `clinic-exam-swallow` | 飲み込むと痛いです / 食べると喉が痛いです |
| `clinic-exam-test-question` | 検査は必要ですか / 何か検査をしますか |
| `clinic-pharmacy-frequency` | 何回飲めばいいですか / 一日三回ですか |
| `clinic-pharmacy-drowsy` | この薬は眠くなりますか / 眠気は出ますか |

## Review

### Reading and medical-language check

Checked: 受診 じゅしん; 保険証 ほけんしょう; 問診票 もんしんひょう;
症状 しょうじょう; 体温 たいおん; 三十八度 さんじゅうはちど; 咳 せき;
医師 いし; 飲み込む のみこむ; 腫れる はれる; 念のため ねんのため;
感染症 かんせんしょう; 和らげる やわらげる; 食後 しょくご; 眠気
ねむけ.

MHLW registration and internal-medicine questionnaire materials explicitly
cover first visit, appointment, insurance, symptoms, onset, and medicine
allergies. MHLW foreign-patient guidance also stresses explaining how to obtain
and take prescribed medicine in a language the patient understands. The story
therefore asks for a usable form and repeats the label-specific dose and safety
condition; it never substitutes dialogue for professional instructions.

### Pessimistic all-skip run

> 初めての受診ですか。／保険証と身分証をお願いします。／英語の用紙もご用意して
> います。／今日はどのような症状ですか。／体温は三十八度です。／薬のアレルギー
> はありますか。／体温と症状を医師に伝えます。／喉を見ますので、口を開けて
> ください。／喉が赤く腫れています。／念のため、感染症の検査をします。／こちら
> は、喉の痛みを和らげる薬です。／朝昼晩の三回、食後に飲んでください。／眠気が
> 出た場合は、運転しないでください。

Forms, measurement, examination, prescription, and label exist independently
of spoken success. No professional line assumes a learner answer.

## Difficulty verdict

- Requested level: N4
- Learner production: N4
- Listening/comprehension: N4 core / N3 stretch
- Overall: **N4 core / N3 listening stretch**
- Confidence: high for text; audio still required
- Practice load: moderate; medical compounds and one three-part dose

Learner turns use onset, symptoms, allergy, need, frequency, and possible side
effect in short explicit forms. Clinical compounds, formal intake register, and
condition-result dosing produce the listening stretch.

## Character separation gate

- **A: pass.** Professionals perform intake, examination, or instruction; none
  teaches Japanese or narrates their job.
- **B: pass.** Reception uses forms; nurse uses measurements; doctor uses the
  visible exam; pharmacist uses prescription and label. No diagnosis or result
  is borrowed.
- **C: pass.** Administrative, systematic intake, evidence-bound clinical, and
  dose-focused voices are textually distinct; learner owns personal facts and
  clarification questions.
- **D: pass.** Each professional maintains one agenda and register; learner is
  concise and safety-conscious throughout.
- **E: pass.** Every declared trait reaches its lines, and every line maps back
  to a declared trait.

Verdict: **pass, all five passes.**

## Sources

- [MHLW multilingual materials for foreign patients](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/kokusai/setsumei-ml.html)
- [MHLW English patient registration form](https://www.mhlw.go.jp/seisakunitsuite/bunya/kenkou_iryou/iryou/kokusai/setsumeisiryo/dl/en01.pdf)
- [MHLW English internal-medicine questionnaire](https://www.mhlw.go.jp/seisakunitsuite/bunya/kenkou_iryou/iryou/kokusai/setsumeisiryo/dl/en14.pdf)
- [MHLW foreign-patient acceptance manual](https://www.mhlw.go.jp/content/10800000/000496346.pdf)
