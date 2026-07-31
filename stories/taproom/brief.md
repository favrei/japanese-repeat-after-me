# Art & voice brief — taproom 初めての一杯

Requirements only. No art is chosen or produced here. Derived from the
character cards in [`story.md`](story.md) — appearance is inferred from the
persona, never restated from styling.

Design system: [`../../.agents/documents/art-system.md`](../../.agents/documents/art-system.md)

## Required pack keys (schemaVersion 2)

The pack must declare exactly these names, because the stages reference them:

- `scenes.board` — wide shot taking in the tap wall and the beer board.
- `scenes.counter` — tighter shot on the spot where the glass is set down.
- `characters.staff` — label 店員, the one other party in both stages.

Following the café pack, the two scenes may be two crops of a **single**
landscape/portrait pair, differing only in `focus` and `scale`. That is the
cheaper and more consistent route here, since both shots are the same room.

## Scene background

- A standing craft-beer taproom, evening, indoors. Camera at counter height,
  medium distance — close enough that the tap wall reads, far enough that a
  standing figure fits.
- Mood: warm, busy, slightly intimidating to someone who has not been here
  before.
- Palette anchor: the approved system unchanged — newsprint paper, black and
  neutral ink, exactly one deep red accent. **Story-specific note:** beer is
  the obvious reason to reach for amber, and this brief explicitly does not.
  Spend the single red accent on the tap handles, which is where the eye should
  go anyway.
- Safe overlay zones: balloons occupy the upper two thirds; controls the lower
  strip. Keep the tap wall and any figure clear of both — the composition's
  detail belongs in the middle band.
- **Constraint: full-bleed. Lettering is allowed and wanted here.** The story's
  premise is a board covered in beer names, so draw it with real writing on it
  — a hand-lettered board, chalk or marker, in the same ink tones. Include
  ペールエール and 黒ビール among the entries, since those are the two the
  staff names aloud. What the learner must read or act on is still UI text,
  and speech still lives in balloons.

## Other-party character — taproom staff

- Early 20s, working build, apron over a dark tee, sleeves pushed up, hair tied
  back and out of the way. Dressed to pour, not to greet.
- Expression range needed: neutral working attention; a brief direct look when
  taking the order; a small acknowledging nod when handing the glass over.
  Nothing broader — this person is efficient, not effusive.
- Register projected: brisk business-polite, taken from the Step 3 card. Read
  as competent and a little fast, not as deferential.
- Constraint: adult seinen proportions, no chibi. Lettering on the apron or a
  name tag is fine if it suits the shop.

## Cover art

One image summarising the situation in the same register: the tap wall, and a
single filled glass set on the counter, no figure. It should read as "you have
arrived somewhere you do not yet understand," not as an advertisement.

## Voice

| Speaker | Perceived age | Speed | Politeness | Accent |
| --- | --- | --- | --- | --- |
| Staff | early 20s | slightly fast, even | business-polite です・ます | standard, regionally neutral |
| Learner | adult, unspecified | slow, hesitant | plain です・ます | non-native is acceptable, not required |
| Narrator | indeterminate | unhurried, even | plain past-tense prose, not です・ます | standard, regionally neutral |

**Narrator voice: `aiden`** — chosen by ear on 2026-07-31 from the four
presets not already cast and not known-broken. The narrator is the storyteller,
not a person in the room, so it reads as detached and literary rather than
conversational: a book read aloud, not someone speaking in the taproom.

Final casting, three distinct voices:

| Role | Preset |
| --- | --- |
| Staff | `Ono_Anna` |
| Learner | `sohee` |
| Narrator | `aiden` |

Voice fingerprints from the character cards, so the two are not synthesised as
one person: the staff is even-paced with clean set-phrase delivery; the learner
is slower, starts on a filler (あの / じゃあ), and lands softly.

**Decision: two voices, not one.** The staff keep `Ono_Anna`, the native
Japanese preset already validated for this project. The learner's single
autoplay line is assigned a *different* voice, so the two characters are not
synthesised as one person — the audio form of exactly what the separation gate
prevents in text.

What the model actually offers, checked in its config and API rather than
assumed:

- Nine built-in presets — `serena`, `vivian`, `uncle_fu`, `ryan`, `aiden`,
  `ono_anna`, `sohee`, `eric`, `dylan`. `eric` and `dylan` are dialect-locked
  (Sichuan, Beijing) and are excluded from Japanese work.
- `generate()` also accepts `ref_audio` + `ref_text`, so voices are **not**
  limited to the preset bank: any voice can be cloned zero-shot from a
  reference clip. This is the real long-term path to distinct characters.
- A `speed` parameter exists and the generator now passes it through, which is
  how the learner's slower delivery is produced.

**Learner voice: `sohee`** — chosen by ear on 2026-07-31 from candidates
covering all seven non-dialect presets, which remain in `audio/candidates/`.

This settled a question the flow had left open, and the answer generalises:
**preset language labels are a hint, not a limit.** `sohee` carries no Japanese
claim in the model card and produces good Japanese anyway. The corollary also
holds — `ryan` is documented as an English voice and produced 4.00s of garbage
for a 1.7s line. So the usable bank for a Japanese story is seven presets to be
judged by ear, not the one native preset. Cast future characters from all seven
rather than assuming `Ono_Anna` is the only option.

**Cloning is the better answer and is blocked on consent, not capability.** It
needs a consented *native* Japanese reference clip, which this repo does not
have. The recordings under `datasets/` must not be used for it: the learner
imitates these clips, so a non-native reference would teach non-native
pronunciation.

## Speech-delivery intent (Step 7b)

Plain-words intent, not prompt wording. How to prompt Qwen3-TTS CustomVoice
well is still unestablished.

| Bubble | Delivery |
| --- | --- |
| `taproom-choose-welcome` | Routine shop greeting, no warmth added; the question rises slightly. |
| `taproom-choose-board` | Reassuring but brief — this is the one moment the staff softens. |
| `taproom-choose-two` | Flat and factual, listing two items. |
| `taproom-choose-bitter` | Mildly recommending; the ですよ carries the only persuasion in the scene. |
| `taproom-glass-served` | Routine, hand-over cadence. |
| `taproom-glass-thanks` | Learner voice. Short, slightly hesitant, genuine. |
| `taproom-glass-later` | Routine procedural information, evenly paced. |
| `taproom-glass-counter` | Closing beat: instruction, then the habitual ごゆっくりどうぞ as a softer tag. |

**Shadowing.** Every learner speak-bubble reference clip, if generated, needs a
slower, evenly spaced reading — the learner imitates these directly.

**Risky pronunciations** — carried over from Steps 5 and 6, all to be checked
by ear against the `reading` field, never against the kanji:

- ペールエール — two long vowels; the single most likely clip to come out wrong.
- 黒ビール — must be くろビール, not こくビール.
- 苦み — にがみ, not くるしみ.
- 本日 — ほんじつ, not きょう.
- 会計 — かいけい.
- ご自由に — ごじゆうに, not ごじゅうに. A short-vowel error here is easy to
  miss and changes the word.

**Recording requirement.** With every generated clip, record the model and
version, the speaker preset, the exact instruction text, and the seed. Without
the prompt text a later re-tune cannot separate a bad prompt from a bad model
from a bad sentence.
