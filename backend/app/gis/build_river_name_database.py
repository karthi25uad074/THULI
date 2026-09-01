import requests
import json

# South India Bounding Box
SOUTH = 8.0
WEST = 73.5
NORTH = 18.8
EAST = 84.9

query = f"""
[out:json][timeout:600];
(
  way["waterway"="river"]({SOUTH},{WEST},{NORTH},{EAST});
  way["waterway"="stream"]({SOUTH},{WEST},{NORTH},{EAST});
);
out tags center;
"""

url = "https://overpass-api.de/api/interpreter"

print("Downloading South India river names...")

response = requests.post(url, data=query, timeout=600)
response.raise_for_status()

data = response.json()

rivers = []

for item in data["elements"]:
    name = item.get("tags", {}).get("name")

    if name:
        rivers.append({
            "name": name,
            "lat": item["center"]["lat"],
            "lon": item["center"]["lon"],
        })

print(f"Downloaded {len(rivers)} named rivers.")

with open("app/gis/database/river_names.json", "w", encoding="utf-8") as f:
    json.dump(rivers, f, ensure_ascii=False, indent=2)

print("Saved app/gis/database/river_names.json")
