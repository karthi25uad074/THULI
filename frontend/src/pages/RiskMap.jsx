import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/risk-map.css";
import "leaflet.heat";
import { GeoJSON } from "react-leaflet";
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const userIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/* ---------------- WEATHER ---------------- */

async function fetchRealWeather(
  latitude,
  longitude,
  setWeather,
  setLoading,
  setError
) {
  try {
    setLoading(true);
    setError("");

    const res = await fetch(
      `${API_URL}/api/weather`
    );

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message);
    }

    setWeather(result.data);
  } catch (err) {
    setWeather(null);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

async function fetchElevation(latitude, longitude) {
  const res = await fetch(
    `${API_URL}/api/elevation`
  );

  const result = await res.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result;
}
async function fetchSoilMoisture(latitude, longitude) {
  const res = await fetch(
    `${API_URL}/api/soil`
  );

  const result = await res.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result;
}

async function fetchRiverGauge(latitude, longitude) {
  const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const res = await fetch(
  `${API_URL}/api/risk-prediction?lat=${latitude}&lon=${longitude}`
);

  // Backend error na exact message kaatu
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend Error (${res.status}): ${text}`);
  }

  const result = await res.json();

  if (!result || !result.success || !result.river) {
    throw new Error("Invalid river response from backend");
  }

  return result.river;
}
async function fetchRiverGeometry(latitude, longitude) {
  const res = await fetch(
  `${API_URL}/api/river-geometry?lat=${lat}&lon=${lon}`
);

  const result = await res.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.river;
}
/* ---------------- MY LOCATION BUTTON ---------------- */

function LocateUser({ onLocation, onWeather }) {
  const map = useMap();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      L.DomEvent.disableClickPropagation(buttonRef.current);
      L.DomEvent.disableScrollPropagation(buttonRef.current);
    }
  }, []);

  const locate = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        onLocation({ latitude, longitude });

        map.flyTo([latitude, longitude], 13, {
          duration: 1.4,
        });

        await onWeather(latitude, longitude);
      
      },
      () => alert("Location permission required."),
      {
        enableHighAccuracy: true,
      }
    );
  };

  return (
    <button
      ref={buttonRef}
      className="location-button"
      onClick={(e) => {
        e.stopPropagation();
        locate();
      }}
    >
      📍 My Location
    </button>
  );
}

/* ---------------- MAP CLICK ---------------- */

function SelectLocation({ onLocation, onWeather }) {
  useMapEvents({
    click: async (e) => {
      const latitude = e.latlng.lat;
      const longitude = e.latlng.lng;

      onLocation({
        latitude,
        longitude,
      });

      await onWeather(latitude, longitude);
    },
  });

  return null;
}

/* ---------------- SEARCH FLY ---------------- */

function FlyToLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(
        [location.latitude, location.longitude],
        13,
        {
          duration: 1.4,
        }
      );
    }
  }, [location, map]);
  

  return null;
}

function RiverOverlay({ river, visible }) {
  const map = useMap();

  useEffect(() => {
    if (!visible || !river?.geometry) return;

    const { type, coordinates } = river.geometry;
    let layer = null;

    // LineString (normal case)
    if (type === "LineString") {
      layer = L.polyline(
        coordinates.map(([lon, lat]) => [lat, lon]),
        {
          color: "#2563EB",
          weight: 5,
          opacity: 0.95,
        }
      ).addTo(map);
    }

    // MultiLineString (fallback)
    else if (type === "MultiLineString") {
      layer = L.polyline(
        coordinates.flat().map(([lon, lat]) => [lat, lon]),
        {
          color: "#2563EB",
          weight: 5,
          opacity: 0.95,
        }
      ).addTo(map);
    }

    return () => {
      if (layer) map.removeLayer(layer);
    };
  }, [river, visible, map]);

  return null;
}

//export default RiverOverlay;
function RainHeatLayer({ weather }) {
  const map = useMap();

  useEffect(() => {
    if (!weather?.forecast) return;

    const lat = weather.latitude;
    const lon = weather.longitude;

    const heatPoints = weather.forecast.map((f, index) => [
      lat + (index - 12) * 0.002,
      lon + (index - 12) * 0.002,
      Math.min(f.precipitation / 25, 1),
    ]);

    const layer = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 12,
      gradient: {
        0.2: "#22c55e",
        0.4: "#eab308",
        0.7: "#f97316",
        1.0: "#dc2626",
      },
    });

    layer.addTo(map);

    return () => map.removeLayer(layer);
  }, [weather, map]);

  return null;
}
function SoilOverlay({ soil, location, visible }) {
  const map = useMap();

  useEffect(() => {
    if (!visible || !soil || !location) return;

    const layers = [];
    const base = soil.moisture;

    // 5x5 raster around selected location
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        const lat = location.latitude + x * 0.004;
        const lon = location.longitude + y * 0.004;

        // small variation around real moisture value
        const value = Math.max(
          0,
          Math.min(0.6, base + (Math.random() - 0.5) * 0.06)
        );

        let color = "#A16207"; // Dry

        if (value >= 0.35) color = "#065F46";
        else if (value >= 0.20) color = "#16A34A";
        else if (value >= 0.10) color = "#84CC16";

        const rect = L.rectangle(
          [
            [lat - 0.002, lon - 0.002],
            [lat + 0.002, lon + 0.002],
          ],
          {
            color,
            fillColor: color,
            fillOpacity: 0.45,
            weight: 1,
          }
        );

        rect.addTo(map);
        layers.push(rect);
      }
    }

    return () => layers.forEach((l) => map.removeLayer(l));
  }, [soil, location, visible, map]);

  return null;
}
/* ====================================================== */

export default function RiskMap() {
  const [searchParams] = useSearchParams();

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  const initialLocation =
    Number.isFinite(lat) && Number.isFinite(lon)
      ? {
          latitude: lat,
          longitude: lon,
        }
      : null;
  const [userLocation, setUserLocation] = useState(null);

  const [weather, setWeather] = useState(null);

  const [weatherLoading, setWeatherLoading] =
    useState(false);

  const [weatherError, setWeatherError] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchLoading, setSearchLoading] =
    useState(false);
    const [showRainHeat, setShowRainHeat] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [elevation, setElevation] = useState(null);
const [slope, setSlope] = useState(null);
const [showTerrain, setShowTerrain] = useState(false);
const [soil, setSoil] = useState(null);
const [soilLoading, setSoilLoading] = useState(false);
const [showSoil, setShowSoil] = useState(false);
const [river, setRiver] = useState(null);
const [riverLoading, setRiverLoading] = useState(false);
const [riverGeometry, setRiverGeometry] = useState(null);
const [showRiver, setShowRiver] = useState(false);
useEffect(() => {
  if (!userLocation) return;

  fetchRealWeather(
    userLocation.latitude,
    userLocation.longitude,
    setWeather,
    setWeatherLoading,
    setWeatherError
  );
}, [userLocation]);
useEffect(() => {
  if (!userLocation) return;

  const loadTerrain = async () => {
    try {
      const terrain = await fetchElevation(
  userLocation.latitude,
  userLocation.longitude
);

setElevation(terrain.elevation);
setSlope(terrain.slope);
setSoilLoading(true);

const soilData = await fetchSoilMoisture(
  userLocation.latitude,
  userLocation.longitude
);

setSoil(soilData);
setSoilLoading(false);
setRiverLoading(true);

const riverData = await fetchRiverGauge(
  userLocation.latitude,
  userLocation.longitude
);

setRiver(riverData);
setRiverLoading(false);
const riverInfo = await fetchRiverGeometry(
  userLocation.latitude,
  userLocation.longitude
);

setRiverGeometry(riverInfo);
    } catch (err) {
      console.error("Elevation Error:", err);
    }
  };

  loadTerrain();
}, [userLocation]);

    const fetchSuggestions = async (query) => {
  if (!query.trim()) {
    setSuggestions([]);
    return;
  }

  try {
   const response = await fetch(
  `${API_URL}/api/search?q=${encodeURIComponent(query)}`
);

const result = await response.json();

if (!result.success) {
  throw new Error(result.message);
}

setSuggestions(result.data);
  } catch (err) {
    console.error(err);
  }
};

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);

     const res = await fetch(
 `${API_URL}/api/search`
);

const result = await res.json();

if (!result.success) {
  throw new Error(result.message);
}

const data = result.data;

      if (!data.length) {
        alert("Location not found.");
        return;
      }

      const latitude = Number(data[0].lat);
      const longitude = Number(data[0].lon);

      setUserLocation({
        latitude,
        longitude,
      });

      await fetchRealWeather(
        latitude,
        longitude,
        setWeather,
        setWeatherLoading,
        setWeatherError
      );
    } finally {
      setSearchLoading(false);
    }
  };
  const maxRain = weather?.forecast
  ? Math.max(...weather.forecast.map((f) => f.precipitation))
  : 0;

const rainRisk =
  maxRain >= 25
    ? "HIGH"
    : maxRain >= 10
    ? "MODERATE"
    : "LOW";

  return (
   <div className="risk-map-page">    
    
      
      {/* NAVBAR */}

      <header className="risk-navbar">

        <div className="risk-brand">

          <div className="risk-brand-mark">
            💧
          </div>

          <div>
            <strong>THULI</strong>

            <span>FLOOD INTELLIGENCE</span>
          </div>

        </div>

        <div className="risk-nav-status">
          <span className="live-dot"></span>
          REAL-TIME MODE
        </div>

      </header>

      <main className="risk-layout">

        {/* SIDEBAR */}

        <aside className="risk-sidebar">

          <div className="sidebar-header">

            <span>THULI INTELLIGENCE</span>

            <h1>Risk Map</h1>

            <p>
              Real-time geospatial monitoring
              for flood and landslide analysis.
            </p>

          </div>

          <div className="analysis-card">

            <div className="analysis-label">
              SELECTED LOCATION
            </div>
{/* TERRAIN CARD */}

<div className="analysis-card">

  <div className="analysis-label">
    ⛰ TERRAIN ANALYSIS
  </div>

  {elevation !== null ? (
    <>
      <div className="coordinate-row">
        <span>Elevation</span>
        <strong>{elevation} m</strong>
      </div>

      <div className="coordinate-row">
        <span>Slope</span>
        <strong>{slope}°</strong>
      </div>

      <div className="coordinate-row">
        <span>Terrain</span>
        <strong>
          {elevation > 1200
            ? "Mountain"
            : elevation > 400
            ? "Hill"
            : "Plain"}
        </strong>
      </div>

      <div
        className={`terrain-badge ${
          slope >= 30
            ? "high"
            : slope >= 15
            ? "medium"
            : "low"
        }`}
      >
        {slope >= 30
          ? "Steep Terrain"
          : slope >= 15
          ? "Moderate Terrain"
          : "Gentle Terrain"}
      </div>
    </>
  ) : (
    <p>Select a location.</p>
  )}

</div>

{/* SOIL CARD */}

<div className="analysis-card">

  <div className="analysis-label">
    🌱 SOIL MOISTURE
  </div>

  {soilLoading && <p>Loading...</p>}

  {soil && (
    <>
      <div className="coordinate-row">
        <span>Moisture</span>
        <strong>{soil.moisture.toFixed(2)} m³/m³</strong>
      </div>

      <div className="coordinate-row">
        <span>Status</span>
        <strong>{soil.status}</strong>
      </div>

      <div className="coordinate-row">
        <span>Updated</span>
        <strong>{soil.time.slice(11,16)}</strong>
      </div>
    </>
  )}

</div>

{/* RIVER CARD */}

<div className="analysis-card">

  <div className="analysis-label">
    💧 RIVER GAUGE
  </div>

  {riverLoading && <p>Loading...</p>}

  {river && (
    <>
      {riverGeometry && (
        <>
          <div className="coordinate-row">
            <span>Nearest River</span>
            <strong>{river?.river || "Detecting..."}</strong>
          </div>

          <div className="coordinate-row">
            <span>Distance</span>
            <strong>{river ? `${river.distance_km} km` : "--"}</strong>
          </div>
        </>
      )}

      <div className="coordinate-row">
        <span>Discharge</span>
        <strong>{river.gauge_m} m</strong>
      </div>

      <div className="coordinate-row">
        <span>Status</span>
        <strong>
  {river.level === 3
    ? "HIGH"
    : river.level === 2
    ? "MODERATE"
    : "SAFE"}
</strong>
      </div>

      <div className="coordinate-row">
        <span>Updated</span>
        <strong>Live</strong>
      </div>

      <div
  className={`terrain-badge ${
    river.level === 3
      ? "high"
      : river.level === 2
      ? "medium"
      : "low"
  }`}
>
  {river.level === 3
    ? "High River Level"
    : river.level === 2
    ? "Moderate River Level"
    : "Safe River Level"}
</div>
    </>
  )}

</div>
            {userLocation ? (
              <>
                <div className="coordinate-row">
                  <span>Latitude</span>
                  <strong>{userLocation.latitude.toFixed(6)}</strong>
                </div>

                <div className="coordinate-row">
                  <span>Longitude</span>
                  <strong>{userLocation.longitude.toFixed(6)}</strong>
                </div>
              </>
            ) : (
              <div className="location-empty">
                📍 Choose a location
              </div>
            )}

          </div>
          <div className="analysis-card weather-card">

  <div className="analysis-label">
    🌤 LIVE WEATHER
  </div>

  {weatherLoading && <p>Loading weather...</p>}
  {weatherError && <p>{weatherError}</p>}

  {weather && (
    <>
      <div className="weather-hero">
        <div className="weather-temp">
          {weather.temperature}°
        </div>

        <div className="weather-meta">
          <strong>Current Conditions</strong>
          <span>{weather.observationTime}</span>
        </div>
      </div>

      <div className="weather-grid">
        <div className="mini-weather-card">
          <span>🌧</span>
          <small>Rain</small>
          <strong>{weather.rain} mm</strong>
        </div>

        <div className="mini-weather-card">
          <span>💧</span>
          <small>Humidity</small>
          <strong>{weather.humidity}%</strong>
        </div>

        <div className="mini-weather-card">
          <span>🌬</span>
          <small>Wind</small>
          <strong>{weather.windSpeed} km/h</strong>
        </div>

        <div className="mini-weather-card">
          <span>🕒</span>
          <small>Updated</small>
          <strong>{weather.observationTime}</strong>
        </div>
      </div>

      <div className={`risk-chip ${rainRisk.toLowerCase()}`}>
        {rainRisk} RAIN RISK
      </div>

      <div className="data-source">
        SOURCE · {weather.source}
      </div>

      {weather.forecast && (
        <>
          <div className="analysis-label" style={{ marginTop: "22px" }}>
            ⏰ NEXT 8 HOURS
          </div>

          <div className="hourly-grid">
            {weather.forecast.slice(0,8).map((item,i)=>(
              <div key={i} className="hour-card">
                <strong>{item.time.slice(11,16)}</strong>
                <span>{item.temperature}°</span>
                <small>{item.precipitation} mm</small>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )}

</div>

{weather?.forecast && (
<div className="forecast-card">

    <div className="analysis-label">
      NEXT 24 HOURS
    </div>

    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={weather.forecast}>
        <XAxis
          dataKey="time"
          tickFormatter={(t) => t.slice(11, 16)}
        />

        <YAxis />

        <Tooltip />

        <Area
          dataKey="precipitation"
          stroke="#0EA5E9"
          fill="#7DD3FC"
        />
      </AreaChart>
    </ResponsiveContainer>

  </div>
)}

         

        </aside>

        {/* MAP */}

        <section className="map-section">

          <div className="map-toolbar">

            <div className="map-title">
              <span>GEOSPATIAL MONITORING</span>
              <strong>South India</strong>
            </div>

            <div className="search-box">

              <input
                value={searchQuery}
                placeholder="Search village, city, river or hill..."
                onChange={(e) => {
  const value = e.target.value;
  setSearchQuery(value);
  fetchSuggestions(value);
}}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    searchLocation();
                }}
              />

             {suggestions.length > 0 && (
  <div className="search-suggestions">
    {suggestions.map((item) => (
      <div
        key={item.place_id}
        className="suggestion-item"
        onClick={async () => {
          const latitude = Number(item.lat);
          const longitude = Number(item.lon);

          setSearchQuery(item.display_name);
          setSuggestions([]);

          setUserLocation({
            latitude,
            longitude,
          });

          await fetchRealWeather(
            latitude,
            longitude,
            setWeather,
            setWeatherLoading,
            setWeatherError
          );
        }}
      >
        📍 {item.display_name}
      </div>
    ))}
  </div>
)}

            </div>

          </div>

         <MapContainer
  center={
    userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : [10.8505, 76.2711]
  }
  zoom={userLocation ? 13 : 7}
  scrollWheelZoom
  className="thuli-map"
>

          
<TileLayer
  key={showTerrain ? "terrain" : "osm"}
  attribution={
    showTerrain
      ? "&copy; OpenTopoMap"
      : "&copy; OpenStreetMap"
  }
  url={
    showTerrain
      ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  }
/>


            <LocateUser
              onLocation={setUserLocation}
              onWeather={(lat, lon) =>
                fetchRealWeather(
                  lat,
                  lon,
                  setWeather,
                  setWeatherLoading,
                  setWeatherError
                )
              }
            />

            <FlyToLocation location={userLocation} />

            <SelectLocation
              onLocation={setUserLocation}
              onWeather={(lat, lon) =>
                fetchRealWeather(
                  lat,
                  lon,
                  setWeather,
                  setWeatherLoading,
                  setWeatherError
                )
              }
            />
          <RiverOverlay
  river={riverGeometry}
  visible={showRiver}
/>
           {showRainHeat && <RainHeatLayer weather={weather} />}
           <SoilOverlay
  soil={soil}
  location={userLocation}
  visible={showSoil}
/>
            {userLocation && (
              <Marker
                position={[
                  userLocation.latitude,
                  userLocation.longitude,
                ]}
                icon={userIcon}
              >
               {river && (
  <>
    <hr />
    <strong>💧 River Gauge</strong>
    <br />
    Discharge: {river.discharge ?? "--"} m³/s
    <br />
    Status: {river.level}
    {riverGeometry && (
  <>
    <div className="coordinate-row">
      <span>Nearest River</span>
     <strong>{river.river}</strong>
    </div>

    <div className="coordinate-row">
      <span>Distance</span>
      <strong>{river.distance_km} km</strong>
    </div>
  </>
)}
  </>
)}
               <Popup>
  <strong>💧 THULI River Analysis</strong>

  <br />
  <br />

  <strong>River:</strong>{" "}
  {riverGeometry?.name || "River network"}

  <br />

  <strong>Distance:</strong>{" "}
  {riverGeometry?.distance ?? "--"} km

  <br />
  <br />

  <strong>Latitude:</strong>{" "}
  {userLocation.latitude.toFixed(5)}

  <br />

  <strong>Longitude:</strong>{" "}
  {userLocation.longitude.toFixed(5)}

  {river && (
    <>
      <hr />

      <strong>River Gauge</strong>

      <br />

      <strong>Discharge:</strong>{" "}
      {river.discharge ?? "--"} m³/s

      <br />

      <strong>Status:</strong>{" "}
      {river.level}
    </>
  )}
</Popup>
              </Marker>
            )}

          </MapContainer>
          {showSoil && (
  <div className="soil-legend">
    <h4>Soil Moisture</h4>

    <div><span className="soil-dot saturated"></span> Saturated</div>
    <div><span className="soil-dot wet"></span> Wet</div>
    <div><span className="soil-dot moist"></span> Moist</div>
    <div><span className="soil-dot dry"></span> Dry</div>
  </div>
)}

          <div className="rain-legend">

  <strong>Rainfall Intensity</strong>

  <div><span className="green"></span> Light</div>

  <div><span className="yellow"></span> Moderate</div>

  <div><span className="orange"></span> Heavy</div>

  <div><span className="red"></span> Extreme</div>

</div>
<div className="layer-toggle-panel">
  <button
    className={`layer-toggle-btn ${showRainHeat ? "active" : ""}`}
    onClick={() => setShowRainHeat(!showRainHeat)}
  >
   🥵 Heat Wave
  </button>

 <button
  className={`layer-toggle-btn ${showTerrain ? "active" : ""}`}
  onClick={() => setShowTerrain(!showTerrain)}
>
  ⛰️ SRTM Elevation
</button>
  <button
  className={`layer-toggle-btn ${showSoil ? "active" : ""}`}
  onClick={() => setShowSoil(!showSoil)}
>
  🌱 Soil Moisture
</button>
 <button
  className={`layer-toggle-btn ${showRiver ? "active" : ""}`}
  onClick={() => setShowRiver(!showRiver)}
>
  💧 River Gauge
</button>
</div>
          

        </section>

      </main>

    </div>
  );
}
