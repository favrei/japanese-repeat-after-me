# Future Accounts and Chapter Review

Date: 2026-07-30
Status: Future phase; memo only, not current implementation scope

## Confirmed direction

- Add an account system using Google/Gmail authentication.
- Allow an authenticated user to upload new conversation chapters.
- A newly uploaded chapter remains private to its uploader before release.
- The uploader can play and test that private chapter immediately.
- Releasing a chapter to other users requires review by both the project owner
  and an agent.

## Minimal content lifecycle

`private draft → review → released`

The private draft remains usable by its uploader while review is pending.

## Chapter audio policy

- Require text for every dialogue bubble.
- Generate text-to-speech on demand for immediate private preview.
- Let the uploader optionally replace generated speech with human audio.
- Store audio per bubble/turn rather than as one whole-conversation recording,
  so playback can pause, repeat, and branch with the rehearsal flow.
- During review, approve the uploaded audio or generate and freeze a canonical
  audio asset for that bubble.
- Released chapters use the reviewed, versioned audio assets and cache them for
  reliable playback and offline use.
- On-the-fly synthesis remains a preview or fallback mechanism, not the
  canonical audio used on every released playback. This avoids voice and output
  differences across browsers and devices.

## Still open

- Exact review criteria and whether automated checks run before human review.
- Whether agent approval is advisory or a technically enforced release gate.
- Who can revise, withdraw, or resubmit a chapter after review.
- Storage, privacy, copyright, abuse-reporting, and deletion policies.
- Which synthesis engine and voices create canonical audio.
- Whether authentication needs only Google identity or access to any Gmail data
  (the latter is not currently required by this product direction).
