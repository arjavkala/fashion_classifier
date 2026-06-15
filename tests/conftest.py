import pytest


@pytest.fixture(autouse=True)
def isolated_uploads(tmp_path, monkeypatch):
    """Redirect all storage operations to a temp directory so tests never touch uploads/."""
    import app.backend.storage as storage
    monkeypatch.setattr(storage, "UPLOAD_DIR", tmp_path)
    tmp_path.mkdir(exist_ok=True)
    yield tmp_path
