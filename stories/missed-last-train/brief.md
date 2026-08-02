# Art & voice brief — missed-last-train 終電を逃した夜

Requirements only. No art or audio is approved or produced here. Derived from
[`story.md`](story.md).

Design system: [`../../.agents/documents/art-system.md`](../../.agents/documents/art-system.md)

## Required pack keys

- `scenes.empty-platform`
- `scenes.taxi-rank`
- `scenes.taxi-interior`
- `scenes.destination-corner`
- `characters.station-attendant` — label 駅員
- `characters.taxi-driver` — label 運転手

## Scene backgrounds

### `empty-platform`

- Late-night city platform after service, indoors/outdoors under a roof, medium
  standing-height view. An inactive departure display and empty track are
  visible.
- Mood: quiet urgency, not danger or horror.
- Palette: standard newsprint and neutral ink; reserve deep red for UI. The
  display is the darkest visual anchor.
- Keep the upper-left and lower control strip quiet for overlays. Full-bleed;
  ordinary station lettering is allowed, but no real railway branding.

### `taxi-rank`

- Station forecourt at night, taxi door and roof light visible, medium view
  from the passenger's approach.
- Mood: relief without sentimentality.
- Continuity: same station and night as Stage 1. Street lamps and wet-looking
  asphalt may carry the value pattern, but no rain is asserted.
- Leave the upper central band readable. Fictional taxi lettering only.

### `taxi-interior`

- Rear-seat passenger viewpoint toward the driver and windscreen; a broad road
  divides ahead and a convenience store is visible beyond it.
- Mood: steady motion after the station's stillness.
- The driver sprite may be a seated three-quarter figure partially occluded by
  the seat and dashboard. Adult proportions must remain credible; do not draw
  a standing person floating inside the vehicle.
- Keep the upper-right balloon zone away from mirrors and street lights.

### `destination-corner`

- Residential intersection at night from inside or just beside the stopped
  taxi. Convenience store, two apartment buildings, and one entrance visible.
- Mood: ordinary safety; the visual payoff is recognition, not celebration.
- Continuity: same dry night and vehicle. No private real-world address or
  identifiable logo.

## Other-party characters

### `station-attendant`

- **Persona:** man, late 40s; calm low-mid voice, measured and clear.
- **Character:** economical and watchful.

| Trait | Visible consequence |
| --- | --- |
| Economical | Neat uniform, hands at rest, no broad gesture; points once toward the exit. |
| Watchful | Upright posture and attention split between learner and platform rather than theatrical eye contact. |

- Negative space: no comic exhaustion, scolding, sympathy performance, or
  personal curiosity.
- States: neutral operational attention; brief directional gesture; restrained
  concern appropriate to a stranded passenger.
- Appears in `empty-platform`. Adult seinen proportions, no real operator logo.

### `taxi-driver`

- **Persona:** woman, early 50s; steady husky mid-low voice, unhurried.
- **Character:** locally experienced and unflappable.

| Trait | Visible consequence |
| --- | --- |
| Locally experienced | Eyes alternate naturally between road, mirror, and landmark; one small route-confirming hand movement. |
| Unflappable | Relaxed shoulders and economical expression even at the late hour; nothing hurried or wary. |

- Negative space: no sightseeing-guide performance, surprise, intrusive
  friendliness, or concern unsupported by the dialogue.
- States: neutral driving focus; small confirming glance; courteous closing
  attention. The pose is seated in taxi scenes by design.
- Appears in `taxi-rank`, `taxi-interior`, and `destination-corner` with clear
  facial and clothing continuity.

The learner is first-person and never drawn.

## Cover

An empty platform, stopped display, and one taxi roof light beyond the station
exit. It promises a route through the night without revealing the destination.

## Voice

| Role | Required identity | Delivery | Casting status |
| --- | --- | --- | --- |
| Station attendant | man, late 40s; calm low-mid | measured, clipped business-polite | `uncle_fu` is an audition candidate only |
| Taxi driver | woman, early 50s; husky mid-low | unhurried plain-polite, landmark-focused | `vivian` is an audition candidate only |
| Learner | unmarked adult; neutral mid-range | even and clearly spaced for imitation | established `sohee` reference candidate |
| Narrator | detached storyteller | quiet, unhurried prose | established `aiden` candidate |

Cast persona first, then Japanese quality and cross-role distinctness. No clip
may ship until the complete batch is heard against the readings.

### Delivery intent

- Transitions: restrained late-night narration; quiet, never ominous.
- Attendant: short operational facts, clean numbers, no emotional coloring.
- Driver: steady and matter-of-fact; ですね/ね confirms visible landmarks.
- Learner: tired but controlled; every reference line clearly segmented.
- Final driver line: courteous safety reminder, not a warning.

### Pronunciation risks

終電 しゅうでん · 始発 しはつ · 五時十二分 ごじじゅうにふん · 東口
ひがしぐち · 桜町二丁目 さくらまちにちょうめ · 二十分 にじゅっぷん ·
二軒 にけん · 四千二百円 よんせんにひゃくえん · 端末 たんまつ.
