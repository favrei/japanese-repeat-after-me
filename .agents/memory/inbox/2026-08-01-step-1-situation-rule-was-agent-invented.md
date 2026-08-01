# Step 1's "chat about hobbies fails" rule was agent-invented, and too narrow

2026-08-01. The user asked for a story about discussing rock music with a
coworker. Step 1 of the stage design flow rejected it by name: its "the learner
has a goal" bullet used *"Chat about hobbies" fails: no goal, no natural
sentence set* as the canonical rejection, and its predictability bullet assumed
a service counter ("Real staff say near-identical lines every time").

Traced on request: the rule entered in `31df6a0` (2026-07-30, "Add stage design
flow"), the commit that created the doc — an agent's draft generalising from the
café, the only story that existed then. The user's reaction: "I don't know why
we would have the 1. rule, at least it was not my intention... I think it makes
sense partially, we need a clean storyline, but the current one is making it too
narrow. You edit it."

Rewritten with explicit permission. The requirement now asks **what the learner
holds at the end** rather than whether the situation is transactional:

- "Talk about music" still fails; "leave with a time and a place for Saturday's
  gig" passes. Same topic, different story.
- Predictability is now explained rather than assumed: service staff are
  predictable because their script is fixed, while a friend or coworker is
  predictable when the learner's goal narrows what they would plausibly say
  next — which is what naming the goal buys you.

**The general lesson is about the docs, not this rule.** `.agents/documents/`
is agent-written, says so ("This is a draft. Revise it as stage authoring
teaches us more"), and is not the user's stated intention. When a rule there
blocks a user request, check who wrote it and when before treating it as a
constraint — and say where it came from rather than apologising around it.
