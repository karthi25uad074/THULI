from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

from app.gis.terrain import get_dem_terrain
from app.services.weather_service import get_weather_data
from app.services.river_service import get_river_data, get_river_geometry
from app.services.ml_service import predict_flood_risk
from app.risk_engine.engine import calculate_thuli_risk

app = FastAPI(title="THULI AI Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://thuli-pk3r8bx2k-kcet-boys.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- HOME ----------------

@app.get("/")
async def home():
    return {"message": "THULI Backend Running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# ---------------- RISK PREDICTION ----------------

@app.get("/api/risk-prediction")
async def risk_prediction(
    lat: float = Query(...),
    lon: float = Query(...)
):
    weather = get_weather_data(lat, lon)
    terrain = get_dem_terrain(lat, lon)

    # Temporary soil value (real soil endpoint below)
    soil = {"moisture": 0.28}

    river = get_river_data(lat, lon)

    result = calculate_thuli_risk(
        weather=weather,
        terrain=terrain,
        soil=soil,
        river=river,
    )

    return {
        "success": True,
        "weather": weather,
        "terrain": terrain,
        "river": river,
        "data": result,
    }


# ---------------- RIVER GEOMETRY ----------------

@app.get("/api/river-geometry")
async def river_geometry(
    lat: float = Query(...),
    lon: float = Query(...)
):
    try:
        river = get_river_geometry(lat, lon)

        return {
            "success": True,
            "river": river
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# ---------------- WEATHER ----------------

@app.get("/api/weather")
async def weather(
    lat: float = Query(...),
    lon: float = Query(...)
):
    try:
        weather_data = get_weather_data(lat, lon)

        return {
            "success": True,
            "data": weather_data
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# ---------------- ELEVATION ----------------

@app.get("/api/elevation")
async def elevation(
    lat: float = Query(...),
    lon: float = Query(...)
):
    try:
        terrain = get_dem_terrain(lat, lon)

        return {
            "success": True,
            "elevation": terrain["elevation"],
            "slope": terrain["slope"]
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# ---------------- SOIL MOISTURE ----------------

@app.get("/api/soil")
async def soil(
    lat: float = Query(...),
    lon: float = Query(...)
):
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}"
            f"&longitude={lon}"
            "&hourly=soil_moisture_0_to_1cm"
            "&forecast_days=1"
        )

        response = requests.get(url, timeout=20)

        # Rate limit na fallback
        if response.status_code == 429:
            return {
                "success": True,
                "moisture": 0.18,
                "status": "Estimated",
                "time": "--",
                "source": "Fallback"
            }

        response.raise_for_status()
        data = response.json()

        hourly = data.get("hourly", {})
        moisture_list = hourly.get("soil_moisture_0_to_1cm", [])
        time_list = hourly.get("time", [])

        if not moisture_list:
            return {
                "success": True,
                "moisture": 0.18,
                "status": "Estimated",
                "time": "--",
                "source": "Fallback"
            }

        moisture = float(moisture_list[0])
        time = time_list[0] if time_list else "--"

        if moisture >= 0.35:
            status = "Saturated"
        elif moisture >= 0.20:
            status = "Wet"
        elif moisture >= 0.10:
            status = "Moist"
        else:
            status = "Dry"

        return {
            "success": True,
            "moisture": moisture,
            "status": status,
            "time": time,
            "source": "Open-Meteo"
        }

    except Exception:
        return {
            "success": True,
            "moisture": 0.18,
            "status": "Estimated",
            "time": "--",
            "source": "Fallback"
        }


# ---------------- SEARCH ----------------

@app.get("/api/search")
async def search(q: str = Query(...)):
    try:
        url = (
            "https://nominatim.openstreetmap.org/search"
            f"?q={q}"
            "&format=json"
            "&limit=6"
        )

        response = requests.get(
            url,
            headers={"User-Agent": "THULI/1.0"},
            timeout=20
        )

        return {
            "success": True,
            "data": response.json()
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }