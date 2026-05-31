import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { ALL_PLACES } from "../data/geoData.js";
import { getPlace, findPlace, getTimes } from "../api_src/calculator.js";
import {
  getCommonTimeRequestParameters,
  getParamsForPlaceSearch,
  isInRange,
} from "../api_src/util.js";
import { getPlaceSuggestionsByText, getNearbyPlaces, getPlaceById } from "irem";

// Precomputed, sorted caches for geo data endpoints (countries, regions, cities)
const countriesCache = Object.keys(ALL_PLACES)
  .map((place) => ({ code: ALL_PLACES[place].code, name: place }))
  .sort((a, b) => a.name.localeCompare(b.name));

const regionsCache = new Map<string, string[]>();
const citiesCache = new Map<string, string[]>();

for (const country in ALL_PLACES) {
  regionsCache.set(
    country,
    Object.keys(ALL_PLACES[country].regions).sort((a, b) => a.localeCompare(b)),
  );
  for (const region in ALL_PLACES[country].regions) {
    citiesCache.set(
      `${country}:${region}`,
      Object.keys(ALL_PLACES[country].regions[region]).sort((a, b) =>
        a.localeCompare(b),
      ),
    );
  }
}

// In-memory caches for external irem API responses
const nearbyPlacesCache = new Map<
  string,
  Awaited<ReturnType<typeof getNearbyPlaces>>
>();
const placeByIdCache = new Map<
  string,
  Awaited<ReturnType<typeof getPlaceById>>
>();

async function cachedNearbyPlaces(
  lat: number,
  lng: number,
  lang: string,
  count: number,
): ReturnType<typeof getNearbyPlaces> {
  const key = `${lat.toFixed(2)}:${lng.toFixed(2)}:${lang}:${count}`;
  if (nearbyPlacesCache.has(key)) return nearbyPlacesCache.get(key)!;
  const result = await getNearbyPlaces(lat, lng, lang, count);
  nearbyPlacesCache.set(key, result);
  return result;
}

async function cachedPlaceById(
  id: number,
  lang: string,
): ReturnType<typeof getPlaceById> {
  const key = `${id}:${lang}`;
  if (placeByIdCache.has(key)) return placeByIdCache.get(key)!;
  const result = await getPlaceById(id, lang);
  placeByIdCache.set(key, result);
  return result;
}

import { Context } from "hono";

const app = new Hono();

const setCacheHeader = (c: Context) =>
  c.header(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=3600",
  );

app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (
        process.env["ENABLE_CORS"] ||
        origin === "http://localhost" ||
        origin === "https://localhost" ||
        origin === "capacitor://localhost"
      ) {
        return origin;
      }
      return null;
    },
  }),
);

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

/** get a list of countries
 */
function getCountries(c: Context) {
  try {
    setCacheHeader(c);
    return c.json(countriesCache);
  } catch (e) {
    console.log("error! ", e);
    return c.json({ error: String(e) });
  }
}

function getRegionsOfCountry(c: Context) {
  const country = c.req.query("country") as string;
  if (!country || country === "undefined" || country === "null") {
    return c.json({ error: "Invalid country parameter!" }, 400);
  }
  const regions = regionsCache.get(country);
  if (regions) {
    setCacheHeader(c);
    return c.json(regions);
  } else {
    return c.json({ error: "NOT FOUND!" }, 404);
  }
}

function getCitiesOfRegion(c: Context) {
  const country = c.req.query("country") as string;
  const region = c.req.query("region") as string;
  if (!country || country === "undefined" || country === "null") {
    return c.json({ error: "Invalid country parameter!" }, 400);
  }
  if (!region || region === "undefined" || region === "null") {
    return c.json({ error: "Invalid region parameter!" }, 400);
  }
  const cities = citiesCache.get(`${country}:${region}`);
  if (cities) {
    setCacheHeader(c);
    return c.json(cities);
  } else {
    return c.json({ error: "NOT FOUND!" }, 404);
  }
}

function getCoordinateData(c: Context) {
  const country = c.req.query("country") as string;
  const region = c.req.query("region") as string;
  const city = c.req.query("city") as string;
  const coords = getPlace(country, region, city);
  if (coords) {
    setCacheHeader(c);
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
    setCacheHeader(c);
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
    const [[place], times] = await Promise.all([
      cachedNearbyPlaces(lat, lng, lang, 1),
      Promise.resolve(
        getTimes(lat, lng, date, days, tzOffset, calculateMethod),
      ),
    ]);
    setCacheHeader(c);
    return c.json({ place, times });
  }
}

async function searchPlaces(c: Context) {
  const q = (c.req.query("q") ?? "") as string;
  const { lat, lng, lang, resultCount, countryCode } =
    getParamsForPlaceSearch(c);
  setCacheHeader(c); // Cache search results
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
    setCacheHeader(c); // Cache nearby results
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
    setCacheHeader(c);
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
  const place = await cachedPlaceById(placeId, lang);

  if (!place) {
    return c.json({ error: "Place cannot be found!" });
  } else if (days > 1000) {
    return c.json({ error: "days can be maximum 1000!" });
  } else {
    const lat = place.latitude;
    const lng = place.longitude;
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    setCacheHeader(c);
    return c.json({ place, times });
  }
}

async function placeById(c: Context) {
  const placeId = Number(c.req.query("id"));
  if (Number.isNaN(placeId)) {
    return c.json({ error: "Id should be a positive integer!" });
  }
  const { lang } = getParamsForPlaceSearch(c);
  const place = await cachedPlaceById(placeId, lang);

  if (!place) {
    return c.json({ error: "Place cannot be found!" });
  } else {
    setCacheHeader(c);
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
    setCacheHeader(c);
    return c.json({ place, times });
  }
}

function getIPAdress(c: Context) {
  return c.json({ IP: c.req.header("x-forwarded-for") });
}

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`); // Listening on http://localhost:3000
});

export default app;
