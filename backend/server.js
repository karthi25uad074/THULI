require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { getWeather } = require("./services/weatherService");
const fs = require("fs");
const path = require("path");
const turf = require("@turf/turf");
function getMainRiverGeometry(mainRivId) {
  const segments = riverData.features.filter(
    (feature) =>
      feature.properties &&
      Number(feature.properties.MAIN_RIV) === Number(mainRivId) &&
      feature.geometry
  );

  const lines = [];

  segments.forEach((feature) => {
    const geometry = feature.geometry;

    if (geometry.type === "LineString") {
      lines.push(geometry.coordinates);
    }

    if (geometry.type === "MultiLineString") {
      geometry.coordinates.forEach((line) => {
        lines.push(line);
      });
    }
  });

  return lines;
}
async function findRiverNameFromOSM(lat, lon) {
  try {
    const query = `
      [out:json][timeout:10];
      (
        way["waterway"="river"]["name"](around:5000,${lat},${lon});
        way["waterway"="river"]["name"](around:5000,${lat},${lon});
        relation["waterway"="river"]["name"](around:5000,${lat},${lon});
      );
      out tags center;
    `;

    const response = await fetch(
      "https://overpass.kumi.systems/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "THULI-SIH-2026/1.0",
        },
        body: new URLSearchParams({
          data: query,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OSM service returned ${response.status}`);
    }

    const data = await response.json();

    const namedRiver = data.elements?.find(
      (element) => element.tags?.name
    );

    return namedRiver?.tags?.name || null;

  } catch (error) {
    console.log("OSM River Search Error:", error.message);
    return null;
  }
}
const app = express();
const PORT = process.env.PORT || 5000;
let riverData = { type: "FeatureCollection", features: [] };

const filePath = path.join(
  __dirname,
  "data",
  "south_india_rivers.geojson"
);

try {
  const fileContent = fs.readFileSync(filePath, "utf8").trim();

  riverData = JSON.parse(fileContent);

  console.log("Loading:", filePath);
  console.log("HydroRIVERS Features:", riverData.features.length);

} catch (err) {
  console.log("HydroRIVERS not loaded:", err.message);
}
app.use(cors());
app.use(express.json());

/* ==========================================
   HEALTH CHECK
========================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    project: "THULI",
    message: "THULI Backend Running",
  });
});

/* ==========================================
   WEATHER API
========================================== */

app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude required.",
      });
    }

    const weather = await getWeather(lat, lon);

    res.json({
      success: true,
      data: weather,
    });
  } catch (err) {
  console.error("Weather API Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message,
  });
}
});

/* ==========================================
   SEARCH API (OpenStreetMap Nominatim Proxy)
========================================== */

app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required.",
      });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=5`,
      {
        headers: {
          "User-Agent": "THULI-SIH-2026/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Search service unavailable.");
    }

    const data = await response.json();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Search API Error:", err);

    res.status(500).json({
      success: false,
      message: "Search failed.",
    });
  }
});
/* ==========================================
   ELEVATION API (SRTM30m + REAL SLOPE)
========================================== */

app.get("/api/elevation", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude required.",
      });
    }

    const step = 0.00027; // ~30m

    const locations = [
      `${Number(lat) + step},${Number(lon) - step}`,
      `${Number(lat) + step},${lon}`,
      `${Number(lat) + step},${Number(lon) + step}`,
      `${lat},${Number(lon) - step}`,
      `${lat},${lon}`,
      `${lat},${Number(lon) + step}`,
      `${Number(lat) - step},${Number(lon) - step}`,
      `${Number(lat) - step},${lon}`,
      `${Number(lat) - step},${Number(lon) + step}`,
    ].join("|");

    const response = await fetch(
      `https://api.opentopodata.org/v1/srtm30m?locations=${locations}`
    );

    if (!response.ok) {
      throw new Error("Elevation service unavailable.");
    }

    const data = await response.json();

    const heights = data.results.map((r) => r.elevation);

    const center = heights[4];
    const maxDiff = Math.max(
      ...heights.map((h) => Math.abs(h - center))
    );

    const slope = Math.min(
      (Math.atan(maxDiff / 30) * 180) / Math.PI,
      90
    );

    res.json({
      success: true,
      elevation: center,
      slope: Number(slope.toFixed(1)),
      grid: heights,
    });

  } catch (err) {
    console.error("Elevation API Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Elevation fetch failed.",
    });
  }
});

/* ==========================================
   SOIL MOISTURE API
========================================== */

app.get("/api/soil", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude required.",
      });
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_moisture_0_to_1cm&forecast_hours=1&timezone=auto`
    );

    if (!response.ok) {
      throw new Error("Soil moisture service unavailable.");
    }

    const data = await response.json();

    const moisture = data.hourly.soil_moisture_0_to_1cm[0];

    let status = "Dry";

    if (moisture >= 0.35) status = "Saturated";
    else if (moisture >= 0.20) status = "Wet";
    else if (moisture >= 0.10) status = "Moist";

    res.json({
      success: true,
      moisture,
      status,
      time: data.hourly.time[0],
    });

  } catch (err) {
    console.error("Soil API Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Soil moisture fetch failed.",
    });
  }
});

/* ==========================================
   RIVER GAUGE API
========================================== */

app.get("/api/river", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude required.",
      });
    }

    const response = await fetch(
      `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&forecast_days=1&timezone=auto`
    );

    if (!response.ok) {
      throw new Error("River service unavailable.");
    }

    const data = await response.json();

    const discharge = data.daily?.river_discharge?.[0] ?? null;

    let level = "Normal";
    if (discharge >= 300) level = "High";
    else if (discharge >= 150) level = "Moderate";

    res.json({
      success: true,
      discharge,
      level,
      time: data.daily?.time?.[0],
    });

  } catch (err) {
    console.error("River API Error:", err.message);

    res.status(500).json({
      success: false,
      message: "River gauge fetch failed.",
    });
  }
});

app.get("/api/river-geometry", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude required.",
      });
    }

    const point = turf.point([Number(lon), Number(lat)]);

    let nearestRiver = null;
    let nearestLine = null;
    let nearestPoint = null;
    let minDistance = Infinity;

    riverData.features.forEach((feature) => {
      if (!feature.geometry) return;

      const type = feature.geometry.type;
      const coords = feature.geometry.coordinates;

      const lines =
        type === "LineString"
          ? [coords]
          : type === "MultiLineString"
          ? coords
          : [];

      lines.forEach((lineCoords) => {
        if (!lineCoords || lineCoords.length < 2) return;

        const line = turf.lineString(lineCoords);
        const snapped = turf.nearestPointOnLine(line, point);

        if (snapped.properties.dist < minDistance) {
          minDistance = snapped.properties.dist;
          nearestRiver = feature;
          nearestLine = lineCoords;
          nearestPoint = snapped;
        }
      });
    });

    if (!nearestRiver || !nearestPoint) {
      return res.json({
        success: true,
        river: null,
      });
    }

    /* ==========================================
       GET RIVER NAME FROM OPENSTREETMAP
    ========================================== */
let riverName = null;

//riverName = await findRiverNameFromOSM(
  //lat,
  //lon
//);

try {
  const [riverLon, riverLat] =
    nearestPoint.geometry.coordinates;

  riverName = await findRiverNameFromOSM(
    riverLat,
    riverLon
  );

  console.log(
    "OSM River Name:",
    riverName || "Not Found"
  );

} catch (error) {
  console.log(
    "River name lookup failed:",
    error.message
  );
}

    /* ==========================================
       FINAL RIVER RESPONSE
    ========================================== */

   const mainRivId = nearestRiver.properties.MAIN_RIV;

const fullRiverGeometry = getMainRiverGeometry(mainRivId);
const riverNames = {
  // Tamil Nadu
  41395120: "Vaigai River",
  41376077: "Kaveri River",
  41297283: "Bhavani River",
  41319354: "Amaravathi River",
  41351761: "Tamirabarani River",

  // Kerala
  41395865: "Periyar River",
  41394638: "Bharathapuzha River",
  41388619: "Pamba River",
  41382806: "Chaliyar River",
  41370524: "Kabini River",

  // Western Ghats
  41374708: "Moyar River",
  41398743: "Gundar River",
};

const displayRiverName =
  riverNames[mainRivId] || `River Network ${mainRivId}`;
  console.log("DEBUG MAIN_RIV:", mainRivId);
console.log("DEBUG DISPLAY NAME:", displayRiverName);

res.json({
  success: true,
  river: {
    name: displayRiverName,
    mainRiverId: mainRivId,

    distance: Number(minDistance.toFixed(2)),

    geometryType: "MultiLineString",

    geometry: fullRiverGeometry,
  },
});

  } catch (err) {
    console.error("HydroRIVERS Error:", err);

    res.status(500).json({
      success: false,
      message: "HydroRIVERS failed.",
    });
  }
});
/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, () => {
  console.log("================================");
  console.log(" THULI Backend Running");
  console.log(` Server : http://localhost:${PORT}`);
  console.log("================================");
});