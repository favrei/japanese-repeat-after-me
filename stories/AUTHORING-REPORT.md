# Ten-story authoring report

Date: 2026-08-01
Scope: the ten standalone stories selected in
[`../.agents/plans/ten-story-expansion.md`](../.agents/plans/ten-story-expansion.md)

Status: **all ten authoring packs complete; media and app implementation not
started.**

## Delivered packs

| Story | Level | Files |
| --- | --- | --- |
| 終電を逃した夜 | N4 | [Script](missed-last-train/story.md) · [Brief](missed-last-train/brief.md) · [Voices](missed-last-train/voices.json) |
| 消えた財布 | N4 core / N3 stretch | [Script](missing-wallet/story.md) · [Brief](missing-wallet/brief.md) · [Voices](missing-wallet/voices.json) |
| 引っ越しの日 | N4 | [Script](moving-day/story.md) · [Brief](moving-day/brief.md) · [Voices](moving-day/voices.json) |
| 町のクリニック | N4 | [Script](neighborhood-clinic/story.md) · [Brief](neighborhood-clinic/brief.md) · [Voices](neighborhood-clinic/voices.json) |
| 中古の自転車 | N4 core / N3 stretch | [Script](secondhand-bicycle/story.md) · [Brief](secondhand-bicycle/brief.md) · [Voices](secondhand-bicycle/voices.json) |
| 山で雨 | N4 core / N3 stretch | [Script](rain-on-mountain/story.md) · [Brief](rain-on-mountain/brief.md) · [Voices](rain-on-mountain/voices.json) |
| 温泉旅館の一泊 | N4 | [Script](onsen-inn/story.md) · [Brief](onsen-inn/brief.md) · [Voices](onsen-inn/voices.json) |
| 商店街の夏祭り | N4 | [Script](shopping-street-festival/story.md) · [Brief](shopping-street-festival/brief.md) · [Voices](shopping-street-festival/voices.json) |
| 二人の料理教室 | N4 | [Script](cooking-class/story.md) · [Brief](cooking-class/brief.md) · [Voices](cooking-class/voices.json) |
| プレゼン前夜 | N3 core / N2 stretch | [Script](presentation-eve/story.md) · [Brief](presentation-eve/brief.md) · [Voices](presentation-eve/voices.json) |

Every pack contains four stage cuts and transitions, shared scene facts,
separate character cards, full Japanese dialogue with readings and English
read-back, accepted variants for each learner target, a difficulty review, an
explicit all-skip proof, the five-pass character-separation gate, production
requirements, and line-level voice delivery intent.

## Detached validation

| Check | Result |
| --- | ---: |
| Stories / stages | 10 / 40 |
| Dialogue / learner targets | 204 / 83 |
| Accepted-variant entries | 83 |
| Skip-safe narrator transitions | 40 |
| Voice-manifest lines | 244 |
| Dialogue-to-manifest text or ID mismatches | 0 |
| Duplicate line IDs across the slate | 0 |
| Stage-size failures (5–9 bubbles; 2–3 learner targets) | 0 |
| Stages not opened by the other party | 0 |
| Missing readings, translations, delivery intents, scenes, or cast keys | 0 |
| Learner readings over the 30-character memory-load ceiling | 0 |
| Five-pass character-separation failures | 0 |

The all-skip proofs were also read in story order to confirm that surrounding
dialogue and stage transitions do not claim the learner spoke. Readings,
counters, time expressions, register, and one-sentence bubble boundaries were
reviewed across the full slate. The detached pass corrected a receptionist
honorific, replaced a less idiomatic cooking phrase, simplified a redundant
business request, and shortened one presentation response before the final
validation.

## Domain checks

The health, bicycle, mountain-weather, and onsen material was checked against
current primary or official guidance. The scripts keep variable facility or
local procedures conditional rather than presenting them as universal rules.

- Clinic flow and medication communication: [Japan Ministry of Health,
  Labour and Welfare](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/kokusai/setsumei-ml.html)
- Bicycle transfer/registration: [National Police Agency](https://www.npa.go.jp/laws/notification/seian/seiki/bouhantouroku.pdf),
  [Tokyo Metropolitan Police](https://www.keishicho.metro.tokyo.lg.jp/kurashi/higai/guard/bicycle.html)
- Lightning and mountain decisions: [Japan Meteorological
  Agency](https://www.jma.go.jp/jma/kishou/know/toppuu/thunder4-3.html),
  [National Police Agency](https://www.npa.go.jp/publications/statistics/safetylife/r6_kaki_sangakusounan.pdf)
- Ryokan and onsen etiquette: [Japan National Tourism
  Organization](https://www.japan.travel/en/guide/how-to-best-enjoy-onsen/)

## Production boundary

The voice names in the manifests are audition candidates, not approved final
casting. Stable per-line seeds remain deliberately unset until generation.
No images or audio were generated, this authoring batch did not edit `app/`,
and no preview or deployment was performed. A future production pass still
needs voice auditions, human listening, art review, app encoding, automated
tests, and visual/browser QA.
