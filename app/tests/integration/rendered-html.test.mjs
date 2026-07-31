import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../../", import.meta.url);

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = `${prefix}${entry.name}`;
    if (entry.isDirectory()) {
      files.push(
        ...(await listFiles(
          new URL(`${entry.name}/`, directory),
          `${relativePath}/`,
        )),
      );
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

async function render(pathname = "/") {
  const workerUrl = new URL("../../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the four-stage story library", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>声にする物語 — Japanese speaking practice<\/title>/,
  );
  assert.match(html, /ステージを選ぶ/);
  assert.match(html, /喫茶店のひととき/);
  assert.match(html, /A moment at the café/);
  assert.match(html, /初めての一杯/);
  assert.match(html, /The first glass/);
  assert.match(html, /\/art-packs\/cafe\/cover\.png/);
  assert.match(html, /\/art-packs\/taproom\/cover\.png/);
  for (const stageId of [
    "ordering",
    "meal",
    "taproom-choose",
    "taproom-glass",
  ]) {
    assert.match(html, new RegExp(`select-stage-${stageId}`));
  }
  assert.match(html, /Skip always dismisses exactly one bubble/);
  assert.match(html, /manifest\.json/);
  assert.doesNotMatch(
    html,
    /Kissa Loop|three short rounds|cafe-scene|codex-preview|STORY COVER/i,
  );
});

test("the built Worker owns backend routes without making them a shell dependency", async () => {
  const catalog = await render("/api/catalog");
  assert.equal(catalog.status, 503);
  assert.deepEqual(await catalog.json(), {
    code: "storage_unavailable",
    error: "D1 storage is not configured.",
  });

  const shell = await render("/");
  assert.equal(shell.status, 200);
});

test("ships a local-only PWA shell without private development artifacts", async () => {
  const [
    app,
    localRecognizer,
    microphoneRoute,
    css,
    page,
    layout,
    packageJson,
    manifest,
    cafeArtManifest,
    taproomArtManifest,
    serviceWorker,
    hostingConfig,
    builtWranglerConfig,
    publicFiles,
    deployedModelFiles,
    deployedServerFiles,
    deployedMigrationFiles,
  ] = await Promise.all([
    readFile(
      new URL("../../client/components/PracticeApp.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../../client/recognition/localVosk.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../../client/recognition/microphone.ts", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../package.json", import.meta.url), "utf8"),
    readFile(new URL("../../public/manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../../art-packs/cafe.json", import.meta.url), "utf8"),
    readFile(new URL("../../art-packs/taproom.json", import.meta.url), "utf8"),
    readFile(new URL("../../public/sw.js", import.meta.url), "utf8"),
    readFile(new URL("../../dist/.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../../dist/server/wrangler.json", import.meta.url), "utf8"),
    listFiles(new URL("../../public/", import.meta.url)),
    listFiles(new URL("../../dist/client/models/", import.meta.url)),
    listFiles(new URL("../../dist/server/", import.meta.url)),
    listFiles(new URL("../../dist/.openai/drizzle/", import.meta.url)),
  ]);

  assert.match(app, /startLocalRecognition/);
  assert.doesNotMatch(app, /webkitSpeechRecognition|SpeechRecognition/);
  assert.match(app, /data-recognition-state=\{recognitionState\}/);
  assert.match(localRecognizer, /vosk-model-small-ja-0\.22/);
  assert.match(localRecognizer, /AudioWorkletNode/);
  assert.match(localRecognizer, /acceptWaveformFloat/);
  assert.match(localRecognizer, /gameMicrophone\.stream/);
  assert.match(microphoneRoute, /enumerateDevices/);
  assert.match(microphoneRoute, /deviceId: \{ exact: selection\.deviceId \}/);
  assert.match(microphoneRoute, /class GameMicrophoneSession/);
  assert.match(app, /openGameMicrophone/);
  assert.match(app, /game-session mic active/);
  assert.match(app, /data-testid="microphone-route"/);
  assert.match(app, /const SUCCESS_ADVANCE_HOLD_MS = 500/);
  assert.match(app, /data-testid="replay-autoplay"/);
  assert.match(app, /setPlaybackReplayToken/);
  assert.match(app, /hardware test open/i);
  assert.match(app, /addEventListener\("devicechange"/);
  assert.match(app, /audio is not saved/i);
  assert.match(app, /data-testid="skip-bubble"/);
  assert.match(app, /getArtPack\(selectedStory\.artPackId\)/);
  assert.match(app, /params\.get\("art"\)/);
  assert.match(app, /data-testid=\{`select-stage-\$\{stage\.id\}`\}/);
  assert.match(app, /data-testid="continue-transition"/);
  assert.match(app, /data-testid=\{`transition-\$\{stage\.transition\.id\}`\}/);
  assert.doesNotMatch(app, /DEFAULT_ROUNDS|Skip round|manual override/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.practice-panel\s*\{[^}]*block-size:/s);
  assert.match(css, /\.panel-foot\s*\{[^}]*grid-row:\s*3/s);
  assert.match(css, /\.autoplay-controls\s*\{[^}]*grid-row:\s*1/s);
  assert.match(css, /\.scene-image/);
  assert.match(css, /\.interlude-card/);
  assert.doesNotMatch(css, /width:\s*min\(100%,\s*680px\)/i);
  assert.doesNotMatch(css, /\.cafe-scene|\.awning|\.lamp|\.counter/i);
  assert.match(page, /<PracticeApp \/>/);
  assert.match(layout, /manifest:\s*"\/manifest\.json"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(packageJson, /"drizzle-orm"/);
  assert.match(packageJson, /"@cloudflare\/vitest-pool-workers"/);
  assert.match(packageJson, /"vosk-browser": "0\.0\.8"/);

  const parsedHostingConfig = JSON.parse(hostingConfig);
  assert.equal(parsedHostingConfig.d1, "DB");
  assert.equal(parsedHostingConfig.r2, "PACKS");
  const parsedWranglerConfig = JSON.parse(builtWranglerConfig);
  assert.equal(parsedWranglerConfig.compatibility_date, "2026-05-22");
  assert.deepEqual(
    parsedWranglerConfig.d1_databases.map((binding) => binding.binding),
    ["DB"],
  );
  assert.deepEqual(
    parsedWranglerConfig.r2_buckets.map((binding) => binding.binding),
    ["PACKS"],
  );
  assert.ok(
    deployedMigrationFiles.some((file) => /^0000_.+\.sql$/.test(file)),
  );

  const parsedManifest = JSON.parse(manifest);
  assert.equal(parsedManifest.display, "standalone");
  assert.equal(parsedManifest.orientation, "portrait");
  assert.equal(parsedManifest.icons.length, 2);
  assert.match(serviceWorker, /conversation-app-shell-v11/);
  assert.match(serviceWorker, /conversation-app-model-v3/);
  assert.match(serviceWorker, /vosk-model-small-ja-0\.22\.parts\.json/);
  assert.match(serviceWorker, /new ReadableStream/);
  assert.match(serviceWorker, /recognition-capture-worklet\.js/);
  assert.ok(
    deployedModelFiles.includes("vosk-model-small-ja-0.22.parts.json"),
  );
  assert.equal(
    deployedModelFiles.filter((file) =>
      /^vosk-model-small-ja-0\.22\.part-\d{3}$/.test(file),
    ).length,
    6,
  );
  assert.ok(!deployedModelFiles.includes("vosk-model-small-ja-0.22.tar.gz"));
  assert.ok(!deployedServerFiles.some((file) => /\.woff2?$/.test(file)));
  assert.ok(!deployedServerFiles.some((file) => /\/vosk-[^/]+\.js$/.test(file)));
  assert.match(app, /window\.isSecureContext/);
  assert.match(app, /trusted HTTPS or localhost URL/);
  const audioFiles = [
    "ordering-welcome.mp3",
    "ordering-question.mp3",
    "ordering-second.mp3",
    "ordering-ready.mp3",
    "ordering-thanks.mp3",
    "meal-arrives.mp3",
    "meal-payment-options.mp3",
    "meal-thanks.mp3",
    "meal-return.mp3",
  ];
  await Promise.all(
    audioFiles.map(async (file) => {
      assert.match(serviceWorker, new RegExp(file.replace(".", "\\.")));
      const info = await stat(
        new URL(`../../public/audio/qwen3/${file}`, import.meta.url),
      );
      assert.ok(info.size > 1_000);
    }),
  );
  const audioMetadata = JSON.parse(
    await readFile(
      new URL("../../public/audio/qwen3/metadata.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(audioMetadata.clips.length, audioFiles.length);
  assert.ok(audioMetadata.clips.every((clip) => clip.voice === "Ono_Anna"));
  assert.ok(audioMetadata.clips.every((clip) => clip.instruction === ""));

  const taproomAudioFiles = [
    "taproom-choose-open.mp3",
    "taproom-choose-welcome.mp3",
    "taproom-choose-board.mp3",
    "taproom-choose-two.mp3",
    "taproom-choose-bitter.mp3",
    "taproom-glass-open.mp3",
    "taproom-glass-served.mp3",
    "taproom-glass-thanks.mp3",
    "taproom-glass-later.mp3",
    "taproom-glass-counter.mp3",
  ];
  await Promise.all(
    taproomAudioFiles.map(async (file) => {
      assert.match(serviceWorker, new RegExp(file.replace(".", "\\.")));
      const info = await stat(
        new URL(`../../public/audio/taproom/${file}`, import.meta.url),
      );
      assert.ok(info.size > 1_000);
    }),
  );
  const taproomAudioMetadata = JSON.parse(
    await readFile(
      new URL("../../public/audio/taproom/metadata.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(taproomAudioMetadata.clips.length, taproomAudioFiles.length);
  assert.equal(
    taproomAudioMetadata.clips.find(
      (clip) => clip.id === "taproom-glass-thanks",
    ).voice,
    "sohee",
  );
  assert.ok(
    taproomAudioMetadata.clips
      .filter((clip) => clip.id.endsWith("-open"))
      .every((clip) => clip.voice === "aiden"),
  );
  assert.ok(
    taproomAudioMetadata.clips
      .filter(
        (clip) =>
          clip.id !== "taproom-glass-thanks" && !clip.id.endsWith("-open"),
      )
      .every((clip) => clip.voice === "dylan"),
  );
  // The staff is drawn as a young man, so the staff preset must stay male and
  // stay distinct from the learner and the narrator.
  assert.equal(
    new Set(taproomAudioMetadata.clips.map((clip) => clip.voice)).size,
    3,
  );

  const parsedArtManifests = [
    JSON.parse(cafeArtManifest),
    JSON.parse(taproomArtManifest),
  ];
  assert.deepEqual(
    parsedArtManifests.map((pack) => pack.id),
    ["cafe", "taproom"],
  );

  for (const parsedArtManifest of parsedArtManifests) {
    assert.equal(parsedArtManifest.schemaVersion, 2);
    assert.equal(
      Object.values(parsedArtManifest.characters)[0].anchor,
      "left",
    );

    const packAssets = [
      parsedArtManifest.cover,
      ...Object.values(parsedArtManifest.scenes).flatMap((scene) => [
        scene.landscape,
        scene.portrait,
      ]),
      ...Object.values(parsedArtManifest.characters).flatMap((character) =>
        Object.values(character.art),
      ),
    ];
    for (const assetPath of new Set(packAssets)) {
      assert.match(
        serviceWorker,
        new RegExp(assetPath.split("/").at(-1).replace(".", "\\.")),
      );
      const info = await stat(
        new URL(`../../public${assetPath}`, import.meta.url),
      );
      assert.ok(info.size > 1_000, `${assetPath} is missing or empty`);
    }
  }

  const publicInventory = publicFiles.join("\n");
  assert.match(publicInventory, /recognition-capture-worklet\.js/);
  assert.doesNotMatch(
    publicInventory,
    /dataset|recording|secret|fixture/i,
  );
  assert.doesNotMatch(
    `${app}\n${localRecognizer}\n${serviceWorker}`,
    /japanese-voice-v1|peter-v1-20260729|api\/recordings/i,
  );

  const projectFiles = await readdir(templateRoot);
  assert.ok(!projectFiles.includes(".env"));
});
