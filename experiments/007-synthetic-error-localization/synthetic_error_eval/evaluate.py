from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import importlib.metadata
import json
import platform
import subprocess
import sys
import tempfile
import time
import urllib.request
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import numpy as np

from .augment import (
    AUGMENTATION_NAMES,
    SAMPLE_RATE_HZ,
    augment,
    decode_wav,
    pcm16_bytes,
    stable_seed,
)
from .core import (
    CatalogTarget,
    aggregate_metrics,
    align_expected_observed,
    intended_error_positions,
    mark_reading_misses,
    normalize_japanese,
    score_attempt,
)


REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DATASET_ROOT = (
    REPO_ROOT
    / "datasets"
    / "japanese-synthetic-errors-v1"
    / "qwen3-voice-design-20"
)
DEFAULT_OUTPUT = (
    Path(__file__).resolve().parents[1]
    / "results"
    / "macbook-m3-vosk-small-ja-0.22.json"
)
MODEL_NAME = "vosk-model-small-ja-0.22"
MODEL_URL = f"https://alphacephei.com/vosk/models/{MODEL_NAME}.zip"
MODEL_ARCHIVE_SHA256 = (
    "efa092d280153a77615e9e0c7d7283e93e600de3d19d3bec686c57ef19d52eac"
)
MODEL_ARCHIVE_BYTES = 49_704_573


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def default_model_cache_root() -> Path:
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Caches" / "japanese-repeat-after-me" / "vosk"
    return Path.home() / ".cache" / "japanese-repeat-after-me" / "vosk"


def _download_model(destination: Path) -> None:
    request = urllib.request.Request(
        MODEL_URL,
        headers={"User-Agent": "007-synthetic-error-localization/1"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        with destination.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)


def ensure_model(cache_root: Path) -> Path:
    cache_root.mkdir(parents=True, exist_ok=True)
    model_path = cache_root / MODEL_NAME
    marker_path = model_path / ".source-archive-sha256"
    archive_path = cache_root / f"{MODEL_NAME}.zip"

    if model_path.is_dir():
        marker = marker_path.read_text(encoding="utf-8").strip() if marker_path.exists() else ""
        if marker != MODEL_ARCHIVE_SHA256:
            raise RuntimeError("the existing Vosk model cache is not checksum-verified")
        return model_path

    if not archive_path.exists():
        partial = archive_path.with_suffix(".zip.part")
        _download_model(partial)
        partial.replace(archive_path)
    if archive_path.stat().st_size != MODEL_ARCHIVE_BYTES:
        raise RuntimeError("the Vosk archive byte size does not match the pin")
    if sha256_file(archive_path) != MODEL_ARCHIVE_SHA256:
        raise RuntimeError("the Vosk archive checksum does not match the pin")

    with tempfile.TemporaryDirectory(prefix=f"{MODEL_NAME}-", dir=cache_root) as temp:
        temporary_root = Path(temp).resolve()
        with zipfile.ZipFile(archive_path) as archive:
            for member in archive.infolist():
                resolved = (temporary_root / member.filename).resolve()
                if not resolved.is_relative_to(temporary_root):
                    raise RuntimeError("unsafe path in Vosk archive")
            archive.extractall(temporary_root)
        extracted = temporary_root / MODEL_NAME
        if not extracted.is_dir():
            raise RuntimeError("Vosk archive did not contain the expected model")
        extracted.rename(model_path)
    marker_path.write_text(MODEL_ARCHIVE_SHA256 + "\n", encoding="utf-8")
    return model_path


def recognize(model: Any, signal: np.ndarray) -> dict[str, Any]:
    from vosk import KaldiRecognizer

    recognizer = KaldiRecognizer(model, SAMPLE_RATE_HZ)
    recognizer.SetWords(True)
    payload = pcm16_bytes(signal)
    segments = []
    started = time.perf_counter()
    bytes_per_chunk = 4_000 * 2
    for offset in range(0, len(payload), bytes_per_chunk):
        if recognizer.AcceptWaveform(payload[offset : offset + bytes_per_chunk]):
            segments.append(json.loads(recognizer.Result()))
    segments.append(json.loads(recognizer.FinalResult()))
    elapsed_ms = (time.perf_counter() - started) * 1000
    texts = [
        segment.get("text", "").strip()
        for segment in segments
        if segment.get("text", "").strip()
    ]
    words = [word for segment in segments for word in segment.get("result", [])]
    confidences = [
        float(word["conf"])
        for word in words
        if isinstance(word.get("conf"), (int, float))
    ]
    return {
        "text": " ".join(texts),
        "normalizedText": normalize_japanese(" ".join(texts)),
        "words": [
            {
                "word": word.get("word"),
                "confidence": word.get("conf"),
                "startSeconds": word.get("start"),
                "endSeconds": word.get("end"),
            }
            for word in words
        ],
        "meanWordConfidence": round(float(np.mean(confidences)), 6)
        if confidences
        else None,
        "decodeMs": round(elapsed_ms, 3),
        "realtimeFactor": round(elapsed_ms / 1000 / (signal.size / SAMPLE_RATE_HZ), 6),
    }


def load_manifest(dataset_root: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    path = dataset_root / "manifest.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("schemaVersion") != 1:
        raise ValueError("unsupported synthetic dataset manifest")
    clips = payload.get("clips")
    if not isinstance(clips, list) or not clips:
        raise ValueError("synthetic dataset manifest contains no clips")
    seen: set[tuple[str, str]] = set()
    for clip in clips:
        key = (clip["personaId"], clip["caseId"])
        if key in seen:
            raise ValueError(f"duplicate clip in manifest: {key}")
        seen.add(key)
        source = dataset_root / clip["file"]
        if not source.is_file() or sha256_file(source) != clip["sha256"]:
            raise ValueError(f"missing or changed source clip: {source}")
    return payload, clips


def build_catalog(clips: list[dict[str, Any]]) -> list[CatalogTarget]:
    targets: dict[str, CatalogTarget] = {}
    for clip in clips:
        candidate = CatalogTarget(
            target_id=clip["targetId"],
            text=clip["targetText"],
            reading=clip["targetReading"],
        )
        previous = targets.setdefault(candidate.target_id, candidate)
        if previous != candidate:
            raise ValueError(f"inconsistent target definition: {candidate.target_id}")
    return sorted(targets.values(), key=lambda target: target.target_id)


def choose_donor(
    source: dict[str, Any],
    clips: list[dict[str, Any]],
) -> dict[str, Any]:
    candidates = [
        clip
        for clip in clips
        if clip["errorKind"] == "exact"
        and clip["personaId"] != source["personaId"]
        and clip["targetId"] != source["targetId"]
    ]
    if not candidates:
        candidates = [clip for clip in clips if clip is not source]
    index = stable_seed(source["personaId"], source["caseId"], "donor") % len(candidates)
    return candidates[index]


def grouped_metrics(records: list[dict[str, Any]], key: str) -> dict[str, Any]:
    values = sorted({str(record[key]) for record in records})
    return {
        value: aggregate_metrics(record for record in records if str(record[key]) == value)
        for value in values
    }


def git_state() -> dict[str, Any]:
    commit = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    dirty = bool(
        subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
    )
    return {"commit": commit, "dirty": dirty}


def portable_path(path: Path) -> str:
    resolved = path.resolve()
    try:
        return str(resolved.relative_to(REPO_ROOT))
    except ValueError:
        return str(resolved)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Evaluate current Vosk scoring and localization over synthetic errors."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET_ROOT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model-cache", type=Path, default=default_model_cache_root())
    parser.add_argument(
        "--augmentation",
        action="append",
        choices=AUGMENTATION_NAMES,
        help="Run selected condition(s); default runs the complete matrix.",
    )
    parser.add_argument("--only-persona", action="append")
    parser.add_argument("--only-case", action="append")
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Parallel recognizers sharing the read-only Vosk model (default: 4).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manifest, clips = load_manifest(args.dataset)
    requested_personas = set(args.only_persona or ())
    requested_cases = set(args.only_case or ())
    clips = [
        clip
        for clip in clips
        if (not requested_personas or clip["personaId"] in requested_personas)
        and (not requested_cases or clip["caseId"] in requested_cases)
    ]
    if not clips:
        raise SystemExit("no source clips matched the requested filters")
    if args.workers < 1:
        raise SystemExit("--workers must be at least one")
    augmentations = tuple(args.augmentation or AUGMENTATION_NAMES)
    catalog = build_catalog(clips)

    from vosk import Model, SetLogLevel

    SetLogLevel(-1)
    model_path = ensure_model(args.model_cache)
    started = time.perf_counter()
    model = Model(str(model_path))
    model_load_ms = (time.perf_counter() - started) * 1000
    print(
        f"Loaded {MODEL_NAME} in {model_load_ms:.0f}ms; "
        f"evaluating {len(clips)} sources x {len(augmentations)} conditions",
        flush=True,
    )

    decoded: dict[tuple[str, str], np.ndarray] = {}

    def decoded_clip(clip: dict[str, Any]) -> np.ndarray:
        key = (clip["personaId"], clip["caseId"])
        if key not in decoded:
            decoded[key] = decode_wav(args.dataset / clip["file"])
        return decoded[key]

    records: list[dict[str, Any]] = []
    total = len(clips) * len(augmentations)
    completed = 0
    evaluation_started = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        for clip in clips:
            source_signal = decoded_clip(clip)
            donor_clip = choose_donor(clip, clips)
            donor_signal = decoded_clip(donor_clip)
            truth_positions = intended_error_positions(
                clip["targetReading"], clip["spokenReading"]
            )
            truth_operations = [
                {
                    "operation": operation.operation,
                    "expectedIndex": operation.expected_index,
                    "expected": operation.expected,
                    "observed": operation.observed,
                }
                for operation in align_expected_observed(
                    clip["targetReading"], clip["spokenReading"]
                )
                if operation.operation != "equal"
            ]
            target = normalize_japanese(clip["targetReading"])

            def evaluate_condition(augmentation_name: str) -> dict[str, Any]:
                """Run one independent recognizer; the Vosk model is read-only."""

                condition_seed = stable_seed(
                    clip["personaId"], clip["caseId"], augmentation_name
                )
                conditioned = augment(
                    source_signal,
                    augmentation_name,
                    condition_seed,
                    donor=donor_signal,
                )
                recognition = recognize(model, conditioned)
                attempt = score_attempt(
                    recognition["text"], clip["targetId"], catalog
                )
                predicted_positions = mark_reading_misses(
                    clip["targetReading"], recognition["text"]
                )
                return {
                    "personaId": clip["personaId"],
                    "caseId": clip["caseId"],
                    "targetId": clip["targetId"],
                    "errorKind": clip["errorKind"],
                    "augmentation": augmentation_name,
                    "sourceFile": clip["file"],
                    "sourceSha256": clip["sha256"],
                    "conditionSeed": condition_seed,
                    "audioDurationSeconds": round(
                        conditioned.size / SAMPLE_RATE_HZ, 3
                    ),
                    "recognizedText": recognition["text"],
                    "normalizedTranscript": recognition["normalizedText"],
                    "words": recognition["words"],
                    "meanWordConfidence": recognition["meanWordConfidence"],
                    "decodeMs": recognition["decodeMs"],
                    "realtimeFactor": recognition["realtimeFactor"],
                    "accepted": attempt.passed,
                    "presentedScore": round(attempt.score, 6),
                    "nearestTargetId": attempt.nearest_target_id,
                    "runnerUpScore": round(attempt.runner_up_score, 6),
                    "targetNormalizedReading": target,
                    "groundTruthErrorPositions": sorted(truth_positions),
                    "groundTruthErrorCharacters": [
                        target[index] for index in sorted(truth_positions)
                    ],
                    "groundTruthOperations": truth_operations,
                    "predictedMissPositions": sorted(predicted_positions),
                    "predictedMissCharacters": [
                        target[index] for index in sorted(predicted_positions)
                    ],
                }

            condition_records = list(
                executor.map(evaluate_condition, augmentations)
            )
            records.extend(condition_records)
            completed += len(condition_records)
            print(
                f"[{completed}/{total}] {clip['personaId']} / {clip['caseId']}",
                flush=True,
            )

    elapsed_seconds = time.perf_counter() - evaluation_started
    clean_records = [record for record in records if record["augmentation"] == "clean"]
    report = {
        "schemaVersion": 1,
        "experiment": "007-synthetic-error-localization",
        "recordedAt": datetime.now(UTC).isoformat(),
        "question": (
            "Can the current Vosk sentence gate and transcript-to-reading marker "
            "detect and localize known synthetic Japanese mistakes across prompted "
            "voice personas and deterministic acoustic interference?"
        ),
        "dataset": {
            "root": portable_path(args.dataset),
            "manifestSha256": sha256_file(args.dataset / "manifest.json"),
            "datasetId": manifest.get("datasetId"),
            "humanListeningStatus": manifest.get("humanListeningStatus"),
            "sourceClips": len(clips),
            "personas": len({clip["personaId"] for clip in clips}),
            "cases": len({clip["caseId"] for clip in clips}),
        },
        "model": {
            "name": MODEL_NAME,
            "sourceArchiveSha256": MODEL_ARCHIVE_SHA256,
            "modelLoadMs": round(model_load_ms, 3),
        },
        "method": {
            "contentThreshold": 0.30,
            "catalogTargets": [target.target_id for target in catalog],
            "augmentationConditions": list(augmentations),
            "positionUnit": "One normalized expected-reading Unicode character.",
            "insertionPolicy": (
                "An inserted character is anchored to the following expected "
                "character, or the final character for an end insertion."
            ),
            "localizer": (
                "Exact Python reproduction of the current app's diagonal-first "
                "Levenshtein markReadingHits behavior."
            ),
            "syntheticAcceptanceLabel": (
                "Exact cases are acceptable; every deliberately changed case is "
                "unacceptable. This is an experimental label, not a human judgment."
            ),
        },
        "summary": {
            "allConditions": aggregate_metrics(records),
            "cleanOnly": aggregate_metrics(clean_records),
            "byAugmentation": grouped_metrics(records, "augmentation"),
            "byErrorKind": grouped_metrics(records, "errorKind"),
            "byPersona": grouped_metrics(records, "personaId"),
        },
        "runtime": {
            "attempts": len(records),
            "workers": args.workers,
            "wallSeconds": round(elapsed_seconds, 3),
            "attemptsPerSecond": round(len(records) / elapsed_seconds, 6),
        },
        "environment": {
            "platform": platform.platform(),
            "machine": platform.machine(),
            "python": platform.python_version(),
            "numpy": np.__version__,
            "vosk": importlib.metadata.version("vosk"),
            "ffmpeg": subprocess.run(
                ["ffmpeg", "-version"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.splitlines()[0],
            "git": git_state(),
        },
        "limitations": [
            "The labels come from text requested from TTS; no human has yet verified that every waveform realizes the intended pronunciation.",
            "The twenty VoiceDesign prompts create broad synthetic timbre variation, not twenty verified independent human speakers.",
            "Augmented attempts reuse each clean source and are correlated; counts are not independent confidence-sample counts.",
            "Synthetic noise, echo, clipping, crosstalk, bandwidth, dropout, and pitch/rate changes do not exhaust real microphones or rooms.",
            "The evaluation tests recognition output and current UI alignment, not acoustic phoneme diagnosis.",
        ],
        "records": records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix(args.output.suffix + ".part")
    temporary.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(args.output)
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2), flush=True)
    print(f"Wrote {args.output}", flush=True)


if __name__ == "__main__":
    main()
