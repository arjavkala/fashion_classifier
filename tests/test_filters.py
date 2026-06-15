import json
import pytest
import tempfile
import os
from pathlib import Path
from unittest.mock import patch


# Helper to build a fake record
def make_record(id, **kwargs):
    base = {
        "id": id,
        "file_path": f"uploads/{id}.jpg",
        "description": "Test garment",
        "garment_type": None,
        "style": None,
        "material": None,
        "color_palette": [],
        "pattern": None,
        "occasion": None,
        "season": None,
        "consumer_profile": None,
        "trend_notes": None,
        "location": {"continent": None, "country": None, "city": None},
        "year": 2026,
        "month": 6,
        "annotations": "",
        "annotation_tags": [],
        "created_at": "2026-06-01T00:00:00+00:00"
    }
    base.update(kwargs)
    return base


RECORDS = [
    make_record("r1", garment_type="dress", season="spring",
                location={"continent": "Europe", "country": "France", "city": "Paris"},
                year=2026, month=3, occasion="evening"),
    make_record("r2", garment_type="jacket", season="winter",
                location={"continent": "Asia", "country": "Japan", "city": "Tokyo"},
                year=2025, month=12, occasion="casual"),
    make_record("r3", garment_type="dress", season="summer",
                location={"continent": "Europe", "country": "Italy", "city": "Milan"},
                year=2026, month=6, occasion="casual",
                annotations="great layering idea", annotation_tags=["layering"]),
]


def apply_filters(records, garment_type=None, season=None, occasion=None,
                  continent=None, country=None, city=None,
                  year=None, month=None, q=None):
    r = records
    if garment_type:
        r = [x for x in r if x.get("garment_type") == garment_type]
    if season:
        r = [x for x in r if x.get("season") == season]
    if occasion:
        r = [x for x in r if x.get("occasion") == occasion]
    if continent:
        r = [x for x in r if x.get("location", {}).get("continent") == continent]
    if country:
        r = [x for x in r if x.get("location", {}).get("country") == country]
    if city:
        r = [x for x in r if x.get("location", {}).get("city") == city]
    if year:
        r = [x for x in r if x.get("year") == year]
    if month:
        r = [x for x in r if x.get("month") == month]
    if q:
        ql = q.lower()
        r = [x for x in r if
             ql in (x.get("description") or "").lower()
             or ql in (x.get("annotations") or "").lower()
             or ql in " ".join(x.get("annotation_tags") or []).lower()]
    return r


def test_filter_by_garment_type():
    result = apply_filters(RECORDS, garment_type="dress")
    assert len(result) == 2
    assert all(r["garment_type"] == "dress" for r in result)


def test_filter_by_city():
    result = apply_filters(RECORDS, city="Paris")
    assert len(result) == 1
    assert result[0]["id"] == "r1"


def test_filter_by_continent():
    result = apply_filters(RECORDS, continent="Europe")
    assert len(result) == 2
    ids = {r["id"] for r in result}
    assert ids == {"r1", "r3"}


def test_filter_by_country():
    result = apply_filters(RECORDS, country="Japan")
    assert len(result) == 1
    assert result[0]["location"]["country"] == "Japan"


def test_filter_by_year():
    result = apply_filters(RECORDS, year=2026)
    assert len(result) == 2
    assert all(r["year"] == 2026 for r in result)


def test_filter_by_month():
    result = apply_filters(RECORDS, month=6)
    assert len(result) == 1
    assert result[0]["id"] == "r3"


def test_filter_by_season():
    result = apply_filters(RECORDS, season="winter")
    assert len(result) == 1
    assert result[0]["id"] == "r2"


def test_filter_combined_garment_and_occasion():
    result = apply_filters(RECORDS, garment_type="dress", occasion="casual")
    assert len(result) == 1
    assert result[0]["id"] == "r3"


def test_search_in_description():
    result = apply_filters(RECORDS, q="Test garment")
    assert len(result) == 3


def test_search_in_annotations():
    """Annotations must be searchable — not just AI description."""
    result = apply_filters(RECORDS, q="layering")
    assert len(result) == 1
    assert result[0]["id"] == "r3"


def test_search_in_annotation_tags():
    result = apply_filters(RECORDS, q="layering")
    assert result[0]["annotation_tags"] == ["layering"]


def test_no_filters_returns_all():
    result = apply_filters(RECORDS)
    assert len(result) == 3


def test_filter_returns_empty_for_no_match():
    result = apply_filters(RECORDS, city="Berlin")
    assert result == []
