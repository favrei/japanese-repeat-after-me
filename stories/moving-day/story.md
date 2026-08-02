# Story: moving-day — 引っ越しの日

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** All authoring
reviews and separation passes are complete. Cast presets remain candidates.

## Situation

On moving day, the learner directs the important boxes and furniture, solves a
sofa problem, learns how the hot-water control works, and greets the next-door
neighbor after the noise settles.

What changes: **an empty apartment becomes a functioning home with the first
neighbor relationship established.**

| Field | Decision |
| --- | --- |
| Learner | Adult resident, N4 plain-polite Japanese; considerate and concrete. |
| Other parties | Moving crew leader, gas technician, next-door neighbor. |
| Length | 4 stages, 20 bubbles, 8 learner `speak` bubbles. |
| Working level | N4 core / N3 listening stretch. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 荷物 | Unsorted delivery → fragile boxes and desk placement understood | `apartment-morning` | `mover` | 朝、新しい部屋の前に引っ越しの箱が積まれていた。 |
| 2 ソファ | Sofa blocked at elevator → safe alternate handling agreed | `hallway-sofa` | `mover` | 玄関の前で、大きなソファが止まっていた。 |
| 3 お湯 | Utility not understood → hot water checked and control explained | `kitchen-evening` | `gas-technician` | 夕方、台所の給湯器の前に工具箱が置かれていた。 |
| 4 お隣 | Unknown neighbor relationship → introduction, apology, and building expectation established | `hallway-night` | `neighbor` | 日が暮れるころ、隣の部屋のドアが開いた。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | あさ、あたらしいへやのまえにひっこしのはこがつまれていた。 | In the morning, moving boxes were stacked outside the new apartment. |
| 2 | げんかんのまえで、おおきなそふぁがとまっていた。 | A large sofa had come to a stop at the entrance. |
| 3 | ゆうがた、だいどころのきゅうとうきのまえにこうぐばこがおかれていた。 | In the evening, a toolbox sat in front of the kitchen water heater. |
| 4 | ひがくれるころ、となりのへやのどあがひらいた。 | Around nightfall, the door to the neighboring apartment opened. |

## Scene facts

- Red fragile labels are visible on several boxes; the desk and window are in
  the same room.
- The sofa visibly exceeds the elevator opening; all four legs are removable.
- The gas appointment is scheduled, and the technician can inspect the heater
  independently of learner speech.
- Moving noise was audible in the shared hallway. The building has a quiet-hours
  rule from 10 p.m.; the manager's office is on the first floor.

## Character cards

### Moving crew leader

- **Wants:** place the shipment safely and finish without damaging the building.
- **Knows:** moving order, labels, furniture construction, elevator dimensions,
  and protective equipment.
- **Cannot know:** the learner's preferred furniture positions until visible or
  stated; sentimental value of boxes.
- **Perceives:** labels, window, desk, sofa, elevator, walls, and blankets.
- **Persona:** man, early 30s; energetic clear mid-range voice.
- **Character:** physically brisk and detail-first. He names the next handling
  action, not feelings; carelessness, banter, or vague reassurance is wrong.
- **Voice fingerprint:** business-polite です・ます; short active sentences;
  frequent concrete nouns; he volunteers handling decisions.
- **Never says:** personal comments about possessions, casual commands to the
  learner, or claims that depend on a skipped request.

### Gas technician

- **Wants:** complete the safety check and leave the resident able to use the
  hot-water control correctly.
- **Knows:** heater condition, inspection sequence, and control functions.
- **Cannot know:** the learner's previous appliance experience or preferred
  temperature.
- **Perceives:** heater, tools, control knob, and water display.
- **Persona:** woman, early 40s; firm neutral mid-range voice, evenly paced.
- **Character:** safety-minded and literal. Every line distinguishes current
  status from what becomes possible next; improvisation or chat is wrong.
- **Voice fingerprint:** formal-polite です・ます; ～れば and ～で変えられます;
  no filler; she supplies conditions and operating facts.
- **Never says:** guarantees beyond the check, jokes about danger, or domestic
  assumptions.

### Neighbor

- **Wants:** establish who moved in and make the building's quiet-hours norm
  clear without starting a dispute.
- **Knows:** they live next door, heard daytime moving noise, quiet hours, and
  manager location.
- **Cannot know:** household composition, work, origin, lease terms, or future
  noise.
- **Perceives:** boxes, open door, shared hallway, and the learner at the door.
- **Persona:** woman, early 60s; dry warm low-mid voice, unhurried.
- **Character:** direct about rules and practical about help. She does not
  soften facts into hints or turn them into a lecture; gossip is wrong.
- **Voice fingerprint:** plain-polite です・ます; one clear norm followed by one
  useful fact; she initiates recognition but asks no personal questions.
- **Never says:** passive-aggressive ちょっと…, guesses about the learner, or
  exaggerated welcome language.

### Learner

- **Wants:** protect possessions, make the apartment usable, and begin well
  with the neighbor.
- **Knows:** which boxes are fragile, desired desk position, and that today's
  move was noisy.
- **Cannot know:** sofa solution, heater status, building rules, or neighbor's
  reaction in advance.
- **Perceives:** every object and control referenced in the dialogue.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** considerate and concrete. They request one placement or
  clarification at a time and apologize only for observable impact; entitlement
  or excessive deference is wrong.
- **Voice fingerprint:** plain です・ます; 入っています, 置いてください,
  できますか, 何に使いますか; learner asks practical questions.
- **Never says:** staff-side keigo, vague いい感じに, or personal information
  not needed for the move.

## Dialogue

### Stage 1 — 荷物

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `moving-boxes-check` | O/A | まず、こちらの荷物を確認します。 | まず、こちらのにもつをかくにんします。 | First, I'll check these items. |
| `moving-boxes-fragile` | L/S | この箱には割れ物が入っています。 | このはこにはわれものがはいっています。 | This box contains fragile items. |
| `moving-boxes-red` | O/A | 赤い印の箱は、上に置きます。 | あかいしるしのはこは、うえにおきます。 | We'll place the boxes with red marks on top. |
| `moving-boxes-desk` | L/S | 机は窓のそばに置いてください。 | つくえはまどのそばにおいてください。 | Please put the desk by the window. |
| `moving-boxes-order` | O/A | 大きい家具から順番に運びます。 | おおきいかぐからじゅんばんにはこびます。 | We'll bring in the large furniture first. |

### Stage 2 — ソファ

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `moving-sofa-elevator` | O/A | このソファは、エレベーターに入りません。 | このそふぁは、えれべーたーにはいりません。 | This sofa won't fit in the elevator. |
| `moving-sofa-legs` | L/S | 脚を外すことはできますか。 | あしをはずすことはできますか。 | Can the legs be removed? |
| `moving-sofa-four` | O/A | 脚は四本とも外せます。 | あしはよんほんともはずせます。 | All four legs can be removed. |
| `moving-sofa-request` | L/S | 外してから運んでください。 | はずしてからはこんでください。 | Please remove them before carrying it in. |
| `moving-sofa-blanket` | O/A | 壁に傷がつかないよう、毛布で包みます。 | かべにきずがつかないよう、もうふでつつみます。 | We'll wrap it in a blanket so it doesn't scratch the walls. |

### Stage 3 — お湯

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `moving-water-check` | O/A | 給湯器の点検を始めます。 | きゅうとうきのてんけんをはじめます。 | I'll begin checking the water heater. |
| `moving-water-when` | L/S | お湯はいつから使えますか。 | おゆはいつからつかえますか。 | When can I start using the hot water? |
| `moving-water-after` | O/A | 点検が終われば、すぐ使えます。 | てんけんがおわれば、すぐつかえます。 | You can use it as soon as the inspection is finished. |
| `moving-water-knob` | L/S | このつまみは何に使いますか。 | このつまみはなににつかいますか。 | What is this knob used for? |
| `moving-water-temperature` | O/A | お湯の温度は、このつまみで変えられます。 | おゆのおんどは、このつまみでかえられます。 | You can change the water temperature with this knob. |

### Stage 4 — お隣

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `moving-neighbor-new` | O/A | お隣に越してきた方ですね。 | おとなりにこしてきたかたですね。 | You're the person who moved in next door. |
| `moving-neighbor-intro` | L/S | 今日、隣に引っ越してきました。 | きょう、となりにひっこしてきました。 | I moved in next door today. |
| `moving-neighbor-rule` | O/A | この建物は、夜十時から静かにする決まりです。 | このたてものは、よるじゅうじからしずかにするきまりです。 | In this building, quiet hours begin at ten. |
| `moving-neighbor-apology` | L/S | 今日はうるさくして、すみませんでした。 | きょうはうるさくして、すみませんでした。 | Sorry about the noise today. |
| `moving-neighbor-manager` | O/A | 困ったときは、一階の管理人さんを呼んでください。 | こまったときは、いっかいのかんりにんさんをよんでください。 | If you have trouble, call the manager on the first floor. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `moving-boxes-fragile` | この箱は割れ物です / この中に割れ物があります |
| `moving-boxes-desk` | 机を窓のそばにお願いします / 机は窓の近くに置いてください |
| `moving-sofa-legs` | ソファの脚は外せますか / 脚を外せますか |
| `moving-sofa-request` | 脚を外して運んでください / 外してからお願いします |
| `moving-water-when` | いつからお湯を使えますか / もうお湯は使えますか |
| `moving-water-knob` | このつまみは何ですか / これは何に使いますか |
| `moving-neighbor-intro` | 今日、こちらに引っ越してきました / 隣に越してきました |
| `moving-neighbor-apology` | 今日は音を立てて、すみませんでした / うるさくして、すみません |

## Review

### Reading and naturalness

Checked risks: 引っ越し → ひっこし; 割れ物 → われもの; 印 → しるし;
家具 → かぐ; 四本 → よんほん; 傷 → きず; 毛布 → もうふ; 給湯器 →
きゅうとうき; 点検 → てんけん; 温度 → おんど; 一階 → いっかい;
管理人 → かんりにん.

Each other party owns a different register and agenda: the mover speaks in
objects and handling order; the technician in conditions and controls; the
neighbor in norms and practical help. The learner stays direct and considerate.

### Pessimistic all-skip run

> まず、こちらの荷物を確認します。／赤い印の箱は、上に置きます。／大きい家具
> から順番に運びます。／このソファは、エレベーターに入りません。／脚は四本とも
> 外せます。／壁に傷がつかないよう、毛布で包みます。／給湯器の点検を始めます。／
> 点検が終われば、すぐ使えます。／お湯の温度は、このつまみで変えられます。／
> お隣に越してきた方ですね。／この建物は、夜十時から静かにする決まりです。／
> 困ったときは、一階の管理人さんを呼んでください。

Labels, furniture dimensions, scheduled inspection, boxes, and hallway noise
are observable. Nothing requires a successful learner bubble.

## Difficulty verdict

- Requested level: N4
- Learner production: N4 core / one N3-form stretch
- Listening/comprehension: N4 core / N3 stretch
- Overall: **N4 core / N3 stretch**
- Confidence: high for text
- Practice load: moderate; household compounds and one long apology

The sustained tasks and learner turns are concrete N4. 外すことはできますか
and the technician's ～れば/変えられます form the limited N3 stretch; shorter
accepted variants keep the production ceiling accessible.

## Character separation gate

- **A: pass.** No mover, technician, or neighbor teaches language or narrates
  their role.
- **B: pass.** Every fact is on a label, object, control, schedule, or shared
  hallway; no skipped speech becomes knowledge.
- **C: pass.** Handling verbs identify the mover, conditional operating facts
  identify the technician, building norms identify the neighbor, and requests
  identify the learner.
- **D: pass.** Each other party has one stable job and cadence; the learner
  remains concrete and considerate across all four.
- **E: pass.** All brisk/detail-first, safety/literal, direct/helpful, and
  considerate traits reach lines; no line invents an undeclared trait.

Verdict: **pass, all five passes.**
