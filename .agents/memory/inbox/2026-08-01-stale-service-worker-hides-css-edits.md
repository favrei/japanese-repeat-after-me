# A stale production service worker silently serves old CSS on localhost:3000

Date: 2026-08-01. Cost about twenty minutes of confused debugging.

While verifying gameplay CSS changes against `npm run dev`, the browser kept
computing the *old* rules — `.panel-status { grid-row: 3 }` from a media query
I had already deleted — even after editing the file, hard-navigating, and
`fetch(url, {cache: 'reload'})`. `curl http://localhost:3000/app/globals.css`
returned the correct new CSS the whole time, which is what made it look like a
browser cache problem rather than what it was.

Cause: a service worker registered by an earlier **production** run
(`npm run start`) was still active on the `http://localhost:3000/` scope and
serving `conversation-app-shell-v15` from Cache Storage. `PracticeApp.tsx`
registers `/sw.js` only when `NODE_ENV === "production"`, but the scope is the
origin, so a dev server on the same port inherits it.

Fix, from the page console:

```js
for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
for (const k of await caches.keys()) await caches.delete(k);
```

Then reload. Worth doing first, not last, whenever a CSS or asset edit does not
show up in the browser on port 3000.

## Related automation gotchas from the same session

- Synthetic `element.click()` does not grant user activation, so `audio.play()`
  never resolves and `speechSynthesis` never fires `onend`. Anything that waits
  on a playback promise appears to hang forever. Drive real clicks, or stub
  `HTMLMediaElement.prototype.play` to resolve and fire `ended`.
- `resize_window` did not change the viewport in this environment. Rendering
  the app inside a `<iframe width="420">` on the same origin is a reliable way
  to exercise the phone-width media queries: an iframe gets its own viewport.
