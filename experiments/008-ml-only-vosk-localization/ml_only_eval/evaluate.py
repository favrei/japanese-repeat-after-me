from __future__ import annotations

import argparse
import gc
import hashlib
import importlib.metadata
import json
import os
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


NATIVE_THREAD_ENVIRONMENT = (
    "OMP_NUM_THREADS",
    "OPENBLAS_NUM_THREADS",
    "MKL_NUM_THREADS",
    "VECLIB_MAXIMUM_THREADS",
    "NUMEXPR_NUM_THREADS",
)
for variable in NATIVE_THREAD_ENVIRONMENT:
    os.environ[variable] = "1"

import numpy as np

from .augment import (
    AUGMENTATION_NAMES,
    SAMPLE_RATE_HZ,
    augment,
    decode_wav,
    pcm16_bytes,
    stable_seed,
)
from .core import aggregate_metrics, align, edit_distance, error_positions, morae


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
        headers={"User-Agent": "008-ml-only-vosk-localization/1"},
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
            raise RuntimeError("existing Vosk model cache is not checksum-verified")
        return model_path
    if not archive_path.exists():
        partial = archive_path.with_suffix(".zip.part")
        _download_model(partial)
        partial.replace(archive_path)
    if archive_path.stat().st_size != MODEL_ARCHIVE_BYTES:
        raise RuntimeError("Vosk archive byte size does not match the pin")
    if sha256_file(archive_path) != MODEL_ARCHIVE_SHA256:
        raise RuntimeError("Vosk archive checksum does not match the pin")
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
    chunk_bytes = 4_000 * 2
    for offset in range(0, len(payload), chunk_bytes):
        if recognizer.AcceptWaveform(payload[offset : offset + chunk_bytes]):
            segments.append(json.loads(recognizer.Result()))
    segments.append(json.loads(recognizer.FinalResult()))
    elapsed_ms = (time.perf_counter() - started) * 1_000
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
        "surfaceText": " ".join(texts),
        "words": [
            {
                "surface": word.get("word"),
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
        "realtimeFactor": round(elapsed_ms / 1_000 / (signal.size / SAMPLE_RATE_HZ), 6),
    }


def load_manifest(dataset_root: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    manifest_path = dataset_root / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schemaVersion") != 1:
        raise ValueError("unsupported source manifest")
    clips = manifest.get("clips")
    if not isinstance(clips, list) or not clips:
        raise ValueError("source manifest contains no clips")
    seen: set[tuple[str, str]] = set()
    for clip in clips:
        key = (clip["personaId"], clip["caseId"])
        if key in seen:
            raise ValueError(f"duplicate clip: {key}")
        seen.add(key)
        source = dataset_root / clip["file"]
        if not source.is_file() or sha256_file(source) != clip["sha256"]:
            raise ValueError(f"missing or changed source: {source}")
    return manifest, clips


def choose_donor(source: dict[str, Any], clips: list[dict[str, Any]]) -> dict[str, Any]:
    candidates = [
        clip
        for clip in clips
        if clip["errorKind"] == "exact"
        and clip["personaId"] != source["personaId"]
        and clip["targetId"] != source["targetId"]
    ]
    if not candidates:
        candidates = [clip for clip in clips if clip is not source]
    if not candidates:
        raise ValueError("crosstalk evaluation needs at least two source clips")
    index = stable_seed(source["personaId"], source["caseId"], "donor") % len(candidates)
    return candidates[index]


def grouped_metrics(records: list[dict[str, Any]], key: str) -> dict[str, Any]:
    return {
        value: aggregate_metrics(record for record in records if str(record[key]) == value)
        for value in sorted({str(record[key]) for record in records})
    }


def portable_path(path: Path) -> str:
    resolved = path.resolve()
    try:
        return str(resolved.relative_to(REPO_ROOT))
    except ValueError:
        return str(resolved)


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


def serialize_operations(operations: Any) -> list[dict[str, Any]]:
    return [
        {
            "operation": operation.operation,
            "expectedIndex": operation.expected_index,
            "expected": operation.expected,
            "observed": operation.observed,
        }
        for operation in operations
        if operation.operation != "equal"
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Measure raw Vosk mora-error localization without application code."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET_ROOT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model-cache", type=Path, default=default_model_cache_root())
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help=(
            "Decoder workers. The recorded benchmark uses one because this "
            "Vosk/Kaldi build changed boundary transcripts under concurrency."
        ),
    )
    parser.add_argument("--augmentation", action="append", choices=AUGMENTATION_NAMES)
    parser.add_argument("--only-persona", action="append")
    parser.add_argument("--only-case", action="append")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.workers != 1:
        raise SystemExit(
            "Experiment 008 requires --workers 1 because concurrent Vosk/Kaldi "
            "decoding changed transcripts during reproducibility validation"
        )
    manifest, corpus_clips = load_manifest(args.dataset)
    requested_personas = set(args.only_persona or ())
    requested_cases = set(args.only_case or ())
    clips = [
        clip
        for clip in corpus_clips
        if (not requested_personas or clip["personaId"] in requested_personas)
        and (not requested_cases or clip["caseId"] in requested_cases)
    ]
    if not clips:
        raise SystemExit("no source clips matched the requested filters")
    augmentations = tuple(args.augmentation or ())
    if len(augmentations) != 1:
        raise SystemExit(
            "evaluate runs exactly one isolated condition; use "
            "python3 -m ml_only_eval.matrix for the complete matrix"
        )

    from vosk import Model, SetLogLevel

    SetLogLevel(-1)
    model_path = ensure_model(args.model_cache)
    print(
        f"Using raw {MODEL_NAME} with one fresh model per condition stream; "
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
    condition_model_load_ms: dict[str, float] = {}
    evaluation_started = time.perf_counter()
    for augmentation_name in augmentations:
        model_started = time.perf_counter()
        model = Model(str(model_path))
        condition_model_load_ms[augmentation_name] = round(
            (time.perf_counter() - model_started) * 1_000, 3
        )
        for clip in clips:
            source_signal = decoded_clip(clip)
            donor_signal = decoded_clip(choose_donor(clip, corpus_clips))
            target_morae = morae(clip["targetReading"])
            injected_morae = morae(clip["spokenReading"])
            truth_operations = align(target_morae, injected_morae)
            truth_positions = error_positions(target_morae, injected_morae)

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
            recognized_morae = morae(recognition["surfaceText"], surface=True)
            predicted_operations = align(target_morae, recognized_morae)
            predicted_positions = error_positions(target_morae, recognized_morae)
            records.append(
                {
                    "personaId": clip["personaId"],
                    "caseId": clip["caseId"],
                    "targetId": clip["targetId"],
                    "errorKind": clip["errorKind"],
                    "augmentation": augmentation_name,
                    "sourceFile": clip["file"],
                    "sourceSha256": clip["sha256"],
                    "conditionSeed": condition_seed,
                    "audioDurationSeconds": round(conditioned.size / SAMPLE_RATE_HZ, 3),
                    "recognizedSurfaceText": recognition["surfaceText"],
                    "recognizedReading": "".join(recognized_morae),
                    "recognizedMorae": list(recognized_morae),
                    "words": recognition["words"],
                    "meanWordConfidence": recognition["meanWordConfidence"],
                    "decodeMs": recognition["decodeMs"],
                    "realtimeFactor": recognition["realtimeFactor"],
                    "targetMorae": list(target_morae),
                    "injectedMorae": list(injected_morae),
                    "groundTruthOperations": serialize_operations(truth_operations),
                    "groundTruthErrorPositions": sorted(truth_positions),
                    "predictedOperations": serialize_operations(predicted_operations),
                    "predictedErrorPositions": sorted(predicted_positions),
                    "distanceToTargetMorae": edit_distance(target_morae, recognized_morae),
                    "distanceToInjectedMorae": edit_distance(
                        injected_morae, recognized_morae
                    ),
                }
            )
            completed += 1
            print(
                f"[{completed}/{total}] {augmentation_name} / "
                f"{clip['personaId']} / {clip['caseId']}",
                flush=True,
            )
        del model
        gc.collect()

    elapsed_seconds = time.perf_counter() - evaluation_started
    clean_records = [record for record in records if record["augmentation"] == "clean"]
    report = {
        "schemaVersion": 1,
        "experiment": "008-ml-only-vosk-localization",
        "recordedAt": datetime.now(UTC).isoformat(),
        "question": (
            "How accurately does raw Vosk output reveal and localize injected "
            "Japanese mora errors when product scoring and UI code are excluded?"
        ),
        "boundary": {
            "included": [
                "Pinned native Vosk Japanese decoding",
                "Independent pykakasi surface-to-hiragana conversion",
                "Independent mora tokenization and Levenshtein alignment",
                "Synthetic audio interference",
            ],
            "excluded": [
                "app/client/gameplay/scoring.ts",
                "Application sentence catalog scoring",
                "Application acceptance threshold",
                "UI reading-marker implementation",
                "UI rendering and feedback policy",
            ],
        },
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
            "stateIsolation": "One Vosk model in a single-condition process",
            "conditionModelLoadMs": condition_model_load_ms,
        },
        "method": {
            "primaryUnit": "Expected-reading Japanese mora position",
            "primaryMetric": "Strict exact-position precision and recall",
            "secondaryMetric": "One-to-one matching within plus/minus one mora",
            "decoderConcurrency": "Sequential native decoding",
            "insertionPolicy": (
                "Inserted morae anchor to the following expected mora, or the "
                "final expected mora when inserted at the end."
            ),
            "variantEvidence": (
                "For each error attempt, compare raw recognized-reading edit "
                "distance to the expected target and injected spoken variant."
            ),
            "augmentationConditions": list(augmentations),
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
            "pykakasi": importlib.metadata.version("pykakasi"),
            "nativeMathThreads": {
                variable: os.environ[variable]
                for variable in NATIVE_THREAD_ENVIRONMENT
            },
            "ffmpeg": subprocess.run(
                ["ffmpeg", "-version"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.splitlines()[0],
            "git": git_state(),
        },
        "limitations": [
            "Vosk is a word ASR model and does not emit phoneme posterior probabilities; localization is inferred only from its free-decoded transcript.",
            "Pykakasi is an evaluation adapter, not a learned acoustic component, and ambiguous Japanese readings can still be converted incorrectly.",
            "The source labels specify text requested from TTS; no human has yet confirmed every waveform realizes the intended pronunciation.",
            "VoiceDesign personas are synthetic variation, not independent human speakers.",
            "Augmented attempts reuse source clips and are correlated; the interference matrix is representative rather than exhaustive.",
            "This Vosk/Kaldi build changed some transcripts under concurrency and after mixed-condition process reuse; the full matrix launches one process per condition.",
            "The macOS Vosk wheel links Apple Accelerate; native math thread counts are pinned to one because noisy boundary hypotheses varied without this pin.",
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
