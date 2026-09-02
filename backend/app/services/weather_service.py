import time
import requests

URL = "https://api.open-meteo.com/v1/forecast"

_cache = {}
CACHE_TIME = 300


def get_weather_data(lat, lon):
    key = f"{round(lat,3)}_{round(lon,3)}"

    now = time.time()

    if key in _cache:
        if now - _cache[key]["time"] < CACHE_TIME:
            return _cache[key]["data"]

    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,rain,wind_speed_10m",
        "hourly": "temperature_2m,precipitation",
        "forecast_days": 1,
    }

    response = requests.get(URL, params=params, timeout=20)
    response.raise_for_status()

    data = response.json()

    current = data["current"]
    hourly = data["hourly"]

    result = {
        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "windSpeed": current["wind_speed_10m"],
        "rain": current["rain"],
        "forecast_rain": sum(hourly["precipitation"][:24]),
        "forecast": [
            {
                "time": hourly["time"][i],
                "temperature": hourly["temperature_2m"][i],
                "precipitation": hourly["precipitation"][i],
            }
            for i in range(min(24, len(hourly["time"])))
        ],
        "observationTime": current["time"],
        "source": "Open-Meteo",
    }

    _cache[key] = {
        "time": now,
        "data": result,
    }

    return result