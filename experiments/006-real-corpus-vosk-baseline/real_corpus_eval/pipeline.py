from __future__ import annotations

import hashlib
import importlib.metadata
import json
import os
import platform
import resource
import subprocess
import sys
import tempfile
import time
import urllib.request
import wave
import zipfile
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Sequence

from .core import (
    BinaryScore,
    CandidateTarget,
    distribution,
    normalize_target_text,
    precision_recall_summary,
    score_candidates,
)

EXPERIMENT_ID = "006-real-corpus-vosk-baseline"
MODEL_NAME = "vosk-model-small-ja-0.22"
MODEL_URL = f"https://alphacephei.com/vosk/models/{MODEL_NAME}.zip"
MODEL_ARCHIVE_SHA256 = (
    "efa092d280153a77615e9e0c7d7283e93e600de3d19d3bec686c57ef19d52eac"
)
MODEL_ARCHIVE_BYTES = 49_704_573
DATASET_SOURCE_ARCHIVE_SHA256 = (
    "2834ca16aae1103582e8070a2c428cb4c280107b01858181a1bc87f1c40797e7"
)
TARGET_SAMPLE_RATE_HZ = 16_000
PCM_BYTES_PER_SAMPLE = 2
PCM_CHANNELS = 1


class EvaluationError(RuntimeError):
    pass


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def default_model_cache_root() -> Path:
    if sys.platform == "darwin":
        return (
            Path.home()
            / "Library"
            / "Caches"
            / "japanese-repeat-after-me"
            / "vosk"
        )
    configured = os.environ.get("XDG_CACHE_HOME")
    base = Path(configured) if configured else Path.home() / ".cache"
    return base / "japanese-repeat-after-me" / "vosk"


def _download_file(url: str, destination: Path) -> None:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": f"{EXPERIMENT_ID}/1"},
    )
    downloaded = 0
    next_progress = 10 * 1024 * 1024
    with urllib.request.urlopen(request, timeout=60) as response:
        with destination.open("wb") as output:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                output.write(chunk)
                downloaded += len(chunk)
                if downloaded >= next_progress:
                    print(
                        f"model download: {downloaded / (1024 * 1024):.0f} MiB",
                        file=sys.stderr,
                        flush=True,
                    )
                    next_progress += 10 * 1024 * 1024


def _safe_extract_model(archive_path: Path, destination_parent: Path) -> Path:
    with tempfile.TemporaryDirectory(
        prefix=f"{MODEL_NAME}-extract-",
        dir=destination_parent,
    ) as temporary_directory:
        temporary_root = Path(temporary_directory).resolve()
        with zipfile.ZipFile(archive_path) as archive:
            for member in archive.infolist():
                resolved = (temporary_root / member.filename).resolve()
                if not resolved.is_relative_to(temporary_root):
                    raise EvaluationError(
                        "model archive contains an unsafe path"
                    )
            archive.extractall(temporary_root)

        extracted_model = temporary_root / MODEL_NAME
        if not extracted_model.is_dir():
            raise EvaluationError(
                f"model archive did not contain {MODEL_NAME}"
            )
        for required_relative_path in (
            "am/final.mdl",
            "conf/model.conf",
            "graph/HCLr.fst",
            "graph/Gr.fst",
        ):
            if not (extracted_model / required_relative_path).is_file():
                raise EvaluationError(
                    "model archive is missing a required runtime file"
                )
        final_model = destination_parent / MODEL_NAME
        extracted_model.rename(final_model)
    return final_model


def ensure_model(cache_root: Path) -> Path:
    cache_root.mkdir(parents=True, exist_ok=True)
    model_path = cache_root / MODEL_NAME
    marker_path = model_path / ".source-archive-sha256"
    archive_path = cache_root / f"{MODEL_NAME}.zip"

    if model_path.is_dir():
        marker = marker_path.read_text(encoding="utf-8").strip() if marker_path.exists() else ""
        if marker != MODEL_ARCHIVE_SHA256:
            raise EvaluationError(
                "existing model cache is not verified by the expected source checksum"
            )
        return model_path

    if archive_path.exists():
        if archive_path.stat().st_size != MODEL_ARCHIVE_BYTES:
            raise EvaluationError(
                "existing model archive does not match the pinned byte size"
            )
        if sha256_file(archive_path) != MODEL_ARCHIVE_SHA256:
            raise EvaluationError(
                "existing model archive does not match the pinned checksum"
            )

    if not archive_path.exists():
        partial_path = cache_root / f"{MODEL_NAME}.zip.part"
        if partial_path.exists():
            partial_path.unlink()
        print(f"downloading pinned model to {cache_root}", file=sys.stderr)
        _download_file(MODEL_URL, partial_path)
        if partial_path.stat().st_size != MODEL_ARCHIVE_BYTES:
            raise EvaluationError(
                "downloaded model archive size does not match the pinned value"
            )
        actual_checksum = sha256_file(partial_path)
        if actual_checksum != MODEL_ARCHIVE_SHA256:
            raise EvaluationError(
                "downloaded model archive checksum does not match the pinned value"
            )
        partial_path.rename(archive_path)

    model_path = _safe_extract_model(archive_path, cache_root)
    marker_path.write_text(f"{MODEL_ARCHIVE_SHA256}\n", encoding="utf-8")
    return model_path


def _parse_checksum_file(path: Path) -> dict[str, str]:
    checksums: dict[str, str] = {}
    for line_number, raw_line in enumerate(
        path.read_text(encoding="utf-8").splitlines(),
        start=1,
    ):
        if not raw_line.strip():
            continue
        try:
            checksum, filename = raw_line.split(maxsplit=1)
        except ValueError as error:
            raise EvaluationError(
                f"invalid checksum line {line_number}"
            ) from error
        filename = filename.removeprefix("*")
        if (
            len(checksum) != 64
            or any(character not in "0123456789abcdef" for character in checksum)
        ):
            raise EvaluationError(
                f"invalid checksum on line {line_number}"
            )
        checksums[filename] = checksum
    return checksums


def load_and_verify_manifest(manifest_path: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    manifest_path = manifest_path.resolve()
    dataset_root = manifest_path.parent
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    if manifest.get("format") != "japanese-voice-v1-dataset":
        raise EvaluationError("unsupported dataset format")
    if manifest.get("version") != 1:
        raise EvaluationError("unsupported dataset version")
    recordings = manifest.get("recordings")
    if not isinstance(recordings, list) or manifest.get("count") != len(recordings):
        raise EvaluationError("manifest recording count is inconsistent")
    if len(recordings) != 30:
        raise EvaluationError("this baseline expects exactly 30 recordings")

    checksums = _parse_checksum_file(dataset_root / "SHA256SUMS")
    expected_manifest_checksum = checksums.get("manifest.json")
    actual_manifest_checksum = sha256_file(manifest_path)
    if expected_manifest_checksum != actual_manifest_checksum:
        raise EvaluationError("manifest checksum verification failed")

    seen_files: set[str] = set()
    verified: list[dict[str, Any]] = []
    for recording in recordings:
        if not isinstance(recording, dict):
            raise EvaluationError("manifest recording must be an object")
        relative_name = recording.get("file")
        if not isinstance(relative_name, str) or relative_name in seen_files:
            raise EvaluationError("recording paths must be unique strings")
        source_path = (dataset_root / relative_name).resolve()
        if not source_path.is_relative_to(dataset_root):
            raise EvaluationError("recording path escapes the dataset directory")
        if not source_path.is_file():
            raise EvaluationError(f"recording is missing: {relative_name}")
        expected_checksum = checksums.get(relative_name)
        actual_checksum = sha256_file(source_path)
        if expected_checksum != actual_checksum:
            raise EvaluationError(
                f"recording checksum verification failed: {relative_name}"
            )
        if source_path.stat().st_size != recording.get("bytes"):
            raise EvaluationError(
                f"recording byte count is inconsistent: {relative_name}"
            )

        seen_files.add(relative_name)
        verified.append(
            {
                **recording,
                "sourcePath": source_path,
                "sourceSha256": actual_checksum,
            }
        )

    verified.sort(
        key=lambda recording: (
            recording["sentenceId"],
            recording["attempt"],
            recording["file"],
        )
    )
    return (
        {
            **manifest,
            "manifestSha256": actual_manifest_checksum,
            "sourceArchiveSha256": DATASET_SOURCE_ARCHIVE_SHA256,
        },
        verified,
    )


def _run_text_command(arguments: list[str], cwd: Path | None = None) -> str | None:
    try:
        completed = subprocess.run(
            arguments,
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None
    return completed.stdout.strip()


def _first_line(value: str | None) -> str | None:
    return value.splitlines()[0] if value else None


def collect_environment(repository_root: Path) -> dict[str, Any]:
    cpu = platform.processor() or platform.machine()
    if sys.platform == "darwin":
        cpu = _run_text_command(["sysctl", "-n", "machdep.cpu.brand_string"]) or cpu
    return {
        "os": platform.platform(),
        "machine": platform.machine(),
        "cpu": cpu,
        "python": platform.python_version(),
        "uv": _first_line(_run_text_command(["uv", "--version"])),
        "ffmpeg": _first_line(_run_text_command(["ffmpeg", "-version"])),
        "ffprobe": _first_line(_run_text_command(["ffprobe", "-version"])),
        "vosk": importlib.metadata.version("vosk"),
        "gitCommit": _run_text_command(
            ["git", "rev-parse", "HEAD"],
            cwd=repository_root,
        ),
    }


def peak_rss_mib() -> float:
    value = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    bytes_value = value if sys.platform == "darwin" else value * 1024
    return bytes_value / (1024 * 1024)


def child_peak_rss_mib() -> float:
    value = resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss
    bytes_value = value if sys.platform == "darwin" else value * 1024
    return bytes_value / (1024 * 1024)


def probe_audio(source_path: Path) -> tuple[dict[str, Any], float]:
    started = time.perf_counter()
    completed = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=codec_name,sample_rate,channels,duration",
            "-of",
            "json",
            str(source_path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    elapsed_ms = (time.perf_counter() - started) * 1000
    payload = json.loads(completed.stdout)
    streams = payload.get("streams", [])
    if len(streams) != 1:
        raise EvaluationError("ffprobe did not return exactly one audio stream")
    stream = streams[0]
    duration = stream.get("duration")
    return (
        {
            "codec": stream.get("codec_name"),
            "sampleRateHz": int(stream["sample_rate"])
            if stream.get("sample_rate")
            else None,
            "channels": stream.get("channels"),
            "containerDurationSeconds": float(duration)
            if duration not in (None, "N/A")
            else None,
        },
        elapsed_ms,
    )


def build_ffmpeg_command(source_path: Path, output_path: Path) -> list[str]:
    return [
        "ffmpeg",
        "-nostdin",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(source_path),
        "-map",
        "0:a:0",
        "-vn",
        "-sn",
        "-dn",
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
        "-ac",
        str(PCM_CHANNELS),
        "-af",
        f"aresample={TARGET_SAMPLE_RATE_HZ}:resampler=swr:dither_method=none",
        "-ar",
        str(TARGET_SAMPLE_RATE_HZ),
        "-sample_fmt",
        "s16",
        "-c:a",
        "pcm_s16le",
        "-threads",
        "1",
        "-fflags",
        "+bitexact",
        "-flags:a",
        "+bitexact",
        str(output_path),
    ]


def convert_to_wav(source_path: Path, output_path: Path) -> dict[str, Any]:
    started = time.perf_counter()
    subprocess.run(
        build_ffmpeg_command(source_path, output_path),
        check=True,
        capture_output=True,
    )
    elapsed_ms = (time.perf_counter() - started) * 1000
    with wave.open(str(output_path), "rb") as audio:
        if (
            audio.getnchannels() != PCM_CHANNELS
            or audio.getsampwidth() != PCM_BYTES_PER_SAMPLE
            or audio.getframerate() != TARGET_SAMPLE_RATE_HZ
            or audio.getcomptype() != "NONE"
        ):
            raise EvaluationError("converted_wav_format_invalid")
        frame_count = audio.getnframes()
    return {
        "status": "ok",
        "sampleRateHz": TARGET_SAMPLE_RATE_HZ,
        "channels": PCM_CHANNELS,
        "sampleFormat": "pcm_s16le",
        "frames": frame_count,
        "durationSeconds": frame_count / TARGET_SAMPLE_RATE_HZ,
        "wavBytes": output_path.stat().st_size,
        "wavSha256": sha256_file(output_path),
        "wallMs": elapsed_ms,
        "errorCode": None,
    }


def _recognize_wav_frames(audio: wave.Wave_read, recognizer: Any) -> list[dict[str, Any]]:
    segments: list[dict[str, Any]] = []
    while True:
        chunk = audio.readframes(4_000)
        if not chunk:
            break
        if recognizer.AcceptWaveform(chunk):
            segments.append(json.loads(recognizer.Result()))
    segments.append(json.loads(recognizer.FinalResult()))
    return segments


def recognize_wav(
    model: Any,
    wav_path: Path,
) -> dict[str, Any]:
    from vosk import KaldiRecognizer

    recognizer_started = time.perf_counter()
    recognizer = KaldiRecognizer(model, TARGET_SAMPLE_RATE_HZ)
    recognizer.SetWords(True)
    recognizer_creation_ms = (time.perf_counter() - recognizer_started) * 1000

    started = time.perf_counter()
    with wave.open(str(wav_path), "rb") as audio:
        frame_count = audio.getnframes()
        segments = _recognize_wav_frames(audio, recognizer)
    decode_ms = (time.perf_counter() - started) * 1000
    audio_duration_seconds = frame_count / TARGET_SAMPLE_RATE_HZ
    texts = [
        segment.get("text", "").strip()
        for segment in segments
        if segment.get("text", "").strip()
    ]
    words = [
        {
            "word": word.get("word"),
            "confidence": word.get("conf"),
            "startSeconds": word.get("start"),
            "endSeconds": word.get("end"),
        }
        for segment in segments
        for word in segment.get("result", [])
    ]
    confidences = [
        float(word["confidence"])
        for word in words
        if isinstance(word.get("confidence"), (int, float))
    ]
    return {
        "status": "ok",
        "recognizedText": " ".join(texts),
        "segments": segments,
        "words": words,
        "wordConfidence": distribution(confidences),
        "audioDurationSeconds": audio_duration_seconds,
        "recognizerCreationMs": recognizer_creation_ms,
        "decodeMs": decode_ms,
        "decodeRealtimeFactor": decode_ms / 1000 / audio_duration_seconds
        if audio_duration_seconds
        else None,
        "errorCode": None,
    }


def _sanitize_error_code(error: Exception) -> str:
    if isinstance(error, FileNotFoundError):
        return "required_command_missing"
    if isinstance(error, subprocess.CalledProcessError):
        return "media_command_failed"
    if isinstance(error, EvaluationError):
        value = str(error)
        if value in {"converted_wav_format_invalid"}:
            return value
    return f"{error.__class__.__name__.lower()}_during_pipeline"


def _round_float(value: float | None, digits: int = 6) -> float | None:
    return round(value, digits) if value is not None else None


def _round_distribution(values: Sequence[float]) -> dict[str, float | int | None]:
    return {
        key: _round_float(value) if isinstance(value, float) else value
        for key, value in distribution(values).items()
    }


def _sentence_catalog(recordings: list[dict[str, Any]]) -> list[CandidateTarget]:
    by_id: dict[str, str] = {}
    for recording in recordings:
        sentence_id = recording["sentenceId"]
        sentence = recording["sentence"]
        existing = by_id.setdefault(sentence_id, sentence)
        if existing != sentence:
            raise EvaluationError(
                f"inconsistent target text for {sentence_id}"
            )
    return [
        CandidateTarget(sentence_id=sentence_id, text=by_id[sentence_id])
        for sentence_id in sorted(by_id)
    ]


def _serialize_pr_summary(summary: Any) -> dict[str, Any]:
    best = asdict(summary.best_point) if summary.best_point else None
    points = [asdict(point) for point in summary.points]
    for point in points:
        for key in ("threshold", "precision", "recall", "f1"):
            point[key] = _round_float(point[key])
    if best:
        for key in ("threshold", "precision", "recall", "f1"):
            best[key] = _round_float(best[key])
        best["true_negatives"] = summary.negatives - best["false_positives"]
    return {
        "positivePairs": summary.positives,
        "negativePairs": summary.negatives,
        "positivePrevalence": _round_float(
            summary.positives / (summary.positives + summary.negatives)
        )
        if summary.positives + summary.negatives
        else None,
        "averagePrecision": _round_float(summary.average_precision),
        "bestInSampleF1Point": best,
        "curve": points,
    }


def build_aggregate(
    records: list[dict[str, Any]],
    candidates: list[CandidateTarget],
) -> dict[str, Any]:
    successful = [record for record in records if record["status"] == "ok"]
    target_rates = [
        record["targetAgreement"]["distanceRate"] for record in successful
    ]
    pipeline_times = [record["pipelineMs"] for record in successful]
    conversion_times = [record["conversion"]["wallMs"] for record in successful]
    decode_times = [record["recognition"]["decodeMs"] for record in successful]
    realtime_factors = [
        record["pipelineRealtimeFactor"]
        for record in successful
        if record["pipelineRealtimeFactor"] is not None
    ]
    audio_seconds = [
        record["audioDurationSeconds"] for record in successful
    ]

    pair_scores: list[BinaryScore] = []
    for record in records:
        if record["status"] == "ok":
            scored = record["candidateScores"]
            score_by_id = {
                score["sentenceId"]: score["similarity"] for score in scored
            }
        else:
            score_by_id = {
                candidate.sentence_id: 0.0 for candidate in candidates
            }
        for candidate in candidates:
            pair_scores.append(
                BinaryScore(
                    positive=candidate.sentence_id == record["sentenceId"],
                    score=score_by_id[candidate.sentence_id],
                )
            )
    pr_summary = precision_recall_summary(pair_scores)

    per_sentence = []
    for candidate in candidates:
        sentence_records = [
            record for record in records if record["sentenceId"] == candidate.sentence_id
        ]
        sentence_successes = [
            record for record in sentence_records if record["status"] == "ok"
        ]
        per_sentence.append(
            {
                "sentenceId": candidate.sentence_id,
                "targetText": candidate.text,
                "recordings": len(sentence_records),
                "succeeded": len(sentence_successes),
                "exactTargetMatches": sum(
                    record["targetAgreement"]["exact"]
                    for record in sentence_successes
                ),
                "top1SentenceMatches": sum(
                    record["targetAgreement"]["top1Correct"]
                    for record in sentence_successes
                ),
                "targetDistanceRate": _round_distribution(
                    [
                        record["targetAgreement"]["distanceRate"]
                        for record in sentence_successes
                    ]
                ),
            }
        )

    return {
        "recordings": {
            "total": len(records),
            "succeeded": len(successful),
            "failed": len(records) - len(successful),
        },
        "manifestTargetAgreement": {
            "reference": (
                "Intended manifest target, not a human literal transcript or "
                "pronunciation judgment."
            ),
            "exactNormalizedMatches": sum(
                record["targetAgreement"]["exact"] for record in successful
            ),
            "exactNormalizedMatchRate": _round_float(
                sum(record["targetAgreement"]["exact"] for record in successful)
                / len(records)
            )
            if records
            else None,
            "top1ClosedSetSentenceMatches": sum(
                record["targetAgreement"]["top1Correct"]
                for record in successful
            ),
            "top1ClosedSetSentenceAccuracy": _round_float(
                sum(
                    record["targetAgreement"]["top1Correct"]
                    for record in successful
                )
                / len(records)
            )
            if records
            else None,
            "targetCharacterDistanceRate": _round_distribution(target_rates),
        },
        "closedSetManifestTargetPrecisionRecall": {
            "reference": (
                "One manifest-assigned target pair per recording versus the "
                "other nine sentence targets."
            ),
            "scope": (
                "Closed-set content discrimination on one speaker/session. "
                "This is not human-referenced sentence acceptance or "
                "pronunciation precision/recall."
            ),
            **_serialize_pr_summary(pr_summary),
        },
        "performance": {
            "audioSeconds": _round_float(sum(audio_seconds), 3),
            "conversionMilliseconds": _round_distribution(conversion_times),
            "decodeMilliseconds": _round_distribution(decode_times),
            "pipelineMilliseconds": _round_distribution(pipeline_times),
            "pipelineRealtimeFactor": _round_distribution(realtime_factors),
        },
        "perSentence": per_sentence,
        "humanReferencedMetrics": {
            "status": "unavailable",
            "reason": (
                "The corpus has intended targets but no human literal "
                "transcripts, recording-quality labels, acceptability labels, "
                "or localized-error labels."
            ),
            "sentenceAcceptancePrecision": None,
            "sentenceAcceptanceRecall": None,
            "localizedErrorPrecision": None,
            "localizedErrorRecall": None,
        },
    }


def evaluate(
    manifest_path: Path,
    output_path: Path,
    model_cache_root: Path,
) -> dict[str, Any]:
    repository_root = Path(__file__).resolve().parents[3]
    run_started = time.perf_counter()
    manifest, source_recordings = load_and_verify_manifest(manifest_path)
    candidates = _sentence_catalog(source_recordings)

    resolved_model_cache = model_cache_root.resolve()
    model_was_cached = (
        resolved_model_cache
        / MODEL_NAME
        / ".source-archive-sha256"
    ).is_file()
    model_prepare_started = time.perf_counter()
    model_path = ensure_model(resolved_model_cache)
    model_prepare_ms = (time.perf_counter() - model_prepare_started) * 1000
    from vosk import Model, SetLogLevel

    SetLogLevel(-1)
    model_load_started = time.perf_counter()
    model = Model(str(model_path))
    model_load_ms = (time.perf_counter() - model_load_started) * 1000
    rss_after_model_mib = peak_rss_mib()

    records: list[dict[str, Any]] = []
    for index, source in enumerate(source_recordings, start=1):
        relative_name = source["file"]
        print(
            f"[{index:02d}/{len(source_recordings)}] {relative_name}",
            file=sys.stderr,
            flush=True,
        )
        base_record: dict[str, Any] = {
            "file": relative_name,
            "sourceSha256": source["sourceSha256"],
            "sourceBytes": source["bytes"],
            "contentType": source["contentType"],
            "sentenceId": source["sentenceId"],
            "attempt": source["attempt"],
            "targetText": source["sentence"],
            "targetReading": source["reading"],
            "recordedAt": source["createdAt"],
        }
        try:
            source_probe, probe_ms = probe_audio(source["sourcePath"])
            with tempfile.TemporaryDirectory(
                prefix="jram-vosk-eval-"
            ) as temporary_directory:
                wav_path = Path(temporary_directory) / "input.wav"
                conversion = convert_to_wav(source["sourcePath"], wav_path)
                recognition = recognize_wav(model, wav_path)
            candidate_scores = score_candidates(
                recognition["recognizedText"],
                candidates,
            )
            target_score = next(
                score
                for score in candidate_scores
                if score.sentence_id == source["sentenceId"]
            )
            target_rank = next(
                rank
                for rank, score in enumerate(candidate_scores, start=1)
                if score.sentence_id == source["sentenceId"]
            )
            runner_up = candidate_scores[1] if len(candidate_scores) > 1 else None
            pipeline_ms = (
                conversion["wallMs"]
                + recognition["recognizerCreationMs"]
                + recognition["decodeMs"]
            )
            pipeline_realtime_factor = (
                pipeline_ms / 1000 / recognition["audioDurationSeconds"]
                if recognition["audioDurationSeconds"]
                else None
            )
            records.append(
                {
                    **base_record,
                    "status": "ok",
                    "sourceAudio": source_probe,
                    "probeMs": _round_float(probe_ms, 3),
                    "conversion": {
                        **conversion,
                        "durationSeconds": _round_float(
                            conversion["durationSeconds"],
                            3,
                        ),
                        "wallMs": _round_float(conversion["wallMs"], 3),
                    },
                    "recognition": {
                        **recognition,
                        "audioDurationSeconds": _round_float(
                            recognition["audioDurationSeconds"],
                            3,
                        ),
                        "recognizerCreationMs": _round_float(
                            recognition["recognizerCreationMs"],
                            3,
                        ),
                        "decodeMs": _round_float(
                            recognition["decodeMs"],
                            3,
                        ),
                        "decodeRealtimeFactor": _round_float(
                            recognition["decodeRealtimeFactor"]
                        ),
                    },
                    "recognizedText": recognition["recognizedText"],
                    "words": recognition["words"],
                    "segments": recognition["segments"],
                    "pipelineMs": _round_float(pipeline_ms, 3),
                    "audioDurationSeconds": _round_float(
                        recognition["audioDurationSeconds"],
                        3,
                    ),
                    "pipelineRealtimeFactor": _round_float(
                        pipeline_realtime_factor
                    ),
                    "normalizedTranscript": normalize_target_text(
                        recognition["recognizedText"]
                    ),
                    "candidateScores": [
                        {
                            "sentenceId": score.sentence_id,
                            "distance": score.distance,
                            "distanceRate": _round_float(score.distance_rate),
                            "similarity": _round_float(score.similarity),
                        }
                        for score in candidate_scores
                    ],
                    "targetAgreement": {
                        "normalizedTarget": normalize_target_text(
                            source["sentence"]
                        ),
                        "distance": target_score.distance,
                        "distanceRate": _round_float(
                            target_score.distance_rate
                        ),
                        "similarity": _round_float(target_score.similarity),
                        "exact": target_score.distance == 0,
                        "targetRank": target_rank,
                        "top1SentenceId": candidate_scores[0].sentence_id,
                        "top1Correct": candidate_scores[0].sentence_id
                        == source["sentenceId"],
                        "top1MarginToRunnerUp": _round_float(
                            (
                                runner_up.distance_rate
                                - candidate_scores[0].distance_rate
                            )
                            if runner_up
                            else None
                        ),
                    },
                }
            )
        except Exception as error:
            records.append(
                {
                    **base_record,
                    "status": "error",
                    "errorCode": _sanitize_error_code(error),
                    "recognizedText": None,
                    "words": [],
                    "segments": [],
                    "conversion": None,
                    "recognition": None,
                    "candidateScores": [],
                    "targetAgreement": None,
                }
            )

    aggregate = build_aggregate(records, candidates)
    result = {
        "schemaVersion": 1,
        "experiment": EXPERIMENT_ID,
        "recordedAt": datetime.now(UTC).isoformat(),
        "question": (
            "Can the pinned small Japanese Vosk model complete a reproducible "
            "real-corpus pipeline on the M3, and how strongly do its transcripts "
            "agree with the intended sentence targets?"
        ),
        "dataset": {
            "format": manifest["format"],
            "version": manifest["version"],
            "sessionId": manifest["sessionId"],
            "recordings": manifest["count"],
            "manifestSha256": manifest["manifestSha256"],
            "sourceArchiveSha256": manifest["sourceArchiveSha256"],
        },
        "model": {
            "name": MODEL_NAME,
            "sourceUrl": MODEL_URL,
            "sourceArchiveBytes": MODEL_ARCHIVE_BYTES,
            "sourceArchiveSha256": MODEL_ARCHIVE_SHA256,
            "cacheHit": model_was_cached,
            "cachePrepareMs": _round_float(model_prepare_ms, 3),
            "loadMs": _round_float(model_load_ms, 3),
        },
        "environment": collect_environment(repository_root),
        "resources": {
            "rssAfterModelLoadMiB": _round_float(rss_after_model_mib, 3),
            "peakRssMiB": _round_float(peak_rss_mib(), 3),
            "childPeakRssMiB": _round_float(child_peak_rss_mib(), 3),
            "totalRunSeconds": _round_float(
                time.perf_counter() - run_started,
                3,
            ),
        },
        "aggregate": aggregate,
        "records": records,
        "limitations": [
            "The manifest target is an intended prompt, not a human literal transcript.",
            "The corpus has one speaker, one session, and three correlated takes per sentence.",
            "Closed-set manifest-target precision/recall uses nine obviously different sentence targets as negatives.",
            "No human sentence-acceptance or localized pronunciation labels exist.",
            "Target comparison uses NFKC surface text and removes punctuation/spacing; it does not convert kanji to kana.",
            "The measurements cover native Python Vosk plus FFmpeg conversion, not a browser or WASM runtime.",
        ],
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_output = output_path.with_suffix(f"{output_path.suffix}.part")
    temporary_output.write_text(
        f"{json.dumps(result, ensure_ascii=False, indent=2)}\n",
        encoding="utf-8",
    )
    temporary_output.replace(output_path)
    return result
