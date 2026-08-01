from __future__ import annotations

import math
import unicodedata
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from typing import Any

from pykakasi import kakasi


_KAKASI = kakasi()
_SMALL_KANA = frozenset("ゃゅょぁぃぅぇぉゎゕゖ")


def katakana_to_hiragana(value: str) -> str:
    converted = []
    for character in value:
        code = ord(character)
        converted.append(chr(code - 0x60) if 0x30A1 <= code <= 0x30F6 else character)
    return "".join(converted)


def normalize_hiragana(value: str) -> str:
    normalized = katakana_to_hiragana(unicodedata.normalize("NFKC", value).lower())
    return "".join(
        character
        for character in normalized
        if not (
            unicodedata.category(character).startswith(("P", "Z", "C"))
            or character.isspace()
        )
    )


def surface_to_hiragana(value: str) -> str:
    """Convert raw Japanese ASR surface text into the evaluation reading space."""

    reading = "".join(item["hira"] for item in _KAKASI.convert(value))
    return normalize_hiragana(reading)


def morae(value: str, *, surface: bool = False) -> tuple[str, ...]:
    reading = surface_to_hiragana(value) if surface else normalize_hiragana(value)
    result: list[str] = []
    for character in reading:
        if character in _SMALL_KANA and result:
            result[-1] += character
        else:
            result.append(character)
    return tuple(result)


def edit_distance(left: Sequence[str], right: Sequence[str]) -> int:
    previous = list(range(len(right) + 1))
    for left_index, left_item in enumerate(left, start=1):
        current = [left_index]
        for right_index, right_item in enumerate(right, start=1):
            current.append(
                min(
                    current[-1] + 1,
                    previous[right_index] + 1,
                    previous[right_index - 1] + (left_item != right_item),
                )
            )
        previous = current
    return previous[-1]


@dataclass(frozen=True)
class AlignmentOperation:
    operation: str
    expected_index: int
    expected: str | None
    observed: str | None


def align(
    expected: Sequence[str],
    observed: Sequence[str],
) -> tuple[AlignmentOperation, ...]:
    rows = len(expected) + 1
    columns = len(observed) + 1
    costs = [[0] * columns for _ in range(rows)]
    operations: list[list[str | None]] = [[None] * columns for _ in range(rows)]
    for row in range(1, rows):
        costs[row][0] = row
        operations[row][0] = "delete"
    for column in range(1, columns):
        costs[0][column] = column
        operations[0][column] = "insert"

    for row in range(1, rows):
        for column in range(1, columns):
            candidates = [
                (
                    costs[row - 1][column - 1]
                    + (expected[row - 1] != observed[column - 1]),
                    "equal" if expected[row - 1] == observed[column - 1] else "replace",
                ),
                (costs[row - 1][column] + 1, "delete"),
                (costs[row][column - 1] + 1, "insert"),
            ]
            costs[row][column], operations[row][column] = min(
                candidates, key=lambda candidate: candidate[0]
            )

    row = len(expected)
    column = len(observed)
    reversed_result: list[AlignmentOperation] = []
    while row or column:
        operation = operations[row][column]
        if operation in ("equal", "replace"):
            reversed_result.append(
                AlignmentOperation(
                    operation=operation,
                    expected_index=row - 1,
                    expected=expected[row - 1],
                    observed=observed[column - 1],
                )
            )
            row -= 1
            column -= 1
        elif operation == "delete":
            reversed_result.append(
                AlignmentOperation(
                    operation="delete",
                    expected_index=row - 1,
                    expected=expected[row - 1],
                    observed=None,
                )
            )
            row -= 1
        elif operation == "insert":
            anchor = min(row, max(0, len(expected) - 1))
            reversed_result.append(
                AlignmentOperation(
                    operation="insert",
                    expected_index=anchor,
                    expected=None,
                    observed=observed[column - 1],
                )
            )
            column -= 1
        else:
            raise AssertionError("alignment reached an invalid state")

    reversed_result.reverse()
    return tuple(reversed_result)


def error_positions(
    expected: Sequence[str],
    observed: Sequence[str],
) -> frozenset[int]:
    return frozenset(
        operation.expected_index
        for operation in align(expected, observed)
        if operation.operation != "equal"
    )


def tolerant_match_count(
    expected_positions: Sequence[int],
    predicted_positions: Sequence[int],
    tolerance: int = 1,
) -> int:
    expected = sorted(set(expected_positions))
    predicted = sorted(set(predicted_positions))
    expected_index = predicted_index = matches = 0
    while expected_index < len(expected) and predicted_index < len(predicted):
        delta = predicted[predicted_index] - expected[expected_index]
        if abs(delta) <= tolerance:
            matches += 1
            expected_index += 1
            predicted_index += 1
        elif delta < -tolerance:
            predicted_index += 1
        else:
            expected_index += 1
    return matches


def _divide(numerator: int, denominator: int) -> float | None:
    return numerator / denominator if denominator else None


def _rounded(value: float | None) -> float | None:
    return round(value, 6) if value is not None and math.isfinite(value) else value


def _f1(precision: float | None, recall: float | None) -> float | None:
    if precision is None or recall is None:
        return None
    return 0.0 if precision + recall == 0 else 2 * precision * recall / (precision + recall)


def _position_metrics(
    records: Sequence[dict[str, Any]],
    tolerance: int,
) -> dict[str, int | float | None]:
    true_positives = false_positives = false_negatives = 0
    for record in records:
        truth = record["groundTruthErrorPositions"]
        predicted = record["predictedErrorPositions"]
        matches = tolerant_match_count(truth, predicted, tolerance)
        true_positives += matches
        false_positives += len(set(predicted)) - matches
        false_negatives += len(set(truth)) - matches
    precision = _divide(true_positives, true_positives + false_positives)
    recall = _divide(true_positives, true_positives + false_negatives)
    return {
        "toleranceMorae": tolerance,
        "truePositivePositions": true_positives,
        "falsePositivePositions": false_positives,
        "falseNegativePositions": false_negatives,
        "precision": _rounded(precision),
        "recall": _rounded(recall),
        "f1": _rounded(_f1(precision, recall)),
    }


def aggregate_metrics(records: Iterable[dict[str, Any]]) -> dict[str, Any]:
    items = list(records)
    detection_tp = detection_fp = detection_fn = detection_tn = 0
    exact_attempts = exact_matches = exact_empty = 0
    exact_distance = exact_target_morae = 0
    closer_to_injected = closer_to_target = tied = 0

    for record in items:
        truth = set(record["groundTruthErrorPositions"])
        predicted = set(record["predictedErrorPositions"])
        expected_error = bool(truth)
        predicted_error = bool(predicted)
        detection_tp += expected_error and predicted_error
        detection_fp += not expected_error and predicted_error
        detection_fn += expected_error and not predicted_error
        detection_tn += not expected_error and not predicted_error

        if record["errorKind"] == "exact":
            exact_attempts += 1
            exact_matches += record["distanceToTargetMorae"] == 0
            exact_empty += not record["recognizedMorae"]
            exact_distance += record["distanceToTargetMorae"]
            exact_target_morae += len(record["targetMorae"])
        else:
            target_distance = record["distanceToTargetMorae"]
            injected_distance = record["distanceToInjectedMorae"]
            if injected_distance < target_distance:
                closer_to_injected += 1
            elif target_distance < injected_distance:
                closer_to_target += 1
            else:
                tied += 1

    detection_precision = _divide(detection_tp, detection_tp + detection_fp)
    detection_recall = _divide(detection_tp, detection_tp + detection_fn)
    error_attempts = closer_to_injected + closer_to_target + tied
    return {
        "attempts": len(items),
        "strictPositionLocalization": _position_metrics(items, tolerance=0),
        "withinOneMoraLocalization": _position_metrics(items, tolerance=1),
        "errorDetection": {
            "truePositives": detection_tp,
            "falsePositives": detection_fp,
            "falseNegatives": detection_fn,
            "trueNegatives": detection_tn,
            "precision": _rounded(detection_precision),
            "recall": _rounded(detection_recall),
            "f1": _rounded(_f1(detection_precision, detection_recall)),
        },
        "exactControlTranscription": {
            "attempts": exact_attempts,
            "exactMoraMatches": exact_matches,
            "emptyTranscripts": exact_empty,
            "moraErrorRate": _rounded(_divide(exact_distance, exact_target_morae)),
        },
        "injectedVariantEvidence": {
            "errorAttempts": error_attempts,
            "closerToInjectedReading": closer_to_injected,
            "closerToExpectedTarget": closer_to_target,
            "equalDistance": tied,
            "closerToInjectedRate": _rounded(_divide(closer_to_injected, error_attempts)),
        },
    }
