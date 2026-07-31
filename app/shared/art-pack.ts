export type CharacterAnchor = "left" | "right";
export type CharacterMood = "neutral" | "positive" | "concerned";

/** One background the story can cut to. Stages pick a scene by key. */
export type ArtScene = {
  landscape: string;
  portrait: string;
  focus: { landscape: string; portrait: string };
  /** Camera push-in about the focus point; 1 is the plate as generated. */
  scale?: number;
  foreground?: string;
};

/** One other party the story can cut to. Stages pick a character by key. */
export type ArtCharacter = {
  label: string;
  anchor: CharacterAnchor;
  heightPercent: { mobile: number; desktop: number };
  bottomPercent: number;
  art: Record<CharacterMood, string>;
};

export type ArtPack = {
  schemaVersion: 2;
  id: string;
  title: { ja: string; en: string };
  labels: { volume: string };
  cover: string;
  scenes: Record<string, ArtScene>;
  characters: Record<string, ArtCharacter>;
  provenance: {
    creator: string;
    generator: string;
    generatedAt: string;
    promptGuide: string;
    notes?: string;
  };
};
