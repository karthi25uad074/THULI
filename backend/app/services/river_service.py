from pathlib import Path
import geopandas as gpd
import numpy as np
from shapely.ops import unary_union, linemerge

DB = Path("app/gis/database/rivers/south_india_river_database.parquet")

# Load once when server starts
RIVERS = gpd.read_parquet(DB).to_crs(epsg=4326).reset_index(drop=True)
RIVERS_M = RIVERS.to_crs(epsg=3857)


def get_river_data(lat: float, lon: float):
    point = gpd.GeoSeries.from_xy([lon], [lat], crs="EPSG:4326")
    point_m = point.to_crs(epsg=3857)

    distances = RIVERS_M.distance(point_m.iloc[0])

    # Position-based selection (duplicate index problem avoid pannum)
    pos = int(np.argmin(distances.to_numpy()))

    nearest = RIVERS.iloc[pos]
    distance_km = float(distances.iloc[pos] / 1000)

    river_name = nearest.get("name")
    if not river_name or str(river_name).strip() == "":
        river_name = f"River Network {int(nearest['MAIN_RIV'])}"

    return {
        "river": river_name,
        "hyriv_id": int(nearest["HYRIV_ID"]),
        "main_river_id": int(nearest["MAIN_RIV"]),
        "distance_km": round(distance_km, 2),
        "gauge_m": round(max(0.5, 4 - distance_km / 15), 2),
        "level": 3 if distance_km < 1 else 2 if distance_km < 5 else 1,
    }
from shapely.geometry import Point
from shapely.ops import unary_union

def get_river_geometry(lat, lon):
    point = Point(lon, lat)

    # Existing working function-la irundhu nearest river info eduthuko
    info = get_river_data(lat, lon)

    # Andha river-oda MAIN_RIV segments mattum eduthuko
    river_segments = RIVERS[RIVERS["MAIN_RIV"] == info["main_river_id"]]

    # Full river line merge
    merged = linemerge(unary_union(river_segments.geometry.tolist()))
    if merged.geom_type == "MultiLineString":
     merged = max(merged.geoms, key=lambda g: g.length)
    return {
        "name": info["river"],
        "distance": info["distance_km"],
        "geometry": merged.__geo_interface__,
        "geometryType": merged.geom_type,
    }