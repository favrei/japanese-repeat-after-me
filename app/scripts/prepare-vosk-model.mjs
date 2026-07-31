import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  access,
  open,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MODEL_NAME = "vosk-model-small-ja-0.22";
const MODEL_URL = `https://alphacephei.com/vosk/models/${MODEL_NAME}.zip`;
const SOURCE_SHA256 =
  "efa092d280153a77615e9e0c7d7283e93e600de3d19d3bec686c57ef19d52eac";
const OUTPUT = resolve(
  "public",
  "models",
  `${MODEL_NAME}.tar.gz`,
);
const PART_SIZE = 8 * 1024 * 1024;
const PART_PREFIX = `${MODEL_NAME}.part-`;
const PART_MANIFEST = resolve(
  "public",
  "models",
  `${MODEL_NAME}.parts.json`,
);

async function requirePreparedModel() {
  try {
    const metadata = await stat(OUTPUT);
    if (metadata.size < 1_000_000) throw new Error("file is unexpectedly small");
    const { stdout } = await execFileAsync("tar", ["-tzf", OUTPUT]);
    const entries = new Set(stdout.split("\n"));
    for (const required of [
      "model/am/final.mdl",
      "model/conf/mfcc.conf",
      "model/conf/model.conf",
      "model/graph/HCLr.fst",
    ]) {
      if (!entries.has(required)) {
        throw new Error(`model archive is missing ${required}`);
      }
    }
    console.log(
      `${MODEL_NAME} is prepared at ${OUTPUT} (${Math.round(metadata.size / 1_000_000)} MB)`,
    );
  } catch (error) {
    throw new Error(
      `Local model is missing or invalid. Run "npm run model:prepare".`,
      { cause: error },
    );
  }
}

async function prepareModelParts() {
  const outputMetadata = await stat(OUTPUT);
  const outputDirectory = dirname(OUTPUT);
  const existing = await readdir(outputDirectory);
  await Promise.all(
    existing
      .filter(
        (entry) =>
          entry.startsWith(PART_PREFIX) ||
          entry === `${MODEL_NAME}.parts.json`,
      )
      .map((entry) =>
        rm(resolve(outputDirectory, entry), { force: true }),
      ),
  );

  const parts = [];
  const source = await open(OUTPUT, "r");
  try {
    for (
      let offset = 0, index = 0;
      offset < outputMetadata.size;
      offset += PART_SIZE, index += 1
    ) {
      const expectedBytes = Math.min(PART_SIZE, outputMetadata.size - offset);
      const buffer = Buffer.allocUnsafe(expectedBytes);
      const { bytesRead } = await source.read(
        buffer,
        0,
        expectedBytes,
        offset,
      );
      if (bytesRead !== expectedBytes) {
        throw new Error(
          `Model part ${index} read ${bytesRead} bytes; expected ${expectedBytes}`,
        );
      }

      const file = `${PART_PREFIX}${String(index).padStart(3, "0")}`;
      const bytes = buffer.subarray(0, bytesRead);
      await writeFile(resolve(outputDirectory, file), bytes);
      parts.push({
        bytes: bytesRead,
        file,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      });
    }
  } finally {
    await source.close();
  }

  await writeFile(
    PART_MANIFEST,
    `${JSON.stringify(
      {
        model: MODEL_NAME,
        parts,
        sha256: await sha256(OUTPUT),
        totalBytes: outputMetadata.size,
      },
      null,
      2,
    )}\n`,
  );
}

async function requirePreparedModelParts() {
  const manifest = JSON.parse(await readFile(PART_MANIFEST, "utf8"));
  if (manifest.model !== MODEL_NAME || !Array.isArray(manifest.parts)) {
    throw new Error("Model part manifest is invalid");
  }

  let totalBytes = 0;
  for (const [index, part] of manifest.parts.entries()) {
    if (
      part.file !== `${PART_PREFIX}${String(index).padStart(3, "0")}`
    ) {
      throw new Error(`Model part ${index} has an unexpected filename`);
    }
    const path = resolve(dirname(OUTPUT), part.file);
    const metadata = await stat(path);
    if (metadata.size !== part.bytes || (await sha256(path)) !== part.sha256) {
      throw new Error(`Model part ${part.file} failed validation`);
    }
    totalBytes += metadata.size;
  }

  if (
    totalBytes !== manifest.totalBytes ||
    manifest.sha256 !== (await sha256(OUTPUT))
  ) {
    throw new Error("Model parts do not reconstruct the prepared archive");
  }

  console.log(
    `${MODEL_NAME} has ${manifest.parts.length} verified browser part(s)`,
  );
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Model download failed with HTTP ${response.status}`);
  }
  await pipeline(
    Readable.fromWeb(response.body),
    createWriteStream(destination),
  );
}

async function sha256(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function main() {
  if (process.argv.includes("--check")) {
    await requirePreparedModel();
    await requirePreparedModelParts();
    return;
  }

  const workingDirectory = await mkdtemp(
    resolve(tmpdir(), "kissa-loop-vosk-"),
  );
  const sourceArchive = resolve(workingDirectory, `${MODEL_NAME}.zip`);
  const extractedDirectory = resolve(workingDirectory, "extracted");
  const packDirectory = resolve(workingDirectory, "pack");

  try {
    console.log(`Downloading ${MODEL_NAME} from the official Vosk host…`);
    await download(MODEL_URL, sourceArchive);

    const actualSha256 = await sha256(sourceArchive);
    if (actualSha256 !== SOURCE_SHA256) {
      throw new Error(
        `Model checksum mismatch: expected ${SOURCE_SHA256}, got ${actualSha256}`,
      );
    }

    await mkdir(extractedDirectory);
    await execFileAsync("unzip", [
      "-q",
      sourceArchive,
      "-d",
      extractedDirectory,
    ]);
    await access(resolve(extractedDirectory, MODEL_NAME, "am", "final.mdl"));
    await access(
      resolve(extractedDirectory, MODEL_NAME, "conf", "model.conf"),
    );

    await mkdir(packDirectory);
    await rename(
      resolve(extractedDirectory, MODEL_NAME),
      resolve(packDirectory, "model"),
    );
    await mkdir(dirname(OUTPUT), { recursive: true });
    await execFileAsync("tar", [
      "-czf",
      OUTPUT,
      "-C",
      packDirectory,
      "model",
    ]);
    await prepareModelParts();
    await requirePreparedModel();
    await requirePreparedModelParts();
  } finally {
    await rm(workingDirectory, { force: true, recursive: true });
  }
}

await main();
