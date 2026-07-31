# Agent Workspace Index

Start here when working in `japanese-repeat-after-me`.

## Startup

1. Read [`memory/current.md`](memory/current.md).
2. Read the canonical memory cells linked from `current.md`.
3. Read the project entry points relevant to the task.
4. Check [`memory/inbox/`](memory/inbox/) for unconsolidated handoffs or
   observations when they may affect the work.

The memory write boundary in the repository-root `AGENTS.md` is authoritative.
During ordinary work, write memory notes only to `memory/inbox/`.

## Active project entry points

- [`../README.md`](../README.md) — project overview, product principles, and
  current status.
- [`../app/README.md`](../app/README.md) — canonical Japanese conversation app,
  local QA, and Android USB preview workflow.
- [`documents/INDEX.md`](documents/INDEX.md) — all durable documents, grouped
  into story authoring and scoping/status.
- [`documents/stage-design-flow.md`](documents/stage-design-flow.md) and
  [`documents/character-separation-gate.md`](documents/character-separation-gate.md)
  — how a new conversation stage is authored and reviewed.
- [`documents/art-system.md`](documents/art-system.md) — the constant manga
  frame and the art-pack contract for story art.
- [`documents/open-questions.md`](documents/open-questions.md) — what is
  settled, partially answered, and still open.
- [`documents/product-and-technical-discussion.md`](documents/product-and-technical-discussion.md)
  — cloud-era product and technical scoping, partly superseded.
- [`documents/platform-scope.md`](documents/platform-scope.md) — development,
  hosting, browser, and capability-tier assumptions, largely unverified.
- [`documents/recognition-options.md`](documents/recognition-options.md) —
  candidate local recognition and acoustic-alignment approaches.
- [`../experiments/README.md`](../experiments/README.md) — experiment catalog,
  results, and replay guidance.

## `.agents` areas

- [`memory/`](memory/) — canonical topic cells, current projection, and inbox.
- [`resources/`](resources/) — external references, tutorials, and reusable
  snippets.
- [`plans/`](plans/) — intended future work and implementation plans.
- [`tools/`](tools/) — repeatable helper scripts managed as an isolated `uv`
  project.
- [`documents/`](documents/) — durable onboarding and project knowledge.

## Current state

Reviewed 2026-07-30. `memory/current.md` is the authority; this is orientation.

- The canonical product application exists under `app/`. Its café and taproom
  flows bundle locally generated Japanese reference audio.
- Two significant lanes sit on **unmerged sibling worktrees**: local-first Vosk
  recognition (`recognition/vosk-local-first`, committed) and the seinen art
  system (`design/art-pack-system`, **uncommitted working-tree state**).
- Six experiments exist under `experiments/`; 005 is parked and incomplete.
- Model/runtime research remains evidence-gated. Nothing has been deployed, and
  no Android device has ever been connected.
- `resources/seinen-manga-frame/` holds the design mockup. No agent helper tool
  has been registered yet.
