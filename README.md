# Japanese Repeat-After-Me

A web-first Japanese speaking-practice application built around repeated, verified sentence exercises.

## Status

This repository is currently in the **product and technical scoping** stage. The documents describe the working concept, constraints, candidate technologies, and unresolved questions. They are not yet an implementation plan.

## Core experience

1. Present a Japanese sentence.
2. Play a reference recording.
3. Ask the learner to repeat it.
4. Verify the attempt locally when practical.
5. Highlight the parts that may be missing, mistimed, or incorrectly pronounced.
6. Count successful attempts.
7. Unlock the next challenge after the configured number of successes.

## Product principles

- Chrome-first Progressive Web App.
- Local-first pronunciation verification.
- No mandatory per-attempt cloud API cost.
- User-generated or user-funded AI lesson content.
- Feedback should be localized to the sentence, not limited to a single pass/fail score.
- The initial product is a focused speaking-drill engine, not a complete language course.

## Current environment

**Development**

- MacBook with Apple M3

**Hosting target**

- GPT Sites

**Primary runtime targets**

- macOS using Chrome
- Android using Chrome

**Optional runtime targets**

- Linux AMD64 using Chrome
- iOS using Chrome or an installed PWA, subject to separate compatibility testing

## Documentation

- [Product and technical discussion](docs/product-and-technical-discussion.md)
- [Platform scope](docs/platform-scope.md)
- [Recognition options](docs/recognition-options.md)
- [Open questions](docs/open-questions.md)

## Repository policy

No license has been selected yet. Until a license is added, the source and documents remain under the repository owner's default copyright.