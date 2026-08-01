from __future__ import annotations

import unittest

from ml_only_eval.core import (
    aggregate_metrics,
    error_positions,
    morae,
    surface_to_hiragana,
    tolerant_match_count,
)


class ReadingConversionTests(unittest.TestCase):
    def test_surface_text_is_converted_to_hiragana(self) -> None:
        self.assertEqual(
            surface_to_hiragana("今日 は いい 天気 です ね"),
            "きょうはいいてんきですね",
        )

    def test_small_kana_join_the_preceding_mora(self) -> None:
        self.assertEqual(morae("きょうは"), ("きょ", "う", "は"))

    def test_punctuation_and_spaces_do_not_create_morae(self) -> None:
        self.assertEqual(morae("この、コーヒー は。"), ("こ", "の", "こ", "ー", "ひ", "ー", "は"))


class AlignmentTests(unittest.TestCase):
    def test_small_tsu_deletion_is_localized(self) -> None:
        expected = morae("じゅっぷん")
        observed = morae("じゅぷん")
        self.assertEqual(error_positions(expected, observed), frozenset({1}))

    def test_exact_surface_recognition_has_no_errors(self) -> None:
        expected = morae("きょうはいいてんきですね")
        observed = morae("今日 は いい 天気 です ね", surface=True)
        self.assertEqual(error_positions(expected, observed), frozenset())

    def test_surface_conversion_preserves_known_segmentation_ambiguity(self) -> None:
        self.assertEqual(surface_to_hiragana("今日は"), "こんにちは")

    def test_tolerant_matching_is_one_to_one(self) -> None:
        self.assertEqual(tolerant_match_count([4], [3, 4], tolerance=1), 1)
        self.assertEqual(tolerant_match_count([4, 8], [5, 7], tolerance=1), 2)


class MetricTests(unittest.TestCase):
    def test_aggregate_metrics_separate_detection_and_localization(self) -> None:
        records = [
            {
                "errorKind": "exact",
                "groundTruthErrorPositions": [],
                "predictedErrorPositions": [],
                "distanceToTargetMorae": 0,
                "distanceToInjectedMorae": 0,
                "recognizedMorae": ["あ"],
                "targetMorae": ["あ"],
            },
            {
                "errorKind": "small_tsu_deletion",
                "groundTruthErrorPositions": [2],
                "predictedErrorPositions": [2],
                "distanceToTargetMorae": 1,
                "distanceToInjectedMorae": 0,
                "recognizedMorae": ["あ"],
                "targetMorae": ["あ", "っ"],
            },
        ]

        metrics = aggregate_metrics(records)

        self.assertEqual(metrics["strictPositionLocalization"]["precision"], 1.0)
        self.assertEqual(metrics["strictPositionLocalization"]["recall"], 1.0)
        self.assertEqual(metrics["errorDetection"]["trueNegatives"], 1)
        self.assertEqual(metrics["injectedVariantEvidence"]["closerToInjectedRate"], 1.0)


if __name__ == "__main__":
    unittest.main()
