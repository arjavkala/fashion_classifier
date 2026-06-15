from pydantic import BaseModel
from typing import Optional

class Location(BaseModel):
    continent: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None

class ImageRecord(BaseModel):
    id: str
    file_path: str
    description: Optional[str] = None
    garment_type: Optional[str] = None
    style: Optional[str] = None
    material: Optional[str] = None
    color_palette: list[str] = []
    pattern: Optional[str] = None
    occasion: Optional[str] = None
    season: Optional[str] = None
    consumer_profile: Optional[str] = None
    trend_notes: Optional[str] = None
    location: Location = Location()
    year: Optional[int] = None
    month: Optional[int] = None
    annotations: str = ""
    annotation_tags: list[str] = []
    created_at: str

class AnnotationUpdate(BaseModel):
    annotations: str
    annotation_tags: list[str] = []

class FilterOptions(BaseModel):
    garment_type: list[str]
    style: list[str]
    material: list[str]
    occasion: list[str]
    season: list[str]
    pattern: list[str]
    continent: list[str]
    country: list[str]
    city: list[str]
    year: list[int]
    month: list[int]
