from __future__ import annotations

import math
import statistics
import unicodedata
from dataclasses import dataclass
from typing import Iterable, Sequence


def normalize_target_text(value: str) -> str:
    """Normalize target/transcript text without pretending to infer a reading."""

    normalized = unicodedata.normalize("NFKC", value).casefold()
    return "".join(
        character
        for character in normalized
        if not unicodedata.category(character).startswith(("P", "Z", "C"))
    )


def edit_distance(left: str, right: str) -> int:
    """Return Unicode code-point Levenshtein distance."""

    if len(left) > len(right):
        left, right = right, left
    previous = list(range(len(left) + 1))

    for right_index, right_character in enumerate(right, start=1):
        current = [right_index]
        for left_index, left_character in enumerate(left, start=1):
            current.append(
                min(
                    current[-1] + 1,
                    previous[left_index] + 1,
                    previous[left_index - 1]
                    + (left_character != right_character),
                )
            )
        previous = current

    return previous[-1]


def target_distance_rate(transcript: str, target: str) -> float:
    normalized_transcript = normalize_target_text(transcript)
    normalized_target = normalize_target_text(target)
    return edit_distance(normalized_transcript, normalized_target) / max(
        1, len(normalized_target)
    )


def target_similarity(transcript: str, target: str) -> float:
    return max(0.0, 1.0 - target_distance_rate(transcript, target))


@dataclass(frozen=True)
class CandidateTarget:
    sentence_id: str
    text: str


@dataclass(frozen=True)
class CandidateScore:
    sentence_id: str
    distance: int
    distance_rate: float
    similarity: float


def score_candidates(
    transcript: str,
    candidates: Sequence[CandidateTarget],
) -> list[CandidateScore]:
    normalized_transcript = normalize_target_text(transcript)
    scores = []

    for candidate in candidates:
        normalized_target = normalize_target_text(candidate.text)
        distance = edit_distance(normalized_transcript, normalized_target)
        distance_rate = distance / max(1, len(normalized_target))
        scores.append(
            CandidateScore(
                sentence_id=candidate.sentence_id,
                distance=distance,
                distance_rate=distance_rate,
                similarity=max(0.0, 1.0 - distance_rate),
            )
        )

    return sorted(
        scores,
        key=lambda score: (
            score.distance_rate,
            score.distance,
            score.sentence_id,
        ),
    )


@dataclass(frozen=True)
class BinaryScore:
    positive: bool
    score: float


@dataclass(frozen=True)
class PrecisionRecallPoint:
    threshold: float
    true_positives: int
    false_positives: int
    false_negatives: int
    precision: float
    recall: float
    f1: float


@dataclass(frozen=True)
class PrecisionRecallSummary:
    positives: int
    negatives: int
    average_precision: float | None
    best_point: PrecisionRecallPoint | None
    points: tuple[PrecisionRecallPoint, ...]


def precision_recall_summary(
    values: Iterable[BinaryScore],
) -> PrecisionRecallSummary:
    items = list(values)
    positives = sum(item.positive for item in items)
    negatives = len(items) - positives

    if not items or positives == 0:
        return PrecisionRecallSummary(
            positives=positives,
            negatives=negatives,
            average_precision=None,
            best_point=None,
            points=(),
        )

    for item in items:
        if not math.isfinite(item.score):
            raise ValueError("precision/recall scores must be finite")

    ordered = sorted(items, key=lambda item: item.score, reverse=True)
    points: list[PrecisionRecallPoint] = []
    true_positives = 0
    false_positives = 0
    index = 0

    while index < len(ordered):
        threshold = ordered[index].score
        while index < len(ordered) and ordered[index].score == threshold:
            if ordered[index].positive:
                true_positives += 1
            else:
                false_positives += 1
            index += 1

        false_negatives = positives - true_positives
        precision = true_positives / (true_positives + false_positives)
        recall = true_positives / positives
        f1 = (
            0.0
            if precision + recall == 0
            else 2 * precision * recall / (precision + recall)
        )
        points.append(
            PrecisionRecallPoint(
                threshold=threshold,
                true_positives=true_positives,
                false_positives=false_positives,
                false_negatives=false_negatives,
                precision=precision,
                recall=recall,
                f1=f1,
            )
        )

    previous_recall = 0.0
    average_precision = 0.0
    for point in points:
        average_precision += (
            point.recall - previous_recall
        ) * point.precision
        previous_recall = point.recall

    best_point = max(
        points,
        key=lambda point: (
            point.f1,
            point.precision,
            point.recall,
            point.threshold,
        ),
    )
    return PrecisionRecallSummary(
        positives=positives,
        negatives=negatives,
        average_precision=average_precision,
        best_point=best_point,
        points=tuple(points),
    )


def percentile(values: Sequence[float], fraction: float) -> float | None:
    if not values:
        return None
    if not 0.0 <= fraction <= 1.0:
        raise ValueError("fraction must be between 0 and 1")

    ordered = sorted(values)
    position = (len(ordered) - 1) * fraction
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    weight = position - lower
    return ordered[lower] * (1.0 - weight) + ordered[upper] * weight


def distribution(values: Sequence[float]) -> dict[str, float | int | None]:
    if not values:
        return {
            "count": 0,
            "min": None,
            "median": None,
            "mean": None,
            "p90": None,
            "max": None,
        }
    return {
        "count": len(values),
        "min": min(values),
        "median": statistics.median(values),
        "mean": statistics.fmean(values),
        "p90": percentile(values, 0.9),
        "max": max(values),
    }
