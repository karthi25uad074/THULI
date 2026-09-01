import joblib
import numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).parent.parent / "models" / "flood_model.pkl"

model = joblib.load(MODEL_PATH)

def predict_flood_risk(
    rainfall_mm,
    forecast_mm,
    soil_moisture,
    elevation_m,
    slope_deg,
    river_distance_km,
    temperature_c,
    river_level
):
    features = np.array([[
        rainfall_mm,
        forecast_mm,
        soil_moisture,
        elevation_m,
        slope_deg,
        river_distance_km,
        temperature_c,
        river_level
    ]])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1] * 100

    if probability >= 80:
        level = "HIGH"
        eta = 15
    elif probability >= 60:
        level = "MODERATE"
        eta = 30
    elif probability >= 35:
        level = "LOW"
        eta = 60
    else:
        level = "SAFE"
        eta = None

    return {
        "risk": round(probability, 2),
        "level": level,
        "eta_minutes": eta,
        "prediction": int(prediction)
    }