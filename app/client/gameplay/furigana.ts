import { normalizeJapanese } from "./scoring.ts";

/**
 * A run of the authored line, paired with the kana that belong above it.
 *
 * A learner reads the sentence, not a second romanised copy of it, so the
 * reading is only ever shown where the surface does not already read itself:
 * over kanji, and over anything else the kana cannot be recovered from.
 */
export type FuriganaSegment = {
  /** The authored surface run, exactly as the story wrote it. */
  text: string;
  /** Kana drawn above `text`; absent when the run already reads itself. */
  ruby?: string;
};

export type FuriganaMark = {
  char: string;
  state: "hit" | "miss" | "plain";
};

export type MarkedFuriganaSegment = FuriganaSegment & {
  /** Per-character marks over `ruby` when it exists, otherwise over `text`. */
  marks: FuriganaMark[];
  /** The run's combined verdict, so a ruby'd kanji can be tinted as a whole. */
  state: "hit" | "miss" | "plain";
};

type SurfaceChunk = {
  /** True when the run's reading cannot be read off the surface itself. */
  opaque: boolean;
  text: string;
};

function isKana(value: string) {
  return Array.from(value).every((character) => {
    const code = character.charCodeAt(0);
    return (code >= 0x3041 && code <= 0x3096) || character === "ー";
  });
}

/**
 * Split an authored line into alternating self-reading and opaque runs.
 *
 * Katakana is self-reading: `normalizeJapanese` folds it to hiragana, which is
 * exactly how the authored reading spells it, and Japanese does not gloss it.
 * Punctuation carries no reading at all, so it rides along with the kana.
 */
function surfaceChunks(japanese: string): SurfaceChunk[] {
  const chunks: SurfaceChunk[] = [];

  for (const character of japanese) {
    const normalized = normalizeJapanese(character);
    const opaque = normalized !== "" && !isKana(normalized);
    const previous = chunks.at(-1);
    if (previous?.opaque === opaque) {
      previous.text += character;
    } else {
      chunks.push({ opaque, text: character });
    }
  }

  return chunks;
}

/**
 * Place the authored reading over the authored surface.
 *
 * The story already supplies the correct reading for the whole line, so the
 * browser never has to guess a kanji reading or ship a dictionary: the kana
 * runs are anchors, and whatever falls between two anchors is the reading of
 * the opaque run between them. Returns null when the two cannot be reconciled,
 * which is a content bug rather than something to paper over at runtime.
 */
export function alignFurigana(line: {
  japanese: string;
  reading: string;
}): FuriganaSegment[] | null {
  const reading = normalizeJapanese(line.reading);
  const chunks = surfaceChunks(line.japanese);
  if (!reading || chunks.length === 0) return null;

  function solve(
    chunkIndex: number,
    readingIndex: number,
  ): FuriganaSegment[] | null {
    if (chunkIndex === chunks.length) {
      return readingIndex === reading.length ? [] : null;
    }

    const chunk = chunks[chunkIndex];
    if (!chunk.opaque) {
      const expected = normalizeJapanese(chunk.text);
      if (!reading.startsWith(expected, readingIndex)) return null;
      const rest = solve(chunkIndex + 1, readingIndex + expected.length);
      return rest && [{ text: chunk.text }, ...rest];
    }

    // An opaque run reads as at least one kana. Try the shortest reading first;
    // the kana the author wrote next is what settles the boundary.
    for (let end = readingIndex + 1; end <= reading.length; end += 1) {
      const rest = solve(chunkIndex + 1, end);
      if (rest) {
        return [
          { text: chunk.text, ruby: reading.slice(readingIndex, end) },
          ...rest,
        ];
      }
    }
    return null;
  }

  return solve(0, 0);
}

/**
 * Spread per-kana attempt marks across placed furigana.
 *
 * `hits` is indexed by position in the normalized reading — the same order the
 * segments consume it in — so a mark lands on the kana it was judged on: on the
 * ruby above a kanji, or on the kana written in the sentence itself.
 */
export function markFurigana(
  segments: FuriganaSegment[],
  hits: boolean[],
): MarkedFuriganaSegment[] {
  let readingIndex = 0;

  return segments.map((segment) => {
    const source = segment.ruby ?? segment.text;
    const marks: FuriganaMark[] = Array.from(source).map((char) => {
      if (normalizeJapanese(char) === "") return { char, state: "plain" };
      const hit = hits[readingIndex] ?? false;
      readingIndex += 1;
      return { char, state: hit ? "hit" : "miss" };
    });

    const judged = marks.filter((mark) => mark.state !== "plain");
    const state = !judged.length
      ? "plain"
      : judged.every((mark) => mark.state === "hit")
        ? "hit"
        : "miss";

    return { ...segment, marks, state };
  });
}
