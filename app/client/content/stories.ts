import type { PracticeStory } from "../../shared/story.ts";
import type { ArtPackId } from "./art-packs.ts";
import { CAFE_STORY } from "./cafe.ts";
import { OFFICE_GIG_STORY } from "./office-gig.ts";
import { TAPROOM_STORY } from "./taproom.ts";

export const STORIES = [CAFE_STORY, TAPROOM_STORY, OFFICE_GIG_STORY] as const satisfies readonly PracticeStory<ArtPackId>[];

export type StoryId = (typeof STORIES)[number]["id"];
export type Story = (typeof STORIES)[number];

export function getStory(id: StoryId): Story {
  return STORIES.find((story) => story.id === id) ?? STORIES[0];
}
