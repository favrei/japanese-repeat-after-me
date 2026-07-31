# Art System

How story art enters the application. The application owns a constant manga
frame; a story supplies a replaceable **art pack** inside it. The café pack is
the reference implementation, not a layout special case.

Read this with [`../memory/cells/visual-design.md`](../memory/cells/visual-design.md),
which holds the visual register and the decision history behind it.

## Status — 2026-07-31

Implemented and mechanically green. The historical branch details below record
how the system reached the nested application repository.

- `design/art-pack-system` in `../japanese-repeat-after-me-art-system` is now
  committed and clean at `e37d5c4`. The earlier warning about uncommitted
  working-tree state there no longer applies.
- **`schemaVersion 2` supersedes the v1 contract this document first
  described.** It lives on `design/scene-transitions` (`6e6b83c`) in
  `../japanese-repeat-after-me-scene-transitions`, branched from
  `design/art-pack-system`. A pack now declares named `scenes` and named
  `characters` rather than one of each, because a stage change is a scene
  change. See [`stage-design-flow.md`](stage-design-flow.md) Step 2b.
- `npm run qa` passes there — art validation, typecheck, lint, production
  build, `19/19` tests — and the cuts were checked in Chrome at desktop and
  `412×915`. None of that is visual approval.
- The nested application later absorbed the finished adult seinen frame.

This document describes the contract so it survives the worktrees. The canonical
copy, while the branches exist, is `art-system/README.md` inside
`../japanese-repeat-after-me-scene-transitions`.

## Fixed frame

The application owns, and a pack never changes:

- full-viewport responsive composition;
- newsprint, ink, neutral screentone, and exactly one deep-red UI accent;
- Shippori Mincho B1 for dialogue, Zen Kaku Gothic New for controls;
- navigation, progress, balloon, speaking controls, feedback, and motion;
- the transition card the narrator speaks over between stages;
- first-person learner with no learner sprite.

The confirmed dialogue flow is independent of all of this. Art work must not
change flow logic, state handling, or test selectors. See
[`../memory/cells/product.md`](../memory/cells/product.md).

## Pack contract

One manifest plus one asset folder per story. A pack declares **named scenes and
named characters**, not one of each, and a stage under
`app/client/content/` names the
`sceneId` and `castId` it plays against:

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

- Scene art is opaque and ships in both orientations. Character art must have
  an alpha channel.
- Generated art must contain no dialogue, speech balloons, UI, or the red
  accent. The accent belongs to application state, never to the story art.
- **Lettering in the scene is allowed.** Signage, menu boards, labels, and
  logos may be rendered into the art when the setting calls for them — the
  generator can produce legible text, so a board that is meant to have writing
  on it should have writing on it. Two limits remain: what the learner is
  asked to *read or act on* is UI text, never baked art; and speech stays in
  balloons, never lettered into the image.
- The manifest is validated against `art-system/art-pack.schema.json`
  (`schemaVersion: 2`, `additionalProperties: false` throughout). It declares:
  - `id`, localized `title` (`ja`/`en`), `labels` (`volume`), and `cover`;
  - `scenes.<id>` — `landscape`, `portrait`, per-orientation `focus` as a
    `"52% 52%"` position, an optional `scale` (1–2) camera push-in about that
    point, and an optional `foreground`;
  - `characters.<id>` — `label` (the name shown on the balloon), `anchor`
    (`left`/`right`), `heightPercent` for `mobile` and `desktop` (30–90),
    `bottomPercent` (−10–30), and three required `art` states;
  - `provenance` — `creator`, `generator`, `generatedAt`, `promptGuide`, and an
    optional `notes`;
  - every path must match `/art-packs/<pack-id>/<name>.png`.
- **Two scenes may name the same files** with a different focus and scale. That
  is a reframe of one plate rather than a second shot, and it must be recorded
  in `provenance.notes`. The café pack's `register` is currently exactly this,
  pending a dedicated plate.

`art-system/PROMPT_TEMPLATE.md` carries a fixed **style lock** and **negative
lock** for generation; only the story brief, setting, character identity, and
composition fields are meant to change. Character cutouts are generated on flat
`#00ff00` chroma key.

## Submitting a pack

1. Copy `art-system/pack-template/manifest.json` to `art-packs/<pack-id>.json`.
2. Generate assets with `art-system/PROMPT_TEMPLATE.md`.
3. Fill in real filenames, composition values, and provenance.
4. Add one manifest import to `app/art-packs.ts`.
5. Point each stage's `sceneId` and `castId` at keys the pack actually ships.
6. Run `npm run validate:art` (it also runs first inside `npm run qa`).
7. Review `/?art=1` — the development-only art-review view — at phone and
   wide-desktop sizes. It lists every scene and every character in the pack.

It passes when the pack can replace the café pack **without changing component
markup or frame CSS**.

## Review gates

- adult proportions and restrained expressions;
- consistent identity, clothing, line work, lighting, and camera across states;
- believable ground contact and scene perspective;
- readable balloon safe area in both orientations;
- no important crop loss at `412×915` or wide desktop;
- a reframed scene still places its character believably in it;
- scenes in one pack agree on establishment, hour, and weather unless a
  narrator's transition line says otherwise;
- no childlike, chibi, glossy, cel-shaded, emoji, or shonen-burst treatment;
- no dialogue, balloons, or UI baked into art; intentional scene lettering is
  non-instructional and reviewed;
- no story colour used as application state;
- required files, dimensions, aspect ratios, and alpha channel validate.

## Café reference pack

Cover, landscape and portrait scenes, three transparent character states, app
icons, and a social card were generated on 2026-07-30 with OpenAI built-in
image generation. Source generations are kept outside the repository at
`~/.codex/generated_images/019fb376-eb0f-7141-b3c7-622e4a05fb44/`.

**The pack still owes art.** It ships one plate and one character, so:

- `register` reframes the `hall` plate instead of being its own shot;
- character change is implemented but undemonstrated — one server across both
  café stages is right for this story, so nothing exercises it.

If a later agent has no text-to-image capability, keep the existing pack assets
and leave one precise inbox note. Do not substitute unrelated stock art or
known-wrong shipped assets.

## Relationship to uploaded chapters

Future user-uploaded chapters are a confirmed later phase. The pack contract is
the current answer for their art: crop focus, character anchoring and scale,
and provenance are already manifest fields. Upload validation would still need
safe overlay areas, file and dimension limits, accessibility treatment, and
copyright and review policy on top of it. See
[`../memory/cells/content.md`](../memory/cells/content.md).

## Related

- [`../resources/seinen-manga-frame/`](../resources/seinen-manga-frame/) — the
  design mockup that preceded the implementation. Reference, not production
  code, and it has known unresolved defects.
- [`stage-design-flow.md`](stage-design-flow.md) — ends by writing the art &
  voice brief that a pack consumes.
- [`../memory/cells/delivery.md`](../memory/cells/delivery.md) — QA and release
  gates, including the `/?art=1` development surface and the outstanding
  `next@16.2.6` advisories on this branch.
