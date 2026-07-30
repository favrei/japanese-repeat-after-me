from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .pipeline import sha256_file


def _records_by_file(result: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {record["file"]: record for record in result["records"]}


def compare_results(
    first: dict[str, Any],
    second: dict[str, Any],
) -> dict[str, Any]:
    first_records = _records_by_file(first)
    second_records = _records_by_file(second)
    if first_records.keys() != second_records.keys():
        raise ValueError("result files do not contain the same recordings")

    differences = []
    same_wav_hashes = 0
    same_transcripts = 0
    same_target_scores = 0
    same_top1_assignments = 0
    same_word_outputs = 0

    for filename in sorted(first_records):
        left = first_records[filename]
        right = second_records[filename]
        if left["conversion"]["wavSha256"] == right["conversion"]["wavSha256"]:
            same_wav_hashes += 1
        if left["recognizedText"] == right["recognizedText"]:
            same_transcripts += 1
        else:
            differences.append(
                {
                    "file": filename,
                    "firstTranscript": left["recognizedText"],
                    "secondTranscript": right["recognizedText"],
                    "firstTargetDistanceRate": left["targetAgreement"][
                        "distanceRate"
                    ],
                    "secondTargetDistanceRate": right["targetAgreement"][
                        "distanceRate"
                    ],
                }
            )
        if (
            left["targetAgreement"]["distanceRate"]
            == right["targetAgreement"]["distanceRate"]
        ):
            same_target_scores += 1
        if (
            left["targetAgreement"]["top1SentenceId"]
            == right["targetAgreement"]["top1SentenceId"]
        ):
            same_top1_assignments += 1
        if left["words"] == right["words"]:
            same_word_outputs += 1

    count = len(first_records)
    first_closed_set = first["aggregate"][
        "closedSetManifestTargetPrecisionRecall"
    ]
    second_closed_set = second["aggregate"][
        "closedSetManifestTargetPrecisionRecall"
    ]
    return {
        "schemaVersion": 1,
        "experiment": "006-real-corpus-vosk-baseline-repeatability",
        "comparedAt": datetime.now(UTC).isoformat(),
        "recordings": count,
        "deterministicConversion": {
            "sameDerivedWavSha256": same_wav_hashes,
            "rate": same_wav_hashes / count if count else None,
        },
        "recognitionRepeatability": {
            "sameTranscript": same_transcripts,
            "transcriptAgreementRate": same_transcripts / count
            if count
            else None,
            "sameTargetDistanceRate": same_target_scores,
            "sameTop1SentenceAssignment": same_top1_assignments,
            "sameExactWordOutput": same_word_outputs,
            "changedTranscripts": differences,
        },
        "aggregateStability": {
            "sameSucceededCount": (
                first["aggregate"]["recordings"]["succeeded"]
                == second["aggregate"]["recordings"]["succeeded"]
            ),
            "sameTop1Accuracy": (
                first["aggregate"]["manifestTargetAgreement"][
                    "top1ClosedSetSentenceAccuracy"
                ]
                == second["aggregate"]["manifestTargetAgreement"][
                    "top1ClosedSetSentenceAccuracy"
                ]
            ),
            "sameAveragePrecision": (
                first_closed_set["averagePrecision"]
                == second_closed_set["averagePrecision"]
            ),
            "firstBestInSamplePoint": first_closed_set[
                "bestInSampleF1Point"
            ],
            "secondBestInSamplePoint": second_closed_set[
                "bestInSampleF1Point"
            ],
        },
        "interpretation": (
            "Identical derived WAV bytes do not guarantee identical Vosk word "
            "decoding on repeated runs. Coarse closed-set sentence identity "
            "must be checked separately from transcript-level stability."
        ),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare two experiment 006 JSON results."
    )
    parser.add_argument("first", type=Path)
    parser.add_argument("second", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    first = json.loads(args.first.read_text(encoding="utf-8"))
    second = json.loads(args.second.read_text(encoding="utf-8"))
    comparison = compare_results(first, second)
    comparison["inputs"] = {
        "first": args.first.name,
        "firstSha256": sha256_file(args.first),
        "second": args.second.name,
        "secondSha256": sha256_file(args.second),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix(f"{args.output.suffix}.part")
    temporary.write_text(
        f"{json.dumps(comparison, ensure_ascii=False, indent=2)}\n",
        encoding="utf-8",
    )
    temporary.replace(args.output)
    print(json.dumps(comparison, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
