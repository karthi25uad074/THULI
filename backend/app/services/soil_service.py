import ee

COLLECTION = "NASA/SMAP/SPL4SMGP/008"


def get_soil_data(lat: float, lon: float):
    point = ee.Geometry.Point([lon, lat])

    image = (
        ee.ImageCollection(COLLECTION)
        .sort("system:time_start", False)
        .first()
    )

    value = image.select("sm_surface").reduceRegion(
        reducer=ee.Reducer.first(),
        geometry=point,
        scale=11000,
        bestEffort=True,
    ).getInfo()

    moisture = value.get("sm_surface")

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
        "source": "NASA SMAP L4 (Earth Engine)",
        "dataset": "NASA/SMAP/SPL4SMGP/008",
        "resolution": "11 km",
        "depth": "0-5 cm",
    }