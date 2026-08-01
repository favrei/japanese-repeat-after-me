const CACHE_NAME = "conversation-app-shell-v14";
const MODEL_CACHE_NAME = "conversation-app-model-v3";
const MODEL_PATH = "/models/vosk-model-small-ja-0.22.tar.gz";
const MODEL_PARTS_MANIFEST =
  "/models/vosk-model-small-ja-0.22.parts.json";
const SHELL = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/recognition-capture-worklet.js",
  "/art-packs/cafe/cover.png",
  "/art-packs/cafe/scene-landscape.png",
  "/art-packs/cafe/scene-portrait.png",
  "/art-packs/cafe/character-neutral.png",
  "/art-packs/cafe/character-positive.png",
  "/art-packs/cafe/character-concerned.png",
  "/art-packs/taproom/cover.png",
  "/art-packs/taproom/scene-landscape.png",
  "/art-packs/taproom/scene-portrait.png",
  "/art-packs/taproom/staff-neutral.png",
  "/art-packs/taproom/staff-positive.png",
  "/art-packs/taproom/staff-concerned.png",
  "/art-packs/office/cover.png",
  "/art-packs/office/lounge-landscape.png",
  "/art-packs/office/lounge-portrait.png",
  "/art-packs/office/entrance-landscape.png",
  "/art-packs/office/entrance-portrait.png",
  "/art-packs/office/coworker-neutral.png",
  "/art-packs/office/coworker-positive.png",
  "/art-packs/office/coworker-concerned.png",
  "/audio/qwen3/ordering-welcome.mp3",
  "/audio/qwen3/ordering-question.mp3",
  "/audio/qwen3/ordering-second.mp3",
  "/audio/qwen3/ordering-ready.mp3",
  "/audio/qwen3/ordering-thanks.mp3",
  "/audio/qwen3/meal-arrives.mp3",
  "/audio/qwen3/meal-payment-options.mp3",
  "/audio/qwen3/meal-thanks.mp3",
  "/audio/qwen3/meal-return.mp3",
  "/audio/qwen3/ordering-menu.mp3",
  "/audio/qwen3/ordering-order.mp3",
  "/audio/qwen3/meal-restroom.mp3",
  "/audio/qwen3/meal-serve.mp3",
  "/audio/qwen3/ordering-open.mp3",
  "/audio/qwen3/meal-open.mp3",
  "/audio/qwen3/metadata.json",
  "/audio/taproom/taproom-choose-welcome.mp3",
  "/audio/taproom/taproom-choose-open.mp3",
  "/audio/taproom/taproom-choose-board.mp3",
  "/audio/taproom/taproom-choose-two.mp3",
  "/audio/taproom/taproom-choose-bitter.mp3",
  "/audio/taproom/taproom-glass-served.mp3",
  "/audio/taproom/taproom-glass-open.mp3",
  "/audio/taproom/taproom-glass-thanks.mp3",
  "/audio/taproom/taproom-glass-later.mp3",
  "/audio/taproom/taproom-glass-counter.mp3",
  "/audio/taproom/taproom-choose-firsttime.mp3",
  "/audio/taproom/taproom-choose-recommend.mp3",
  "/audio/taproom/taproom-choose-order.mp3",
  "/audio/taproom/taproom-glass-pay.mp3",
  "/audio/taproom/taproom-glass-here.mp3",
  "/audio/taproom/metadata.json",
  "/audio/office-gig/gig-notice-open.mp3",
  "/audio/office-gig/gig-notice-hello.mp3",
  "/audio/office-gig/gig-notice-hello-back.mp3",
  "/audio/office-gig/gig-notice-shirt.mp3",
  "/audio/office-gig/gig-notice-highschool.mp3",
  "/audio/office-gig/gig-notice-rock.mp3",
  "/audio/office-gig/gig-notice-guitar.mp3",
  "/audio/office-gig/gig-taste-open.mp3",
  "/audio/office-gig/gig-taste-ask.mp3",
  "/audio/office-gig/gig-taste-why.mp3",
  "/audio/office-gig/gig-taste-agree.mp3",
  "/audio/office-gig/gig-taste-recommend.mp3",
  "/audio/office-gig/gig-taste-saturday.mp3",
  "/audio/office-gig/gig-taste-venue.mp3",
  "/audio/office-gig/gig-join-open.mp3",
  "/audio/office-gig/gig-join-earlier.mp3",
  "/audio/office-gig/gig-join-spare.mp3",
  "/audio/office-gig/gig-join-come.mp3",
  "/audio/office-gig/gig-join-together.mp3",
  "/audio/office-gig/gig-join-price.mp3",
  "/audio/office-gig/gig-join-cash.mp3",
  "/audio/office-gig/gig-meet-open.mp3",
  "/audio/office-gig/gig-meet-six.mp3",
  "/audio/office-gig/gig-meet-where.mp3",
  "/audio/office-gig/gig-meet-east.mp3",
  "/audio/office-gig/gig-meet-forward.mp3",
  "/audio/office-gig/gig-meet-bye.mp3",
  "/audio/office-gig/metadata.json",
];

async function modelAsset(cache, path) {
  const cached = await cache.match(path);
  if (cached) return cached;

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Recognition model asset failed: ${path}`);
  }
  await cache.put(path, response.clone());
  return response;
}

async function streamRecognitionModel() {
  const cache = await caches.open(MODEL_CACHE_NAME);
  const manifestResponse = await modelAsset(cache, MODEL_PARTS_MANIFEST);
  const manifest = await manifestResponse.json();

  const body = new ReadableStream({
    async start(controller) {
      try {
        for (const part of manifest.parts) {
          const response = await modelAsset(
            cache,
            `/models/${part.file}`,
          );
          if (!response.body) {
            throw new Error(`Recognition model part has no body: ${part.file}`);
          }

          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Length": String(manifest.totalBytes),
      "Content-Type": "application/gzip",
    },
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key !== CACHE_NAME && key !== MODEL_CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Vinext's production asset layer cannot serve this archive as one file.
  // Stream verified sub-limit assets as the URL vosk-browser expects.
  if (url.pathname === MODEL_PATH) {
    event.respondWith(streamRecognitionModel());
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
