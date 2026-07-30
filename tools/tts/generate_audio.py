from __future__ import annotations

import argparse
import subprocess
import tempfile
from dataclasses import dataclass
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
        "--only",
        action="append",
        choices=[line.id for line in LINES],
        help="Generate only one line; repeat the flag to select several.",
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
    selected = [line for line in LINES if not args.only or line.id in args.only]
    args.output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Loading {args.model}@{args.revision}")
    model_path = snapshot_download(repo_id=args.model, revision=args.revision)
    model = load_model(model_path)

    with tempfile.TemporaryDirectory(prefix="japanese-repeat-tts-") as temp_dir:
        temp_root = Path(temp_dir)
        for line in selected:
            mx.random.seed(args.seed + LINES.index(line))
            print(f"Generating {line.id}: {line.text}")
            results = list(
                model.generate(
                    text=line.text,
                    voice=args.voice,
                    lang_code="Japanese",
                    instruct=args.instruct,
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

            duration = audio.shape[0] / sample_rate
            print(f"Wrote {mp3_path} ({duration:.2f}s)")


if __name__ == "__main__":
    main()
