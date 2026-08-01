from __future__ import annotations

import unittest

from synthetic_error_eval.core import (
    CatalogTarget,
    aggregate_metrics,
    intended_error_positions,
    mark_reading_misses,
    normalize_japanese,
    score_attempt,
)


class NormalizationTests(unittest.TestCase):
    def test_matches_app_katakana_and_punctuation_behavior(self) -> None:
        self.assertEqual(normalize_japanese(" コーヒー、です。"), "こーひーです")


class LocalizationTests(unittest.TestCase):
    def test_exact_transcript_has_no_misses(self) -> None:
        self.assertEqual(mark_reading_misses("きょうは。", "きょうは"), frozenset())

    def test_small_tsu_deletion_is_localized(self) -> None:
        self.assertEqual(
            intended_error_positions("じゅっぷん", "じゅぷん"),
            frozenset({2}),
        )
        self.assertEqual(
            mark_reading_misses("じゅっぷん", "じゅぷん"),
            frozenset({2}),
        )

    def test_insertion_is_grounded_but_not_represented_by_current_marker(self) -> None:
        expected = "じかんをへんこう"
        observed = "じかんをいまへんこう"
        self.assertTrue(intended_error_positions(expected, observed))
        self.assertEqual(mark_reading_misses(expected, observed), frozenset())

    def test_kanji_surface_transcript_causes_false_misses_against_reading(self) -> None:
        misses = mark_reading_misses("きょうはいいてんきですね", "今日はいい天気ですね")
        self.assertGreater(len(misses), 0)


class ScoringTests(unittest.TestCase):
    def test_score_uses_surface_or_reading_like_application(self) -> None:
        catalog = [
            CatalogTarget("s01", "今日はいい天気ですね。", "きょうはいいてんきですね。"),
            CatalogTarget("s02", "駅まで歩きます。", "えきまであるきます。"),
        ]
        result = score_attempt("今日 は いい 天気 です ね", "s01", catalog)
        self.assertTrue(result.passed)
        self.assertEqual(result.nearest_target_id, "s01")

    def test_metric_counts_are_explicit(self) -> None:
        summary = aggregate_metrics(
            [
                {
                    "groundTruthErrorPositions": [],
                    "predictedMissPositions": [1],
                    "errorKind": "exact",
                    "accepted": True,
                },
                {
                    "groundTruthErrorPositions": [2],
                    "predictedMissPositions": [2],
                    "errorKind": "deletion",
                    "accepted": True,
                },
            ]
        )
        self.assertEqual(summary["positionLocalization"]["precision"], 0.5)
        self.assertEqual(summary["positionLocalization"]["recall"], 1.0)
        self.assertEqual(summary["sentenceAcceptance"]["precision"], 0.5)
        self.assertEqual(summary["sentenceAcceptance"]["recall"], 1.0)


if __name__ == "__main__":
    unittest.main()
