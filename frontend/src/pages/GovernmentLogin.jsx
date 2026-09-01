import { useNavigate } from "react-router-dom";

export default function GovernmentLogin() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#031926",
        color: "white",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>THULI Government Portal</h1>
        <p>District Collector • Revenue • Disaster Management Login</p>

        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            background: "#14b8a6",
            color: "white",
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}