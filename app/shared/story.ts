/**
 * Who says a bubble: the learner, or the other party in the scene.
 *
 * "other" names the role, not the job — the person on screen is whoever the
 * stage's `castId` resolves to in the art pack, and the balloon's label comes
 * from there. A stage carries one other party today; a scene with two would
 * need a `castId` per bubble, not a wider union here.
 */
export type Speaker = "other" | "learner";
export type BubbleMode = "autoplay" | "speak";

export type DialogueBubble = {
  id: string;
  speaker: Speaker;
  mode: BubbleMode;
  japanese: string;
  reading: string;
  translation: string;
  audioSrc?: string;
  accepted?: string[];
};

/**
 * The break between stages: the narrator's cut.
 *
 * Every stage opens with one, including the first, so a stage is never entered
 * mid-sentence. The card covers the scene and cast change, and it is the only
 * place the narrator speaks.
 */
export type StageTransition = {
  id: string;
  japanese: string;
  reading: string;
  translation: string;
  audioSrc?: string;
  /** Overrides the default hold before the card releases itself. */
  holdMs?: number;
};

export type PracticeStage = {
  id: string;
  number: number;
  title: string;
  jpTitle: string;
  sceneId: string;
  castId: string;
  transition: StageTransition;
  bubbles: DialogueBubble[];
};

export type FlowBubble = DialogueBubble & {
  stageIndex: number;
  stageId: string;
  stageNumber: number;
  stageTitle: string;
  stageJpTitle: string;
};

export type PracticeStory<TArtPackId extends string = string> = {
  id: string;
  artPackId: TArtPackId;
  title: {
    ja: string;
    en: string;
  };
  stages: PracticeStage[];
  flow: FlowBubble[];
};

export function createFlow(stages: PracticeStage[]): FlowBubble[] {
  return stages.flatMap((stage, stageIndex) =>
    stage.bubbles.map((bubble) => ({
      ...bubble,
      stageIndex,
      stageId: stage.id,
      stageNumber: stage.number,
      stageTitle: stage.title,
      stageJpTitle: stage.jpTitle,
    })),
  );
}
