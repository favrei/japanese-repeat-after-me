import assert from "node:assert/strict";
import test from "node:test";
import {
  CONTENT_ACCEPT_THRESHOLD,
  markReadingHits,
  normalizeForReadingComparison,
  normalizeJapanese,
  scoreAttempt,
} from "../../client/gameplay/scoring.ts";
import { CAFE_STORY, STAGES } from "../../client/content/cafe.ts";
import { STORIES } from "../../client/content/stories.ts";

const target = STAGES[0].bubbles.find(
  (bubble) => bubble.id === "ordering-order",
);

test("normalizes Japanese kana and punctuation", () => {
  assert.equal(normalizeJapanese(" ブレンドコーヒー！ "), "ぶれんどこーひー");
});

test("accepts the known line in kanji or kana", () => {
  assert.ok(target);
  assert.equal(scoreAttempt([target.japanese], target).passed, true);
  assert.equal(scoreAttempt([target.reading], target).passed, true);
});

test("rejects an unrelated café line", () => {
  assert.ok(target);
  const result = scoreAttempt(["お手洗いはどこですか。"], target);
  assert.equal(result.passed, false);
  assert.ok(result.score < CONTENT_ACCEPT_THRESHOLD);
});

test("requires the presented line to be closest in the selected story", () => {
  assert.ok(target);
  const speakingBubbles = CAFE_STORY.flow.filter(
    (bubble) => bubble.mode === "speak",
  );
  const receipt = speakingBubbles.find(
    (bubble) => bubble.id === "meal-restroom",
  );
  assert.ok(receipt);

  const result = scoreAttempt(
    [receipt.japanese],
    target,
    speakingBubbles,
  );
  assert.equal(result.passed, false);
  assert.equal(result.nearestLineId, receipt.id);
});

test("uses the experiment 006 content threshold", () => {
  assert.equal(CONTENT_ACCEPT_THRESHOLD, 0.3);
});

test("marks every kana as hit for an exact attempt", () => {
  assert.ok(target);
  const marks = markReadingHits(target, target.reading);
  assert.ok(marks.length > 0);
  for (const mark of marks) {
    assert.notEqual(mark.state, "miss", `unexpected miss for ${mark.char}`);
  }
  assert.equal(
    marks.find((mark) => mark.char === "。")?.state,
    "plain",
  );
});

test("marks only the substituted kana as miss", () => {
  assert.ok(target);
  const missed = target.reading.replace("ぶれんど", "ぶれんご");
  assert.notEqual(missed, target.reading);
  const marks = markReadingHits(target, missed);
  const missChars = marks
    .filter((mark) => mark.state === "miss")
    .map((mark) => mark.char);
  assert.deepEqual(missChars, ["ど"]);
});

test("marks deleted kana as miss", () => {
  assert.ok(target);
  const dropped = target.reading.replace("こーひー", "こひー");
  const marks = markReadingHits(target, dropped);
  const missChars = marks
    .filter((mark) => mark.state === "miss")
    .map((mark) => mark.char);
  assert.deepEqual(missChars, ["ー"]);
});

test("normalizes recognized kanji to the authored reading before marking", () => {
  const line = {
    japanese: "今日はいい天気ですね。",
    reading: "きょうはいいてんきですね。",
  };
  const transcript = "今日 は いい 天気 です ねー";

  assert.equal(
    normalizeForReadingComparison(line, transcript),
    "きょうはいいてんきですねー",
  );
  assert.deepEqual(
    markReadingHits(line, transcript)
      .filter((mark) => mark.state === "miss")
      .map((mark) => mark.char),
    [],
  );
});

test("normalizes mixed Latin and katakana without changing the displayed reading", () => {
  const line = STORIES.flatMap((story) => story.flow).find(
    (bubble) => bubble.id === "gig-notice-shirt",
  );
  assert.ok(line);

  assert.equal(
    normalizeForReadingComparison(line, "Tシャツ、何のバンドですか。"),
    "てぃーしゃつなんのばんどですか",
  );
  assert.equal(
    markReadingHits(line, line.japanese)
      .map((mark) => mark.char)
      .join(""),
    line.reading,
  );
});

test("every speaking surface can be normalized through its canonical reading", () => {
  for (const line of STORIES.flatMap((story) => story.flow).filter(
    (bubble) => bubble.mode === "speak",
  )) {
    // The extra recognizer elongation prevents the exact-surface fast path
    // from hiding a broken surface-to-reading derivation. Insertions do not
    // turn an otherwise matching target character into a miss.
    const misses = markReadingHits(line, `${line.japanese}ー`).filter(
      (mark) => mark.state === "miss",
    );
    assert.deepEqual(misses, [], `${line.id} has representation-only misses`);
  }
});
