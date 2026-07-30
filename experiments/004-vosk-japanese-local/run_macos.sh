#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV="$ROOT/.venv"
MODEL_DIR="$ROOT/models/vosk-model-small-ja-0.22"
MODEL_ZIP="$ROOT/models/vosk-model-small-ja-0.22.zip"
AUDIO="${1:-}"

if [[ -z "$AUDIO" ]]; then
  echo "Usage: $0 path/to/16khz-mono.wav" >&2
  exit 2
fi

python3 -m venv "$VENV"
source "$VENV/bin/activate"
python -m pip install --upgrade pip
python -m pip install vosk

mkdir -p "$ROOT/models"
if [[ ! -d "$MODEL_DIR" ]]; then
  curl -L --fail --output "$MODEL_ZIP" \
    https://alphacephei.com/vosk/models/vosk-model-small-ja-0.22.zip
  unzip -q "$MODEL_ZIP" -d "$ROOT/models"
fi

python "$ROOT/transcribe.py" --model "$MODEL_DIR" --audio "$AUDIO"
