from pathlib import Path

TILES = [
    {
        "name": "Kodaikanal",
        "state": "TamilNadu",
        "path": Path("app/gis/tiles/TamilNadu/kodaikanal_dem.tif"),
        "north": 10.35,
        "south": 10.10,
        "west": 77.30,
        "east": 77.65,
    }
]


def get_dem_file(lat: float, lon: float):
    for tile in TILES:
        if (
            tile["south"] <= lat <= tile["north"]
            and tile["west"] <= lon <= tile["east"]
        ):
            return tile

    return None