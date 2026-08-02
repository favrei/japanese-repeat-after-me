# Story: rain-on-mountain — 山で雨

Flow: [`../../.agents/documents/stage-design-flow.md`](../../.agents/documents/stage-design-flow.md)
Gate: [`../../.agents/documents/character-separation-gate.md`](../../.agents/documents/character-separation-gate.md)
Level: [`../../.agents/documents/japanese-conversation-difficulty-guideline.md`](../../.agents/documents/japanese-conversation-difficulty-guideline.md)
Brief: [`brief.md`](brief.md) · Voice manifest: [`voices.json`](voices.json)

Status: **authoring complete; production media not started.** The safety shape
was checked against current Japan Meteorological Agency (JMA) lightning
guidance and National Police Agency mountain-incident prevention guidance. This
is language practice, not route or emergency advice. All authoring gates pass.

## Situation

Two adults begin a familiar day hike with rain forecast for later. The sky
darkens before the summit; they check the nowcast, abandon the summit, move off
the ridge to a sturdy shelter, wait while thunder is near, then descend together
by the lower route when conditions ease.

What changes: **a summit plan becomes an early, shared safety decision and a
completed descent.**

| Field | Decision |
| --- | --- |
| Learner | Adult recreational hiker, N4/N3 plain-polite Japanese; prepared and cooperative. |
| Other parties | One hiking partner; one shelter attendant. |
| Length | 4 stages, 20 bubbles, 8 learner `speak` bubbles. |
| Working level | N4 core / N3 stretch. |

## Stage cuts and transitions

| Stage | Goal-state change | `sceneId` | `castId` | Transition |
| --- | --- | --- | --- | --- |
| 1 計画 | General hike → explicit turnaround time and shared equipment check | `trailhead` | `hiking-partner` | 朝、登山口の案内板の下に地図が広げられていた。 |
| 2 引き返す | Summit still intended → current lightning risk checked and summit abandoned | `darkening-trail` | `hiking-partner` | 昼前、西の空から濃い雲が広がってきた。 |
| 3 避難 | Exposed descent → inside sturdy shelter with lower route identified | `mountain-shelter` | `shelter-attendant` | 尾根の下に、頑丈な避難小屋が見えた。 |
| 4 下山 | Sheltered waiting → conditions eased and pair reaches trailhead together | `lower-trail` | `hiking-partner` | 雷が遠ざかり、屋根を打つ雨の音が弱くなった。 |

### Transition readings

| Stage | Reading | Translation |
| --- | --- | --- |
| 1 | あさ、とざんぐちのあんないばんのしたにちずがひろげられていた。 | In the morning, a map was spread beneath the trailhead information board. |
| 2 | ひるまえ、にしのそらからこいくもがひろがってきた。 | Before noon, dark clouds began spreading from the western sky. |
| 3 | おねのしたに、がんじょうなひなんごやがみえた。 | A sturdy mountain shelter appeared below the ridge. |
| 4 | かみなりがとおざかり、やねをうつあめのおとがよわくなった。 | The thunder moved away, and the rain against the roof weakened. |

## Scene facts

- Forecast and route are visible on the map and phones; both hikers carry rain
  gear and water.
- The planned turnaround is noon even if the summit has not been reached.
- The western sky darkens, and the current fictional nowcast indicates possible
  lightning within an hour.
- A sturdy enclosed shelter lies below the ridge. The attendant has the current
  radar and knows the lower route on this fictional mountain.
- The story never recommends waiting outdoors, sheltering under a tree, or
  continuing toward the summit after thunder risk appears.

## Character cards

### Hiking partner

- **Wants:** enjoy the walk while keeping the plan inside weather and time limits.
- **Knows:** route, noon turnaround, forecast, shared equipment, and how to read
  the current nowcast.
- **Cannot know:** future weather beyond the displayed forecast or whether the
  learner wants to continue unless stated.
- **Perceives:** map, gear, clouds, phone warning, trail, rain, and trailhead sign.
- **Persona:** woman, early 30s; clear low-mid voice, calm and outdoorsy.
- **Character:** cautious without being fearful and decisive without heroics.
  She converts evidence into the next safe movement; bravado, teasing, or “it
  will probably be fine” is wrong.
- **Voice fingerprint:** friendly polite です・ます; planned time, visible weather,
  and movement verbs; no emotional filler; she states decisions cleanly.
- **Never says:** guarantees, minimizes thunder, pressures the learner, or gives
  improvised rescue instruction.

### Shelter attendant

- **Wants:** keep visitors inside while thunder is near and point them to the
  lower mapped route afterward.
- **Knows:** current radar display, shelter function, and marked east-side path.
- **Cannot know:** exact future weather beyond the display or hikers' skill.
- **Perceives:** thunder, roof rain, radar, map, and hikers inside.
- **Persona:** man, late 50s; rough quiet low voice, slow and exact.
- **Character:** locally factual and unsentimental. He names present conditions
  and mapped options; adventure stories, reassurance, or authority theater are
  wrong.
- **Voice fingerprint:** plain-polite; ～間は, 見込み, ～ずに; deliberate weather
  nouns; he answers only safety-relevant questions.
- **Never says:** that conditions are safe before evidence, shortcuts, or
  personal judgments about the hikers.

### Learner

- **Wants:** share the plan, recognize deterioration, advocate turning around,
  and descend without separating.
- **Knows:** own equipment and what the visible app/map shows.
- **Cannot know:** partner's planned time, storm duration, or safest marked
  descent before asking.
- **Perceives:** all weather, map, shelter, path, and signs mentioned.
- **Persona:** default unmarked adult, late 20s–40s; neutral mid-range voice.
- **Character:** prepared and cooperative. They ask before assuming and suggest
  conservative action early; summit fixation, panic, or false expertise is wrong.
- **Voice fingerprint:** plain です・ます; planned-time question, ましょう,
  ～ずに, route request; proposals rather than commands.
- **Never says:** 大丈夫でしょう without evidence, insists on the summit, or
  treats the script as emergency guidance.

## Dialogue

### Stage 1 — 計画

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `mountain-plan-rain` | O/A | 午後は雨の予報です。 | ごごはあめのよほうです。 | Rain is forecast for the afternoon. |
| `mountain-plan-turnaround` | L/S | 何時に引き返す予定ですか。 | なんじにひきかえすよていですか。 | What time are we planning to turn back? |
| `mountain-plan-noon` | O/A | 十二時になったら、山頂の手前でも戻ります。 | じゅうにじになったら、さんちょうのてまえでももどります。 | At noon, we'll turn back even if we're short of the summit. |
| `mountain-plan-gear` | L/S | 雨具と水は持っています。 | あまぐとみずはもっています。 | I have rain gear and water. |
| `mountain-plan-map` | O/A | 地図は二人で確認しておきましょう。 | ちずはふたりでかくにんしておきましょう。 | Let's check the map together beforehand. |

### Stage 2 — 引き返す

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `mountain-turn-dark` | O/A | 西の空が急に暗くなってきました。 | にしのそらがきゅうにくらくなってきました。 | The western sky has suddenly grown dark. |
| `mountain-turn-nowcast` | L/S | 雨雲レーダーを確認しましょう。 | あまぐもれーだーをかくにんしましょう。 | Let's check the rain radar. |
| `mountain-turn-lightning` | O/A | 一時間以内に雷の可能性があります。 | いちじかんいないにかみなりのかのうせいがあります。 | There is a possibility of lightning within an hour. |
| `mountain-turn-back` | L/S | 山頂へ行かずに、引き返しませんか。 | さんちょうへいかずに、ひきかえしませんか。 | Shall we turn back instead of going to the summit? |
| `mountain-turn-shelter` | O/A | 尾根を離れて、避難小屋へ向かいます。 | おねをはなれて、ひなんごやへむかいます。 | We'll leave the ridge and head for the shelter. |

### Stage 3 — 避難

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `mountain-shelter-inside` | O/A | 雷が聞こえる間は、建物の中にいてください。 | かみなりがきこえるあいだは、たてもののなかにいてください。 | Stay inside the building while thunder can be heard. |
| `mountain-shelter-duration` | L/S | 雨はどのくらい続きそうですか。 | あめはどのくらいつづきそうですか。 | How long does the rain look likely to continue? |
| `mountain-shelter-thirty` | O/A | レーダーでは、三十分ほどで弱まる見込みです。 | れーだーでは、さんじゅっぷんほどでよわまるみこみです。 | The radar suggests it will weaken in about thirty minutes. |
| `mountain-shelter-route` | L/S | 下りの安全な道を教えてください。 | くだりのあんぜんなみちをおしえてください。 | Please show us a safe route down. |
| `mountain-shelter-east` | O/A | 東側の道は、尾根を通らずに下れます。 | ひがしがわのみちは、おねをとおらずにくだれます。 | The eastern path descends without crossing the ridge. |

### Stage 4 — 下山

| ID | Mode | Japanese | Reading | Translation |
| --- | --- | --- | --- | --- |
| `mountain-descent-slippery` | O/A | 雨は弱くなりましたが、道が滑りやすくなっています。 | あめはよわくなりましたが、みちがすべりやすくなっています。 | The rain has weakened, but the trail is slippery. |
| `mountain-descent-slowly` | L/S | ゆっくり下りましょう。 | ゆっくりくだりましょう。 | Let's descend slowly. |
| `mountain-descent-forty` | O/A | バス停まで、あと四十分です。 | ばすていまで、あとよんじゅっぷんです。 | It's another forty minutes to the bus stop. |
| `mountain-descent-together` | L/S | 離れないで、一緒に歩きましょう。 | はなれないで、いっしょにあるきましょう。 | Let's stay together as we walk. |
| `mountain-descent-sign` | O/A | 登山口の案内板が見えてきました。 | とざんぐちのあんないばんがみえてきました。 | The trailhead information board has come into view. |

### Accepted variants

| ID | Accepted |
| --- | --- |
| `mountain-plan-turnaround` | 何時に戻る予定ですか / 引き返す時間は何時ですか |
| `mountain-plan-gear` | 雨具も水もあります / レインウェアと水を持っています |
| `mountain-turn-nowcast` | 雨雲を確認しましょう / レーダーを見ませんか |
| `mountain-turn-back` | 山頂へ行かないで戻りませんか / ここで引き返しましょう |
| `mountain-shelter-duration` | 雨はいつまで続きますか / あとどのくらい降りますか |
| `mountain-shelter-route` | 安全な下り道を教えてください / どの道で下ればいいですか |
| `mountain-descent-slowly` | ゆっくり行きましょう / 急がずに下りましょう |
| `mountain-descent-together` | 一緒に歩きましょう / 離れないようにしましょう |

## Review

### Reading and safety check

Checked: 登山口 とざんぐち; 引き返す ひきかえす; 山頂 さんちょう;
雨具 あまぐ; 雨雲 あまぐも; 一時間以内 いちじかんいない; 雷
かみなり; 可能性 かのうせい; 尾根 おね; 避難小屋 ひなんごや;
三十分 さんじゅっぷん; 見込み みこみ; 東側 ひがしがわ; 四十分
よんじゅっぷん.

JMA guidance says to monitor current information and move promptly to a safe
place when thunder is heard or lightning risk is indicated; exposed summits and
ridges are dangerous. Police guidance emphasizes judging conditions correctly
and ending a climb early. The story operationalizes only those conservative
choices: check, turn back, leave the ridge, enter a sturdy building, and descend
by a marked lower route when current information supports it.

### Pessimistic all-skip run

> 午後は雨の予報です。／十二時になったら、山頂の手前でも戻ります。／地図は二人
> で確認しておきましょう。／西の空が急に暗くなってきました。／一時間以内に雷の
> 可能性があります。／尾根を離れて、避難小屋へ向かいます。／雷が聞こえる間は、
> 建物の中にいてください。／レーダーでは、三十分ほどで弱まる見込みです。／東側
> の道は、尾根を通らずに下れます。／雨は弱くなりましたが、道が滑りやすくなって
> います。／バス停まで、あと四十分です。／登山口の案内板が見えてきました。

Weather, map, radar, and route markings—not learner claims—drive every line.

## Difficulty verdict

- Requested level: N4/N3
- Learner production: N4 core / N3 stretch
- Listening/comprehension: N3
- Overall: **N4 core / N3 stretch**
- Confidence: high for text; safety wording must be rechecked at release
- Practice load: moderate-high; weather compounds and time counters

Suggestions and equipment statements are N4. ～ずに, possibility, forecast
interpretation, conditional route decisions, and near-natural safety listening
form a genuine N3 stretch without asking the learner for expert explanation.

## Character separation gate

- **A: pass.** No one delivers an outdoor-safety lecture from inside the scene;
  each line changes the current plan.
- **B: pass.** Forecast, clouds, nowcast, thunder, map, rain, and signs are
  visible. No speaker predicts beyond displayed information.
- **C: pass.** Partner owns collaborative plans and movement; attendant owns
  local shelter/radar facts; learner owns checks and conservative proposals.
- **D: pass.** Partner is cautious and decisive, attendant locally factual,
  learner prepared and cooperative throughout.
- **E: pass.** Every declared trait reaches dialogue; no heroism, teasing,
  panic, or unsupported reassurance appears.

Verdict: **pass, all five passes.**

## Sources

- [JMA: using the lightning nowcast](https://www.jma.go.jp/jma/kishou/know/toppuu/thunder4-2.html)
- [JMA: protecting yourself from lightning](https://www.jma.go.jp/jma/kishou/know/toppuu/thunder4-3.html)
- [JMA: staged weather information](https://www.jma.go.jp/jma/kishou/know/toppuu/thunder4-1.html)
- [National Police Agency: summer mountain incidents and prevention](https://www.npa.go.jp/publications/statistics/safetylife/r6_kaki_sangakusounan.pdf)
