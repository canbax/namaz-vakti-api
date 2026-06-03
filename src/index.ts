import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { getParamsForPlaceSearch } from "../api_src/util.js";
import { getPlaceSuggestionsByText, getNearbyPlaces, getPlaceById } from "irem";
import { Context } from "hono";

// In-memory cache for external irem API responses
const placeByIdCache = new Map<
  string,
  Awaited<ReturnType<typeof getPlaceById>>
>();

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
app.get("/api/placeById", placeById);

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

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`); // Listening on http://localhost:3000
});

export default app;
