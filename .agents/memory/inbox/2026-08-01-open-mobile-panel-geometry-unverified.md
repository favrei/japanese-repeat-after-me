# Open: mobile practice-panel geometry never measured

The 2026-08-01 panel slimming (see
[[2026-08-01-practice-panel-slimmed-mic-chip]]) was verified on desktop only.
The mobile branch — `@media (max-width: 820px)` in `app/globals.css`, rows
`minmax(38px, auto) 50px auto auto`, `min-block-size: 132px`,
`max-block-size: 46dvh` — has never been rendered at a mobile viewport.

Claimed ~153px settled against the old fixed 238px, but that is arithmetic off
the row stack, not observation. Worth confirming on a real phone, especially:

- whether the `.mic-chip` at `max-width: 58%` and the right-aligned
  `.panel-foot` fit on one line at 390px without wrapping;
- whether the drawer open (row 4) plus the 46dvh cap leaves the balloon
  readable on a short viewport.
