import json
import uuid
from pathlib import Path
from datetime import datetime, timezone
from .models import ImageRecord, Location

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def save_image(file_bytes: bytes, filename: str, metadata: dict) -> dict:
    """Save image file and JSON metadata to disk. Returns the full record dict."""
    record_id = str(uuid.uuid4())[:8]
    suffix = Path(filename).suffix.lower() or ".jpg"
    img_path = UPLOAD_DIR / f"{record_id}{suffix}"
    json_path = UPLOAD_DIR / f"{record_id}.json"

    img_path.write_bytes(file_bytes)

    now = datetime.now(timezone.utc)
    record = {
        "id": record_id,
        "file_path": str(img_path),
        "year": now.year,
        "month": now.month,
        "created_at": now.isoformat(),
        "annotations": "",
        "annotation_tags": [],
        **metadata,
    }
    json_path.write_text(json.dumps(record, indent=2))
    return record


def load_all() -> list[dict]:
    """Load all JSON records from uploads directory."""
    records = []
    for p in UPLOAD_DIR.glob("*.json"):
        try:
            records.append(json.loads(p.read_text()))
        except Exception:
            continue
    return records


def load_one(record_id: str) -> dict | None:
    """Load a single record by ID."""
    path = UPLOAD_DIR / f"{record_id}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def update_annotations(record_id: str, annotations: str, tags: list[str]) -> dict | None:
    """Update the annotations and annotation_tags fields for a record."""
    path = UPLOAD_DIR / f"{record_id}.json"
    if not path.exists():
        return None
    record = json.loads(path.read_text())
    record["annotations"] = annotations
    record["annotation_tags"] = tags
    path.write_text(json.dumps(record, indent=2))
    return record


def get_filter_options() -> dict:
    """Return distinct non-null values for every filterable field."""
    records = load_all()

    def distinct(key):
        return sorted({r[key] for r in records if r.get(key)})

    def distinct_nested(outer, inner):
        return sorted({r.get(outer, {}).get(inner)
                       for r in records
                       if r.get(outer, {}).get(inner)})

    def distinct_int(key):
        return sorted({r[key] for r in records if r.get(key) is not None})

    return {
        "garment_type": distinct("garment_type"),
        "style": distinct("style"),
        "material": distinct("material"),
        "occasion": distinct("occasion"),
        "season": distinct("season"),
        "pattern": distinct("pattern"),
        "continent": distinct_nested("location", "continent"),
        "country": distinct_nested("location", "country"),
        "city": distinct_nested("location", "city"),
        "year": distinct_int("year"),
        "month": distinct_int("month"),
    }
