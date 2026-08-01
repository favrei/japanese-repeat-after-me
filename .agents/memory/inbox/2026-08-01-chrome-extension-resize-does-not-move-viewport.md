# Chrome-extension `resize_window` does not change the page viewport

Attempting responsive QA through the in-app Chrome control:
`mcp__claude-in-chrome__resize_window` reported success and `outerWidth` /
`outerHeight` did change (840x443, then 500x950), but the page kept reporting
`innerWidth: 1633` and `matchMedia('(max-width: 820px)').matches === false`.
The media query never flipped, so the mobile branch never rendered. Screenshots
also came back at a fixed 1512x797 regardless.

So: **do not trust `resize_window` for responsive checks in this setup.** Either
verify mobile layout another way (device, DevTools device mode driven by the
user, a separate headless run with an explicit viewport) or state plainly that
mobile was not measured.

Related environment gotcha from the same session, in
[[2026-08-01-stale-service-worker-breaks-dev-preview]]: an unfocused automated
tab also gets Chrome's intensive timer throttling, quantising `setTimeout` to
1 s boundaries — a control `setTimeout(1600)` measured 1999 ms. Assert DOM
state, never wall-clock timing, from that tab.
