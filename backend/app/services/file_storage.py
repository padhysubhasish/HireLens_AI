import os
import uuid

from app.core.config import get_settings

settings = get_settings()


def save_upload(file_bytes: bytes, original_filename: str) -> str:
    os.makedirs(settings.upload_dir, exist_ok=True)
    safe_name = f"{uuid.uuid4()}_{os.path.basename(original_filename)}"
    path = os.path.join(settings.upload_dir, safe_name)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return path
