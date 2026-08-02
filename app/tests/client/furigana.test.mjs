import assert from "node:assert/strict";
import test from "node:test";
import {
  alignFurigana,
  markFurigana,
} from "../../client/gameplay/furigana.ts";
import { readingHitFlags } from "../../client/gameplay/scoring.ts";
import { STORIES } from "../../client/content/stories.ts";

function authoredLines() {
  return STORIES.flatMap((story) =>
    story.stages.flatMap((stage) => [
      { id: `${stage.id}:transition`, line: stage.transition },
      ...stage.bubbles.map((bubble) => ({ id: bubble.id, line: bubble })),
    ]),
  );
}

test("places the reading only over runs that do not read themselves", () => {
  const segments = alignFurigana({
    japanese: "ご注文はお決まりですか。",
    reading: "ごちゅうもんはおきまりですか。",
  });

  assert.deepEqual(segments, [
    { text: "ご" },
    { text: "注文", ruby: "ちゅうもん" },
    { text: "はお" },
    { text: "決", ruby: "き" },
    { text: "まりですか。" },
  ]);
});

test("leaves katakana unglossed", () => {
  const segments = alignFurigana({
    japanese: "メニューをお願いします。",
    reading: "めにゅーをおねがいします。",
  });

  assert.deepEqual(
    segments.filter((segment) => segment.ruby),
    [{ text: "願", ruby: "ねが" }],
  );
});

test("refuses a reading that cannot be reconciled with the surface", () => {
  assert.equal(
    alignFurigana({ japanese: "お茶をください。", reading: "こんにちは。" }),
    null,
  );
});

test("every authored line places its own reading", () => {
  for (const { id, line } of authoredLines()) {
    const segments = alignFurigana(line);
    assert.ok(segments, `${id} could not place its reading`);
    assert.equal(
      segments.map((segment) => segment.text).join(""),
      line.japanese,
      `${id} did not reproduce its own surface`,
    );
  }
});

test("attempt marks land on the kana they were judged on", () => {
  const line = {
    japanese: "ご注文はお決まりですか。",
    reading: "ごちゅうもんはおきまりですか。",
  };
  const segments = alignFurigana(line);
  const perfect = markFurigana(segments, readingHitFlags(line, line.reading));

  assert.ok(perfect.every((segment) => segment.state !== "miss"));
  // Punctuation carries no reading, so it is never judged.
  assert.deepEqual(perfect.at(-1).marks.at(-1), { char: "。", state: "plain" });

  const missed = markFurigana(
    segments,
    readingHitFlags(line, "ごまままままはおきまりですか"),
  );
  const kanjiRun = missed.find((segment) => segment.text === "注文");
  assert.equal(kanjiRun.state, "miss");
  assert.equal(kanjiRun.marks.map((mark) => mark.char).join(""), "ちゅうもん");
});
