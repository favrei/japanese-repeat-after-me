# Precision and Recall Gate

Keep these evaluations separate:

1. **Functionality and target agreement** — conversion succeeds, recognition
   succeeds, and the transcript can be compared with the intended prompt.
2. **Sentence acceptance** — human judgment decides whether the learner's
   attempt should count.
3. **Localized errors** — human labels identify actionable target units or
   gaps.

The current 30 recordings have intended targets but none of the human labels
needed by items 2 or 3.

## Required labels

For each recording retain:

- immutable file SHA-256, speaker/session/sentence/take group, and unknown
  capture fields rather than inferred values;
- `recordingQuality`:
  `usable | retry_required | uncertain`;
- quality reasons:
  `no_speech | truncated_capture | clipped | low_volume | excessive_noise | other`;
- human literal transcript and reading when transcript accuracy is evaluated;
- `sentenceAcceptability`:
  `acceptable | unacceptable | uncertain | not_applicable_quality`;
- rejection reasons such as omission, insertion, substitution, order, or a
  blocking timing distinction;
- localized errors with stable target unit or gap IDs, type, severity, and
  annotator confidence;
- annotator, adjudication, and rubric versions.

Use two independent Japanese-capable raters, hide model output and take number,
and adjudicate disagreements.

## Sentence decision counts

For human-usable, determinate attempts record:

- `TP`: human acceptable, pipeline accepts;
- `FN`: human acceptable, pipeline rejects;
- `FP`: human unacceptable, pipeline accepts;
- `TN`: human unacceptable, pipeline rejects;
- acceptable/unacceptable quality abstentions;
- acceptable/unacceptable technical abstentions.

Report:

- acceptance precision: `TP / (TP + FP)`;
- conditional recall: `TP / (TP + FN)`;
- end-to-end recall: accepted true positives divided by all human-acceptable
  attempts, including abstentions;
- decision coverage and acceptable-attempt retry burden.

Undefined denominators stay undefined.

## Split rule

Never randomly split the three takes. Group at least by
`speaker + session + sentence`; all derivatives remain with the source group.
The current one-speaker corpus cannot estimate unseen-speaker behavior.

Before tuning a production threshold, add:

- human labels for the existing 30 recordings;
- two intentionally incorrect usable attempts per sentence;
- ten recording-quality failures covering the five primary failure types;
- at least two held-out speakers, each with acceptable and assigned-incorrect
  attempts for every sentence.
