import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email.trim(), password);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">`n      <div className="auth-overlay-bg"></div>
      <div className="auth-overlay-bg"></div>
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-card">

        <div className="auth-logo">
          ??
        </div>

        <div className="auth-brand">
          <h1>THULI</h1>
          <span>AI FLOOD PREDICTION PLATFORM</span>
        </div>

        <div className="auth-heading">
          <p className="auth-label">WELCOME BACK</p>

          <h2>Login to THULI</h2>

          <p>
            Access real-time flood intelligence and
            geospatial risk monitoring.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            className="auth-primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Don't have an account?
          <Link to="/register"> Create Account</Link>
        </p>

        <button
          className="back-home-btn"
          type="button"
          onClick={() => navigate("/")}
        >
          ? Back to THULI
        </button>

      </div>
    </div>
  );
}

