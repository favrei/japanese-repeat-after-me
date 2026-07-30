from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .core import (
    GroupedBinaryDecision,
    GroupedBinaryScore,
    SentenceGroupedRejectionSummary,
    sentence_grouped_rejection_summary,
)
from .pipeline import sha256_file


def _round_float(value: float | None) -> float | None:
    return round(value, 6) if value is not None else None


def _require_string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value:
        raise ValueError(f"{field} must be a non-empty string")
    return value


def _load_scores(
    result: dict[str, Any],
) -> tuple[list[GroupedBinaryScore], dict[str, str]]:
    if result.get("experiment") != "006-real-corpus-vosk-baseline":
        raise ValueError("input is not an experiment 006 baseline result")
    if result.get("schemaVersion") != 1:
        raise ValueError("input does not use result schema version 1")
    records = result.get("records")
    if not isinstance(records, list) or not records:
        raise ValueError("result must contain at least one record")

    scores: list[GroupedBinaryScore] = []
    sentence_texts: dict[str, str] = {}
    recording_ids: set[str] = set()

    for record in records:
        if not isinstance(record, dict):
            raise ValueError("every result record must be an object")
        recording_id = _require_string(record.get("file"), "record.file")
        if recording_id in recording_ids:
            raise ValueError(f"duplicate recording: {recording_id}")
        recording_ids.add(recording_id)

        if record.get("status") != "ok":
            raise ValueError(
                f"record does not have candidate scores: {recording_id}"
            )
        recording_group = _require_string(
            record.get("sentenceId"),
            f"{recording_id}.sentenceId",
        )
        target_text = _require_string(
            record.get("targetText"),
            f"{recording_id}.targetText",
        )
        previous_text = sentence_texts.setdefault(
            recording_group,
            target_text,
        )
        if previous_text != target_text:
            raise ValueError(
                f"inconsistent target text for {recording_group}"
            )

        candidate_scores = record.get("candidateScores")
        if not isinstance(candidate_scores, list):
            raise ValueError(
                f"{recording_id}.candidateScores must be an array"
            )
        for candidate in candidate_scores:
            if not isinstance(candidate, dict):
                raise ValueError("every candidate score must be an object")
            candidate_group = _require_string(
                candidate.get("sentenceId"),
                f"{recording_id}.candidateScores[].sentenceId",
            )
            similarity = candidate.get("similarity")
            if (
                not isinstance(similarity, (int, float))
                or isinstance(similarity, bool)
            ):
                raise ValueError(
                    f"{recording_id}/{candidate_group} similarity "
                    "must be numeric"
                )
            if not 0.0 <= similarity <= 1.0:
                raise ValueError(
                    f"{recording_id}/{candidate_group} similarity "
                    "must be between zero and one"
                )
            scores.append(
                GroupedBinaryScore(
                    recording_id=recording_id,
                    recording_group=recording_group,
                    candidate_group=candidate_group,
                    positive=recording_group == candidate_group,
                    score=float(similarity),
                )
            )

    return scores, sentence_texts


def _serialize_metrics(metrics: Any) -> dict[str, int | float | None]:
    return {
        "positivePairs": metrics.positives,
        "negativePairs": metrics.negatives,
        "truePositives": metrics.true_positives,
        "falsePositives": metrics.false_positives,
        "falseNegatives": metrics.false_negatives,
        "trueNegatives": metrics.true_negatives,
        "manifestPairPrecision": _round_float(metrics.precision),
        "manifestPairRecall": _round_float(metrics.recall),
        "manifestPairF1": _round_float(metrics.f1),
        "incorrectSentenceRejectionRate": _round_float(
            metrics.incorrect_sentence_rejection_rate
        ),
        "incorrectSentenceFalseAcceptanceRate": _round_float(
            metrics.false_acceptance_rate
        ),
    }


def _serialize_error(
    decision: GroupedBinaryDecision,
    sentence_texts: dict[str, str],
) -> dict[str, Any]:
    return {
        "recording": decision.recording_id,
        "recordingManifestSentenceId": decision.recording_group,
        "recordingManifestSentence": sentence_texts[
            decision.recording_group
        ],
        "presentedTargetSentenceId": decision.candidate_group,
        "presentedTargetSentence": sentence_texts[decision.candidate_group],
        "similarity": _round_float(decision.score),
        "threshold": _round_float(decision.threshold),
    }


def _serialize_summary(
    summary: SentenceGroupedRejectionSummary,
    sentence_texts: dict[str, str],
) -> dict[str, Any]:
    return {
        "recordings": len(
            {decision.recording_id for decision in summary.decisions}
        ),
        "sentenceGroups": len(summary.groups),
        "metrics": _serialize_metrics(summary.aggregate),
        "folds": [
            {
                "heldOutSentenceId": fold.held_out_group,
                "heldOutSentence": sentence_texts[fold.held_out_group],
                "selectedThreshold": _round_float(
                    fold.selected_threshold
                ),
                "trainingPositivePairs": fold.training_positives,
                "trainingNegativePairs": fold.training_negatives,
                "trainingBestF1": _round_float(
                    fold.training_best_f1
                ),
                "test": _serialize_metrics(fold.test_metrics),
            }
            for fold in summary.folds
        ],
        "falseAccepts": [
            _serialize_error(decision, sentence_texts)
            for decision in summary.false_accepts
        ],
        "falseRejects": [
            _serialize_error(decision, sentence_texts)
            for decision in summary.false_rejects
        ],
    }


def analyze_result(
    result: dict[str, Any],
) -> tuple[dict[str, Any], SentenceGroupedRejectionSummary]:
    scores, sentence_texts = _load_scores(result)
    summary = sentence_grouped_rejection_summary(scores)
    return _serialize_summary(summary, sentence_texts), summary


def build_report(
    inputs: list[tuple[Path, dict[str, Any]]],
) -> dict[str, Any]:
    if not inputs:
        raise ValueError("at least one result is required")

    runs = []
    summaries = []
    seen_input_hashes: set[str] = set()
    common_provenance: tuple[Any, ...] | None = None
    for path, result in inputs:
        input_sha256 = sha256_file(path)
        if input_sha256 in seen_input_hashes:
            raise ValueError("the same result content was provided more than once")
        seen_input_hashes.add(input_sha256)

        dataset = result.get("dataset")
        model = result.get("model")
        if not isinstance(dataset, dict) or not isinstance(model, dict):
            raise ValueError("result is missing dataset or model provenance")
        provenance = (
            dataset.get("manifestSha256"),
            dataset.get("sourceArchiveSha256"),
            model.get("name"),
            model.get("sourceArchiveSha256"),
        )
        if any(value is None for value in provenance):
            raise ValueError("result is missing dataset or model provenance")
        if common_provenance is None:
            common_provenance = provenance
        elif provenance != common_provenance:
            raise ValueError(
                "all results must use the same dataset and model provenance"
            )

        analysis, summary = analyze_result(result)
        runs.append(
            {
                "input": {
                    "file": path.name,
                    "sha256": input_sha256,
                    "recordedAt": result.get("recordedAt"),
                    "sourceGitCommit": result.get("environment", {}).get(
                        "gitCommit"
                    ),
                    "datasetManifestSha256": provenance[0],
                    "datasetSourceArchiveSha256": provenance[1],
                    "model": provenance[2],
                    "modelSourceArchiveSha256": provenance[3],
                },
                **analysis,
            }
        )
        summaries.append(summary)

    false_accept_sets = [
        {
            (decision.recording_id, decision.candidate_group)
            for decision in summary.false_accepts
        }
        for summary in summaries
    ]
    false_reject_sets = [
        {
            (decision.recording_id, decision.candidate_group)
            for decision in summary.false_rejects
        }
        for summary in summaries
    ]
    rejection_rates = [
        summary.aggregate.incorrect_sentence_rejection_rate
        for summary in summaries
        if summary.aggregate.incorrect_sentence_rejection_rate is not None
    ]
    recalls = [
        summary.aggregate.recall
        for summary in summaries
        if summary.aggregate.recall is not None
    ]
    has_repeat_runs = len(runs) >= 2

    return {
        "schemaVersion": 1,
        "experiment": (
            "006-real-corpus-vosk-baseline-wrong-sentence-rejection"
        ),
        "question": (
            "When a real recording assigned to one Japanese sentence is "
            "presented against another sentence target, how often is it "
            "rejected?"
        ),
        "method": {
            "positivePair": (
                "A real recording paired with its manifest-assigned sentence."
            ),
            "negativePair": (
                "The same recording paired with each of the other nine "
                "real Japanese sentence prompts."
            ),
            "folding": (
                "Leave one source sentence and all three takes out. Remove "
                "that sentence from both recording and candidate sides of "
                "threshold training, then test its recordings against all "
                "ten candidates."
            ),
            "thresholdSelection": (
                "Choose the score threshold with best training F1; ties "
                "prefer precision, then recall, then the higher threshold. "
                "Accept when similarity is greater than or equal to the "
                "selected threshold."
            ),
            "decisionUnit": "One recording/candidate-sentence pair.",
        },
        "runs": runs,
        "repeatability": {
            "runCount": len(runs),
            "comparisonsAvailable": has_repeat_runs,
            "aggregateMetricsIdentical": (
                all(
                    run["metrics"] == runs[0]["metrics"]
                    for run in runs[1:]
                )
                if has_repeat_runs
                else None
            ),
            "sameFalseAcceptSet": (
                all(
                    values == false_accept_sets[0]
                    for values in false_accept_sets[1:]
                )
                if has_repeat_runs
                else None
            ),
            "sameFalseRejectSet": (
                all(
                    values == false_reject_sets[0]
                    for values in false_reject_sets[1:]
                )
                if has_repeat_runs
                else None
            ),
            "incorrectSentenceRejectionRateRange": {
                "min": _round_float(min(rejection_rates))
                if rejection_rates
                else None,
                "max": _round_float(max(rejection_rates))
                if rejection_rates
                else None,
            },
            "manifestPairRecallRange": {
                "min": _round_float(min(recalls)) if recalls else None,
                "max": _round_float(max(recalls)) if recalls else None,
            },
        },
        "limitations": [
            (
                "These negatives are wholly different sentences, not subtle "
                "mispronunciations or near-miss learner errors."
            ),
            (
                "The negative candidates come from the fixed ten-sentence "
                "catalog and occur as candidate targets during threshold "
                "training; this does not test unseen prompt sentences."
            ),
            (
                "The 270 negative pair decisions reuse 30 recordings and "
                "are correlated; the reported rate is empirical, not 270 "
                "independent wrong utterances."
            ),
            (
                "All recordings are from one speaker and one session, so "
                "this does not estimate unseen-speaker performance."
            ),
            (
                "Manifest assignment supplies the pair label; no human "
                "acceptability or pronunciation judgment is available."
            ),
            (
                "The selected thresholds are exploratory cross-validation "
                "outputs, not frozen production thresholds."
            ),
        ],
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Measure wrong-sentence rejection from experiment 006 results."
        )
    )
    parser.add_argument("results", nargs="+", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def validate_output_path(
    input_paths: list[Path],
    output_path: Path,
) -> None:
    resolved_output = output_path.resolve()
    if any(path.resolve() == resolved_output for path in input_paths):
        raise ValueError("--output must not overwrite an input result")


def main() -> None:
    args = parse_args()
    validate_output_path(args.results, args.output)
    inputs = [
        (
            path,
            json.loads(path.read_text(encoding="utf-8")),
        )
        for path in args.results
    ]
    report = build_report(inputs)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix(f"{args.output.suffix}.part")
    temporary.write_text(
        f"{json.dumps(report, ensure_ascii=False, indent=2)}\n",
        encoding="utf-8",
    )
    temporary.replace(args.output)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
