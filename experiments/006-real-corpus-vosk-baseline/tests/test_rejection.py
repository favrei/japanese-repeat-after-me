from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from real_corpus_eval.rejection import (
    analyze_result,
    build_report,
    validate_output_path,
)


def _result() -> dict:
    matrix = {
        "a": {"a": 0.85, "b": 0.81, "c": 0.10},
        "b": {"a": 0.20, "b": 0.90, "c": 0.20},
        "c": {"a": 0.25, "b": 0.30, "c": 0.80},
    }
    return {
        "schemaVersion": 1,
        "experiment": "006-real-corpus-vosk-baseline",
        "dataset": {
            "manifestSha256": "manifest",
            "sourceArchiveSha256": "dataset",
        },
        "model": {
            "name": "model",
            "sourceArchiveSha256": "archive",
        },
        "records": [
            {
                "file": f"audio/{source}.webm",
                "status": "ok",
                "sentenceId": source,
                "targetText": f"sentence {source}",
                "candidateScores": [
                    {
                        "sentenceId": candidate,
                        "similarity": similarity,
                    }
                    for candidate, similarity in candidates.items()
                ],
            }
            for source, candidates in matrix.items()
        ],
    }


class RejectionResultTests(unittest.TestCase):
    def test_serializes_grouped_rejection_metrics_and_errors(self):
        analysis, _ = analyze_result(_result())

        self.assertEqual(analysis["recordings"], 3)
        self.assertEqual(analysis["sentenceGroups"], 3)
        self.assertEqual(
            analysis["metrics"],
            {
                "positivePairs": 3,
                "negativePairs": 6,
                "truePositives": 2,
                "falsePositives": 1,
                "falseNegatives": 1,
                "trueNegatives": 5,
                "manifestPairPrecision": 0.666667,
                "manifestPairRecall": 0.666667,
                "manifestPairF1": 0.666667,
                "incorrectSentenceRejectionRate": 0.833333,
                "incorrectSentenceFalseAcceptanceRate": 0.166667,
            },
        )
        self.assertEqual(
            analysis["falseAccepts"][0]["presentedTargetSentence"],
            "sentence b",
        )
        self.assertEqual(
            analysis["falseRejects"][0]["recordingManifestSentence"],
            "sentence c",
        )

    def test_rejects_failed_records_and_out_of_range_similarity(self):
        failed = _result()
        failed["records"][0]["status"] = "failed"
        with self.assertRaisesRegex(ValueError, "does not have candidate"):
            analyze_result(failed)

        out_of_range = _result()
        out_of_range["records"][0]["candidateScores"][0][
            "similarity"
        ] = 1.1
        with self.assertRaisesRegex(ValueError, "between zero and one"):
            analyze_result(out_of_range)

    def test_rejects_overwriting_an_input_result(self):
        with self.assertRaisesRegex(ValueError, "must not overwrite"):
            validate_output_path(
                [Path("results/input.json")],
                Path("results/input.json"),
            )

    def test_single_run_does_not_claim_repeatability(self):
        result = _result()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "input.json"
            path.write_text(json.dumps(result), encoding="utf-8")
            report = build_report([(path, result)])

        repeatability = report["repeatability"]
        self.assertFalse(repeatability["comparisonsAvailable"])
        self.assertIsNone(repeatability["aggregateMetricsIdentical"])
        self.assertIsNone(repeatability["sameFalseAcceptSet"])
        self.assertIsNone(repeatability["sameFalseRejectSet"])


if __name__ == "__main__":
    unittest.main()
