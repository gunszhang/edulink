"""Environment-only model configuration; no credentials are embedded."""
import os

API_BASE_URL = os.getenv("EDULINK_API_BASE_URL", "https://api.deepseek.com/v1").rstrip("/")
API_KEY = os.getenv("DEEPSEEK_API_KEY", "").strip()
MODEL = os.getenv("EDULINK_MODEL", "deepseek-v4-flash").strip()
REASONING_EFFORT = os.getenv("EDULINK_REASONING_EFFORT", "medium").strip().lower()
