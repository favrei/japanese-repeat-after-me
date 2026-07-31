import assert from "node:assert/strict";
import test from "node:test";
import {
  recordingQualityProblem,
  summarizeRecordingQuality,
} from "../../client/recognition/quality.ts";

function evidence(overrides = {}) {
  return {
    clippedSamples: 0,
    peak: 0.2,
    sampleRate: 16_000,
    sumSquares: 16,
    totalSamples: 16_000,
    ...overrides,
  };
}

test("accepts a usable one-second recording", () => {
  const quality = summarizeRecordingQuality(evidence());
  assert.equal(quality.durationSeconds, 1);
  assert.equal(recordingQualityProblem(quality), null);
});

test("requests a retry for short, quiet, and clipped audio", () => {
  assert.equal(
    recordingQualityProblem(
      summarizeRecordingQuality(evidence({ totalSamples: 3_200 })),
    ),
    "too-short",
  );
  assert.equal(
    recordingQualityProblem(
      summarizeRecordingQuality(evidence({ sumSquares: 0.01 })),
    ),
    "too-quiet",
  );
  assert.equal(
    recordingQualityProblem(
      summarizeRecordingQuality(evidence({ clippedSamples: 2_000 })),
    ),
    "clipped",
  );
});
