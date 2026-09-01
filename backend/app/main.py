from app.gis.terrain import get_dem_terrain
from app.services.weather_service import get_weather_data
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.river_service import get_river_data
from app.services.river_service import get_river_data, get_river_geometry

from app.services.ml_service import predict_flood_risk
from app.risk_engine.engine import calculate_thuli_risk

app = FastAPI(title="THULI AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return {
        "message": "THULI Backend Running"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }
from fastapi import Query

@app.get("/api/risk-prediction")
async def risk_prediction(
    lat: float = Query(...),
    lon: float = Query(...)
):
    weather = get_weather_data(lat, lon)
    terrain = get_dem_terrain(lat, lon)

    # Temporary values (next steps-la real APIs replace pannuvom)
    soil = {
        "moisture": 0.28
    }

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
@app.get("/api/river-geometry")
async def river_geometry(lat: float, lon: float):
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