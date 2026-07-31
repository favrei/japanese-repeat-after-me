# Art system

The application owns the manga frame. A story pack supplies the replaceable
art inside that frame. The café pack is the reference implementation, not a
layout special case.

## Fixed frame

- full-viewport responsive composition;
- newsprint, ink, neutral screentone, and one deep-red UI accent;
- Shippori Mincho for dialogue and Zen Kaku Gothic New for controls;
- navigation, progress, balloon, speaking controls, feedback, and motion;
- the transition card the narrator speaks over between stages;
- first-person learner with no learner sprite.

## Pack contract (schemaVersion 2)

A pack declares **named scenes and named characters**, not one of each. A stage
in a registered story module names the `sceneId` and `castId` it plays against,
so a story can change background, change other party, or both, at a stage
boundary.

```text
art-packs/<pack-id>.json
public/art-packs/<pack-id>/
  cover.png
  <scene>-landscape.png
  <scene>-portrait.png
  <character>-neutral.png
  <character>-positive.png
  <character>-concerned.png
```

- `cover` — one entry-frame plate per pack.
- `scenes.<id>` — `landscape`, `portrait`, per-orientation `focus`, and an
  optional `scale` (1–2) that pushes the camera in about the focus point. Two
  scenes may name the same files with a different focus and scale; that is a
  reframe of one plate, and it belongs in `provenance.notes` when it happens.
- `characters.<id>` — `label` (the name on the balloon), `anchor`,
  `heightPercent` for `mobile` and `desktop`, `bottomPercent`, and the three
  required `art` states.

Scene art is opaque. Character art must have transparency. Generated art must
not contain dialogue, speech balloons, UI, or the red accent. Anything the
learner is asked to read or act on is UI text, never baked art.

## Submission

1. Copy `art-system/pack-template/manifest.json` to
   `art-packs/<pack-id>.json`.
2. Generate the assets with `art-system/PROMPT_TEMPLATE.md`.
3. Fill in the real filenames, composition values, and provenance.
4. Add one manifest import to `app/art-packs.ts`.
5. Point each stage's `sceneId` and `castId` at keys the pack actually ships.
6. Add the story to `app/stories.ts`.
7. Run `npm run validate:art`.
8. Review `/?art=<pack-id>` at phone and wide-desktop sizes — it lists every
   scene and every character in the pack.

The submission passes when the pack can replace the café pack without changing
component markup or frame CSS.

## Review gates

- adult proportions and restrained expressions;
- consistent identity, clothing, line work, lighting, and camera across states;
- believable ground contact and scene perspective;
- readable balloon safe area in both orientations;
- no important crop loss at `412×915` or wide desktop;
- a reframed scene must still place the character believably in it;
- no childlike, chibi, glossy, cel-shaded, emoji, or shonen-burst treatment;
- no embedded text and no story colour used as application state;
- required files, dimensions, aspect ratios, and alpha channel validate.
