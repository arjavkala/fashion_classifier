# Fashion Garment Classifier

AI-powered web app for fashion designers to upload, classify, search, and annotate inspiration imagery.

## Setup

1. Clone the repo and navigate to the project folder
2. Copy `.env.example` to `.env` and add your Anthropic API key
3. Install backend dependencies: `pip install -r requirements.txt`
4. Install frontend dependencies: `cd app/frontend && npm install`
5. Start backend: `uvicorn app.backend.main:app --reload` (from project root)
6. Start frontend: `cd app/frontend && npm run dev`
7. Open `http://localhost:5173`

## Architecture

```
Upload → classify_image() → save_image() → JSON file on disk
                                                  ↓
GET /images ← apply_filters() ← load_all() ← JSON files
```

**Storage:** JSON files on disk — zero setup, works for 100 images, swap to SQLite/Postgres by replacing storage.py.  
**AI:** Claude claude-sonnet-4-6 multimodal — structured JSON output via strict prompt, fallback on any failure.  
**Filters:** Dynamically generated from actual data via `get_filter_options()` — nothing hardcoded.

## Running Tests

```bash
pytest tests/ -v
```

## Running Eval

Add images to `eval/test_set/`, populate `eval/expected.json`, then:
```bash
python eval/eval.py
```

## Eval Results

| Attribute     | Accuracy | Notes |
|---------------|----------|-------|
| garment_type  | TBD      |       |
| style         | TBD      |       |
| occasion      | TBD      |       |
| season        | TBD      |       |
| pattern       | TBD      |       |
| material      | TBD      |       |
| color_palette | TBD      |       |

**Where the model performs well:** garment_type and color_palette have the strongest visual signal.  
**Where it struggles:** material (silk vs satin vs polyester are visually indistinct), location (only works when landmarks are visible).  
**Improvements with more time:** structured location input at upload, material as controlled-vocab dropdown, fine-tuned style taxonomy.

## Key Decisions

- **JSON files over SQLite** — zero schema migrations, trivially swappable, fast enough for 100 images
- **Flat schema** — all garment attributes are top-level keys for simple Python list-comprehension filtering
- **Claude over GPT-4o** — more reliable strict JSON output without needing function calling
- **No auth** — single-user local tool, out of scope for MVP

## What I'd Do Next

1. Migrate storage to SQLite (one migration script, same storage.py interface)
2. Add pgvector embeddings for semantic search ("show me something like this")
3. User-provided capture location at upload time (more reliable than model inference)
4. Batch upload support
5. Pagination on /images endpoint

## Known Limitations

- Material detection is unreliable — visually similar fabrics are hard to distinguish
- Location inference only works when landmarks or signage are visible
- No pagination (fine for 100 images, needed at 1000+)
- Single-user, no authentication
