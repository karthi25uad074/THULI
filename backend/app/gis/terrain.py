import requests

# Rasterio optional
try:
    import rasterio
    RASTERIO_AVAILABLE = True
except Exception:
    RASTERIO_AVAILABLE = False

DEM_PATH = "app/gis/tiles/SouthIndia/south_india_dem.tif"


def terrain_type_from_slope(slope):
    if slope < 5:
        return "FLAT"
    elif slope < 15:
        return "GENTLE"
    elif slope < 30:
        return "MODERATE"
    else:
        return "STEEP"


def get_dem_terrain(lat, lon):
    # Method 1: Local DEM (if rasterio works)
    if RASTERIO_AVAILABLE:
        with rasterio.open(DEM_PATH) as src:
            row, col = src.index(lon, lat)
            cell = src.read(1)

            elevation = float(cell[row, col])

            x1 = max(col - 1, 0)
            x2 = min(col + 1, src.width - 1)
            y1 = max(row - 1, 0)
            y2 = min(row + 1, src.height - 1)

            window = cell[y1:y2 + 1, x1:x2 + 1]
            slope = float(window.max() - window.min())

            return {
                "elevation": round(elevation, 2),
                "slope": round(slope, 2),
                "terrain_type": terrain_type_from_slope(slope),
            }

    # Method 2: Real online DEM fallback
    url = f"https://api.opentopodata.org/v1/srtm90m?locations={lat},{lon}"
    res = requests.get(url, timeout=10)
    res.raise_for_status()

    elevation = res.json()["results"][0]["elevation"]

    return {
        "elevation": float(elevation),
        "slope": 0.0,
        "terrain_type": "UNKNOWN",
    }