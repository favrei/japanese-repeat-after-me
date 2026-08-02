# Gameplay UI: furigana, one control strip, autoplay read hold

Date: 2026-08-01. Branch `chore/stories-idea-not-implementation`.

**Only part of this is committed.** At the user's direction the commit covers
the self-contained half — `client/gameplay/furigana.ts`, its test, the
`readingHitFlags` split in `scoring.ts`, and the taproom reading fix. The UI
itself (`app/globals.css`, `client/components/PracticeApp.tsx`,
`tests/integration/rendered-html.test.mjs`) is **still uncommitted in the
working tree**, because a concurrent accounts/voices session edited the same
three files and the ~150 hunks are interleaved beyond safe separation. Whoever
lands the accounts slice lands this UI with it.

User asked for three things and all three are implemented in `app/`:

1. **Bottom panel was a wall of buttons.** The speaking turn used to render a
   `panel-lead` heading + paragraph, a two-button control row, an attempts
   block with its own `1 / 3` label, a `panel-status` line with a labelled mic
   chip and a privacy note, the mic drawer, and QA controls — six blocks. It is
   now one caption line (`.panel-status` > `.panel-caption` + `.panel-heard`)
   over one control row (`.speak-controls`: おてほん, はなす, three attempt
   squares, an icon-only mic toggle). `.panel-lead` and `.panel-foot` are gone.
   Header and progress merged: position numbers moved into `.stage-title`, and
   `.progress` is a 4px hairline of cells. The scene gained roughly a third of
   the screen.

2. **Full-sentence reading removed, furigana added.** New
   `client/gameplay/furigana.ts` places the authored reading over only the runs
   that need it. It reuses the anchor idea already in `scoring.ts`
   `surfaceReadingParts`: kana runs are anchors, whatever falls between two
   anchors is the reading of the opaque run between them. Katakana normalizes
   to hiragana so it is treated as self-reading and never glossed. Returns
   `null` when surface and reading cannot be reconciled — that is a content
   bug, and the component falls back to showing both. `.dialogue-reading` and
   `.interlude-reading` are gone; `<rt>` carries the reading instead.
   `scoring.ts` gained `readingHitFlags` (flags over the normalized reading)
   split out of `markReadingHits`, so attempt marks land on the ruby kana above
   a kanji and on the bare kana in the sentence.

3. **Autoplay ended too fast.** `AUTOPLAY_READ_HOLD_MS = 2_600` now holds every
   autoplay bubble and every narrator card on screen after its clip ends,
   replacing the old 220 ms gap. A `.hold-bar` drains in view. スキップ still
   ends it immediately, and the one-success / three-failures / one-Skip bubble
   rules are untouched.

## Content bug the alignment found

`taproom-glass` transition read `立ち上がった` as `たちのぼった` — the surface
has an extra が the reading does not. The shipped `taproom-glass-open.mp3` was
synthesized from the *surface*, so the reading was corrected to
`たちあがった` rather than the surface being changed; the clip, its seed, and
its hash stay valid. A test now asserts every authored line in all three
stories can place its own reading (`tests/client/furigana.test.mjs`).

## Verified

`npm run typecheck`, `lint`, `test:client` (41), `test:contracts` (4),
`build`, `test:integration` (5) all pass. Browser-checked at 420 px and at
desktop width against the real dev server.
