import requests

URL = "https://api.open-meteo.com/v1/forecast"


def get_weather_data(lat, lon):
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,rain,wind_speed_10m",
        "hourly": "temperature_2m,precipitation",
        "forecast_days": 1,
    }

    try:
        response = requests.get(URL, params=params, timeout=20)
        response.raise_for_status()

        data = response.json()

        current = data.get("current", {})
        hourly = data.get("hourly", {})

        forecast = []

        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        rain = hourly.get("precipitation", [])

        for i in range(min(24, len(times))):
            forecast.append(
                {
                    "time": times[i],
                    "temperature": temps[i],
                    "precipitation": rain[i],
                }
            )

        return {
            "temperature": current.get("temperature_2m", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "windSpeed": current.get("wind_speed_10m", 0),
            "rain": current.get("rain", 0),
            "forecast_rain": sum(rain[:24]) if rain else 0,
            "forecast": forecast,
            "observationTime": current.get("time", "--"),
            "source": "Open-Meteo",
            "latitude": lat,
            "longitude": lon,
        }

    except requests.exceptions.HTTPError as e:
        if e.response is not None and e.response.status_code == 429:
            return {
                "temperature": 0,
                "humidity": 0,
                "windSpeed": 0,
                "rain": 0,
                "forecast_rain": 0,
                "forecast": [],
                "observationTime": "--",
                "source": "Open-Meteo (Rate Limited)",
                "latitude": lat,
                "longitude": lon,
            }
        raise

    except Exception:
        return {
            "temperature": 0,
            "humidity": 0,
            "windSpeed": 0,
            "rain": 0,
            "forecast_rain": 0,
            "forecast": [],
            "observationTime": "--",
            "source": "Weather Unavailable",
            "latitude": lat,
            "longitude": lon,
        }