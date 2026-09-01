from pathlib import Path
import geopandas as gpd

print("Loading HydroRIVERS...")
hydro = gpd.read_parquet("app/gis/database/rivers/south_india_rivers.parquet")

print("Loading OSM Waterways...")
osm = gpd.read_file(
    "app/gis/osm/SouthIndia/southern-zone-260829-free.shp/gis_osm_waterways_free_1.shp"
)

# Same CRS
hydro = hydro.to_crs(epsg=4326)
osm = osm.to_crs(epsg=4326)

# OSM-la name irukkura rivers mattum
osm = osm[osm["name"].notna()].copy()

print(f"Named OSM waterways: {len(osm)}")

# Distance calculation-ku meter projection
hydro_m = hydro.to_crs(epsg=3857)
osm_m = osm.to_crs(epsg=3857)

# Nearest named OSM river attach
merged = gpd.sjoin_nearest(
    hydro_m,
    osm_m[["name", "geometry"]],
    how="left",
    distance_col="name_distance_m"
)

merged = merged.to_crs(epsg=4326)

OUTPUT = "app/gis/database/rivers/south_india_river_database.parquet"
merged.to_parquet(OUTPUT)

print(f"Saved: {OUTPUT}")
print(f"Named rivers attached: {merged['name'].notna().sum()}")