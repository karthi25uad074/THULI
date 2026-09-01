from pathlib import Path
import reverse_geocoder as rg

TILE_ROOT = Path(__file__).parent / "tiles"

STATE_MAP = {
    "Tamil Nadu": "TamilNadu",
    "Kerala": "Kerala",
    "Karnataka": "Karnataka",
    "Andhra Pradesh": "AndhraPradesh",
    "Telangana": "Telangana",
}


def get_state_from_location(lat: float, lon: float):
    result = rg.search((lat, lon))[0]
    state = result["admin1"]
    return STATE_MAP.get(state)


def get_tile_folder(lat: float, lon: float):
    state = get_state_from_location(lat, lon)
    if state is None:
        return None
    return TILE_ROOT / state