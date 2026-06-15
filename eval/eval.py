"""
Evaluation script for the garment classifier.

Usage:
    python eval/eval.py

Expects:
    eval/test_set/     — folder of garment images (JPEG/PNG)
    eval/expected.json — manually labeled attributes per image

expected.json format:
{
  "image_filename.jpg": {
    "garment_type": "dress",
    "style": "bohemian",
    "occasion": "casual",
    "season": "spring",
    "pattern": "floral",
    "color_palette": ["ivory", "gold"]
  }
}

Outputs:
    Per-attribute accuracy table printed to stdout.
"""

import json
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
os.environ.setdefault("ANTHROPIC_API_KEY", os.getenv("ANTHROPIC_API_KEY", ""))

from app.backend.classifier import classify_image

EVAL_DIR = Path(__file__).parent
TEST_SET_DIR = EVAL_DIR / "test_set"
EXPECTED_FILE = EVAL_DIR / "expected.json"

EVAL_ATTRIBUTES = ["garment_type", "style", "occasion", "season", "pattern", "material"]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MEDIA_TYPE_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def normalize(value):
    """Lowercase and strip for comparison."""
    if value is None:
        return None
    return str(value).lower().strip()


def color_match(predicted: list, expected: list) -> bool:
    """Check if there is at least 50% overlap between predicted and expected colors."""
    if not expected:
        return True
    pred_set = {normalize(c) for c in (predicted or [])}
    exp_set = {normalize(c) for c in expected}
    overlap = pred_set & exp_set
    return len(overlap) / len(exp_set) >= 0.5


def run_eval():
    if not EXPECTED_FILE.exists():
        print("ERROR: eval/expected.json not found. Create it with manually labeled test data.")
        sys.exit(1)

    expected_all = json.loads(EXPECTED_FILE.read_text())

    if not expected_all:
        print("eval/expected.json is empty. Add labeled test images before running eval.")
        sys.exit(0)

    image_files = [
        f for f in TEST_SET_DIR.iterdir()
        if f.suffix.lower() in IMAGE_EXTENSIONS
    ]

    if not image_files:
        print(f"No images found in {TEST_SET_DIR}. Add garment images to run eval.")
        sys.exit(0)

    print(f"\nRunning evaluation on {len(image_files)} images...\n")

    results = {attr: {"correct": 0, "total": 0} for attr in EVAL_ATTRIBUTES}
    results["color_palette"] = {"correct": 0, "total": 0}

    for img_path in sorted(image_files):
        filename = img_path.name
        if filename not in expected_all:
            print(f"  SKIP {filename} — not in expected.json")
            continue

        expected = expected_all[filename]
        media_type = MEDIA_TYPE_MAP.get(img_path.suffix.lower(), "image/jpeg")
        print(f"  Classifying {filename}...", end=" ", flush=True)

        try:
            predicted = classify_image(img_path.read_bytes(), media_type)
            print("done")
        except Exception as e:
            print(f"ERROR: {e}")
            continue

        for attr in EVAL_ATTRIBUTES:
            if attr not in expected:
                continue
            results[attr]["total"] += 1
            if normalize(predicted.get(attr)) == normalize(expected[attr]):
                results[attr]["correct"] += 1

        if "color_palette" in expected:
            results["color_palette"]["total"] += 1
            if color_match(predicted.get("color_palette", []), expected["color_palette"]):
                results["color_palette"]["correct"] += 1

    print("\n" + "=" * 50)
    print(f"{'Attribute':<20} {'Correct':>8} {'Total':>8} {'Accuracy':>10}")
    print("-" * 50)

    for attr in EVAL_ATTRIBUTES + ["color_palette"]:
        c = results[attr]["correct"]
        t = results[attr]["total"]
        acc = f"{(c/t*100):.1f}%" if t > 0 else "N/A"
        print(f"{attr:<20} {c:>8} {t:>8} {acc:>10}")

    print("=" * 50)
    total_correct = sum(v["correct"] for v in results.values())
    total_total = sum(v["total"] for v in results.values())
    if total_total > 0:
        overall = total_correct / total_total * 100
        print(f"\nOverall accuracy: {overall:.1f}% ({total_correct}/{total_total})")


if __name__ == "__main__":
    run_eval()
