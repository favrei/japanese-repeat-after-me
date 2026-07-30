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
