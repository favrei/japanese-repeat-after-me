# The halted "hear your own line" feature got its player

The 2026-08-01 UX review's top finding — a learner can never hear a model of
the line they are asked to say — was half-built when work stopped: the nine
model clips were generated (café four, taproom five), `cafe.ts` / `taproom.ts`
carried `audioSrc` on every `mode: "speak"` bubble, and `sw.js` precached them
at cache `v12`. Nothing in the UI played any of it: `replayCurrentAutoplay`
returns early on speak bubbles and its button lives in the autoplay branch.

Finished in `client/components/PracticeApp.tsx` + `app/globals.css`:

- `playModelLine()` and a `▷ おてほん` / `■ とめる` button
  (`data-testid="model-line"`), placed in a new `.speak-controls` flex beside
  はなす — hearing the line and saying it are one gesture.
- Never automatic, and **disabled while `isListening || isWarmingUp ||
  isEvaluating`**: a clip sounding into an open microphone would be captured
  and scored as the learner's attempt. `startListening` also stops any clip
  still playing, for the same reason.
- Tapping おてほん during a judged hold clears `advanceTimerRef`, so studying
  the model never gets the card pulled away; つぎへ is still right there.

Also fixed while in there: `.dialogue-reading.passed .miss` kept the accent red
(the `.passed` rule softened background and weight but never `color`), so an
exact pass still showed red kana — `markReadingHits` marks kana that a kanji
transcript cannot literally contain. Now `color: inherit`. And the `too-short`
error told the learner to "hold the button" when recording is tap-to-toggle.

Guardrails: a new contract test asserts every `speak` bubble ships a model clip
file over 1 KB, and the integration test pins the testid, the disabled
condition, and `.speak-controls`.

Full `npm run qa` green: art validation, model check, typecheck, lint, build,
31 client + 3 contract + 7 worker + 5 integration.
