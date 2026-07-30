# Character Separation Gate

A required review pass over authored dialogue. It exists because the writer of
a stage is a single agent voicing several people at once, and that reliably
produces two defects that a fluent-sounding script hides.

Run it on every new or edited stage set, before encoding into
`poc/app/stages.ts`. It reviews **the conversation**. It never changes flow
logic, state handling, or test selectors — see
[`stage-design-flow.md`](stage-design-flow.md).

## The two failures, named

**1. Persona leak.** The writer's own reasoning surfaces inside a character's
mouth. The character explains who they are, why they are speaking this way, or
what the scene is for, instead of simply doing the thing a real person would do.
Any line that would only be written by someone aware of being an author is a
leak.

**2. Shared mind.** One narrator wearing several name tags. Every character
draws on one pool of knowledge, one vocabulary, one sentence rhythm, and one
intention. Symptoms: a character knows something they had no way to learn; two
characters are interchangeable if you hide the labels; nobody wants anything
that conflicts with anybody else.

Both are invisible when you read the script as its author, because the author
supplies the missing justification silently. The passes below are built to
remove that support.

## Precondition — declare the cards first

The gate is a comparison. Without declared cards there is nothing to compare
against, so Step 3 of the stage design flow must produce, per speaker
(**including the learner** — the most frequently forgotten character):

- **Wants.** The goal in this scene, in one line. Two characters wanting the
  exact same thing is a warning sign.
- **Knows.** What this person knows entering the scene.
- **Cannot know.** Named explicitly: the other party's plans, the learner's
  nationality, name, itinerary, budget, level, or anything said in a bubble
  that Skip can dismiss.
- **Perceives.** What is observable in the room by anyone present. Only these
  facts may be reacted to.
- **Voice fingerprint.** Politeness tier stated as concrete grammar
  (尊敬語・謙譲語 / です・ます / plain), typical sentence length, one habitual
  word or opener, who asks the questions.
- **Never says.** A short banned list for this speaker. For a beginner learner:
  かしこまりました, 承知しました, よろしいでしょうか. For café staff: casual
  forms toward a customer, and any grammar explanation.

Scene facts shared by everyone go in one separate list, not into any card.

## How to run it

Run the gate as a **separate reading pass over the finished lines only** —
`speaker`, `japanese`, `reading`, `translation` — with the design notes and
your own drafting rationale out of view. The point is to lose the author's
memory of what each line was *meant* to accomplish. If you cannot judge a line
without recalling why you wrote it, that line already fails.

### Pass A — Leak scan

Read every line and ask: would a real person say this sentence, in this room,
to this listener, for their own reasons?

Fails:

- Self-description as justification — 「私は店員ですので、ご注文をうかがいます。」
  A server just says 「ご注文は何になさいますか。」
- Teaching from inside the scene — 「これは丁寧な言い方です。」 The staff is
  serving coffee, not running the lesson. Pedagogy lives in `translation` and
  in the choice of sentence, never in a character's mouth.
- Stage direction spoken aloud — announcing an action instead of performing it,
  or narrating the scene's purpose.
- Leak in the `translation` field — "As the server, I'll take your order."
  A translation renders what the person says, not what they are.

### Pass B — Knowledge ledger

Walk the bubbles in order. For each line, check the speaker's card: is every
fact in this line something they **know** or **perceive** at this moment?

Fails:

- 「お連れ様はいかがなさいますか。」 when no companion was ever established as
  visible in the scene.
- Staff naming the learner, their country, or their trip when nothing observable
  supplied it.
- A reply that quotes or depends on what the learner actually said. This is the
  same defect as a skip-safety violation, seen from the epistemic side: a bubble
  that Skip can dismiss was never knowledge anyone in the room received.
- Emotional telepathy — reacting to a feeling with no observable cue.

Perceiving that a customer is foreign, hesitant, or holding a menu is legitimate;
knowing anything beyond what the room shows is not.

### Pass C — Blind attribution

Strip the `speaker` labels and reassign every line from the text alone. Every
line must land on exactly one character, forced by register, vocabulary, and
intent. Any line that could plausibly belong to either speaker is evidence of a
shared voice, not of a neutral sentence.

In Japanese the tiers do most of the work and must stay separated: staff use
尊敬語・謙譲語 (なさいますか, お待ちください, かしこまりました); a beginner
learner uses plain polite forms (お願いします, ください, すみません). A learner
line reaching for staff-side keigo, or a staff line dropping into the learner's
beginner phrasing, fails this pass.

Then check the fingerprints against the cards: if both speakers average the same
sentence length, open the same way, and hedge the same way, the cards were
declared but not written.

### Pass D — Single-speaker read-through

Read one character's lines in sequence, ignoring everyone else. Do it once per
character.

It must read as one continuous person with one agenda. Fails:

- Personality drift — brusque at the start, chatty by the end, with nothing in
  the scene causing the change.
- A line that is incomprehensible in isolation because it only works as an
  answer to specific words the other party may never have said.
- The character's own goal disappearing — a server who stops trying to complete
  the transaction, a learner who stops trying to get fed.

## Verdict

The gate is pass/fail for the whole stage set. On any failure, fix the content,
then rerun **all four passes** — a rewritten line changes attribution and
knowledge for its neighbours. Never resolve a failure by changing flow rules;
if a line seems to require a flow change, stop and raise it with the user.

Record the result in the inbox note for the stage set: which passes were run,
what was rewritten, and anything left uncertain.

## Limits

- This gate judges the conversation only. Art, audio, difficulty, and reading
  accuracy have their own checks in the stage design flow.
- It cannot certify natural Japanese. A script can pass all four passes and
  still be stiff; Step 6 of the flow and reading aloud remain necessary.
- Distinct voices must survive into audio. Carry the fingerprints into the
  art & voice brief so two characters are not synthesised as the same person.
