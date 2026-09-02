import requests

SOIL_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"

# Nearby offsets (approx 250m–1km)
OFFSETS = [
    (0, 0),
    (0.002, 0),
    (-0.002, 0),
    (0, 0.002),
    (0, -0.002),
    (0.004, 0),
    (-0.004, 0),
    (0, 0.004),
    (0, -0.004),
]


def get_soil_data(lat, lon):
    for dlat, dlon in OFFSETS:
        params = {
            "lat": lat + dlat,
            "lon": lon + dlon,
            "property": "wv0010",
            "depth": "0-5cm",
            "value": "mean",
        }

        response = requests.get(SOIL_URL, params=params, timeout=20)
        response.raise_for_status()

        data = response.json()

        layers = data.get("properties", {}).get("layers", [])
        if not layers:
            continue

        value = layers[0].get("depths", [{}])[0].get("values", {}).get("mean")

        if value is None:
            continue

        # SoilGrids conversion factor = divide by 10
        moisture = value / 10 / 100

        if moisture >= 0.35:
            status = "Saturated"
        elif moisture >= 0.20:
            status = "Wet"
        elif moisture >= 0.10:
            status = "Moist"
        else:
            status = "Dry"

        return {
            "moisture": round(moisture, 3),
            "status": status,
            "source": "ISRIC SoilGrids",
            "used_offset": {
                "lat": dlat,
                "lon": dlon
            }
        }

    raise Exception("No valid SoilGrids pixel found nearby.")