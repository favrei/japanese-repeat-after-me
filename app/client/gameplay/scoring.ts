import type { DialogueBubble } from "../../shared/story";

export type AttemptScore = {
  passed: boolean;
  score: number;
  transcript: string;
  nearestLineId: string;
  runnerUpScore: number;
};

/**
 * Experiment 006's sentence-grouped Vosk evaluation selected 0.30–0.35
 * thresholds across held-out sentence groups. This 0.30 floor is only a
 * coarse known-sentence content gate; it is not a pronunciation threshold.
 */
export const CONTENT_ACCEPT_THRESHOLD = 0.3;

function katakanaToHiragana(value: string) {
  return Array.from(value)
    .map((character) => {
      const code = character.charCodeAt(0);
      if (code >= 0x30a1 && code <= 0x30f6) {
        return String.fromCharCode(code - 0x60);
      }
      return character;
    })
    .join("");
}

export function normalizeJapanese(value: string) {
  return katakanaToHiragana(value.normalize("NFKC").toLowerCase())
    .replace(/[。、！？!?.,・「」『』（）()\s]/g, "")
    .replace(/ヶ/g, "か");
}

type ReadingComparisonLine = Pick<DialogueBubble, "japanese" | "reading">;

type SurfaceReadingPart = {
  reading: string;
  surface: string;
};

function isReadingCharacter(character: string) {
  const code = character.charCodeAt(0);
  return (code >= 0x3041 && code <= 0x3096) || character === "ー";
}

/**
 * Derive the opaque surface chunks in one authored line from its canonical
 * reading. This keeps the browser comparison target-conditioned: the content
 * already supplies the correct reading, so the runtime does not need a large
 * general-purpose Japanese dictionary or an ambiguous kanji-reading guess.
 */
function surfaceReadingParts(
  line: ReadingComparisonLine,
): SurfaceReadingPart[] {
  const surface = normalizeJapanese(line.japanese);
  const reading = normalizeJapanese(line.reading);
  if (!surface || !reading) return [];

  const chunks: Array<{ opaque: boolean; text: string }> = [];
  for (const character of surface) {
    const opaque = !isReadingCharacter(character);
    const previous = chunks.at(-1);
    if (previous?.opaque === opaque) {
      previous.text += character;
    } else {
      chunks.push({ opaque, text: character });
    }
  }

  function match(
    chunkIndex: number,
    readingIndex: number,
  ): SurfaceReadingPart[] | null {
    if (chunkIndex === chunks.length) {
      return readingIndex === reading.length ? [] : null;
    }

    const chunk = chunks[chunkIndex];
    if (!chunk.opaque) {
      if (!reading.startsWith(chunk.text, readingIndex)) return null;
      return match(chunkIndex + 1, readingIndex + chunk.text.length);
    }

    // An opaque surface chunk (kanji, a Latin abbreviation, or a number) must
    // consume at least one reading character. Try the shortest viable reading
    // first; the following authored kana anchors disambiguate the boundary.
    for (let end = readingIndex + 1; end <= reading.length; end += 1) {
      const rest = match(chunkIndex + 1, end);
      if (rest) {
        return [
          {
            surface: chunk.text,
            reading: reading.slice(readingIndex, end),
          },
          ...rest,
        ];
      }
    }
    return null;
  }

  return match(0, 0) ?? [];
}

/**
 * Put a recognizer transcript and the authored reading in the same internal
 * representation. The line shown in the UI is never changed.
 */
export function normalizeForReadingComparison(
  line: ReadingComparisonLine,
  transcript: string,
) {
  const surface = normalizeJapanese(line.japanese);
  const reading = normalizeJapanese(line.reading);
  let heard = normalizeJapanese(transcript);

  if (!heard || !surface || !reading) return heard;
  if (heard === surface) return reading;

  // Preserve authored order so a repeated kanji with two readings is handled
  // by its occurrence rather than by a global dictionary replacement.
  let searchFrom = 0;
  for (const part of surfaceReadingParts(line)) {
    const index = heard.indexOf(part.surface, searchFrom);
    if (index === -1) continue;
    heard =
      heard.slice(0, index) +
      part.reading +
      heard.slice(index + part.surface.length);
    searchFrom = index + part.reading.length;
  }

  return heard;
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost =
        left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

function targetSimilarity(transcript: string, target: string) {
  if (!transcript || !target) return 0;
  return Math.max(0, 1 - editDistance(transcript, target) / target.length);
}

function lineSimilarity(transcript: string, line: DialogueBubble) {
  const normalizedTranscript = normalizeJapanese(transcript);
  const readingTranscript = normalizeForReadingComparison(line, transcript);
  return Math.max(
    targetSimilarity(readingTranscript, normalizeJapanese(line.reading)),
    ...[line.japanese, line.reading, ...(line.accepted ?? [])]
      .map(normalizeJapanese)
      .map((target) => targetSimilarity(normalizedTranscript, target)),
  );
}

export function scoreAttempt(
  transcripts: string[],
  line: DialogueBubble,
  catalog: DialogueBubble[] = [line],
): AttemptScore {
  const candidates = catalog.some((candidate) => candidate.id === line.id)
    ? catalog
    : [line, ...catalog];
  let best:
    | {
        nearestLineId: string;
        presentedScore: number;
        runnerUpScore: number;
        transcript: string;
      }
    | undefined;

  for (const transcript of transcripts) {
    const scores = candidates
      .map((candidate) => ({
        id: candidate.id,
        score: lineSimilarity(transcript, candidate),
      }))
      .sort(
        (left, right) =>
          right.score - left.score || left.id.localeCompare(right.id),
      );
    const presentedScore =
      scores.find((candidate) => candidate.id === line.id)?.score ?? 0;
    const candidate = {
      nearestLineId: scores[0]?.id ?? line.id,
      presentedScore,
      runnerUpScore: scores[1]?.score ?? 0,
      transcript,
    };

    if (!best || candidate.presentedScore > best.presentedScore) {
      best = candidate;
    }
  }

  const result = best ?? {
    nearestLineId: line.id,
    presentedScore: 0,
    runnerUpScore: 0,
    transcript: "",
  };

  return {
    passed:
      result.nearestLineId === line.id &&
      result.presentedScore >= CONTENT_ACCEPT_THRESHOLD,
    score: result.presentedScore,
    transcript: result.transcript,
    nearestLineId: result.nearestLineId,
    runnerUpScore: result.runnerUpScore,
  };
}

export type ReadingMark = {
  char: string;
  state: "hit" | "miss" | "plain";
};

/**
 * Approximate per-kana hit flags for one attempt, indexed by position in the
 * normalized reading, derived from a Levenshtein alignment between that
 * reading and the heard transcript. This is transcript-to-target string
 * alignment, not acoustic phoneme scoring — treat the flags as coarse
 * guidance, not ground truth.
 */
export function readingHitFlags(
  line: ReadingComparisonLine,
  transcript: string,
): boolean[] {
  const target = normalizeJapanese(line.reading);
  const heard = normalizeForReadingComparison(line, transcript);
  const hits = new Array<boolean>(target.length).fill(false);

  if (target && heard) {
    const rows = target.length + 1;
    const cols = heard.length + 1;
    const dp: number[][] = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => (row === 0 ? col : col === 0 ? row : 0)),
    );

    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        const cost = target[i - 1] === heard[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost,
        );
      }
    }

    let i = target.length;
    let j = heard.length;
    while (i > 0 && j > 0) {
      const cost = target[i - 1] === heard[j - 1] ? 0 : 1;
      if (dp[i][j] === dp[i - 1][j - 1] + cost) {
        hits[i - 1] = cost === 0;
        i -= 1;
        j -= 1;
      } else if (dp[i][j] === dp[i - 1][j] + 1) {
        hits[i - 1] = false;
        i -= 1;
      } else {
        j -= 1;
      }
    }
    while (i > 0) {
      hits[i - 1] = false;
      i -= 1;
    }
  }

  return hits;
}

/**
 * The same attempt marks laid back over the authored reading string, so
 * punctuation stays visible and unmarked.
 */
export function markReadingHits(
  line: ReadingComparisonLine,
  transcript: string,
): ReadingMark[] {
  const hits = readingHitFlags(line, transcript);
  let markIndex = 0;
  return Array.from(line.reading).map((char) => {
    if (normalizeJapanese(char) === "") {
      return { char, state: "plain" };
    }
    const hit = hits[markIndex] ?? false;
    markIndex += 1;
    return { char, state: hit ? "hit" : "miss" };
  });
}
