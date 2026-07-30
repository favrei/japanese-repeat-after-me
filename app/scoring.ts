import type { DialogueBubble } from "./stages";

export type AttemptScore = {
  passed: boolean;
  score: number;
  transcript: string;
};

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

function similarity(left: string, right: string) {
  if (!left || !right) return 0;
  const longest = Math.max(left.length, right.length);
  return 1 - editDistance(left, right) / longest;
}

export function scoreAttempt(
  transcripts: string[],
  line: DialogueBubble,
): AttemptScore {
  const targets = [line.japanese, line.reading, ...(line.accepted ?? [])].map(
    normalizeJapanese,
  );
  let bestScore = 0;
  let bestTranscript = transcripts[0] ?? "";

  for (const transcript of transcripts) {
    const normalizedTranscript = normalizeJapanese(transcript);
    for (const target of targets) {
      const directScore = similarity(normalizedTranscript, target);
      const containmentScore =
        normalizedTranscript.includes(target) || target.includes(normalizedTranscript)
          ? Math.min(normalizedTranscript.length, target.length) /
            Math.max(normalizedTranscript.length, target.length)
          : 0;
      const candidateScore = Math.max(directScore, containmentScore);
      if (candidateScore > bestScore) {
        bestScore = candidateScore;
        bestTranscript = transcript;
      }
    }
  }

  return {
    passed: bestScore >= 0.56,
    score: bestScore,
    transcript: bestTranscript,
  };
}

export type ReadingMark = {
  char: string;
  state: "hit" | "miss" | "plain";
};

/**
 * Approximate per-kana hit/miss marks for a failed attempt, derived from a
 * Levenshtein alignment between the line reading and the heard transcript.
 * This is transcript-to-target string alignment, not acoustic phoneme
 * scoring — treat the marks as coarse guidance, not ground truth.
 */
export function markReadingHits(
  reading: string,
  transcript: string,
): ReadingMark[] {
  const target = normalizeJapanese(reading);
  const heard = normalizeJapanese(transcript);
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

  // Map normalized-hit flags back onto the original reading string so
  // punctuation stays visible and unmarked.
  let markIndex = 0;
  return Array.from(reading).map((char) => {
    if (normalizeJapanese(char) === "") {
      return { char, state: "plain" };
    }
    const hit = hits[markIndex] ?? false;
    markIndex += 1;
    return { char, state: hit ? "hit" : "miss" };
  });
}
