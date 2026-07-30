# Documents Index

Durable onboarding material, architecture explanations, project-specific
patterns, and hard-won gotchas belong here.

Use memory cells for current research belief and decisions. Use this directory
for material that should be read as a document rather than as active memory.

## Authoring a story

Read in this order when making new conversation content.

- [`stage-design-flow.md`](stage-design-flow.md) — step-by-step flow for
  authoring a new conversation stage: situation, stage cuts, personas,
  dialogue, difficulty control, and the art & voice brief handoff.
- [`character-separation-gate.md`](character-separation-gate.md) — required
  review pass over authored dialogue: catches writer reasoning leaking into a
  character's mouth, and characters sharing one omniscient mind. Never yet run
  on a real stage set.
- [`art-system.md`](art-system.md) — the constant manga frame and the art-pack
  contract a story's art must satisfy, plus how to submit and review a pack.

## Scoping and status

These predate the current implementation. Each now opens with a status block
saying what it still governs and what has been superseded — read that block
before trusting the body.

- [`product-and-technical-discussion.md`](product-and-technical-discussion.md) —
  product concept, technical hypotheses, scope, and candidate architecture.
  Partly superseded: the repetition-count loop and the lesson-item schema.
- [`platform-scope.md`](platform-scope.md) — development, hosting, browser
  targets, PWA expectations, and runtime capability tiers. Almost entirely
  unverified beyond macOS Chrome.
- [`recognition-options.md`](recognition-options.md) — candidate local
  recognition, acoustic alignment, scoring, and evaluation approaches. Option 1
  is chosen and measured; its evaluation requirements are unmet.
- [`open-questions.md`](open-questions.md) — unresolved decisions, now split
  into settled, partially answered, and still open.
