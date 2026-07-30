from __future__ import annotations

import math
import unittest
from pathlib import Path

from real_corpus_eval.core import (
    BinaryScore,
    CandidateTarget,
    distribution,
    edit_distance,
    normalize_target_text,
    precision_recall_summary,
    score_candidates,
)
from real_corpus_eval.compare import compare_results
from real_corpus_eval.pipeline import build_ffmpeg_command


class NormalizationTests(unittest.TestCase):
    def test_removes_spacing_and_punctuation_without_removing_long_mark(self):
        self.assertEqual(
            normalize_target_text("この コーヒーは、 おいしいです。"),
            "このコーヒーはおいしいです",
        )

    def test_nfkc_normalizes_full_width_ascii(self):
        self.assertEqual(normalize_target_text("ＡＢＣ １２３"), "abc123")


class EditDistanceTests(unittest.TestCase):
    def test_known_alignment_distances(self):
        self.assertEqual(edit_distance("きょう", "きょ"), 1)
        self.assertEqual(edit_distance("いって", "いて"), 1)
        self.assertEqual(edit_distance("", "かな"), 2)

    def test_candidate_order_is_deterministic(self):
        candidates = [
            CandidateTarget("s02", "雨です。"),
            CandidateTarget("s01", "晴れです。"),
        ]
        scores = score_candidates("晴れ です", candidates)
        self.assertEqual(scores[0].sentence_id, "s01")
        self.assertEqual(scores[0].distance, 0)


class PrecisionRecallTests(unittest.TestCase):
    def test_perfect_ranking_has_average_precision_one(self):
        summary = precision_recall_summary(
            [
                BinaryScore(True, 0.9),
                BinaryScore(True, 0.8),
                BinaryScore(False, 0.3),
                BinaryScore(False, 0.1),
            ]
        )
        self.assertEqual(summary.positives, 2)
        self.assertEqual(summary.negatives, 2)
        self.assertTrue(math.isclose(summary.average_precision or 0.0, 1.0))
        self.assertIsNotNone(summary.best_point)
        self.assertTrue(
            math.isclose(summary.best_point.f1, 1.0)  # type: ignore[union-attr]
        )

    def test_tied_scores_are_evaluated_as_one_threshold(self):
        summary = precision_recall_summary(
            [
                BinaryScore(True, 0.5),
                BinaryScore(False, 0.5),
                BinaryScore(True, 0.1),
            ]
        )
        self.assertEqual(len(summary.points), 2)
        self.assertEqual(summary.points[0].true_positives, 1)
        self.assertEqual(summary.points[0].false_positives, 1)

    def test_missing_positive_class_is_explicitly_undefined(self):
        summary = precision_recall_summary([BinaryScore(False, 0.3)])
        self.assertIsNone(summary.average_precision)
        self.assertIsNone(summary.best_point)


class DistributionTests(unittest.TestCase):
    def test_empty_distribution_uses_nulls(self):
        self.assertEqual(distribution([])["count"], 0)
        self.assertIsNone(distribution([])["median"])


class ConversionCommandTests(unittest.TestCase):
    def test_conversion_is_explicit_and_deterministic(self):
        command = build_ffmpeg_command(
            Path("/input/source.webm"),
            Path("/output/derived.wav"),
        )
        self.assertEqual(command[0], "ffmpeg")
        self.assertIn("aresample=16000:resampler=swr:dither_method=none", command)
        self.assertIn("+bitexact", command)
        self.assertIn("pcm_s16le", command)
        self.assertEqual(command[-1], "/output/derived.wav")


class RepeatabilityTests(unittest.TestCase):
    def test_identifies_changed_transcript_with_stable_wav(self):
        def result(transcript: str) -> dict:
            return {
                "aggregate": {
                    "recordings": {"succeeded": 1},
                    "manifestTargetAgreement": {
                        "top1ClosedSetSentenceAccuracy": 1.0
                    },
                    "closedSetManifestTargetPrecisionRecall": {
                        "averagePrecision": 1.0,
                        "bestInSampleF1Point": {"threshold": 0.5},
                    },
                },
                "records": [
                    {
                        "file": "audio/example.webm",
                        "conversion": {"wavSha256": "abc"},
                        "recognizedText": transcript,
                        "targetAgreement": {
                            "distanceRate": 0.1,
                            "top1SentenceId": "s01",
                        },
                        "words": [],
                    }
                ],
            }

        comparison = compare_results(result("天気"), result("天気です"))
        self.assertEqual(
            comparison["deterministicConversion"]["sameDerivedWavSha256"],
            1,
        )
        self.assertEqual(
            comparison["recognitionRepeatability"]["sameTranscript"],
            0,
        )


if __name__ == "__main__":
    unittest.main()
