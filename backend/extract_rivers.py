import geopandas as gpd

input_file = r"HydroRIVERS_Asia\HydroRIVERS_v10_as_shp\HydroRIVERS_v10_as.shp"
output_file = r"data\south_india_hydrorivers.geojson"

print("Reading South India river network...")

bbox = (74, 8, 80.5, 14.5)

gdf = gpd.read_file(
    input_file,
    bbox=bbox,
    engine="pyogrio"
)

print("South India river features:", len(gdf))
print("CRS:", gdf.crs)

gdf.to_file(
    output_file,
    driver="GeoJSON",
    engine="pyogrio"
)

print("Saved:", output_file)