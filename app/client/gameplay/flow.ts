export type BubbleEvent = "success" | "failure" | "skip";

export type BubbleDecision = {
  advance: boolean;
  failedAttempts: number;
};

export function resolveBubbleEvent(
  event: BubbleEvent,
  failedAttempts: number,
): BubbleDecision {
  if (event === "success" || event === "skip") {
    return {
      advance: true,
      failedAttempts,
    };
  }

  const nextFailedAttempts = failedAttempts + 1;
  return {
    advance: nextFailedAttempts >= 3,
    failedAttempts: nextFailedAttempts,
  };
}

/** How long a transition card holds before releasing itself, when it has no audio. */
export const DEFAULT_INTERLUDE_HOLD_MS = 3400;

export type StagedStep = { stageIndex: number };

/**
 * Where the story goes once the bubble at `position` is dismissed.
 *
 * `interlude` means the next bubble belongs to a different stage, so the
 * narrator's transition card plays before it. The bubble rules themselves are
 * untouched: a transition is a break between bubbles, never an extra attempt,
 * a scored step, or something the learner has to pass.
 */
export type AdvanceTarget =
  | { kind: "complete" }
  | { kind: "interlude"; position: number; stageIndex: number }
  | { kind: "bubble"; position: number };

export function advanceTarget(
  script: StagedStep[],
  position: number,
): AdvanceTarget {
  const next = position + 1;
  if (next >= script.length) return { kind: "complete" };

  const nextStageIndex = script[next].stageIndex;
  if (nextStageIndex !== script[position].stageIndex) {
    return { kind: "interlude", position: next, stageIndex: nextStageIndex };
  }

  return { kind: "bubble", position: next };
}

/** A selected stage opens on its transition, never mid-sentence. */
export function openingTarget(stageIndex = 0): AdvanceTarget {
  return { kind: "interlude", position: 0, stageIndex };
}
