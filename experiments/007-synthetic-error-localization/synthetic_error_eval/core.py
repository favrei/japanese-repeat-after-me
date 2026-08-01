from __future__ import annotations

import math
import unicodedata
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from typing import Any


CONTENT_ACCEPT_THRESHOLD = 0.30


def katakana_to_hiragana(value: str) -> str:
    converted = []
    for character in value:
        code = ord(character)
        converted.append(chr(code - 0x60) if 0x30A1 <= code <= 0x30F6 else character)
    return "".join(converted)


def normalize_japanese(value: str) -> str:
    """Mirror the application's current `normalizeJapanese` behavior."""

    normalized = katakana_to_hiragana(unicodedata.normalize("NFKC", value).lower())
    ignored = set("。、！？!?.,・「」『』（）() \t\r\n")
    return "".join(character for character in normalized if character not in ignored).replace(
        "ヶ", "か"
    )


def edit_distance(left: str, right: str) -> int:
    previous = list(range(len(right) + 1))
    for left_index, left_character in enumerate(left, start=1):
        current = [left_index]
        for right_index, right_character in enumerate(right, start=1):
            current.append(
                min(
                    current[-1] + 1,
                    previous[right_index] + 1,
                    previous[right_index - 1]
                    + (left_character != right_character),
                )
            )
        previous = current
    return previous[-1]


def target_similarity(transcript: str, target: str) -> float:
    normalized_transcript = normalize_japanese(transcript)
    normalized_target = normalize_japanese(target)
    if not normalized_transcript or not normalized_target:
        return 0.0
    return max(
        0.0,
        1.0
        - edit_distance(normalized_transcript, normalized_target)
        / len(normalized_target),
    )


def mark_reading_misses(reading: str, transcript: str) -> frozenset[int]:
    """Return normalized target indices the current UI would mark as misses.

    The dynamic-programming fill and diagonal-first backtrace intentionally
    match `app/client/gameplay/scoring.ts` rather than improving it here.
    """

    target = normalize_japanese(reading)
    heard = normalize_japanese(transcript)
    hits = [False] * len(target)

    if target and heard:
        rows = len(target) + 1
        cols = len(heard) + 1
        dp = [
            [column if row == 0 else row if column == 0 else 0 for column in range(cols)]
            for row in range(rows)
        ]
        for row in range(1, rows):
            for column in range(1, cols):
                cost = target[row - 1] != heard[column - 1]
                dp[row][column] = min(
                    dp[row - 1][column] + 1,
                    dp[row][column - 1] + 1,
                    dp[row - 1][column - 1] + cost,
                )

        row = len(target)
        column = len(heard)
        while row > 0 and column > 0:
            cost = target[row - 1] != heard[column - 1]
            if dp[row][column] == dp[row - 1][column - 1] + cost:
                hits[row - 1] = not cost
                row -= 1
                column -= 1
            elif dp[row][column] == dp[row - 1][column] + 1:
                row -= 1
            else:
                column -= 1

    return frozenset(index for index, hit in enumerate(hits) if not hit)


@dataclass(frozen=True)
class AlignmentOperation:
    operation: str
    expected_index: int
    expected: str | None
    observed: str | None


def align_expected_observed(expected: str, observed: str) -> tuple[AlignmentOperation, ...]:
    """Levenshtein alignment with insertion anchors on expected positions."""

    expected = normalize_japanese(expected)
    observed = normalize_japanese(observed)
    rows = len(expected) + 1
    cols = len(observed) + 1
    dp = [[0] * cols for _ in range(rows)]
    operation: list[list[str | None]] = [[None] * cols for _ in range(rows)]
    for row in range(1, rows):
        dp[row][0] = row
        operation[row][0] = "delete"
    for column in range(1, cols):
        dp[0][column] = column
        operation[0][column] = "insert"

    for row in range(1, rows):
        for column in range(1, cols):
            candidates = [
                (
                    dp[row - 1][column - 1]
                    + (expected[row - 1] != observed[column - 1]),
                    "equal"
                    if expected[row - 1] == observed[column - 1]
                    else "replace",
                ),
                (dp[row - 1][column] + 1, "delete"),
                (dp[row][column - 1] + 1, "insert"),
            ]
            dp[row][column], operation[row][column] = min(
                candidates, key=lambda item: item[0]
            )

    row = len(expected)
    column = len(observed)
    reversed_operations: list[AlignmentOperation] = []
    while row or column:
        action = operation[row][column]
        if action in ("equal", "replace"):
            reversed_operations.append(
                AlignmentOperation(
                    operation=action,
                    expected_index=row - 1,
                    expected=expected[row - 1],
                    observed=observed[column - 1],
                )
            )
            row -= 1
            column -= 1
        elif action == "delete":
            reversed_operations.append(
                AlignmentOperation(
                    operation="delete",
                    expected_index=row - 1,
                    expected=expected[row - 1],
                    observed=None,
                )
            )
            row -= 1
        elif action == "insert":
            anchor = min(row, max(0, len(expected) - 1))
            reversed_operations.append(
                AlignmentOperation(
                    operation="insert",
                    expected_index=anchor,
                    expected=None,
                    observed=observed[column - 1],
                )
            )
            column -= 1
        else:
            raise AssertionError("alignment backtrace reached an invalid state")

    reversed_operations.reverse()
    return tuple(reversed_operations)


def intended_error_positions(expected: str, spoken: str) -> frozenset[int]:
    return frozenset(
        item.expected_index
        for item in align_expected_observed(expected, spoken)
        if item.operation != "equal"
    )


@dataclass(frozen=True)
class CatalogTarget:
    target_id: str
    text: str
    reading: str


@dataclass(frozen=True)
class AttemptScore:
    passed: bool
    score: float
    nearest_target_id: str
    runner_up_score: float


def score_attempt(
    transcript: str,
    presented_target_id: str,
    catalog: Sequence[CatalogTarget],
) -> AttemptScore:
    scores = sorted(
        (
            (
                target.target_id,
                max(
                    target_similarity(transcript, target.text),
                    target_similarity(transcript, target.reading),
                ),
            )
            for target in catalog
        ),
        key=lambda item: (-item[1], item[0]),
    )
    by_id = dict(scores)
    presented_score = by_id[presented_target_id]
    nearest_target_id = scores[0][0]
    return AttemptScore(
        passed=(
            nearest_target_id == presented_target_id
            and presented_score >= CONTENT_ACCEPT_THRESHOLD
        ),
        score=presented_score,
        nearest_target_id=nearest_target_id,
        runner_up_score=scores[1][1] if len(scores) > 1 else 0.0,
    )


def _divide(numerator: int, denominator: int) -> float | None:
    return numerator / denominator if denominator else None


def _f1(precision: float | None, recall: float | None) -> float | None:
    if precision is None or recall is None:
        return None
    return 0.0 if precision + recall == 0 else 2 * precision * recall / (precision + recall)


def _rounded(value: float | None) -> float | None:
    return round(value, 6) if value is not None and math.isfinite(value) else value


def aggregate_metrics(records: Iterable[dict[str, Any]]) -> dict[str, Any]:
    items = list(records)
    position_tp = position_fp = position_fn = 0
    detection_tp = detection_fp = detection_fn = detection_tn = 0
    acceptance_tp = acceptance_fp = acceptance_fn = acceptance_tn = 0

    for item in items:
        expected_positions = set(item["groundTruthErrorPositions"])
        predicted_positions = set(item["predictedMissPositions"])
        position_tp += len(expected_positions & predicted_positions)
        position_fp += len(predicted_positions - expected_positions)
        position_fn += len(expected_positions - predicted_positions)

        expected_error = bool(expected_positions)
        predicted_error = bool(predicted_positions)
        detection_tp += expected_error and predicted_error
        detection_fp += not expected_error and predicted_error
        detection_fn += expected_error and not predicted_error
        detection_tn += not expected_error and not predicted_error

        acceptable = item["errorKind"] == "exact"
        accepted = bool(item["accepted"])
        acceptance_tp += acceptable and accepted
        acceptance_fp += not acceptable and accepted
        acceptance_fn += acceptable and not accepted
        acceptance_tn += not acceptable and not accepted

    position_precision = _divide(position_tp, position_tp + position_fp)
    position_recall = _divide(position_tp, position_tp + position_fn)
    detection_precision = _divide(detection_tp, detection_tp + detection_fp)
    detection_recall = _divide(detection_tp, detection_tp + detection_fn)
    acceptance_precision = _divide(acceptance_tp, acceptance_tp + acceptance_fp)
    acceptance_recall = _divide(acceptance_tp, acceptance_tp + acceptance_fn)

    return {
        "attempts": len(items),
        "positionLocalization": {
            "truePositivePositions": position_tp,
            "falsePositivePositions": position_fp,
            "falseNegativePositions": position_fn,
            "precision": _rounded(position_precision),
            "recall": _rounded(position_recall),
            "f1": _rounded(_f1(position_precision, position_recall)),
        },
        "errorDetection": {
            "truePositives": detection_tp,
            "falsePositives": detection_fp,
            "falseNegatives": detection_fn,
            "trueNegatives": detection_tn,
            "precision": _rounded(detection_precision),
            "recall": _rounded(detection_recall),
            "f1": _rounded(_f1(detection_precision, detection_recall)),
        },
        "sentenceAcceptance": {
            "trueAccepts": acceptance_tp,
            "falseAccepts": acceptance_fp,
            "falseRejects": acceptance_fn,
            "trueRejects": acceptance_tn,
            "precision": _rounded(acceptance_precision),
            "recall": _rounded(acceptance_recall),
            "f1": _rounded(_f1(acceptance_precision, acceptance_recall)),
            "falseAcceptanceRate": _rounded(
                _divide(acceptance_fp, acceptance_fp + acceptance_tn)
            ),
            "falseRejectionRate": _rounded(
                _divide(acceptance_fn, acceptance_tp + acceptance_fn)
            ),
        },
    }
