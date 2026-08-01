# Mobile practice-panel geometry finally measured

Closes the open item in
[[2026-08-01-open-mobile-panel-geometry-unverified]]: the mobile branch had
only ever been arithmetic, because `resize_window` in the Chrome extension
never moves the page viewport
([[2026-08-01-chrome-extension-resize-does-not-move-viewport]]).

Measured with Playwright driving the **installed Chrome**, not a bundled
build — `~/Library/Caches/ms-playwright` holds chromium 1187/1200/1208 while
current playwright wants 1234, so `p.chromium.launch(channel="chrome")` is the
working path. Playwright itself runs fine as `uv run --with playwright`.
Fake media flags plus `permissions=["microphone"]` are not enough on their own:
several fake inputs are offered, so `microphoneState` stays `choosing` and the
drawer stays open until an option is picked from the route `select`.

Real numbers, speaking turn, café stage 1, with the おてほん button present:

| viewport | drawer open | settled | scene |
| --- | --- | --- | --- |
| 390x844 | 261px | 194px | 561px |
| 360x780 | 261px | 196px | 495px |

Against the old fixed 238px panel. `▷ おてほん` (84px) and はなす sit on one
row at 360px with no wrap, `documentElement.scrollWidth === innerWidth` in
every state, and the chip/privacy-note line does not collide (16px gap at
360px, the tightest case). The privacy note wraps to two lines at 360px.

Script kept at `scratchpad/mobile_panel_check.py` for this session only.
