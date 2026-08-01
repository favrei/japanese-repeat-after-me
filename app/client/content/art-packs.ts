import cafeManifest from "../../art-packs/cafe.json";
import officeManifest from "../../art-packs/office.json";
import taproomManifest from "../../art-packs/taproom.json";
import type {
  ArtCharacter,
  ArtPack,
  ArtScene,
} from "../../shared/art-pack";

export type {
  ArtCharacter,
  ArtPack,
  ArtScene,
  CharacterAnchor,
  CharacterMood,
} from "../../shared/art-pack";

export const ART_PACKS = {
  cafe: cafeManifest as ArtPack,
  office: officeManifest as ArtPack,
  taproom: taproomManifest as ArtPack,
} satisfies Record<string, ArtPack>;

export type ArtPackId = keyof typeof ART_PACKS;

export function getArtPack(id: ArtPackId) {
  return ART_PACKS[id];
}

export function isArtPackId(id: string): id is ArtPackId {
  return id in ART_PACKS;
}

/**
 * Scene and character lookups throw rather than fall back: a stage pointing at
 * a key the pack does not ship is a content bug, and `npm run validate:art`
 * plus the flow tests catch it long before it can reach a screen.
 */
export function getScene(pack: ArtPack, sceneId: string): ArtScene {
  const scene = pack.scenes[sceneId];
  if (!scene) {
    throw new Error(`Art pack "${pack.id}" has no scene "${sceneId}"`);
  }
  return scene;
}

export function getCharacter(pack: ArtPack, castId: string): ArtCharacter {
  const character = pack.characters[castId];
  if (!character) {
    throw new Error(`Art pack "${pack.id}" has no character "${castId}"`);
  }
  return character;
}
