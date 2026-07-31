import type { ArtPack } from "./art-pack";
import type { PracticeStory } from "./story";

export const STORY_PACK_SCHEMA_VERSION = 1;

export type StoryPack = {
  schemaVersion: typeof STORY_PACK_SCHEMA_VERSION;
  id: string;
  version: string;
  story: PracticeStory;
  artPack: ArtPack;
};

/**
 * Validate the cross-boundary references without duplicating the full art-pack
 * schema validator used by the authoring tool.
 */
export function assertStoryPack(value: StoryPack): void {
  if (value.schemaVersion !== STORY_PACK_SCHEMA_VERSION) {
    throw new TypeError("unsupported story-pack schema version");
  }
  if (value.id !== value.story.id) {
    throw new TypeError("story-pack id must match story.id");
  }
  if (value.artPack.id !== value.story.artPackId) {
    throw new TypeError("story artPackId must match artPack.id");
  }

  const expectedFlowLength = value.story.stages.reduce(
    (count, stage) => count + stage.bubbles.length,
    0,
  );
  if (value.story.flow.length !== expectedFlowLength) {
    throw new TypeError("story flow must contain every stage bubble exactly once");
  }

  for (const [stageIndex, stage] of value.story.stages.entries()) {
    if (!value.artPack.scenes[stage.sceneId]) {
      throw new TypeError(`stage "${stage.id}" references a missing scene`);
    }
    if (!value.artPack.characters[stage.castId]) {
      throw new TypeError(`stage "${stage.id}" references a missing character`);
    }

    const stageFlow = value.story.flow.filter(
      (bubble) => bubble.stageIndex === stageIndex,
    );
    if (stageFlow.length !== stage.bubbles.length) {
      throw new TypeError(`stage "${stage.id}" flow length does not match`);
    }
    for (const [bubbleIndex, bubble] of stage.bubbles.entries()) {
      const flowBubble = stageFlow[bubbleIndex];
      if (
        flowBubble.id !== bubble.id ||
        flowBubble.stageId !== stage.id ||
        flowBubble.stageNumber !== stage.number
      ) {
        throw new TypeError(`stage "${stage.id}" flow order does not match`);
      }
    }
  }
}
