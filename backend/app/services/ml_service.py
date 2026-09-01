from pathlib import Path
import joblib

MODEL_PATH = Path("app/models/flood_model.pkl")

model = None

# Model irundha load pannu, illa na fallback mode
if MODEL_PATH.exists():
    try:
        model = joblib.load(MODEL_PATH)
        print("ML model loaded successfully.")
    except Exception as e:
        print(f"ML model load failed: {e}")
        model = None


def predict_flood_risk(
    rainfall_mm,
    forecast_mm,
    soil_moisture,
    elevation_m,
    slope_deg,
    river_distance_km,
    temperature_c,
    river_level,
):
    # ---------- Real ML Model ----------
    if model is not None:
        features = [[
            rainfall_mm,
            forecast_mm,
            soil_moisture,
            elevation_m,
            slope_deg,
            river_distance_km,
            temperature_c,
            river_level,
        ]]

        probability = float(model.predict_proba(features)[0][1]) * 100

    # ---------- Fallback Rule Engine ----------
    else:
        probability = (
            rainfall_mm * 1.8
            + forecast_mm * 1.2
            + soil_moisture * 100 * 0.8
            + max(0, 5 - river_distance_km) * 8
            + river_level * 10
            + slope_deg * 0.3
        )

        probability = max(0, min(100, probability))

    # Risk level
    if probability >= 75:
        level = "HIGH"
    elif probability >= 40:
        level = "MODERATE"
    else:
        level = "SAFE"

    return {
        "risk": round(probability, 1),
        "level": level,
    }