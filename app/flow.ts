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
