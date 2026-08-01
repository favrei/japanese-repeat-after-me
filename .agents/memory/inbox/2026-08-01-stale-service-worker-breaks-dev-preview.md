# A stale service worker silently serves old code on localhost:3000

Browser QA of a fresh `npm run dev` showed **old** app behaviour and a wall of
Vite overlay errors:

```
TypeError: Cannot read properties of undefined (reading 'send')
  at Object.send (http://localhost:3000/@vite/client:438:7)
  at sendError (http://localhost:3000/@vite/client:480:13)
```

Cause: `PracticeApp` registers `/sw.js` in production builds. A previous
production preview on the same origin left a controlling service worker and a
`conversation-app-shell-v11` cache, which then served stale assets — including
a broken `@vite/client` — to the dev server's pages. Dev-overlay noise, not an
app bug.

Fix before browser QA on localhost:

```js
for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
for (const k of await caches.keys()) await caches.delete(k);
```

then reload. Errors disappear and the current bundle loads.

Second gotcha in the same session: an automated, unfocused Chrome tab applies
Chrome's intensive timer throttling, quantising `setTimeout` to 1 s
boundaries. A control `setTimeout(1600)` measured 1999 ms. Do **not** read
timing constants off wall-clock measurements taken in that tab — assert the
DOM state instead.
