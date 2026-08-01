from __future__ import annotations

import argparse
import copy
import hashlib
import json
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .augment import AUGMENTATION_NAMES
from .core import aggregate_metrics
from .evaluate import (
    DEFAULT_DATASET_ROOT,
    DEFAULT_OUTPUT,
    MODEL_ARCHIVE_SHA256,
    MODEL_NAME,
    NATIVE_THREAD_ENVIRONMENT,
    default_model_cache_root,
    git_state,
    grouped_metrics,
    load_manifest,
    portable_path,
    sha256_file,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run each Vosk condition in a separate process and merge results."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET_ROOT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--condition-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "results" / "conditions",
    )
    parser.add_argument("--model-cache", type=Path, default=default_model_cache_root())
    parser.add_argument(
        "--reuse",
        action="store_true",
        help="Reuse condition files that pass complete structural validation.",
    )
    return parser.parse_args()


def condition_path(root: Path, name: str) -> Path:
    return root / f"{name}.json"


def condition_log_path(root: Path, name: str) -> Path:
    return root / f"{name}.log"


def validate_condition_report(
    report: dict[str, Any],
    name: str,
    expected_clips: int,
    manifest_sha256: str,
) -> None:
    if report.get("experiment") != "008-ml-only-vosk-localization":
        raise ValueError(f"{name}: wrong experiment")
    if report.get("dataset", {}).get("manifestSha256") != manifest_sha256:
        raise ValueError(f"{name}: source manifest mismatch")
    if report.get("model", {}).get("sourceArchiveSha256") != MODEL_ARCHIVE_SHA256:
        raise ValueError(f"{name}: model pin mismatch")
    if report.get("method", {}).get("augmentationConditions") != [name]:
        raise ValueError(f"{name}: condition declaration mismatch")
    records = report.get("records")
    if not isinstance(records, list) or len(records) != expected_clips:
        raise ValueError(f"{name}: expected {expected_clips} records")
    keys = {(record["personaId"], record["caseId"]) for record in records}
    if len(keys) != expected_clips or any(
        record.get("augmentation") != name for record in records
    ):
        raise ValueError(f"{name}: duplicate or foreign records")
    if aggregate_metrics(records) != report.get("summary", {}).get("allConditions"):
        raise ValueError(f"{name}: stored summary does not recompute")


def run_condition(args: argparse.Namespace, name: str, output: Path) -> None:
    log_path = condition_log_path(args.condition_dir, name)
    command = [
        sys.executable,
        "-m",
        "ml_only_eval.evaluate",
        "--dataset",
        str(args.dataset),
        "--output",
        str(output),
        "--model-cache",
        str(args.model_cache),
        "--augmentation",
        name,
    ]
    print(f"Running isolated condition: {name}", flush=True)
    with log_path.open("w", encoding="utf-8") as log:
        subprocess.run(command, check=True, stdout=log, stderr=subprocess.STDOUT)


def main() -> None:
    args = parse_args()
    manifest, clips = load_manifest(args.dataset)
    manifest_sha256 = sha256_file(args.dataset / "manifest.json")
    args.condition_dir.mkdir(parents=True, exist_ok=True)

    reports: dict[str, dict[str, Any]] = {}
    for name in AUGMENTATION_NAMES:
        path = condition_path(args.condition_dir, name)
        report = None
        if args.reuse and path.is_file():
            try:
                candidate = json.loads(path.read_text(encoding="utf-8"))
                validate_condition_report(
                    candidate, name, len(clips), manifest_sha256
                )
                report = candidate
                print(f"Reusing validated condition: {name}", flush=True)
            except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
                print(f"Rejected cached {name}: {error}", flush=True)
        if report is None:
            run_condition(args, name, path)
            report = json.loads(path.read_text(encoding="utf-8"))
            validate_condition_report(report, name, len(clips), manifest_sha256)
        reports[name] = report

    records = [
        record
        for name in AUGMENTATION_NAMES
        for record in reports[name]["records"]
    ]
    template = copy.deepcopy(reports["clean"])
    clean_records = reports["clean"]["records"]
    condition_wall_seconds = {
        name: reports[name]["runtime"]["wallSeconds"] for name in AUGMENTATION_NAMES
    }
    condition_hashes = {
        name: sha256_file(condition_path(args.condition_dir, name))
        for name in AUGMENTATION_NAMES
    }
    total_wall_seconds = sum(condition_wall_seconds.values())

    template["recordedAt"] = datetime.now(UTC).isoformat()
    template["model"] = {
        "name": MODEL_NAME,
        "sourceArchiveSha256": MODEL_ARCHIVE_SHA256,
        "stateIsolation": "One fresh Python process per augmentation condition",
        "conditionResultSha256": condition_hashes,
    }
    template["method"]["augmentationConditions"] = list(AUGMENTATION_NAMES)
    template["method"]["decoderConcurrency"] = (
        "Sequential decoding; one fresh Python process per condition"
    )
    template["summary"] = {
        "allConditions": aggregate_metrics(records),
        "cleanOnly": aggregate_metrics(clean_records),
        "byAugmentation": grouped_metrics(records, "augmentation"),
        "byErrorKind": grouped_metrics(records, "errorKind"),
        "byPersona": grouped_metrics(records, "personaId"),
    }
    template["runtime"] = {
        "attempts": len(records),
        "workers": 1,
        "conditionProcesses": len(AUGMENTATION_NAMES),
        "conditionWallSeconds": condition_wall_seconds,
        "summedConditionWallSeconds": round(total_wall_seconds, 3),
        "attemptsPerSecond": round(len(records) / total_wall_seconds, 6),
    }
    template["environment"]["git"] = git_state()
    template["environment"]["nativeMathThreads"] = {
        variable: "1" for variable in NATIVE_THREAD_ENVIRONMENT
    }
    template["dataset"]["root"] = portable_path(args.dataset)
    template["dataset"]["manifestSha256"] = manifest_sha256
    template["dataset"]["datasetId"] = manifest.get("datasetId")
    template["limitations"] = [
        limitation
        for limitation in template["limitations"]
        if "full matrix launches one process per condition" not in limitation
    ] + [
        "This Vosk/Kaldi build changed noisy transcripts when conditions shared a process; every reported condition therefore ran in a fresh Python process."
    ]
    template["records"] = records

    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix(args.output.suffix + ".part")
    temporary.write_text(
        json.dumps(template, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(args.output)
    print(json.dumps(template["summary"], ensure_ascii=False, indent=2), flush=True)
    print(f"Wrote {args.output}", flush=True)


if __name__ == "__main__":
    main()
