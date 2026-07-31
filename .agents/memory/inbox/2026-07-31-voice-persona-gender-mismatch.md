# Voice/persona gender mismatch — taproom staff

Date: 2026-07-31

User testing the merged four-stage app reported the taproom staff "uses a girl
sound for a male character," and asked which part of the chain is responsible.

Confirmed at the artifact level:

- `poc/public/art-packs/taproom/staff-neutral.png` draws the staff as a young
  man (early 20s, hair tied back).
- `stories/taproom/voices.json` casts every staff line to `Ono_Anna`, a female
  preset.
- The café escaped only by coincidence: `cafe/character-neutral.png` is female
  and is also voiced `Ono_Anna`.

Chain audit — no link carries apparent gender:

1. Step 3 character card template
   (`.agents/documents/stage-design-flow.md:140-151`) has Wants / Knows /
   Cannot know / Perceives / Voice fingerprint / Never says. "Voice
   fingerprint" is politeness tier, sentence length, habitual opener — grammar
   only, no sex or timbre. The taproom staff card (`stories/taproom/story.md:90`)
   inherits that gap.
2. Step 7 art & voice brief template (`stage-design-flow.md:305-315`) specifies
   perceived age, speed, politeness, regional neutrality. No gender column.
   `stories/taproom/brief.md:61-66` matches it exactly.
3. The art half of the same brief (`brief.md:43-52`) describes the staff as
   "early 20s, working build, apron over a dark tee, hair tied back" — also
   gender-neutral.
4. Art generation resolved the ambiguity toward male. Nothing records that
   choice: `poc/art-packs/taproom.json` stores label/anchor/height/art paths,
   and provenance keeps generator and date but not the prompt text.
5. Voice casting resolved it toward female. The recorded criteria were native
   Japanese capability, prior validation, and distinctness from the learner
   (`voices.json` note, `brief.md:86-88`) — persona is never a criterion.
6. `poc/tools/tts/generate_audio.py:20,172,301` accepts voice preset, speed,
   seed. No persona input exists to violate; default is `Ono_Anna`.
7. No gate compares the two: the character-separation gate is four text reading
   passes, QA validates art-pack structure, and the listening pass judges clip
   quality per clip.

Verdict: Step 7's brief is the break point — it is the one document feeding
both art and voice, and it names apparent gender to neither. Step 3's card
template is the upstream cause, since the brief inherits its fields.

Fix constraint discovered while scoping a recast: the preset bank carries no
gender metadata anywhere. `grep` over
`mlx_audio/tts/models/qwen3_tts/qwen3_tts.py` returns only example speaker
names, and no repo file records preset sex. Of nine presets, `eric`/`dylan` are
dialect-locked, `ryan` is documented as producing garbage Japanese, `aiden` is
the narrator, and `uncle_fu` reads much older than early 20s — so a young-male
Japanese-capable preset may not exist in the bank. Recasting may require voice
cloning (blocked on a consented native clip) or regenerating the staff art as
female.

Not fixed in this session; presented to the user as options.
