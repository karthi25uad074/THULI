from app.services.ml_service import predict_flood_risk
from app.risk_engine.eta import calculate_eta


def calculate_thuli_risk(weather, terrain, soil, river):
    # ML Prediction
    result = predict_flood_risk(
        rainfall_mm=weather["rain"],
        forecast_mm=weather["forecast_rain"],
        soil_moisture=soil["moisture"],
        elevation_m=terrain["elevation"],
        slope_deg=terrain["slope"],
        river_distance_km=river["distance_km"],
        temperature_c=weather["temperature"],
        river_level=river["level"],
    )

    # AI Confidence
    confidence = min(95, round(result["risk"] + 8))

    # Explainable AI Reasons
    reasons = []

    if weather["rain"] > 10:
        reasons.append("Heavy current rainfall")

    if weather["forecast_rain"] > 20:
        reasons.append("Heavy upcoming rainfall")

    if terrain["slope"] >= 30:
        reasons.append("Steep terrain")

    if river["distance_km"] <= 1:
        reasons.append("Very close to river")

    if soil["moisture"] >= 0.30:
        reasons.append("High soil moisture")

    # ETA Calculation
    eta = calculate_eta(
        distance_km=river["distance_km"],
        rainfall_mm=weather["rain"],
        slope_deg=terrain["slope"],
        river_level=river["level"],
    )

    # SAFE-na ETA kaatta vendam
    if result["level"] == "SAFE":
        result["eta_minutes"] = None
        result["arrival_status"] = "No immediate flood arrival expected."
    else:
        result["eta_minutes"] = eta
        result["arrival_status"] = (
            f"Flood may reach this area in approximately {eta} minutes."
        )

    # Final response
    result["confidence"] = confidence
    result["reasons"] = reasons

    return result