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


@dataclass(frozen=True)
class GroupedBinaryScore:
    """One recording/candidate score used for sentence-grouped evaluation."""

    recording_id: str
    recording_group: str
    candidate_group: str
    positive: bool
    score: float


@dataclass(frozen=True)
class GroupedBinaryDecision:
    recording_id: str
    recording_group: str
    candidate_group: str
    positive: bool
    score: float
    threshold: float
    accepted: bool


@dataclass(frozen=True)
class WrongSentenceRejectionMetrics:
    positives: int
    negatives: int
    true_positives: int
    false_positives: int
    false_negatives: int
    true_negatives: int
    precision: float | None
    recall: float | None
    f1: float | None
    incorrect_sentence_rejection_rate: float | None
    false_acceptance_rate: float | None


@dataclass(frozen=True)
class SentenceGroupedRejectionFold:
    held_out_group: str
    selected_threshold: float
    training_positives: int
    training_negatives: int
    training_best_f1: float
    test_metrics: WrongSentenceRejectionMetrics


@dataclass(frozen=True)
class SentenceGroupedRejectionSummary:
    groups: tuple[str, ...]
    aggregate: WrongSentenceRejectionMetrics
    folds: tuple[SentenceGroupedRejectionFold, ...]
    decisions: tuple[GroupedBinaryDecision, ...]
    false_accepts: tuple[GroupedBinaryDecision, ...]
    false_rejects: tuple[GroupedBinaryDecision, ...]


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


def _wrong_sentence_rejection_metrics(
    decisions: Sequence[GroupedBinaryDecision],
) -> WrongSentenceRejectionMetrics:
    true_positives = sum(
        decision.positive and decision.accepted for decision in decisions
    )
    false_positives = sum(
        not decision.positive and decision.accepted for decision in decisions
    )
    false_negatives = sum(
        decision.positive and not decision.accepted for decision in decisions
    )
    true_negatives = sum(
        not decision.positive and not decision.accepted
        for decision in decisions
    )
    positives = true_positives + false_negatives
    negatives = true_negatives + false_positives
    accepted = true_positives + false_positives
    f1_denominator = 2 * true_positives + false_positives + false_negatives

    return WrongSentenceRejectionMetrics(
        positives=positives,
        negatives=negatives,
        true_positives=true_positives,
        false_positives=false_positives,
        false_negatives=false_negatives,
        true_negatives=true_negatives,
        precision=true_positives / accepted if accepted else None,
        recall=true_positives / positives if positives else None,
        f1=(
            2 * true_positives / f1_denominator
            if f1_denominator
            else None
        ),
        incorrect_sentence_rejection_rate=(
            true_negatives / negatives if negatives else None
        ),
        false_acceptance_rate=(
            false_positives / negatives if negatives else None
        ),
    )


def sentence_grouped_rejection_summary(
    values: Iterable[GroupedBinaryScore],
) -> SentenceGroupedRejectionSummary:
    """Evaluate wrong-sentence rejection with grouped threshold selection.

    Each fold holds out one source sentence and all of its recordings. The
    held-out sentence is also removed from the candidate side of threshold
    training. The threshold that maximizes training F1 is then applied to all
    candidate pairings for the held-out recordings.
    """

    items = list(values)
    if not items:
        return SentenceGroupedRejectionSummary(
            groups=(),
            aggregate=_wrong_sentence_rejection_metrics(()),
            folds=(),
            decisions=(),
            false_accepts=(),
            false_rejects=(),
        )

    recording_groups: dict[str, str] = {}
    candidate_groups: set[str] = set()
    pair_keys: set[tuple[str, str]] = set()

    for item in items:
        if not math.isfinite(item.score):
            raise ValueError("sentence-grouped scores must be finite")
        previous_group = recording_groups.setdefault(
            item.recording_id, item.recording_group
        )
        if previous_group != item.recording_group:
            raise ValueError(
                f"recording {item.recording_id!r} belongs to multiple groups"
            )
        pair_key = (item.recording_id, item.candidate_group)
        if pair_key in pair_keys:
            raise ValueError(
                "duplicate recording/candidate pair "
                f"{item.recording_id!r}/{item.candidate_group!r}"
            )
        pair_keys.add(pair_key)
        candidate_groups.add(item.candidate_group)
        if item.positive != (
            item.recording_group == item.candidate_group
        ):
            raise ValueError(
                "positive labels must match recording/candidate group equality"
            )

    source_groups = set(recording_groups.values())
    if source_groups != candidate_groups:
        raise ValueError(
            "recording and candidate sentence groups must be identical"
        )
    if len(source_groups) < 3:
        raise ValueError(
            "sentence-grouped rejection requires at least three groups"
        )

    expected_candidates = candidate_groups
    candidates_by_recording: dict[str, set[str]] = {
        recording_id: set() for recording_id in recording_groups
    }
    for item in items:
        candidates_by_recording[item.recording_id].add(
            item.candidate_group
        )
    incomplete = [
        recording_id
        for recording_id, candidates in candidates_by_recording.items()
        if candidates != expected_candidates
    ]
    if incomplete:
        raise ValueError(
            "every recording must have exactly one score for every candidate"
        )

    folds: list[SentenceGroupedRejectionFold] = []
    decisions: list[GroupedBinaryDecision] = []

    for held_out_group in sorted(source_groups):
        training = [
            item
            for item in items
            if item.recording_group != held_out_group
            and item.candidate_group != held_out_group
        ]
        training_summary = precision_recall_summary(
            BinaryScore(positive=item.positive, score=item.score)
            for item in training
        )
        if training_summary.best_point is None:
            raise ValueError(
                f"fold {held_out_group!r} has no positive training pairs"
            )
        best_point = training_summary.best_point
        fold_decisions = [
            GroupedBinaryDecision(
                recording_id=item.recording_id,
                recording_group=item.recording_group,
                candidate_group=item.candidate_group,
                positive=item.positive,
                score=item.score,
                threshold=best_point.threshold,
                accepted=item.score >= best_point.threshold,
            )
            for item in items
            if item.recording_group == held_out_group
        ]
        decisions.extend(fold_decisions)
        folds.append(
            SentenceGroupedRejectionFold(
                held_out_group=held_out_group,
                selected_threshold=best_point.threshold,
                training_positives=training_summary.positives,
                training_negatives=training_summary.negatives,
                training_best_f1=best_point.f1,
                test_metrics=_wrong_sentence_rejection_metrics(
                    fold_decisions
                ),
            )
        )

    aggregate = _wrong_sentence_rejection_metrics(decisions)
    return SentenceGroupedRejectionSummary(
        groups=tuple(sorted(source_groups)),
        aggregate=aggregate,
        folds=tuple(folds),
        decisions=tuple(decisions),
        false_accepts=tuple(
            decision
            for decision in decisions
            if not decision.positive and decision.accepted
        ),
        false_rejects=tuple(
            decision
            for decision in decisions
            if decision.positive and not decision.accepted
        ),
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
