# A judged bubble now holds long enough to read the verdict

Peter: passing the recognition gate advanced silently, with no chance to see
the final judgement.

`client/components/PracticeApp.tsx`:

- `SUCCESS_ADVANCE_HOLD_MS` 500 → 1600; the forced third-miss advance moved
  from an inline 650 to `EXHAUSTED_ADVANCE_HOLD_MS` = 2200 (that card is the
  one most worth studying).
- Marks were previously computed for misses only, so a pass had nothing to
  read. `attemptMarks` now renders for every judged attempt; the balloon gets
  `.dialogue-reading.marked.passed`, which softens the miss highlight and
  underlines hits instead of shouting.
- Scene badge on a pass reads ごうかく rather than 次へ.
- During the hold the はなす button is replaced by `data-testid="advance-now"`
  (つぎへ →), so the pause is a floor and never a wait.

`tests/integration/rendered-html.test.mjs` used to pin
`/const SUCCESS_ADVANCE_HOLD_MS = 500/` — a change-detector on the exact value
being tuned. Replaced with assertions on both constants plus the escape-hatch
testid.
