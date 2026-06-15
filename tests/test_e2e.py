import pytest
import os
import io
from pathlib import Path
from fastapi.testclient import TestClient
from unittest.mock import patch

os.environ["ANTHROPIC_API_KEY"] = "test-key"

from app.backend.main import app

client = TestClient(app)

MOCK_CLASSIFICATION = {
    "garment_type": "dress",
    "style": "casual",
    "material": None,
    "color_palette": ["red", "white"],
    "pattern": "striped",
    "occasion": "casual",
    "season": "summer",
    "consumer_profile": "women 20-30",
    "trend_notes": "summer basics",
    "location": {"continent": "Europe", "country": "France", "city": "Paris"},
    "description": "A casual red and white striped dress suitable for summer."
}

# Minimal valid 1x1 pixel JPEG bytes
TINY_JPEG = (
    b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'
    b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t'
    b'\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a'
    b'\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\x1e!'
    b'!\x1c\x1c(7),01444\x1f\'9=82<.342\x1e!!\xff\xc0\x00\x0b\x08\x00'
    b'\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01'
    b'\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03'
    b'\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03'
    b'\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04'
    b'\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1'
    b'\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFG'
    b'HIJKLMNOPQRSTUVWXYZ\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb\xce'
    b'\xff\xd9'
)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@patch("app.backend.main.classify_image", return_value=MOCK_CLASSIFICATION)
def test_upload_returns_record(mock_classify):
    """Upload an image and verify the returned record has expected fields."""
    response = client.post(
        "/upload",
        files={"file": ("test.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")}
    )
    assert response.status_code == 200
    record = response.json()
    assert record["garment_type"] == "dress"
    assert record["location"]["city"] == "Paris"
    assert record["season"] == "summer"
    assert "id" in record
    assert "created_at" in record
    return record["id"]


@patch("app.backend.main.classify_image", return_value=MOCK_CLASSIFICATION)
def test_upload_then_appears_in_get_images(mock_classify):
    """Upload an image, then verify it appears in GET /images."""
    upload_response = client.post(
        "/upload",
        files={"file": ("test.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")}
    )
    assert upload_response.status_code == 200
    record_id = upload_response.json()["id"]

    list_response = client.get("/images")
    assert list_response.status_code == 200
    ids = [r["id"] for r in list_response.json()]
    assert record_id in ids


@patch("app.backend.main.classify_image", return_value=MOCK_CLASSIFICATION)
def test_upload_then_filter_by_city(mock_classify):
    """Upload an image classified as Paris, then filter by city=Paris."""
    upload_response = client.post(
        "/upload",
        files={"file": ("test.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")}
    )
    record_id = upload_response.json()["id"]

    filter_response = client.get("/images?city=Paris")
    assert filter_response.status_code == 200
    paris_ids = [r["id"] for r in filter_response.json()]
    assert record_id in paris_ids


@patch("app.backend.main.classify_image", return_value=MOCK_CLASSIFICATION)
def test_upload_then_search_finds_it(mock_classify):
    """Upload image, then search for a word in its description."""
    client.post(
        "/upload",
        files={"file": ("test.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")}
    )
    search_response = client.get("/images?q=striped")
    assert search_response.status_code == 200
    assert len(search_response.json()) >= 1


@patch("app.backend.main.classify_image", return_value=MOCK_CLASSIFICATION)
def test_patch_annotations(mock_classify):
    """Upload image, patch annotations, verify they are saved and searchable."""
    upload_response = client.post(
        "/upload",
        files={"file": ("test.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")}
    )
    record_id = upload_response.json()["id"]

    patch_response = client.patch(
        f"/images/{record_id}",
        json={"annotations": "great layering piece", "annotation_tags": ["layering", "summer"]}
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["annotations"] == "great layering piece"

    # Annotations must be searchable
    search_response = client.get("/images?q=layering")
    assert search_response.status_code == 200
    ids = [r["id"] for r in search_response.json()]
    assert record_id in ids


def test_get_filters_returns_dict():
    """GET /images/filters returns a dict with expected keys."""
    response = client.get("/images/filters")
    assert response.status_code == 200
    data = response.json()
    for key in ["garment_type", "style", "occasion", "season", "continent", "country", "city", "year", "month"]:
        assert key in data


def test_upload_rejects_non_image():
    """Non-image file type returns 400."""
    response = client.post(
        "/upload",
        files={"file": ("test.txt", io.BytesIO(b"hello"), "text/plain")}
    )
    assert response.status_code == 400
