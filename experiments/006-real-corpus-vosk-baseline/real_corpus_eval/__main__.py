from __future__ import annotations

import argparse
import json
from pathlib import Path

from .pipeline import default_model_cache_root, evaluate


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Evaluate the recovered Japanese voice corpus with one pinned Vosk "
            "model load and deterministic temporary-WAV conversion."
        )
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        required=True,
        help="Path to the recovered dataset manifest.json.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="Machine-readable JSON result path.",
    )
    parser.add_argument(
        "--model-cache",
        type=Path,
        default=default_model_cache_root(),
        help="External cache directory for the verified Vosk model.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    result = evaluate(
        manifest_path=args.manifest,
        output_path=args.output,
        model_cache_root=args.model_cache,
    )
    aggregate = result["aggregate"]
    print(
        json.dumps(
            {
                "output": str(args.output),
                "recordings": aggregate["recordings"],
                "manifestTargetAgreement": aggregate[
                    "manifestTargetAgreement"
                ],
                "closedSetManifestTargetPrecisionRecall": {
                    key: value
                    for key, value in aggregate[
                        "closedSetManifestTargetPrecisionRecall"
                    ].items()
                    if key != "curve"
                },
                "humanReferencedMetrics": aggregate[
                    "humanReferencedMetrics"
                ],
                "resources": result["resources"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
