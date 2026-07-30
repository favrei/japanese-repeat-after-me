# Open Questions

These items remain unresolved and should be discussed before they become implementation requirements.

## Learning behavior

- What exactly counts as one successful repetition?
- Must all required repetitions be consecutive?
- Should an incorrect attempt reset progress for the current sentence?
- Can the learner override a rejected attempt?
- Should the required repetition count vary by difficulty?
- Should the reference audio be replayed before every attempt or only on demand?

## Feedback

- Should the initial UI highlight words, phrases, kana, or mora?
- How should uncertain feedback be displayed?
- Which errors should block progression?
- Should pitch accent be shown in the first version?
- How should the system distinguish bad pronunciation from bad recording quality?

## Recognition

- What is the maximum acceptable initial model download?
- What is the maximum acceptable memory use on Android?
- Is a 48 MB-class recognizer sufficiently accurate for the core loop?
- Is direct comparison with browser TTS stable enough for useful feedback?
- Should WebGPU be an optimization or a separate enhanced mode?
- What reduced feature set should be available on devices that cannot run the recognizer?

## Content

- What lesson-pack schema is required?
- How should AI-generated kana readings be validated?
- Should the application accept plain text, JSON, or both?
- Should users be able to edit readings and segmentation manually?
- Should reference audio be generated, imported, or produced by system TTS?

## Data and privacy

- Should learner recordings be deleted immediately after scoring?
- Should users be able to retain recordings for self-review?
- Is anonymized learner data collection desirable for future model calibration?
- What explicit consent would be required?
- Should progress remain local or support optional synchronization?

## Platform and hosting

- Can GPT Sites serve large model assets efficiently?
- Are the required service-worker and caching behaviors supported?
- Are the required WebAssembly MIME types and headers configurable?
- Is cross-origin isolation required by the selected runtime?
- What level of iOS support is realistic without a native wrapper?

## Validation

- Which learner population defines acceptable recognition quality?
- How many speakers and devices are required before thresholds are trusted?
- Who provides the human reference judgment for pronunciation quality?
- Which false result is more harmful: accepting a weak attempt or rejecting a reasonable attempt?

These questions are intentionally separated from a project plan. Their answers will determine the eventual product requirements and architecture.
