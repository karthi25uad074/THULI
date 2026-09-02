from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

from app.gis.terrain import get_dem_terrain
from app.services.weather_service import get_weather_data
from app.services.river_service import get_river_data, get_river_geometry
from app.services.ml_service import predict_flood_risk
from app.risk_engine.engine import calculate_thuli_risk
from app.services.soil_service import get_soil_data

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
        soil = get_soil_data(lat, lon)

        return {
            "success": True,
            **soil
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e),
            "source": "ISRIC SoilGrids"
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