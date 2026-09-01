import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">`n      <div className="landing-overlay-bg"></div>
      <div className="landing-overlay"></div>
<div className="landing-overlay-bg"></div>
      <header className="landing-header">
        <div className="logo-box">
          <div className="logo-circle">💧</div>

          <div>
            <h1>THULI</h1>
            <p>AI Flood Prediction Platform</p>
          </div>
        </div>

        <button
          className="gov-btn"
          onClick={() => navigate("/government-login")}
        >
          Government Login
        </button>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">
            Smart India Hackathon 2026
          </span>

          <h2>
            Predict Before
            <br />
            Disaster Strikes.
          </h2>

          <p>
            AI-powered flash flood prediction system using rainfall forecast,
            river networks, terrain, weather and satellite intelligence.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
             <button
    className="secondary-btn"
    onClick={() => navigate("/risk-map")}
  >
    Risk Map
  </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>24×7</h3>
              <p>AI Monitoring</p>
            </div>

            <div className="stat-card">
              <h3>1h • 3h • 6h</h3>
              <p>Prediction Window</p>
            </div>

            <div className="stat-card">
              <h3>HydroRIVERS</h3>
              <p>Real River Network</p>
            </div>
          </div>
        </div>
      </main>

      <div className="floating-circle one"></div>
      <div className="floating-circle two"></div>
      <div className="floating-circle three"></div>
    </div>
  );
}





