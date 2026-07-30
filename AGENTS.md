# AGENTS.md

<!-- forgetnot:start -->
## Project Memory — Hard Write Boundary

This repo uses cell-first Markdown memory under `.agents/memory/`.

Outside these two cases, do not create, edit, rename, or delete anything under
`.agents/memory/` except files inside `.agents/memory/inbox/`:

1. The user explicitly asks to dream or consolidate memory.
2. The user explicitly asks to create, update, move, or delete durable memory.

Never infer permission from ordinary work, stale memory, contradictions, or a
desire to keep memory updated. Write an inbox note instead. The user is
authoritative: when directly asked to edit durable memory, comply without
requiring a dreaming pass.

Before research, planning, architecture, or long-running work, read
`.agents/memory/current.md` and the cells it points to. Cells are canonical;
`current.md` is only the compact active projection.

Use the locally installed `$dream-agent-memory` skill to consolidate inbox
notes, maintain cells, and rebuild `current.md`. Dreaming is exclusive: end or
suspend it before source edits or other project work.

Do not build a database, RAG system, vector index, graph, dashboard, or broad
framework around memory unless the user explicitly asks.

Project type: ML or AI project
<!-- forgetnot:end -->

## Workspace Navigation

Read `.agents/INDEX.md` at startup for neosr workspace navigation and active
project entry points. Any legacy memory-write or consolidation guidance there
is subordinate to the marked block above and `$dream-agent-memory`.

## Project Context

- Project type: ML or AI project
- Package manager: `uv`
- Development philosophy: minimalism but worked; this is not a product, so avoid over-design

## Core Principles

- Prefer simple, straightforward solutions.
- Focus on what works first.
- Iterate quickly.
- Avoid unnecessary abstractions or features.
- Use `uv` for Python package management and execution.
- Keep unit tests as guardrails for development.

## Client Preview and Browser Debugging

- Every coding agent working in this repository is authorized, without
  additional per-run confirmation, to start or reuse the local client host,
  open the client, inspect runtime behavior, and debug it.
- Headless inspection may use OpenCLI, Playwright, Puppeteer, CDP, or another
  conventional headless browser framework available in the environment.
- An agent with in-app Browser, Chrome control, or equivalent real-browser
  capability may use it when visual behavior, interaction, permissions,
  WebGPU, audio, or browser-specific behavior needs inspection.
- Use the project's normal host command and the exact local URL it reports.
  Do not scan ports or interfere with unrelated local servers. Track processes
  started for debugging and stop them when finished unless an active shared
  preview should remain available.
- Prefer fake or synthetic media for automated checks. This permission does
  not independently authorize ambient microphone/camera capture, uploading
  private data, external publication, or deployment.
- Preview and QA never imply deployment. Deployment remains a separate,
  explicit action after the agreed QA gate.

## Communication Style

- The user is a fluent professional English speaker, but English is not his native language.
- Prefer straight, concise replies and multi-round back-and-forth over large walls of text.
- Lead with the answer; add detail only when asked or clearly needed.

## `uv` Rules

- Run Python as `uv run python3 -m xxxx.yyy.zzz`
- Add packages with `uv add <package>`
- Remove packages with `uv remove <package>`
- For complex dependency changes, edit `pyproject.toml` directly and then run `uv sync`

## `.agents` Directory Roles

### `.agents/memory/`

- Topic cells are the authority for durable research belief.
- `current.md` is a compact active projection, not a second canonical ledger.
- The legacy `decisions.md` and `artifacts.md` ledgers were absorbed into
  owning cells on 2026-07-11 after explicit user approval. Do not recreate
  cross-cutting ledgers; keep topic decisions and evidence pointers in cells.

### `.agents/resources/`

- Store tutorial material, external links, code snippets, and reference notes.
- Add brief descriptions so future agents know why the resource matters.

### `.agents/plans/`

- Store intended future work and implementation plans.
- Plans are an existing neosr workspace convention, not part of the current
  minimal ForgetNot install. Dreaming alone does not authorize changing them.

### `.agents/tools/`

- Store standalone helper scripts for repeated commands.
- Manage this directory with its own `pyproject.toml`.
- Run tools from inside `.agents/tools/` with `uv run <script_name>`.
- Maintain an `INDEX.md` listing available tools.

### `.agents/documents/`

- Store onboarding material and durable project knowledge.
- Keep high-value patterns, gotchas, and architecture notes here.
- Maintain an `INDEX.md` to help future agents navigate.
- Documents are outside a dreaming pass unless the user separately asks to
  update them.

## Writing Guidance

- Write for future agents with no session context.
- Be concise but complete.
- Update documentation during work, not only at the end.
- Use Markdown consistently.
- Cross-reference related notes when useful.
