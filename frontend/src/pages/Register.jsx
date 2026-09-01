import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name: fullName.trim(),
        phone,
        email: email.trim(),
        password,
      });

      if (data?.session) {
        navigate("/dashboard");
        return;
      }

      setSuccess(
        "Account created successfully. Please check your email to verify your account."
      );
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">`n      <div className="auth-overlay-bg"></div>
      <div className="auth-overlay-bg"></div>
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-card register-card">

        <div className="auth-logo">
          ??
        </div>

        <div className="auth-brand">
          <h1>THULI</h1>
          <span>AI FLOOD PREDICTION PLATFORM</span>
        </div>

        <div className="auth-heading">
          <p className="auth-label">JOIN THULI</p>

          <h2>Create Account</h2>

          <p>
            Create your account to access THULI
            flood intelligence platform.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>

          <label>Full Name</label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />

          <label>Phone Number</label>

          <input
            type="tel"
            placeholder="Enter your 10-digit phone number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            inputMode="numeric"
            autoComplete="tel"
            maxLength="10"
            required
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button
            className="auth-primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Already have an account?
          <Link to="/login"> Login</Link>
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

