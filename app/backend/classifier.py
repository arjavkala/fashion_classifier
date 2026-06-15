import base64
import json
import logging
import os
from anthropic import Anthropic
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are a fashion analyst AI. Analyze the garment image provided and return ONLY valid JSON — no markdown fences, no explanation, no preamble. Return exactly this structure:

{
  "garment_type": "string or null",
  "style": "string or null",
  "material": "string or null",
  "color_palette": ["array", "of", "color", "strings"],
  "pattern": "string or null",
  "occasion": "string or null",
  "season": "string or null",
  "consumer_profile": "string or null",
  "trend_notes": "string or null",
  "location": {
    "continent": "string or null",
    "country": "string or null",
    "city": "string or null"
  },
  "description": "2-3 sentence natural language description of the garment"
}

Rules:
- Return null for any field you are not confident about.
- For material: only return a value if visually clear. Silk vs satin vs polyester are hard to distinguish — prefer null over wrong.
- For location: only infer from visible landmarks, signage, architecture, or street context. If unclear, return all nulls.
- For season: infer from clothing weight, layering, and visible environment.
- color_palette: list the 2-5 dominant colors as plain English words (e.g. "ivory", "forest green", "rust").
- occasion: one of casual, workwear, evening, athletic, formal, streetwear, or null.
- season: one of spring, summer, autumn, winter, or null.
- Your entire response must be parseable by json.loads(). Nothing else."""

FALLBACK_METADATA = {
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
    "description": "Classification unavailable — model returned unexpected output.",
}


def classify_image(image_bytes: bytes, media_type: str) -> dict:
    """
    Send image to Claude claude-sonnet-4-6 and return structured metadata dict.
    On ANY failure, returns FALLBACK_METADATA — never raises.
    """
    b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Classify this garment image and return JSON only.",
                        },
                    ],
                }
            ],
        )
        raw = response.content[0].text.strip()
        # Strip markdown fences if model adds them despite instructions
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as e:
        logger.warning("classify_image failed: %s", e)
        return FALLBACK_METADATA
