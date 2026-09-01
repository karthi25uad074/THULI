import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  saveMonitoredLocation,
  getMonitoredLocation,
} from "../services/locationService";
import "../styles/dashboard.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null);
  const [monitoringStatus, setMonitoringStatus] = useState("Starting");

  useEffect(() => {
    async function initializeLocation() {
      const saved = await getMonitoredLocation();

      if (saved) {
        setLocation({
          latitude: saved.latitude,
          longitude: saved.longitude,
        });

        setMonitoringStatus("Active");
        setLastUpdated(new Date());
        setLocationLoading(false);
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
  async (position) => {
    const data = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    setLocation(data);

    await saveMonitoredLocation(
      data.latitude,
      data.longitude
    );

    setMonitoringStatus("Live Tracking");
    setLastUpdated(new Date());
    setLocationLoading(false);
  },
  () => {
    setMonitoringStatus("Permission Needed");
    setLocationLoading(false);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000,
  }
);

return () => {
  navigator.geolocation.clearWatch(watchId);
};
    }

    initializeLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    async function loadWeather() {
      try {
        setWeatherLoading(true);

        const res = await fetch(
          `http://localhost:5000/api/weather?lat=${location.latitude}&lon=${location.longitude}`
        );

        const result = await res.json();

        if (!result.success) return;

        setWeather(result.data);
      } finally {
        setWeatherLoading(false);
      }
    }

    loadWeather();
  }, [location]);

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Citizen";

  const rainRisk =
    weather?.rain >= 25
      ? "HIGH"
      : weather?.rain >= 10
      ? "MODERATE"
      : "LOW";

  return (
    <div className="dashboard-page">

      <div className="hero-bg"></div>

      {/* NAVBAR */}

      <header className="dashboard-navbar">

        <div className="dashboard-brand">

          <div className="brand-drop">
            💧
          </div>

          <div>
            <strong>THULI</strong>
            <span>FLOOD INTELLIGENCE</span>
          </div>

        </div>

       

      </header>

      <main className="dashboard-main">

        {/* HERO */}

        <section className="hero-panel">

          <div className="hero-left">

            <span className="hero-label">
              CITIZEN COMMAND CENTER
            </span>

            <h1>
              Welcome, {userName}
            </h1>

            <p>
              Your monitored area is continuously linked
              with THULI flood intelligence.
            </p>

            <div className="hero-actions">

             

            </div>

          </div>

          <div className="hero-right">

            <div className="status-pill">
              <span className="live-dot"></span>
              Monitoring {monitoringStatus}
            </div>

            <div className="time-card">

              <small>Last Updated</small>

              <strong>
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString()
                  : "--:--"}
              </strong>

            </div>

          </div>

        </section>

        {/* LIVE STATUS */}

        <section className="status-grid">

          <div className="status-card">
            <span>🌧</span>
            <small>Rainfall</small>

            <strong>
              {weatherLoading
                ? "..."
                : weather
                ? `${weather.rain} mm`
                : "--"}
            </strong>
          </div>

          <div className="status-card">
            <span>🌡</span>
            <small>Temperature</small>

            <strong>
              {weatherLoading
                ? "..."
                : weather
                ? `${weather.temperature}°C`
                : "--"}
            </strong>
          </div>

          <div className="status-card">
            <span>💧</span>
            <small>River</small>

            <strong>Monitoring</strong>
          </div>

          <div className="status-card">
            <span>⚠</span>
            <small>Flood Risk</small>

            <strong className={`risk-${rainRisk.toLowerCase()}`}>
              {rainRisk}
            </strong>
          </div>

        </section>

        {/* MAIN GRID */}

        <section className="dashboard-grid">

          {/* LOCATION */}

          <div className="dashboard-panel location-panel">

            <div className="panel-header">

              <span>📍</span>

              <div>
                <small>MONITORED AREA</small>
                <strong>Current Location</strong>
              </div>

            </div>

            {locationLoading ? (
              <p>Detecting location...</p>
            ) : location ? (
              <>
                <div className="coord-row">
                  <span>Latitude</span>
                  <strong>{location.latitude.toFixed(5)}</strong>
                </div>

                <div className="coord-row">
                  <span>Longitude</span>
                  <strong>{location.longitude.toFixed(5)}</strong>
                </div>
              </>
            ) : (
              <p>Location permission required.</p>
            )}
{location && (
  <div style={{ height: "180px", borderRadius: "16px", overflow: "hidden", marginTop: "16px" }}>
    <MapContainer
      center={[location.latitude, location.longitude]}
      zoom={15}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[location.latitude, location.longitude]} />
    </MapContainer>
  </div>
)}
            <button
              className="full-btn"
              onClick={() => {
                if (location) {
                  navigate(
                    `/risk-map?lat=${location.latitude}&lon=${location.longitude}`
                  );
                } else {
                  navigate("/risk-map");
                }
              }}
            >
              Open Risk Map
            </button>

          </div>

          {/* AI PANEL */}

          <div className="dashboard-panel ai-panel">

            <div className="panel-header">

              <span>🤖</span>

              <div>
                <small>THULI ASSISTANT</small>
                <strong>AI Copilot</strong>
              </div>

            </div>

            <p>
              Ask flood risk, weather insights and emergency guidance.
            </p>

            <button
              className="full-btn ai-btn"
              onClick={() => navigate("/ai-bot")}
            >
              Open AI Bot
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}