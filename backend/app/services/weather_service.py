import requests

def get_weather_data(lat: float, lon: float):
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}"
        f"&longitude={lon}"
        "&current=temperature_2m,rain"
        "&hourly=rain"
        "&forecast_days=1"
    )

    response = requests.get(url, timeout=10)
    response.raise_for_status()

    data = response.json()

    current = data["current"]
    hourly_rain = data["hourly"]["rain"]

    # Next 24 hours total rainfall
    forecast_rain = round(sum(hourly_rain), 2)

    return {
        "temperature": current["temperature_2m"],
        "rain": current["rain"],
        "forecast_rain": forecast_rain,
    }