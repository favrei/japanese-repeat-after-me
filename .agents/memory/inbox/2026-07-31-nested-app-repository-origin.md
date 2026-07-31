# Origin of the nested application repository

- Delivery policy commit `6a7a8e9` at 2026-07-30 13:36 +08:00 first required
  the deployable site to live in an isolated Git project so it could not
  inherit the parent repository's private voice-data history. Dream commit
  `8ea3584` consolidated that policy at 15:44.
- The nested application repository began at commit `d0bd4bd` on 2026-07-30
  17:46:31 +08:00. Root commit `e2396e7` ignored `/poc/` 38 seconds later, and
  `12fe570` documented it as an isolated product prototype.
- This was a delivery/privacy boundary, not frontend/backend separation. At the
  time, private voice data existed in local root history while the configured
  GitHub origin was public.
- Root commit `87e1ca2` at 23:28 later stripped the voice corpus from every
  root commit and added `/datasets/` to `.gitignore`. That removed the original
  reason for a separate application repository, but the nested structure
  remained and eventually became the canonical app by inertia.
- Flattening should preserve the inner app history under ordinary root path
`app/`. Privacy remains enforced by `/datasets/`, deployment-artifact checks,
and the rule never to publish private recordings.
