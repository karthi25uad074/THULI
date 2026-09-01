import geopandas as gpd
from pathlib import Path

INPUT = Path("HydroRIVERS_Asia/HydroRIVERS_v10_as_shp/HydroRIVERS_v10_as.shp")
OUTPUT = Path("app/gis/database/rivers/south_india_rivers.parquet")

print("Loading HydroRIVERS...")

gdf = gpd.read_file(INPUT)

# South India bounding box
gdf = gdf.cx[73.5:84.9, 8.0:18.8]

print(f"River segments: {len(gdf)}")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
gdf.to_parquet(OUTPUT)

print(f"Saved: {OUTPUT}")
