from __future__ import annotations

import argparse
import html
import json
from pathlib import Path

from .generate import DEFAULT_DATASET_ROOT, EXPERIMENT_ROOT


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a local HTML player for the twenty persona anchors."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET_ROOT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    personas = json.loads(
        (EXPERIMENT_ROOT / "personas.json").read_text(encoding="utf-8")
    )["personas"]
    manifest = json.loads(
        (args.dataset / "manifest.json").read_text(encoding="utf-8")
    )
    anchors = {
        clip["personaId"]: clip
        for clip in manifest["clips"]
        if clip["caseId"] == "weather-exact"
    }
    missing = [persona["id"] for persona in personas if persona["id"] not in anchors]
    if missing:
        raise SystemExit(f"missing anchor(s): {', '.join(missing)}")

    cards = []
    for index, persona in enumerate(personas, start=1):
        clip = anchors[persona["id"]]
        cards.append(
            f"""
      <article>
        <div class="number">{index:02d}</div>
        <h2>{html.escape(persona['label'])}</h2>
        <p>{html.escape(persona['ageBand'])} · {html.escape(persona['timbre'])}</p>
        <audio controls preload="none" src="{html.escape(clip['file'])}"></audio>
        <details><summary>Prompt and provenance</summary>
          <p>{html.escape(persona['prompt'])}</p>
          <code>seed {clip['seed']} · {clip['durationSeconds']:.2f}s · {html.escape(clip['sha256'])}</code>
        </details>
      </article>"""
        )

    output = args.dataset / "audition.html"
    output.write_text(
        f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Qwen3 VoiceDesign — 20 Japanese persona anchors</title>
  <style>
    :root {{ color-scheme: dark; font-family: system-ui, sans-serif; background:#171614; color:#f3eee5; }}
    body {{ max-width: 980px; margin: 0 auto; padding: 32px 20px 72px; }}
    header {{ border-bottom: 1px solid #514d46; margin-bottom: 24px; }}
    h1 {{ margin-bottom: 8px; }}
    header p {{ color:#c6beb0; max-width: 72ch; line-height:1.5; }}
    main {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); gap:14px; }}
    article {{ position:relative; padding:18px; border:1px solid #514d46; background:#22201d; }}
    .number {{ color:#cf4b3f; font:700 13px ui-monospace,monospace; }}
    h2 {{ font-size:18px; margin:6px 0; }}
    article>p {{ color:#c6beb0; min-height:42px; margin:0 0 12px; }}
    audio {{ width:100%; }}
    details {{ margin-top:12px; color:#c6beb0; font-size:13px; line-height:1.45; }}
    code {{ overflow-wrap:anywhere; color:#a9d6c4; }}
  </style>
</head>
<body>
  <header>
    <h1>20 Japanese persona anchors</h1>
    <p>All clips say 「今日はいい天気ですね。」 These are unreviewed VoiceDesign candidates, not approved learner references. Listen for pronunciation, breaths, extra sounds, persona fit, and identity distinctness.</p>
  </header>
  <main>{''.join(cards)}
  </main>
</body>
</html>
""",
        encoding="utf-8",
    )
    print(output)


if __name__ == "__main__":
    main()
