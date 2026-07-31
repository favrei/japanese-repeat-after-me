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
REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT_DIR = REPO_ROOT / "public" / "audio" / "qwen3"


@dataclass(frozen=True)
class Line:
    id: str
    text: str
    voice: str | None = None
    speed: float = 1.0
    seed: int | None = None


def seed_for(line: Line) -> int:
    """Resolve a line's seed without reference to its position.

    The seed controls which take of a voice you get; it does not carry voice
    identity, which comes entirely from the preset. Its only job is
    reproducibility, so any stable mapping works — but it must not depend on
    the line's index in the manifest, or inserting a line silently regenerates
    every clip after it. An explicit `seed` wins; otherwise it is derived from
    the line id.
    """
    if line.seed is not None:
        return line.seed
    digest = hashlib.sha256(line.id.encode("utf-8")).digest()
    return int.from_bytes(digest[:4], "big") & 0x7FFFFFFF


# The model sometimes fails to emit its end-of-speech token and pads with near
# silence until the token cap. Measured case: one clip ran 81.92s where a good
# take is 3.28s, and the energy map showed ~5s of speech followed by ~77s of
# silence. The speech itself was fine, so the remedy is to trim the tail, not
# to throw the take away and reseed.
SILENCE_THRESHOLD = 0.02  # fraction of the clip's peak amplitude
SILENCE_WINDOW_SECONDS = 0.05
TAIL_PADDING_SECONDS = 0.15

# Healthy Japanese clips from this model measure 0.16-0.24 seconds per scoring
# character, after trimming. These bounds are loose enough to accept every clip
# observed good, and exist as a backstop for failures that trimming cannot fix
# (looping or babbling, which would keep their energy).
MAX_SECONDS_PER_CHAR = 0.40
MIN_SECONDS_PER_CHAR = 0.10
DURATION_SLACK_SECONDS = 1.0
MAX_ATTEMPTS = 4
SEED_STRIDE = 1000


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
    """Drop the near-silent tail, keeping a short natural pause.

    Only the tail is trimmed. Leading audio and any internal pause are left
    alone, so sentence rhythm — which the learner imitates — is unchanged.
    """
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
    loud_indices = [i for i, flag in enumerate(loud.tolist()) if flag]
    if not loud_indices:
        return audio

    end = (loud_indices[-1] + 1) * window + int(sample_rate * TAIL_PADDING_SECONDS)
    return audio[: min(end, audio.shape[0])]


def load_lines(path: Path) -> tuple[Line, ...]:
    """Read a story bundle's line manifest.

    Each entry needs `id` and `text`; `voice` and `speed` are optional and fall
    back to the CLI defaults. Per-line `voice` is what keeps two characters in
    one story from being synthesised as the same person.
    """
    raw = json.loads(path.read_text(encoding="utf-8"))
    return tuple(
        Line(
            id=entry["id"],
            text=entry["text"],
            voice=entry.get("voice"),
            speed=float(entry.get("speed", 1.0)),
            seed=entry["seed"] if "seed" in entry else None,
        )
        for entry in raw["lines"]
    )


LINES = (
    Line(
        "ordering-welcome",
        "いらっしゃいませ。どうぞお入りください。",
    ),
    Line(
        "ordering-question",
        "ご注文は何になさいますか。",
    ),
    Line(
        "ordering-second",
        "あ、ちょっと待ってください。",
    ),
    Line(
        "ordering-menu",
        "メニューはどこですか。",
    ),
    Line(
        "ordering-thanks",
        "はい、ご注文ありがとうございます。",
    ),
    Line(
        "meal-arrives",
        "お料理をお持ちしました。",
    ),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate the PoC's canonical Japanese MP3 files with MLX."
    )
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--revision", default=DEFAULT_MODEL_REVISION)
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument(
        "--instruct",
        help="Optional acting direction. Canonical clips omit this to avoid non-verbal artifacts.",
    )
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument(
        "--lines",
        type=Path,
        help="JSON line manifest from a story bundle. Defaults to the built-in "
        "cafe lines. Entries may set their own voice and speed.",
    )
    parser.add_argument(
        "--log",
        type=Path,
        help="Write a JSON generation log (model, revision, voice, instruct, "
        "seed, duration, SHA-256) so a clip can be traced and reproduced.",
    )
    parser.add_argument(
        "--only",
        action="append",
        help="Generate only one line id; repeat the flag to select several.",
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


def main() -> None:
    args = parse_args()
    lines = load_lines(args.lines) if args.lines else LINES
    known = {line.id for line in lines}
    requested: set[str] = set(args.only or [])
    unknown = sorted(requested - known)
    if unknown:
        raise SystemExit(f"unknown line id(s): {', '.join(unknown)}")

    selected = [line for line in lines if not args.only or line.id in args.only]
    args.output_dir.mkdir(parents=True, exist_ok=True)
    log_entries: list[dict[str, object]] = []

    print(f"Loading {args.model}@{args.revision}")
    model_path = snapshot_download(repo_id=args.model, revision=args.revision)
    model = load_model(model_path)

    with tempfile.TemporaryDirectory(prefix="japanese-repeat-tts-") as temp_dir:
        temp_root = Path(temp_dir)
        for line in selected:
            voice = line.voice or args.voice
            base_seed = seed_for(line)
            low, high = duration_bounds(line.text)
            print(f"Generating {line.id} [{voice}]: {line.text}")

            audio = None
            sample_rate = 0
            seed = base_seed
            duration = 0.0
            suspect = True

            for attempt in range(MAX_ATTEMPTS):
                seed = base_seed + attempt * SEED_STRIDE
                mx.random.seed(seed)
                results = list(
                    model.generate(
                        text=line.text,
                        voice=voice,
                        lang_code="Japanese",
                        instruct=args.instruct,
                        speed=line.speed,
                        temperature=0.7,
                        top_p=0.95,
                        repetition_penalty=1.05,
                        max_tokens=1024,
                        verbose=True,
                    )
                )
                if not results:
                    raise RuntimeError(f"{line.id}: model returned no audio")

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
                        f"  trimmed {raw_duration - duration:.2f}s of trailing "
                        f"silence ({raw_duration:.2f}s -> {duration:.2f}s)"
                    )

                if low <= duration <= high:
                    suspect = False
                    break

                print(
                    f"  seed {seed} gave {duration:.2f}s after trimming, outside "
                    f"{low:.2f}-{high:.2f}s; reseeding"
                )

            if suspect:
                print(
                    f"  WARNING: {line.id} still outside bounds after "
                    f"{MAX_ATTEMPTS} attempts; flagged in the log"
                )
            assert audio is not None
            wav_path = temp_root / f"{line.id}.wav"
            mp3_path = args.output_dir / f"{line.id}.mp3"
            write_audio(str(wav_path), audio, sample_rate, format="wav")
            encode_mp3(wav_path, mp3_path)

            if args.keep_wav:
                write_audio(
                    str(args.output_dir / f"{line.id}.wav"),
                    audio,
                    sample_rate,
                    format="wav",
                )

            print(f"Wrote {mp3_path} ({duration:.2f}s, seed {seed})")

            log_entries.append(
                {
                    "id": line.id,
                    "text": line.text,
                    "file": mp3_path.name,
                    "voice": voice,
                    "speed": line.speed,
                    "instruct": args.instruct,
                    "seed": seed,
                    "duration_seconds": round(duration, 3),
                    "expected_seconds": [round(low, 2), round(high, 2)],
                    "suspect": suspect,
                    "sha256": hashlib.sha256(mp3_path.read_bytes()).hexdigest(),
                }
            )

    if args.log:
        args.log.parent.mkdir(parents=True, exist_ok=True)

        # Merge rather than overwrite. A partial run (--only) must not delete
        # the provenance of clips it did not regenerate.
        merged: dict[str, dict[str, object]] = {}
        if args.log.exists():
            previous = json.loads(args.log.read_text(encoding="utf-8"))
            for entry in previous.get("clips", []):
                merged[str(entry["id"])] = entry
        for entry in log_entries:
            merged[str(entry["id"])] = entry

        order = {line.id: index for index, line in enumerate(lines)}
        clips = sorted(merged.values(), key=lambda e: order.get(str(e["id"]), 1 << 30))

        args.log.write_text(
            json.dumps(
                {
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "model": args.model,
                    "revision": args.revision,
                    "default_voice": args.voice,
                    "clips": clips,
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        print(f"Wrote {args.log}")


if __name__ == "__main__":
    main()
