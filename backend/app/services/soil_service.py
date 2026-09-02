import ee

# NASA SMAP Daily Soil Moisture (10 km)
COLLECTION = "NASA_USDA/HSL/SMAP10KM_soil_moisture"

def get_soil_data(lat: float, lon: float):
    point = ee.Geometry.Point([lon, lat])

    image = (
        ee.ImageCollection(COLLECTION)
        .sort("system:time_start", False)
        .first()
    )

    values = image.reduceRegion(
        reducer=ee.Reducer.first(),
        geometry=point,
        scale=10000,
        bestEffort=True,
    ).getInfo()

    if not values:
        raise Exception("No SMAP data available for this location.")

    # SMAP band (surface soil moisture)
    moisture = values.get("ssm")

    if moisture is None:
        raise Exception("SMAP soil moisture unavailable.")

    if moisture >= 0.35:
        status = "Saturated"
    elif moisture >= 0.20:
        status = "Wet"
    elif moisture >= 0.10:
        status = "Moist"
    else:
        status = "Dry"

    return {
        "moisture": round(float(moisture), 3),
        "status": status,
        "source": "NASA SMAP (Earth Engine)",
        "dataset": "NASA_USDA/HSL/SMAP10KM_soil_moisture",
        "resolution": "10 km",
    }