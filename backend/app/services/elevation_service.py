import requests

def get_elevation_data(lat: float, lon: float):
    url = (
        "https://api.open-meteo.com/v1/elevation"
        f"?latitude={lat}&longitude={lon}"
    )

    response = requests.get(url, timeout=10)
    response.raise_for_status()

    data = response.json()

    elevation = data["elevation"][0]

    # Temporary slope estimation from elevation
    if elevation >= 1200:
        slope = 38
    elif elevation >= 600:
        slope = 28
    elif elevation >= 300:
        slope = 18
    else:
        slope = 8

    return {
        "elevation": elevation,
        "slope": slope,
    }