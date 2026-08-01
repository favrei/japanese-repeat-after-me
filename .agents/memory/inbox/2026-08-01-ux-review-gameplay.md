# UX review of gameplay (2026-08-01)

Walked the app headless (Playwright, phone + desktop viewports, `?qa=1` synthetic
buttons, fake mic). Verified against `PracticeApp.tsx`. Observations:

- Learner (`mode: "speak"`) bubbles have **no `audioSrc`** — only staff autoplay
  lines carry clips. A learner can never hear a model of the line they must say.
- On QA success, the marked reading still renders red-highlighted kana
  (`markReadingHits` on exact transcript "メニューをお願いします。" marks ねが red).
- Learner-facing jargon shipped in UI: `Vosk heard: 「…」` (PracticeApp.tsx:1440)
  and mic status strings `game-session mic active · browser route matched ·
  hardware test open` / `Microphone not confirmed · hardware test open` (:1222-31).
- Attempt pips change semantics: `1/3` ordinal before attempts, `のこり Nかい`
  after a failure, back to `1/3` on success (:1405-1414).
- too-short error says "hold the button" (:775) but record is tap-toggle.
- Record stop label `録音をおわる` uses kanji; rest of learner copy is hiragana-first.
- End screen always says STORY COMPLETE + story title even when entered at stage 2.
- Phone library hides `7 BUBBLES / 2 TO SPEAK` + subtitle that desktop shows.
- QA mode holds autoplay 60 s by design (`wait(60_000)` :537) — not a bug.

Dev server started for review and stopped after.
