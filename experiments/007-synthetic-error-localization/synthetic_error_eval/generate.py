from __future__ import annotations

import argparse
import hashlib
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import mlx.core as mx
from huggingface_hub import snapshot_download
from mlx_audio.audio_io import write as write_audio
from mlx_audio.tts.utils import load_model


EXPERIMENT_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DATASET_ROOT = (
    REPO_ROOT
    / "datasets"
    / "japanese-synthetic-errors-v1"
    / "qwen3-voice-design-20"
)
MODEL_ID = "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-6bit"
MODEL_REVISION = "ffc6545dc9cb086950aa46c6cd3db490e6ece3e1"
MAX_TOKENS = 256
MAX_ATTEMPTS = 4
SEED_NAMESPACE = 20_260_801
SEED_STRIDE = 10_000
SILENCE_THRESHOLD = 0.02
SILENCE_WINDOW_SECONDS = 0.05
TAIL_PADDING_SECONDS = 0.15


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def stable_seed(persona_id: str, case_id: str) -> int:
    digest = hashlib.sha256(
        f"{SEED_NAMESPACE}:{persona_id}:{case_id}".encode("utf-8")
    ).digest()
    return int.from_bytes(digest[:4], "big") & 0x7FFFFFFF


def scoring_characters(text: str) -> int:
    return sum(
        1
        for character in text
        if not (
            unicategory(character).startswith(("P", "Z", "C"))
            or character.isspace()
        )
    )


def unicategory(character: str) -> str:
    import unicodedata

    return unicodedata.category(character)


def duration_bounds(text: str) -> tuple[float, float]:
    characters = scoring_characters(text)
    return characters * 0.075, characters * 0.48 + 1.5


def trim_trailing_silence(audio: mx.array, sample_rate: int) -> mx.array:
    window = max(1, int(sample_rate * SILENCE_WINDOW_SECONDS))
    magnitude = mx.abs(audio.reshape(-1))
    peak = float(mx.max(magnitude)) if magnitude.size else 0.0
    usable = (magnitude.size // window) * window
    if peak <= 0 or usable == 0:
        return audio
    frames = magnitude[:usable].reshape(-1, window)
    loud = mx.max(frames, axis=1) > peak * SILENCE_THRESHOLD
    indices = [index for index, flag in enumerate(loud.tolist()) if flag]
    if not indices:
        return audio
    end = (indices[-1] + 1) * window + int(sample_rate * TAIL_PADDING_SECONDS)
    return audio[: min(end, audio.shape[0])]


def load_catalog(path: Path, key: str) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("schemaVersion") != 1 or not isinstance(payload.get(key), list):
        raise ValueError(f"{path} is not a supported {key} catalog")
    values = payload[key]
    identifiers = [value.get("id") for value in values]
    if any(not isinstance(identifier, str) or not identifier for identifier in identifiers):
        raise ValueError(f"every {key} entry needs a non-empty id")
    if len(identifiers) != len(set(identifiers)):
        raise ValueError(f"duplicate id in {path}")
    return values


def write_manifest(
    path: Path,
    personas: list[dict[str, Any]],
    cases: list[dict[str, Any]],
    clips: dict[str, dict[str, Any]],
) -> None:
    now = datetime.now(UTC).isoformat()
    previous_created_at = None
    if path.exists():
        previous_created_at = json.loads(path.read_text(encoding="utf-8")).get(
            "createdAt"
        )
    order = {
        f"{persona['id']}:{case['id']}": persona_index * len(cases) + case_index
        for persona_index, persona in enumerate(personas)
        for case_index, case in enumerate(cases)
    }
    payload = {
        "schemaVersion": 1,
        "datasetId": "japanese-synthetic-errors-v1-qwen3-voice-design-20",
        "createdAt": previous_created_at or now,
        "updatedAt": now,
        "model": {
            "id": MODEL_ID,
            "revision": MODEL_REVISION,
            "maxTokens": MAX_TOKENS,
            "maxAttempts": MAX_ATTEMPTS,
            "seedNamespace": SEED_NAMESPACE,
        },
        "personaCatalog": "experiments/007-synthetic-error-localization/personas.json",
        "caseCatalog": "experiments/007-synthetic-error-localization/cases.json",
        "humanListeningStatus": "not_reviewed",
        "clips": sorted(
            clips.values(), key=lambda clip: order[f"{clip['personaId']}:{clip['caseId']}"]
        ),
    }
    temporary = path.with_suffix(".json.part")
    temporary.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate 20 prompted Japanese voice personas and labeled cases."
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_DATASET_ROOT)
    parser.add_argument("--only-persona", action="append")
    parser.add_argument("--only-case", action="append")
    parser.add_argument(
        "--anchor-only",
        action="store_true",
        help="Generate only weather-exact, one audition anchor per persona.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    personas = load_catalog(EXPERIMENT_ROOT / "personas.json", "personas")
    cases = load_catalog(EXPERIMENT_ROOT / "cases.json", "cases")

    requested_personas = set(args.only_persona or ())
    requested_cases = set(args.only_case or ())
    known_personas = {persona["id"] for persona in personas}
    known_cases = {case["id"] for case in cases}
    if requested_personas - known_personas:
        raise SystemExit(
            f"unknown persona(s): {', '.join(sorted(requested_personas - known_personas))}"
        )
    if requested_cases - known_cases:
        raise SystemExit(
            f"unknown case(s): {', '.join(sorted(requested_cases - known_cases))}"
        )
    if args.anchor_only:
        requested_cases = {"weather-exact"}

    selected_personas = [
        persona
        for persona in personas
        if not requested_personas or persona["id"] in requested_personas
    ]
    selected_cases = [
        case for case in cases if not requested_cases or case["id"] in requested_cases
    ]
    args.output.mkdir(parents=True, exist_ok=True)
    manifest_path = args.output / "manifest.json"
    existing_clips: dict[str, dict[str, Any]] = {}
    if manifest_path.exists():
        previous = json.loads(manifest_path.read_text(encoding="utf-8"))
        if previous.get("model", {}).get("revision") != MODEL_REVISION:
            raise RuntimeError("existing dataset used a different model revision")
        existing_clips = {
            f"{clip['personaId']}:{clip['caseId']}": clip
            for clip in previous.get("clips", [])
        }

    pending: list[tuple[dict[str, Any], dict[str, Any]]] = []
    for persona in selected_personas:
        for case in selected_cases:
            key = f"{persona['id']}:{case['id']}"
            destination = args.output / "clean" / persona["id"] / f"{case['id']}.wav"
            existing = existing_clips.get(key)
            if (
                existing
                and destination.is_file()
                and existing.get("sha256") == sha256_file(destination)
            ):
                print(f"Verified existing {key}", flush=True)
                continue
            pending.append((persona, case))

    if not pending:
        print("All selected clips already exist and match their hashes.")
        return

    print(
        f"Loading {MODEL_ID}@{MODEL_REVISION} for {len(pending)} clips",
        flush=True,
    )
    model_path = snapshot_download(repo_id=MODEL_ID, revision=MODEL_REVISION)
    model = load_model(model_path)

    for clip_index, (persona, case) in enumerate(pending, start=1):
        key = f"{persona['id']}:{case['id']}"
        base_seed = stable_seed(persona["id"], case["id"])
        low_seconds, high_seconds = duration_bounds(case["ttsText"])
        accepted_audio = None
        accepted_rate = None
        accepted_seed = None
        accepted_duration = None
        raw_duration = None

        for attempt in range(MAX_ATTEMPTS):
            seed = base_seed + attempt * SEED_STRIDE
            mx.random.seed(seed)
            print(
                f"[{clip_index}/{len(pending)}] {key}, seed {seed}",
                flush=True,
            )
            results = list(
                model.generate(
                    text=case["ttsText"],
                    instruct=persona["prompt"],
                    lang_code="Japanese",
                    temperature=0.7,
                    top_k=50,
                    top_p=0.95,
                    repetition_penalty=1.05,
                    max_tokens=MAX_TOKENS,
                    verbose=False,
                )
            )
            if not results:
                print(f"Rejected {key}: model returned no audio", flush=True)
                continue
            audio = (
                mx.concatenate([result.audio for result in results], axis=0)
                if len(results) > 1
                else results[0].audio
            )
            sample_rate = int(results[0].sample_rate)
            raw_duration = audio.shape[0] / sample_rate
            audio = trim_trailing_silence(audio, sample_rate)
            duration = audio.shape[0] / sample_rate
            if low_seconds <= duration <= high_seconds:
                accepted_audio = audio
                accepted_rate = sample_rate
                accepted_seed = seed
                accepted_duration = duration
                break
            print(
                f"Rejected {key}: {duration:.2f}s outside "
                f"{low_seconds:.2f}-{high_seconds:.2f}s",
                flush=True,
            )

        if accepted_audio is None or accepted_rate is None:
            raise RuntimeError(f"{key}: no plausible output after {MAX_ATTEMPTS} attempts")

        destination = args.output / "clean" / persona["id"] / f"{case['id']}.wav"
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_suffix(".wav.part")
        write_audio(str(temporary), accepted_audio, accepted_rate, format="wav")
        temporary.replace(destination)
        existing_clips[key] = {
            "personaId": persona["id"],
            "personaLabel": persona["label"],
            "personaPrompt": persona["prompt"],
            "caseId": case["id"],
            "targetId": case["targetId"],
            "targetText": case["targetText"],
            "targetReading": case["targetReading"],
            "ttsText": case["ttsText"],
            "spokenReading": case["spokenReading"],
            "errorKind": case["errorKind"],
            "file": str(destination.relative_to(args.output)),
            "seed": accepted_seed,
            "sampleRateHz": accepted_rate,
            "rawDurationSeconds": round(float(raw_duration), 3),
            "durationSeconds": round(float(accepted_duration), 3),
            "expectedDurationSeconds": [round(low_seconds, 3), round(high_seconds, 3)],
            "sha256": sha256_file(destination),
            "humanListeningStatus": "not_reviewed",
        }
        write_manifest(manifest_path, personas, cases, existing_clips)
        print(
            f"Wrote {destination} ({accepted_duration:.2f}s)",
            flush=True,
        )

    print(f"Dataset manifest: {manifest_path}", flush=True)


if __name__ == "__main__":
    main()
