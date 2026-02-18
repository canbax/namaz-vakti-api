import { Hono } from "hono";
import { cors } from "hono/cors";
import { ALL_PLACES } from "../data/geoData.js";
import { getPlace, findPlace, getTimes } from "../api_src/calculator.js";
import {
  getCommonTimeRequestParameters,
  getParamsForPlaceSearch,
  isInRange,
} from "../api_src/util.js";
import { getPlaceSuggestionsByText, getNearbyPlaces, getPlaceById } from "irem";

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Context } from "hono";

const app = new Hono();

// Middleware
app.use("*", cors());

app.get("/api/searchPlaces", searchPlaces);
app.get("/api/nearByPlaces", nearByPlaces);
app.get("/api/timesForGPS", getTimesForGPS);
app.get("/api/timesForPlace", getTimesForPlace);
app.get("/api/timesFromCoordinates", getTimesFromCoordinates);
app.get("/api/timesFromPlace", getTimesFromPlace);
app.get("/api/countries", getCountries);
app.get("/api/regions", getRegionsOfCountry);
app.get("/api/cities", getCitiesOfRegion);
app.get("/api/coordinates", getCoordinateData);
app.get("/api/place", getPlaceData);
app.get("/api/placeById", placeById);
app.get("/api/ip", getIPAdress);
app.post("/api/timesFromCoordinates", getTimesFromCoordinates);
app.post("/api/timesFromPlace", getTimesFromPlace);
app.post("/api/countries", getCountries);
app.post("/api/regions", getRegionsOfCountry);
app.post("/api/cities", getCitiesOfRegion);
app.post("/api/coordinates", getCoordinateData);
app.post("/api/place", getPlaceData);
app.post("/api/placeById", placeById);
app.post("/api/ip", getIPAdress);

const __dirname = dirname(fileURLToPath(import.meta.url));
// if not starting with "/api" return index.html page as response so that routes in the static page will work
app.get("*", async (c) => {
  const url = new URL(c.req.url);
  if (!url.pathname.startsWith("/api")) {
    const fs = await import("fs/promises");
    try {
      const content = await fs.readFile(
        path.resolve(__dirname, "..", "public", "index.html"),
        "utf-8",
      );
      return c.html(content);
    } catch {
      return c.text("index.html not found", 404);
    }
  }
  return c.text("index.html not found", 404);
});

// For compatibility with some localdev setups, but purely optional for Hono + Workers
if (
  process.env["NODE_ENV"] !== "production" &&
  !process.env["Generic_Worker"]
) {
  // try to serve with @hono/node-server if installed, or just log
  console.log(
    `To run locally, use 'npm run dev' which uses nodemon/tsx. For production use 'wrangler dev'`,
  );
}

/** get a list of countries
 */
function getCountries(c: Context) {
  try {
    const r = [];
    for (const place in ALL_PLACES) {
      r.push({ code: ALL_PLACES[place].code, name: place });
    }
    return c.json(r.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (e) {
    console.log("error! ", e);
    return c.json({ error: String(e) });
  }
}

function getRegionsOfCountry(c: Context) {
  const country = c.req.query("country") as string;
  if (ALL_PLACES[country]) {
    return c.json(
      Object.keys(ALL_PLACES[country].regions).sort((a, b) =>
        a.localeCompare(b),
      ),
    );
  } else {
    return c.json({ error: "NOT FOUND!" });
  }
}

function getCitiesOfRegion(c: Context) {
  const country = c.req.query("country") as string;
  const region = c.req.query("region") as string;
  if (ALL_PLACES[country] && ALL_PLACES[country].regions[region]) {
    return c.json(
      Object.keys(ALL_PLACES[country].regions[region]).sort((a, b) =>
        a.localeCompare(b),
      ),
    );
  } else {
    return c.json({ error: "NOT FOUND!" });
  }
}

function getCoordinateData(c: Context) {
  const country = c.req.query("country") as string;
  const region = c.req.query("region") as string;
  const city = c.req.query("city") as string;
  const coords = getPlace(country, region, city);
  if (coords) {
    return c.json(coords);
  } else {
    return c.json({ error: "NOT FOUND!" });
  }
}

/**
 * DEPRECATED, use `getTimesForGPS`
 */
function getTimesFromCoordinates(c: Context) {
  const lat = Number(c.req.query("lat") as string);
  const lng = Number(c.req.query("lng") as string);
  const { date, days, tzOffset, calculateMethod } =
    getCommonTimeRequestParameters(c);
  if (
    isNaN(lat) ||
    isNaN(lng) ||
    !isInRange(lat, -90, 90) ||
    !isInRange(lng, -180, 180)
  ) {
    return c.json({ error: "Invalid coordinates!" });
  } else if (days > 1000) {
    return c.json({ error: "days can be maximum 1000!" });
  } else {
    const place = findPlace(lat, lng);
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    return c.json({ place, times });
  }
}

async function getTimesForGPS(c: Context) {
  const { lat, lng, lang } = getParamsForPlaceSearch(c);
  const { date, days, tzOffset, calculateMethod } =
    getCommonTimeRequestParameters(c);
  if (
    isNaN(lat) ||
    isNaN(lng) ||
    !isInRange(lat, -90, 90) ||
    !isInRange(lng, -180, 180)
  ) {
    return c.json({ error: "Invalid coordinates!" });
  } else if (days > 1000) {
    return c.json({ error: "days can be maximum 1000!" });
  } else {
    const [place] = await getNearbyPlaces(lat, lng, lang, 1);
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    return c.json({ place, times });
  }
}

async function searchPlaces(c: Context) {
  const q = (c.req.query("q") ?? "") as string;
  const { lat, lng, lang, resultCount, countryCode } =
    getParamsForPlaceSearch(c);
  return c.json(
    await getPlaceSuggestionsByText(
      q,
      lang,
      lat,
      lng,
      resultCount,
      countryCode,
    ),
  );
}

async function nearByPlaces(c: Context) {
  try {
    const { lat, lng, lang, resultCount } = getParamsForPlaceSearch(c);
    const places = await getNearbyPlaces(lat, lng, lang, resultCount);
    return c.json(places);
  } catch (e) {
    console.error("nearByPlaces error:", e);
    return c.json({ error: String(e) }, 500);
  }
}

function getPlaceData(c: Context) {
  const lat = Number(c.req.query("lat") as string);
  const lng = Number(c.req.query("lng") as string);
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return c.json({ error: "INVALID coordinates!" });
  } else {
    return c.json(findPlace(lat, lng));
  }
}

async function getTimesForPlace(c: Context) {
  const placeId = Number(c.req.query("id"));
  if (Number.isNaN(placeId)) {
    return c.json({ error: "Id should be a positive integer!" });
  }
  const { date, days, tzOffset, calculateMethod } =
    getCommonTimeRequestParameters(c);
  const { lang } = getParamsForPlaceSearch(c);
  const place = await getPlaceById(placeId, lang);

  if (!place) {
    return c.json({ error: "Place cannot be found!" });
  } else if (days > 1000) {
    return c.json({ error: "days can be maximum 1000!" });
  } else {
    const lat = place.latitude;
    const lng = place.longitude;
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    return c.json({ place, times });
  }
}

async function placeById(c: Context) {
  const placeId = Number(c.req.query("id"));
  if (Number.isNaN(placeId)) {
    return c.json({ error: "Id should be a positive integer!" });
  }
  const { lang } = getParamsForPlaceSearch(c);
  const place = await getPlaceById(placeId, lang);

  if (!place) {
    return c.json({ error: "Place cannot be found!" });
  } else {
    return c.json({ ...place });
  }
}

/**
 * DEPRECATED, use `getTimesForPlace`
 */
function getTimesFromPlace(c: Context) {
  const country = c.req.query("country") as string;
  const region = c.req.query("region") as string;
  const city = c.req.query("city") as string;
  const place = getPlace(country, region, city);
  const { date, days, tzOffset, calculateMethod } =
    getCommonTimeRequestParameters(c);
  if (!place) {
    return c.json({ error: "Place cannot be found!" });
  } else if (days > 1000) {
    return c.json({ error: "days can be maximum 1000!" });
  } else {
    const lat = place.latitude;
    const lng = place.longitude;
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    return c.json({ place, times });
  }
}

function getIPAdress(c: Context) {
  return c.json({ IP: c.req.header("x-forwarded-for") });
}

export default app;
