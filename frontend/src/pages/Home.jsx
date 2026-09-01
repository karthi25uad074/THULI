import {
  ArrowRight,
  ChevronRight,
  CloudRain,
  Droplets,
  Mountain,
  ShieldCheck,
  Waves,
  Zap,
} from "lucide-react";
import "../styles/home.css";
import { Link } from "react-router-dom";

const dataSources = [
  {
    icon: CloudRain,
    name: "IMD Rainfall",
    description: "Rainfall intensity and historical precipitation patterns",
  },
  {
    icon: Mountain,
    name: "NASA SRTM",
    description: "Elevation, slope and terrain intelligence",
  },
  {
    icon: Waves,
    name: "River Gauges",
    description: "Water-level trends and rising river conditions",
  },
  {
    icon: Droplets,
    name: "Soil Moisture",
    description: "Ground saturation and runoff potential",
  },
];

const capabilities = [
  "Multi-source environmental intelligence",
  "AI-powered flash flood risk prediction",
  "Village-level vulnerability identification",
  "Early warning for citizens and authorities",
  "Safe evacuation and rescue route intelligence",
];

function Home() {
  return (
    <main className="thuli-home">
      {/* NAVBAR */}
      <nav className="thuli-navbar">
        <div className="thuli-brand">
          <div className="brand-mark">
            <Droplets size={18} strokeWidth={2.4} />
          </div>

          <div>
            <span className="brand-name">THULI</span>
            <span className="brand-subtitle">FLOOD INTELLIGENCE</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#intelligence">Intelligence</a>
          <a href="#data">Data Sources</a>
          <a href="#how-it-works">How It Works</a>
        </div>

        <button className="nav-button">
          Authority Portal
          <ArrowRight size={16} />
        </button>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-grid" />

        <div className="hero-content">
          <div className="status-pill">
            <span className="status-dot" />
            SOUTH INDIA FLOOD INTELLIGENCE
          </div>

          <h1>
            Predict the flood.
            <br />
            <span>Protect what matters.</span>
          </h1>

          <p className="hero-description">
            THULI transforms rainfall, terrain, soil, river and weather data
            into intelligent early warnings for vulnerable hilly communities.
          </p>

          <div className="hero-actions">
            <Link to="/risk-map" className="primary-button">
  Explore Risk Map
              <ArrowRight size={18} />
            
</Link>

            <button className="secondary-button">
              Citizen Safety
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="hero-note">
            <ShieldCheck size={15} />
            Built for Kerala & Tamil Nadu's hilly regions
          </div>
        </div>

        {/* INTELLIGENCE VISUAL */}
        <div className="hero-visual">
          <div className="radar-glow" />

          <div className="terrain-orb">
            <div className="orb-ring ring-one" />
            <div className="orb-ring ring-two" />
            <div className="orb-ring ring-three" />

            <div className="terrain-core">
              <Mountain size={58} strokeWidth={1.1} />
              <span>THULI</span>
              <small>LIVE INTELLIGENCE</small>
            </div>

            <div className="signal signal-one">
              <span />
              RAINFALL
            </div>

            <div className="signal signal-two">
              <span />
              TERRAIN
            </div>

            <div className="signal signal-three">
              <span />
              RIVER
            </div>
          </div>

          <div className="floating-card card-risk">
            <div className="card-label">CURRENT RISK</div>
            <div className="risk-value">
              <span className="risk-dot" />
              MONITORING
            </div>
            <div className="card-location">Kerala • Tamil Nadu</div>
          </div>

          <div className="floating-card card-data">
            <div className="card-label">DATA STREAMS</div>
            <div className="data-number">06</div>
            <div className="card-location">Active sources</div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE STRIP */}
      <section className="intelligence-strip" id="intelligence">
        <div className="strip-item">
          <Zap size={18} />
          <div>
            <strong>DETECT</strong>
            <span>Environmental signals</span>
          </div>
        </div>

        <div className="strip-line" />

        <div className="strip-item">
          <Mountain size={18} />
          <div>
            <strong>PREDICT</strong>
            <span>AI flood risk</span>
          </div>
        </div>

        <div className="strip-line" />

        <div className="strip-item">
          <ShieldCheck size={18} />
          <div>
            <strong>PROTECT</strong>
            <span>People & villages</span>
          </div>
        </div>

        <div className="strip-line" />

        <div className="strip-item">
          <Waves size={18} />
          <div>
            <strong>RESPOND</strong>
            <span>Safer rescue routes</span>
          </div>
        </div>
      </section>

      {/* DATA SOURCES */}
      <section className="data-section" id="data">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MULTI-SOURCE INTELLIGENCE</span>
            <h2>
              One flood.
              <br />
              <span>Multiple signals.</span>
            </h2>
          </div>

          <p>
            THULI doesn't depend on a single measurement. It combines
            environmental signals to understand how flood risk is developing.
          </p>
        </div>

        <div className="source-grid">
          {dataSources.map((source) => {
            const Icon = source.icon;

            return (
              <article className="source-card" key={source.name}>
                <div className="source-icon">
                  <Icon size={21} strokeWidth={1.7} />
                </div>

                <div>
                  <h3>{source.name}</h3>
                  <p>{source.description}</p>
                </div>

                <ChevronRight className="source-arrow" size={17} />
              </article>
            );
          })}
        </div>

        <div className="source-footer">
          <span>+ Open-Meteo Forecast</span>
          <span>+ ISRO Bhuvan</span>
          <span>+ Historical Flood Records</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="workflow-section" id="how-it-works">
        <div className="workflow-heading">
          <span className="eyebrow">FROM DATA TO ACTION</span>
          <h2>
            Intelligence that
            <br />
            <span>moves before the water.</span>
          </h2>
        </div>

        <div className="workflow">
          <div className="workflow-step">
            <span>01</span>
            <div>
              <h3>Observe</h3>
              <p>
                THULI continuously analyses rainfall, terrain, soil, river and
                weather signals.
              </p>
            </div>
          </div>

          <div className="workflow-step">
            <span>02</span>
            <div>
              <h3>Predict</h3>
              <p>
                Machine learning estimates the probability and severity of
                flash-flood risk.
              </p>
            </div>
          </div>

          <div className="workflow-step">
            <span>03</span>
            <div>
              <h3>Localize</h3>
              <p>
                Risk is translated into actionable locations, villages and
                vulnerable zones.
              </p>
            </div>
          </div>

          <div className="workflow-step">
            <span>04</span>
            <div>
              <h3>Respond</h3>
              <p>
                Authorities and citizens receive understandable warnings and
                safer response options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITY */}
      <section className="capability-section">
        <div className="capability-panel">
          <div className="capability-copy">
            <span className="eyebrow">BUILT FOR DECISION MAKING</span>

            <h2>
              From scattered data
              <br />
              <span>to one clear decision.</span>
            </h2>

            <p>
              THULI turns complex environmental information into a simple
              operational picture for disaster-response teams.
            </p>

            <button className="primary-button">
              Enter THULI
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="capability-list">
            {capabilities.map((item, index) => (
              <div className="capability-item" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
                <ShieldCheck size={16} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="thuli-footer">
        <div className="footer-brand">
          <div className="brand-mark">
            <Droplets size={17} />
          </div>
          <span>THULI</span>
        </div>

        <p>Predict. Protect. Respond.</p>

        <span className="footer-meta">
          SIH26191 • Disaster Management
        </span>
      </footer>
    </main>
  );
}

export default Home;