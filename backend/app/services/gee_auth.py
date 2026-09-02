import os
import json
from pathlib import Path

import ee
from google.oauth2 import service_account

_initialized = False


def init_earth_engine():
    global _initialized

    if _initialized:
        return

    key_path = Path("earth-engine-key.json")

    if key_path.exists():
        with open(key_path, "r", encoding="utf-8") as f:
            info = json.load(f)

        credentials = service_account.Credentials.from_service_account_info(
            info,
            scopes=[
                "https://www.googleapis.com/auth/earthengine",
                "https://www.googleapis.com/auth/cloud-platform",
            ],
        )

        ee.Initialize(credentials, project=info["project_id"])

    else:
        credentials = service_account.Credentials.from_service_account_info(
            {
                "type": "service_account",
                "project_id": os.getenv("GCP_PROJECT_ID"),
                "private_key": os.getenv("GCP_PRIVATE_KEY", "").replace("\\n", "\n"),
                "client_email": os.getenv("GCP_CLIENT_EMAIL"),
                "token_uri": "https://oauth2.googleapis.com/token",
            },
            scopes=[
                "https://www.googleapis.com/auth/earthengine",
                "https://www.googleapis.com/auth/cloud-platform",
            ],
        )

        ee.Initialize(credentials, project=os.getenv("GCP_PROJECT_ID"))

    _initialized = True