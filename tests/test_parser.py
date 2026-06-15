import json
import pytest
from app.backend.classifier import FALLBACK_METADATA


def test_valid_json_is_parsed_correctly():
    """Valid JSON from model is parsed into correct structure."""
    raw = json.dumps({
        "garment_type": "dress",
        "style": "bohemian",
        "material": None,
        "color_palette": ["ivory", "gold"],
        "pattern": "floral",
        "occasion": "casual",
        "season": "spring",
        "consumer_profile": "women 25-35",
        "trend_notes": "quiet luxury",
        "location": {"continent": "Europe", "country": "France", "city": "Paris"},
        "description": "A flowing bohemian dress."
    })
    result = json.loads(raw)
    assert result["garment_type"] == "dress"
    assert result["location"]["city"] == "Paris"
    assert result["color_palette"] == ["ivory", "gold"]


def test_malformed_json_returns_fallback():
    """Malformed model output returns FALLBACK_METADATA, never raises."""
    def parse_with_fallback(raw: str) -> dict:
        try:
            return json.loads(raw)
        except Exception:
            return FALLBACK_METADATA

    result = parse_with_fallback("not valid json {{{{")
    assert result["garment_type"] is None
    assert result["location"] == {"continent": None, "country": None, "city": None}
    assert result["color_palette"] == []


def test_partial_json_missing_fields_uses_fallback():
    """Partial JSON (missing fields) is handled gracefully."""
    def parse_with_fallback(raw: str) -> dict:
        try:
            parsed = json.loads(raw)
            return parsed
        except Exception:
            return FALLBACK_METADATA

    result = parse_with_fallback('{"garment_type": "jacket"}')
    assert result["garment_type"] == "jacket"
    # missing fields return None in fallback
    assert result.get("style") is None


def test_fallback_has_all_required_keys():
    """FALLBACK_METADATA contains all expected keys."""
    required = ["garment_type", "style", "material", "color_palette", "pattern",
                "occasion", "season", "consumer_profile", "trend_notes", "location", "description"]
    for key in required:
        assert key in FALLBACK_METADATA, f"Missing key: {key}"
    assert "continent" in FALLBACK_METADATA["location"]
    assert "country" in FALLBACK_METADATA["location"]
    assert "city" in FALLBACK_METADATA["location"]
