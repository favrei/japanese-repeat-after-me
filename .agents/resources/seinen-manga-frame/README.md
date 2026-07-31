# Seinen manga frame — design mockup

`mock.html` is a self-contained static mockup of the seinen slice-of-life manga
frame the user approved on 2026-07-30, replacing the earlier kawaii/storybook
tone shipped in `app/`. Open it directly in a browser; states are selected by
the location hash:

```
mock.html#cover   mock.html#staff   mock.html#speak
mock.html#fail    mock.html#win     mock.html#end
```

Resize the window to check the responsive behaviour — the shell is
`position: fixed; inset: 0`, so the scene fills any viewport and the bottom
panel collapses to a single row above 760px.

## Why it matters

It is the reference for porting the frame into `app/app/globals.css` and
`app/app/PracticeApp.tsx`. It is a **design reference, not production code** —
flow logic, testids, and state handling in `app/` are authoritative and must not
be changed to match the mockup.

## Design tokens it establishes

| Token      | Value     | Role                                  |
| ---------- | --------- | ------------------------------------- |
| `--paper`  | `#efece4` | newsprint background                  |
| `--ink`    | `#14120f` | outlines, fills, primary text         |
| `--ink-2`  | `#3d3831` | secondary text                        |
| `--ink-3`  | `#7d766b` | tertiary text                         |
| `--accent` | `#a81c22` | the single accent — deep manga red    |

Fonts: **Shippori Mincho B1** (dialogue, headings) and **Zen Kaku Gothic New**
(UI, latin). Both Google Fonts, SIL Open Font License — self-host the JP subsets
for PWA offline use rather than relying on the CDN as the mockup does.

Screentone is CSS: two offset `radial-gradient` dot layers form a 45° lattice;
density is varied through `--r` (dot radius) and `--d` (cell size) on the
`.tone-10 / -30 / -50 / -70` classes.

## Known unresolved issues in this mockup

- The character SVG is a weak placeholder (reads as a long robe, head floats,
  balloon tail overlaps it). Real art is the pending t2i pass.
- The failure state is louder than the seinen register warrants — full-width red
  burst plus dense speed lines is closer to shonen.
- The black counter band is a dead slab, worse on wide viewports.
- The placeholder scene geometry does not fill a 1440px-wide viewport.
- The failure caption wraps awkwardly at 412px.

Accessed / authored 2026-07-30. No external assets are embedded; the only
network dependency is the Google Fonts stylesheet.
