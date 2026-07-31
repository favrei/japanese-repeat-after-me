import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const manifestsRoot = path.join(projectRoot, "art-packs");
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const positionPattern = /^(?:100|\d{1,2})% (?:100|\d{1,2})%$/;

function readPngMetadata(buffer, label) {
  assert.ok(buffer.subarray(0, 8).equals(pngSignature), `${label} is not PNG`);
  assert.equal(buffer.toString("ascii", 12, 16), "IHDR", `${label} lacks IHDR`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25],
  };
}

function publicAssetPath(assetPath) {
  assert.match(assetPath, /^\/art-packs\/[a-z][a-z0-9-]*\/[a-z0-9-]+\.png$/);
  return path.join(projectRoot, "public", assetPath);
}

async function inspectAsset(assetPath, label) {
  const absolutePath = publicAssetPath(assetPath);
  const info = await stat(absolutePath);
  assert.ok(info.size > 0, `${label} is empty`);
  return readPngMetadata(await readFile(absolutePath), label);
}

const manifestFiles = (await readdir(manifestsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => entry.name)
  .sort();

assert.ok(manifestFiles.length > 0, "No art packs found");

for (const manifestFile of manifestFiles) {
  const folder = path.basename(manifestFile, ".json");
  const manifestPath = path.join(manifestsRoot, manifestFile);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.equal(manifest.schemaVersion, 2, `${folder}: unsupported schema`);
  assert.equal(manifest.id, folder, `${folder}: id must match its folder`);
  assert.match(manifest.id, /^[a-z][a-z0-9-]*$/);
  assert.ok(manifest.title?.ja && manifest.title?.en);
  assert.ok(manifest.labels?.volume);

  const cover = await inspectAsset(manifest.cover, `${folder}: cover`);
  assert.ok(cover.width >= 1200 && cover.height >= 750);
  assert.ok(cover.width / cover.height >= 1.45);

  const sceneIds = Object.keys(manifest.scenes ?? {});
  assert.ok(sceneIds.length > 0, `${folder}: needs at least one scene`);

  for (const sceneId of sceneIds) {
    const scene = manifest.scenes[sceneId];
    assert.match(sceneId, /^[a-z][a-z0-9-]*$/);
    assert.match(scene.focus?.landscape ?? "", positionPattern);
    assert.match(scene.focus?.portrait ?? "", positionPattern);
    if (scene.scale !== undefined) {
      assert.ok(
        typeof scene.scale === "number" && scene.scale >= 1 && scene.scale <= 2,
        `${folder}/${sceneId}: scale must be between 1 and 2`,
      );
    }

    const landscape = await inspectAsset(
      scene.landscape,
      `${folder}/${sceneId}: landscape scene`,
    );
    const portrait = await inspectAsset(
      scene.portrait,
      `${folder}/${sceneId}: portrait scene`,
    );
    assert.ok(
      landscape.width >= 1400 && landscape.width / landscape.height >= 1.4,
    );
    assert.ok(
      portrait.height >= 1400 && portrait.width / portrait.height <= 0.8,
    );
  }

  const characterIds = Object.keys(manifest.characters ?? {});
  assert.ok(characterIds.length > 0, `${folder}: needs at least one character`);

  for (const characterId of characterIds) {
    const character = manifest.characters[characterId];
    assert.match(characterId, /^[a-z][a-z0-9-]*$/);
    assert.ok(character.label, `${folder}/${characterId}: needs a label`);
    assert.ok(["left", "right"].includes(character.anchor));
    assert.ok(
      character.heightPercent?.mobile >= 30 &&
        character.heightPercent?.mobile <= 90,
    );
    assert.ok(
      character.heightPercent?.desktop >= 30 &&
        character.heightPercent?.desktop <= 90,
    );
    assert.ok(
      character.bottomPercent >= -10 && character.bottomPercent <= 30,
      `${folder}/${characterId}: bottomPercent out of range`,
    );

    for (const mood of ["neutral", "positive", "concerned"]) {
      const art = await inspectAsset(
        character.art[mood],
        `${folder}/${characterId}: ${mood} character`,
      );
      assert.ok(art.height >= 1400);
      assert.ok(
        art.colorType === 4 || art.colorType === 6,
        `${folder}/${characterId}: ${mood} character must have alpha`,
      );
    }
  }

  console.log(
    `✓ ${folder} — ${sceneIds.length} scene(s), ${characterIds.length} character(s)`,
  );
}
