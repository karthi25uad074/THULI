import os
import ee
from google.oauth2 import service_account

_initialized = False

def init_earth_engine():
    global _initialized

    if _initialized:
        return

    credentials = service_account.Credentials.from_service_account_info({
        "type": "service_account",
        "project_id": os.getenv("GCP_PROJECT_ID"),
        "private_key": os.getenv("GCP_PRIVATE_KEY").replace("\\n", "\n"),
        "client_email": os.getenv("GCP_CLIENT_EMAIL"),
        "token_uri": "https://oauth2.googleapis.com/token",
    })

    ee.Initialize(credentials, project=os.getenv("GCP_PROJECT_ID"))
    _initialized = True