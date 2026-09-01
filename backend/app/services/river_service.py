import requests
from geopy.distance import geodesic

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def get_river_data(lat: float, lon: float):
    query = f"""
    [out:json][timeout:15];
    (
      way(around:5000,{lat},{lon})["waterway"="river"];
      way(around:5000,{lat},{lon})["waterway"="stream"];
    );
    out center tags;
    """

    try:
        response = requests.post(
            OVERPASS_URL,
            data=query,
            headers={"User-Agent": "THULI/1.0"},
            timeout=20,
        )
        response.raise_for_status()

        data = response.json()
        elements = data.get("elements", [])

        if not elements:
            return {
                "river": "No nearby river found",
                "hyriv_id": 0,
                "main_river_id": 0,
                "distance_km": 999,
                "gauge_m": 0,
                "level": 1,
            }

        nearest = None
        nearest_distance = float("inf")

        for item in elements:
            if "center" not in item:
                continue

            rlat = item["center"]["lat"]
            rlon = item["center"]["lon"]

            d = geodesic((lat, lon), (rlat, rlon)).km

            if d < nearest_distance:
                nearest_distance = d
                nearest = item

        river_name = nearest.get("tags", {}).get("name", "Unnamed River")

        return {
            "river": river_name,
            "hyriv_id": nearest["id"],
            "main_river_id": nearest["id"],
            "distance_km": round(nearest_distance, 2),
            "gauge_m": round(max(0.5, 4 - nearest_distance / 15), 2),
            "level": 3 if nearest_distance < 1 else 2 if nearest_distance < 5 else 1,
        }

    except Exception:
        return {
            "river": "River unavailable",
            "hyriv_id": 0,
            "main_river_id": 0,
            "distance_km": 999,
            "gauge_m": 0,
            "level": 1,
        }


def get_river_geometry(lat: float, lon: float):
    info = get_river_data(lat, lon)

    return {
        "name": info["river"],
        "distance": info["distance_km"],
        "geometry": None,
        "geometryType": None,
    }