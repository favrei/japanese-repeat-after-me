# Art System

How story art enters the application. The application owns a constant manga
frame; a story supplies a replaceable **art pack** inside it. The café pack is
the reference implementation, not a layout special case.

Read this with [`../memory/cells/visual-design.md`](../memory/cells/visual-design.md),
which holds the visual register and the decision history behind it.

## Status — 2026-07-30

Implemented, mechanically green, **not yet seen by the user, and not on nested
PoC `main`**.

- It lives in the sibling worktree `../japanese-repeat-after-me-art-system` on
  branch `design/art-pack-system`, rebased onto nested `main` (`ad3a356`).
- The branch tip is still `ad3a356`: the whole art system is **uncommitted
  working-tree state**. A careless `git clean`, `checkout`, or worktree removal
  destroys it. Commit before doing anything disruptive there.
- That worktree was seeded from `poc/`'s dirty state, so it also carries
  unrelated uncommitted scoring/test changes.
- `npm run qa` passes there — art validation, typecheck, lint, production
  build, `13/13` tests — and production browser QA passed at mobile and
  wide-desktop sizes. None of that is visual approval.
- Nested PoC `main` still runs the rejected childlike manga frame.

This document describes the contract so it survives the worktree. The canonical
copy of the contract, while the branch exists, is `art-system/README.md` inside
that worktree.

## Fixed frame

The application owns, and a pack never changes:

- full-viewport responsive composition;
- newsprint, ink, neutral screentone, and exactly one deep-red UI accent;
- Shippori Mincho B1 for dialogue, Zen Kaku Gothic New for controls;
- navigation, progress, balloon, speaking controls, feedback, and motion;
- first-person learner with no learner sprite.

The confirmed dialogue flow is independent of all of this. Art work must not
change flow logic, state handling, or test selectors. See
[`../memory/cells/product.md`](../memory/cells/product.md).

## Pack contract

One manifest plus one asset folder per story:

```text
art-packs/<pack-id>.json
public/art-packs/<pack-id>/
  cover.png
  scene-landscape.png
  scene-portrait.png
  character-neutral.png
  character-positive.png
  character-concerned.png
```

- Scene art is opaque and ships in both orientations. Character art must have
  an alpha channel.
- Generated art must contain no dialogue, lettering, logos, speech balloons,
  UI, or the red accent. The accent belongs to application state, never to the
  story art.
- The manifest is validated against `art-system/art-pack.schema.json`
  (`schemaVersion: 1`, `additionalProperties: false` throughout). It declares:
  - `id`, localized `title` (`ja`/`en`), and `labels` (`volume`, `otherParty`);
  - `assets` — cover, `scene.{landscape,portrait}`, three required character
    states, optional `foreground`; every path must match
    `/art-packs/<pack-id>/<name>.png`;
  - `composition` — `characterAnchor` (`left`/`right`), per-orientation
    `sceneFocus` crop focus as a `"52% 52%"` position, `characterHeightPercent`
    for `mobile` and `desktop` (30–90), and `characterBottomPercent` (−10–30);
  - `provenance` — `creator`, `generator`, `generatedAt`, `promptGuide`.

`art-system/PROMPT_TEMPLATE.md` carries a fixed **style lock** and **negative
lock** for generation; only the story brief, setting, character identity, and
composition fields are meant to change. Character cutouts are generated on flat
`#00ff00` chroma key.

## Submitting a pack

1. Copy `art-system/pack-template/manifest.json` to `art-packs/<pack-id>.json`.
2. Generate assets with `art-system/PROMPT_TEMPLATE.md`.
3. Fill in real filenames, composition values, and provenance.
4. Add one manifest import to `app/art-packs.ts`.
5. Run `npm run validate:art` (it also runs first inside `npm run qa`).
6. Review `/?art=1` — the development-only art-review view — at phone and
   wide-desktop sizes.

It passes when the pack can replace the café pack **without changing component
markup or frame CSS**.

## Review gates

- adult proportions and restrained expressions;
- consistent identity, clothing, line work, lighting, and camera across states;
- believable ground contact and scene perspective;
- readable balloon safe area in both orientations;
- no important crop loss at `412×915` or wide desktop;
- no childlike, chibi, glossy, cel-shaded, emoji, or shonen-burst treatment;
- no embedded text, and no story colour used as application state;
- required files, dimensions, aspect ratios, and alpha channel validate.

## Café reference pack

Cover, landscape and portrait scenes, three transparent character states, app
icons, and a social card were generated on 2026-07-30 with OpenAI built-in
image generation. Source generations are kept outside the repository at
`~/.codex/generated_images/019fb376-eb0f-7141-b3c7-622e4a05fb44/`.

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
