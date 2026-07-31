export type RecordingEvidence = {
  clippedSamples: number;
  peak: number;
  sampleRate: number;
  sumSquares: number;
  totalSamples: number;
};

export type RecordingQuality = {
  clippedFraction: number;
  durationSeconds: number;
  peak: number;
  rms: number;
};

export type RecordingQualityProblem =
  | "clipped"
  | "no-audio"
  | "too-quiet"
  | "too-short";

export function summarizeRecordingQuality(
  evidence: RecordingEvidence,
): RecordingQuality {
  const durationSeconds =
    evidence.sampleRate > 0 ? evidence.totalSamples / evidence.sampleRate : 0;

  return {
    clippedFraction:
      evidence.totalSamples > 0
        ? evidence.clippedSamples / evidence.totalSamples
        : 0,
    durationSeconds,
    peak: evidence.peak,
    rms:
      evidence.totalSamples > 0
        ? Math.sqrt(evidence.sumSquares / evidence.totalSamples)
        : 0,
  };
}

export function recordingQualityProblem(
  quality: RecordingQuality,
): RecordingQualityProblem | null {
  if (quality.durationSeconds === 0) return "no-audio";
  if (quality.durationSeconds < 0.45) return "too-short";
  if (quality.rms < 0.003) return "too-quiet";
  if (quality.clippedFraction > 0.1) return "clipped";
  return null;
}
