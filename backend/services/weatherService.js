async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m,precipitation,rain,wind_speed_10m` +
    `&forecast_hours=24` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather service request failed.");
  }

  const data = await response.json();

  const forecast = data.hourly.time.map((time, i) => ({
    time,
    temperature: data.hourly.temperature_2m[i],
    precipitation: data.hourly.precipitation[i],
    rain: data.hourly.rain[i],
    wind: data.hourly.wind_speed_10m[i],
  }));

  return {
    source: "Open-Meteo",
    latitude: data.latitude,
    longitude: data.longitude,
    observationTime: data.current.time,
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    rain: data.current.rain,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    timezone: data.timezone,
    forecast,
  };
}

module.exports = { getWeather };