import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .storage import save_image, load_all, load_one, update_annotations, get_filter_options
from .classifier import classify_image
from .models import AnnotationUpdate

load_dotenv()

app = FastAPI(title="Fashion Classifier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_TYPES = {
    "image/jpeg": "image/jpeg",
    "image/jpg": "image/jpeg",
    "image/png": "image/png",
    "image/webp": "image/webp",
}

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"


# ── Serve uploaded images ────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# ── POST /upload ─────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image, classify it, save to disk, return the full record."""
    content_type = file.content_type or ""
    media_type = ALLOWED_TYPES.get(content_type)
    if not media_type:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use JPEG, PNG, or WebP.")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB.")

    metadata = classify_image(file_bytes, media_type)
    record = save_image(file_bytes, file.filename or "upload.jpg", metadata)
    return record


# ── GET /images ───────────────────────────────────────────────────────────────
@app.get("/images")
def get_images(
    garment_type: str = Query(None),
    style: str = Query(None),
    material: str = Query(None),
    occasion: str = Query(None),
    season: str = Query(None),
    pattern: str = Query(None),
    continent: str = Query(None),
    country: str = Query(None),
    city: str = Query(None),
    year: int = Query(None),
    month: int = Query(None),
    q: str = Query(None),
):
    """Return all images, filtered by any combination of query params."""
    records = load_all()

    if garment_type:
        records = [r for r in records if r.get("garment_type") == garment_type]
    if style:
        records = [r for r in records if r.get("style") == style]
    if material:
        records = [r for r in records if r.get("material") == material]
    if occasion:
        records = [r for r in records if r.get("occasion") == occasion]
    if season:
        records = [r for r in records if r.get("season") == season]
    if pattern:
        records = [r for r in records if r.get("pattern") == pattern]
    if continent:
        records = [r for r in records if r.get("location", {}).get("continent") == continent]
    if country:
        records = [r for r in records if r.get("location", {}).get("country") == country]
    if city:
        records = [r for r in records if r.get("location", {}).get("city") == city]
    if year:
        records = [r for r in records if r.get("year") == year]
    if month:
        records = [r for r in records if r.get("month") == month]
    if q:
        ql = q.lower()
        records = [
            r for r in records
            if ql in (r.get("description") or "").lower()
            or ql in (r.get("annotations") or "").lower()
            or ql in " ".join(r.get("annotation_tags") or []).lower()
            or ql in (r.get("trend_notes") or "").lower()
            or ql in (r.get("consumer_profile") or "").lower()
        ]

    return records


# ── GET /images/filters ───────────────────────────────────────────────────────
@app.get("/images/filters")
def get_filters():
    """Return distinct values for each filterable field. Powers frontend dropdowns."""
    return get_filter_options()


# ── PATCH /images/{id} ────────────────────────────────────────────────────────
@app.patch("/images/{record_id}")
def patch_annotations(record_id: str, body: AnnotationUpdate):
    """Update annotations and annotation_tags for a given image."""
    record = update_annotations(record_id, body.annotations, body.annotation_tags)
    if not record:
        raise HTTPException(status_code=404, detail="Image not found.")
    return record


# ── GET /images/{id} ─────────────────────────────────────────────────────────
@app.get("/images/{record_id}")
def get_image(record_id: str):
    """Return a single image record by ID."""
    record = load_one(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Image not found.")
    return record


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}
