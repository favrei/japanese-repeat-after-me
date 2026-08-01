# Practice panel slimmed: microphone routing collapsed to a chip

Peter: "the mic part is too big, the experience is not immersive anymore."

The microphone route was a permanent full-width row of technical controls —
`MIC INPUT | select | long status string | 再確認` — sitting under every
speaking turn, plus a separate privacy footer row.

Now, in `PracticeApp.tsx` + `app/globals.css`:

- Collapsed state is a single `.mic-chip` (`data-testid="microphone-chip"`):
  status dot plus device name, sharing one slim `.panel-status` line with the
  privacy note.
- The full `.microphone-route` drawer is `hidden` unless the learner taps the
  chip **or** `microphoneNeedsAttention` (state `choosing` / `error` /
  `route-lost`, or nothing selected). It resets closed on `beginStage`.
- `.practice-panel` moved from a fixed `block-size` to
  `auto` + `min-block-size` + `max-block-size: 38dvh` (46dvh mobile), so the
  drawer can open without ever swallowing the art.

Measured on desktop (dev build, QA row present, so production is ~25px less):

| state | panel | scene |
| --- | --- | --- |
| drawer open | 185px | 587px |
| settled (chip only) | 130px | 642px |

Mobile row stack recomputes to roughly 153px against the old fixed 238px.

**CSS trap hit here:** `.microphone-route` sets `display: grid`, and an author
class rule beats the UA `[hidden] { display: none }` rule, so `hidden` alone
did nothing. Needed an explicit `.microphone-route[hidden] { display: none }`.

Mobile geometry was not measured in the browser — `resize_window` did not move
the page viewport in this Chrome extension session (`innerWidth` stayed 1633
while `outerWidth` changed), so the mobile numbers above are arithmetic from
the row stack, not observation.
