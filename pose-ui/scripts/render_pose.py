#!/usr/bin/env python3
"""Build and optionally run an image edit command from pose-ui payload."""

from __future__ import annotations

import argparse
import json
import shlex
import subprocess
from pathlib import Path

CANONICAL_ORDER = [
    "head",
    "neck",
    "leftShoulder",
    "rightShoulder",
    "leftElbow",
    "rightElbow",
    "leftHand",
    "rightHand",
    "torso",
    "hip",
    "leftHip",
    "rightHip",
    "leftKnee",
    "rightKnee",
    "leftFoot",
    "rightFoot",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a polished edit prompt from pose-payload.json and run skills/imagegen/scripts/image_gen.py."
    )
    parser.add_argument("--payload", required=True, help="Path to pose-payload.json")
    parser.add_argument("--reference", required=True, help="Path to reference image")
    parser.add_argument(
        "--imagegen-script",
        default="skills/imagegen/scripts/image_gen.py",
        help="Path to image_gen.py",
    )
    parser.add_argument("--out", default="outputs/pose-result.png", help="Output image path")
    parser.add_argument("--size", default="1024x1024", help="Target size")
    parser.add_argument("--model", default="gpt-image-1", help="Image model")
    parser.add_argument("--quality", default="high", help="Image quality")
    parser.add_argument(
        "--run",
        action="store_true",
        help="Execute the generated command. Without this flag, prints dry-run command only.",
    )
    return parser.parse_args()


def _clean_text(value: str) -> str:
    text = " ".join(value.split())
    text = text.replace("прозраачный", "прозрачный")
    return text.strip()


def _pose_to_string(pose: dict) -> str:
    parts = []
    for name in CANONICAL_ORDER:
        point = pose.get(name)
        if not point:
            continue
        x = round(point.get("x", 0))
        y = round(point.get("y", 0))
        parts.append(f"{name}({x},{y})")
    return ", ".join(parts)


def build_prompt(payload: dict) -> str:
    character = _clean_text(payload.get("characterPrompt") or "") or "персонаж не описан"
    extra = _clean_text(payload.get("extraPrompt") or "")
    pose_text = _pose_to_string(payload.get("pose") or {})

    lines = [
        "Сгенерируй персонажа по референсу в целевой позе.",
        f"Описание персонажа: {character}.",
        f"Поза (координаты скелета): {pose_text}.",
        "Сохрани лицо, прическу, одежду, палитру и пиксель-арт стиль референса.",
        "Финальный рендер: чистый прозрачный фон, без лишних объектов.",
    ]
    if extra:
        lines.insert(3, f"Дополнительно: {extra}.")
    return "\n".join(lines)


def build_command(args: argparse.Namespace, prompt: str) -> list[str]:
    return [
        "python3",
        args.imagegen_script,
        "edit",
        "--image",
        args.reference,
        "--prompt",
        prompt,
        "--background",
        "transparent",
        "--size",
        args.size,
        "--quality",
        args.quality,
        "--model",
        args.model,
        "--out",
        args.out,
    ]


def main() -> int:
    args = parse_args()
    payload_path = Path(args.payload)
    payload = json.loads(payload_path.read_text(encoding="utf-8"))
    prompt = build_prompt(payload)
    command = build_command(args, prompt)

    print("=== Prompt ===")
    print(prompt)
    print("\n=== Command ===")
    print(" ".join(shlex.quote(part) for part in command))

    if not args.run:
        print("\nDry-run only. Add --run to execute generation.")
        return 0

    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    completed = subprocess.run(command, check=False)
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
