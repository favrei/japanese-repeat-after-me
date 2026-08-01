from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import mlx.core as mx
from huggingface_hub import snapshot_download
from mlx_audio.audio_io import write as write_audio
from mlx_audio.tts.utils import load_model


DEFAULT_MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-6bit"
DEFAULT_MODEL_REVISION = "1c6c0ff58c43afa8df571facde2efa077efd85e2"
DEFAULT_VOICE = "Ono_Anna"
DEFAULT_SEED = 20_260_730
DEFAULT_MAX_ATTEMPTS = 5
DEFAULT_MAX_TOKENS = 256
SEED_STRIDE = 1_000
SILENCE_THRESHOLD = 0.02
SILENCE_WINDOW_SECONDS = 0.05
TAIL_PADDING_SECONDS = 0.15
MIN_SECONDS_PER_CHAR = 0.10
MAX_SECONDS_PER_CHAR = 0.40
DURATION_SLACK_SECONDS = 1.0


@dataclass(frozen=True)
class Line:
    id: str
    text: str
    delivery_intent: str = ""
    voice: str | None = None
    speed: float = 1.0
    seed: int | None = None
    speaker: str = "staff"
    section: str | None = None
    instruct: str | None = None


@dataclass(frozen=True)
class Story:
    """A manifest's lines plus the acting direction they inherit."""

    lines: tuple[Line, ...]
    instruct: str | None = None
    sections: dict[str, str] | None = None

    def instruct_for(self, line: Line, fallback: str | None) -> str | None:
        """Resolve direction: line, then section, then story, then CLI."""
        if line.instruct is not None:
            return line.instruct or None
        if line.section and self.sections:
            section_instruct = self.sections.get(line.section)
            if section_instruct is not None:
                return section_instruct or None
        if self.instruct is not None:
            return self.instruct or None
        return fallback


def seed_for(line: Line, namespace_seed: int) -> int:
    """Resolve a stable take seed without using manifest position."""
    if line.seed is not None:
        return line.seed
    digest = hashlib.sha256(f"{namespace_seed}:{line.id}".encode()).digest()
    return int.from_bytes(digest[:4], "big") & 0x7FFFFFFF


def scoring_chars(text: str) -> int:
    """Count characters that carry duration, ignoring punctuation."""
    return sum(1 for char in text if char not in "。、！？「」・ \n")


def duration_bounds(text: str) -> tuple[float, float]:
    count = scoring_chars(text)
    return (
        count * MIN_SECONDS_PER_CHAR,
        count * MAX_SECONDS_PER_CHAR + DURATION_SLACK_SECONDS,
    )


def trim_trailing_silence(audio: mx.array, sample_rate: int) -> mx.array:
    """Trim only a near-silent tail, leaving leading and internal pauses."""
    window = max(1, int(sample_rate * SILENCE_WINDOW_SECONDS))
    magnitude = mx.abs(audio.reshape(-1))
    peak = float(mx.max(magnitude)) if magnitude.size else 0.0
    if peak <= 0.0:
        return audio

    usable = (magnitude.size // window) * window
    if usable == 0:
        return audio

    frames = magnitude[:usable].reshape(-1, window)
    loud = mx.max(frames, axis=1) > (peak * SILENCE_THRESHOLD)
    loud_indices = [index for index, flag in enumerate(loud.tolist()) if flag]
    if not loud_indices:
        return audio

    end = (loud_indices[-1] + 1) * window
    end += int(sample_rate * TAIL_PADDING_SECONDS)
    return audio[: min(end, audio.shape[0])]


def load_lines(path: Path) -> Story:
    """Load a story manifest with optional voice, speed, seed, and direction."""
    raw = json.loads(path.read_text(encoding="utf-8"))
    sections = raw.get("sections") or {}
    lines = tuple(
        Line(
            id=entry["id"],
            text=entry["text"],
            delivery_intent=entry.get(
                "deliveryIntent",
                entry.get("delivery_intent", ""),
            ),
            voice=entry.get("voice"),
            speed=float(entry.get("speed", 1.0)),
            seed=entry.get("seed"),
            speaker=entry.get("speaker", "staff"),
            section=entry.get("section"),
            instruct=entry.get("instruct"),
        )
        for entry in raw["lines"]
    )

    unknown = sorted(
        {line.section for line in lines if line.section} - set(sections)
    )
    if unknown:
        raise SystemExit(
            f"{path}: line(s) reference undeclared section(s): "
            f"{', '.join(unknown)}"
        )

    return Story(lines=lines, instruct=raw.get("instruct"), sections=sections)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate canonical Japanese MP3 files with MLX."
    )
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--revision", default=DEFAULT_MODEL_REVISION)
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument(
        "--instruct",
        help="Run-wide acting direction; a manifest line or section overrides it.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=DEFAULT_SEED,
        help="Namespace seed for manifest lines that do not pin a seed.",
    )
    parser.add_argument(
        "--max-attempts",
        type=int,
        default=DEFAULT_MAX_ATTEMPTS,
        help="Retry a line with deterministic alternate seeds.",
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=DEFAULT_MAX_TOKENS,
        help="Hard generation ceiling per attempt.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        required=True,
        help="Where the shipped MP3s land, under app/public/audio/.",
    )
    parser.add_argument(
        "--lines",
        type=Path,
        required=True,
        help="Story JSON manifest under stories/<story>/voices.json.",
    )
    parser.add_argument(
        "--log",
        type=Path,
        help="Merge generation provenance into this JSON log.",
    )
    parser.add_argument(
        "--only",
        action="append",
        help="Generate one line id; repeat to select several.",
    )
    parser.add_argument(
        "--keep-wav",
        action="store_true",
        help="Keep the lossless intermediate next to each MP3.",
    )
    return parser.parse_args()


def encode_mp3(source: Path, destination: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(source),
            "-af",
            "loudnorm=I=-18:LRA=7:TP=-1.5",
            "-codec:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(destination),
        ],
        check=True,
    )


def merged_log(
    path: Path,
    lines: tuple[Line, ...],
    entries: list[dict[str, object]],
    args: argparse.Namespace,
) -> None:
    merged: dict[str, dict[str, object]] = {}
    if path.exists():
        previous = json.loads(path.read_text(encoding="utf-8"))
        for entry in previous.get("clips", []):
            merged[str(entry["id"])] = entry
    for entry in entries:
        merged[str(entry["id"])] = entry

    order = {line.id: index for index, line in enumerate(lines)}
    clips = sorted(
        merged.values(),
        key=lambda entry: order.get(str(entry["id"]), 1 << 30),
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "model": args.model,
                "revision": args.revision,
                "default_voice": args.voice,
                "max_tokens": args.max_tokens,
                "max_attempts": args.max_attempts,
                "clips": clips,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {path}")


def main() -> None:
    args = parse_args()
    story = load_lines(args.lines)
    lines = story.lines
    known = {line.id for line in lines}
    requested = set(args.only or ())
    unknown = sorted(requested - known)
    if unknown:
        raise SystemExit(f"unknown line id(s): {', '.join(unknown)}")

    selected = [line for line in lines if not requested or line.id in requested]
    args.output_dir.mkdir(parents=True, exist_ok=True)
    log_entries: list[dict[str, object]] = []

    print(f"Loading {args.model}@{args.revision}")
    model_path = snapshot_download(repo_id=args.model, revision=args.revision)
    model = load_model(model_path)

    with tempfile.TemporaryDirectory(prefix="japanese-repeat-tts-") as temp_dir:
        temp_root = Path(temp_dir)
        for line in selected:
            voice = line.voice or args.voice
            instruct = story.instruct_for(line, args.instruct)
            base_seed = seed_for(line, args.seed)
            low, high = duration_bounds(line.text)
            accepted_audio = None
            accepted_sample_rate = None
            accepted_seed = None
            accepted_duration = None

            for attempt in range(args.max_attempts):
                seed = base_seed + attempt * SEED_STRIDE
                mx.random.seed(seed)
                print(f"Generating {line.id} [{voice}] with seed {seed}: {line.text}")
                if instruct:
                    print(f"  direction: {instruct}")
                results = list(
                    model.generate(
                        text=line.text,
                        voice=voice,
                        lang_code="Japanese",
                        instruct=instruct,
                        speed=line.speed,
                        temperature=0.7,
                        top_p=0.95,
                        repetition_penalty=1.05,
                        max_tokens=args.max_tokens,
                        verbose=True,
                    )
                )
                if not results:
                    print(f"Rejected {line.id}: model returned no audio")
                    continue

                audio = (
                    mx.concatenate([result.audio for result in results], axis=0)
                    if len(results) > 1
                    else results[0].audio
                )
                sample_rate = results[0].sample_rate
                raw_duration = audio.shape[0] / sample_rate
                audio = trim_trailing_silence(audio, sample_rate)
                duration = audio.shape[0] / sample_rate

                if raw_duration - duration > 0.5:
                    print(
                        f"Trimmed {raw_duration - duration:.2f}s of trailing "
                        f"silence ({raw_duration:.2f}s -> {duration:.2f}s)"
                    )
                if low <= duration <= high:
                    accepted_audio = audio
                    accepted_sample_rate = sample_rate
                    accepted_seed = seed
                    accepted_duration = duration
                    break

                print(
                    f"Rejected {line.id}: {duration:.2f}s is outside "
                    f"{low:.2f}–{high:.2f}s"
                )

            if (
                accepted_audio is None
                or accepted_sample_rate is None
                or accepted_seed is None
                or accepted_duration is None
            ):
                raise RuntimeError(
                    f"{line.id}: no reasonable output after "
                    f"{args.max_attempts} attempts"
                )

            wav_path = temp_root / f"{line.id}.wav"
            mp3_path = args.output_dir / f"{line.id}.mp3"
            write_audio(
                str(wav_path),
                accepted_audio,
                accepted_sample_rate,
                format="wav",
            )
            encode_mp3(wav_path, mp3_path)

            if args.keep_wav:
                write_audio(
                    str(args.output_dir / f"{line.id}.wav"),
                    accepted_audio,
                    accepted_sample_rate,
                    format="wav",
                )

            print(
                f"Wrote {mp3_path} "
                f"({accepted_duration:.2f}s, seed {accepted_seed})"
            )
            log_entries.append(
                {
                    "id": line.id,
                    "text": line.text,
                    "file": mp3_path.name,
                    "voice": voice,
                    "speed": line.speed,
                    "instruct": instruct,
                    "seed": accepted_seed,
                    "duration_seconds": round(accepted_duration, 3),
                    "expected_seconds": [round(low, 2), round(high, 2)],
                    "suspect": False,
                    "sha256": hashlib.sha256(mp3_path.read_bytes()).hexdigest(),
                }
            )

    if args.log:
        merged_log(args.log, lines, log_entries, args)

    if not args.lines and not args.only:
        entry_by_id = {str(entry["id"]): entry for entry in log_entries}
        metadata = {
            "schemaVersion": 1,
            "generator": "tools/tts/generate_audio.py",
            "model": args.model,
            "revision": args.revision,
            "baseSeed": args.seed,
            "maxTokens": args.max_tokens,
            "maxAttempts": args.max_attempts,
            "clips": [
                {
                    "id": line.id,
                    "text": line.text,
                    "speaker": line.speaker,
                    "voice": line.voice or args.voice,
                    "instruction": story.instruct_for(line, args.instruct) or "",
                    "deliveryIntent": line.delivery_intent,
                    "seed": entry_by_id[line.id]["seed"],
                }
                for line in lines
            ],
        }
        metadata_path = args.output_dir / "metadata.json"
        metadata_path.write_text(
            json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Wrote {metadata_path}")


if __name__ == "__main__":
    main()
