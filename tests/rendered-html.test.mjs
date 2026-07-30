import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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

test("server-renders the neutral conversation start screen", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Japanese conversation — UX flow PoC<\/title>/i,
  );
  assert.match(html, /Café conversation/);
  assert.match(html, /Stage (?:<!-- -->)?1/);
  assert.match(html, /Stage (?:<!-- -->)?2/);
  assert.match(html, /Start conversation/);
  assert.match(html, /Skip always dismisses exactly one bubble/);
  assert.match(html, /manifest\.json/);
  assert.doesNotMatch(
    html,
    /Kissa Loop|three short rounds|choose a stage|cafe-scene|codex-preview/i,
  );
});

test("ships a local-only PWA shell without private development artifacts", async () => {
  const [
    app,
    css,
    page,
    layout,
    packageJson,
    manifest,
    serviceWorker,
    publicFiles,
  ] = await Promise.all([
    readFile(new URL("../app/PracticeApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
    readdir(new URL("../public/", import.meta.url)),
  ]);

  assert.match(app, /SpeechRecognition/);
  assert.match(app, /Audio is not saved/);
  assert.match(app, /data-testid="skip-bubble"/);
  assert.doesNotMatch(app, /DEFAULT_ROUNDS|Skip round|manual override/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(
    css,
    /\.cafe-scene|\.awning|\.lamp|\.counter|radial-gradient/i,
  );
  assert.match(page, /<PracticeApp \/>/);
  assert.match(layout, /manifest:\s*"\/manifest\.json"/);
  assert.doesNotMatch(
    packageJson,
    /react-loading-skeleton|drizzle-orm|drizzle-kit/,
  );

  const parsedManifest = JSON.parse(manifest);
  assert.equal(parsedManifest.display, "standalone");
  assert.equal(parsedManifest.orientation, "portrait");
  assert.equal(parsedManifest.icons.length, 2);
  assert.match(serviceWorker, /conversation-poc-shell-v5/);
  assert.match(app, /window\.isSecureContext/);
  assert.match(app, /trusted HTTPS or localhost URL/);
  const audioFiles = [
    "ordering-welcome.mp3",
    "ordering-question.mp3",
    "ordering-second.mp3",
    "ordering-menu.mp3",
    "ordering-thanks.mp3",
    "meal-arrives.mp3",
  ];
  await Promise.all(
    audioFiles.map(async (file) => {
      assert.match(serviceWorker, new RegExp(file.replace(".", "\\.")));
      const info = await stat(
        new URL(`../public/audio/qwen3/${file}`, import.meta.url),
      );
      assert.ok(info.size > 1_000);
    }),
  );

  const publicInventory = publicFiles.join("\n");
  assert.doesNotMatch(
    publicInventory,
    /dataset|recording|secret|fixture|capture|model/i,
  );
  assert.doesNotMatch(
    `${app}\n${serviceWorker}`,
    /japanese-voice-v1|peter-v1-20260729|api\/recordings/i,
  );

  const projectFiles = await readdir(templateRoot);
  assert.ok(!projectFiles.includes(".env"));
});
