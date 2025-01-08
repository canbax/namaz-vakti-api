import express, {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { ALL_PLACES } from "../data/geoData.js";
import { getPlace, findPlace, getTimes } from "../api_src/calculator.js";
import {
  getCommonTimeRequestParameters,
  getParamsForPlaceSearch,
  isInRange,
} from "../api_src/util.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getPlaceSuggestionsByText, getNearbyPlaces, getPlaceById } from "irem";

export const app: Express = express();

/** use this function like `app.use(allowOriginForAll);` for an express app
 * Make API accessible for all clients. Not for only clients from a specific domain.
 */
const allowOriginForAll: RequestHandler = (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  next();
};

app.use(allowOriginForAll);
app.use(express.static("public"));
app.use(logIPAdress);

app.get("/api/searchPlaces", searchPlaces);
app.get("/api/nearbyPlaces", nearByPlaces);
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
app.get(/^\/(?!api).*/, (_, res) => {
  res.sendFile(path.resolve(__dirname, "..", "public", "index.html"));
});

const PORT = process.env["PORT"] || 3000;
export const httpServer = app.listen(PORT);

/** get a list of countries
 * @param  {} _
 * @param  {} res
 */
function getCountries(_: Request, res: Response) {
  try {
    const r = [];
    for (const c in ALL_PLACES) {
      r.push({ code: ALL_PLACES[c].code, name: c });
    }
    res.send(r.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (e) {
    console.log("error! ", e);
    res.send("error: " + e);
  } finally {
    res.send("error: ");
  }
}

function getRegionsOfCountry(req: Request, res: Response) {
  const country = req.query["country"] as string;
  if (ALL_PLACES[country]) {
    res.send(
      Object.keys(ALL_PLACES[country].regions).sort((a, b) =>
        a.localeCompare(b),
      ),
    );
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

function getCitiesOfRegion(req: Request, res: Response) {
  const country = req.query["country"] as string;
  const region = req.query["region"] as string;
  if (ALL_PLACES[country] && ALL_PLACES[country].regions[region]) {
    res.send(
      Object.keys(ALL_PLACES[country].regions[region]).sort((a, b) =>
        a.localeCompare(b),
      ),
    );
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

function getCoordinateData(req: Request, res: Response) {
  const country = req.query["country"] as string;
  const region = req.query["region"] as string;
  const city = req.query["city"] as string;
  const coords = getPlace(country, region, city);
  if (coords) {
    res.send(coords);
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

/**
 * DEPRECATED, use `getTimesForGPS`
 */
function getTimesFromCoordinates(req: Request, res: Response) {
  const lat = Number(req.query["lat"] as string);
  const lng = Number(req.query["lng"] as string);
  const { date, days, tzOffset, calculateMethod } =
    getCommonTimeRequestParameters(req);
  if (
    isNaN(lat) ||
    isNaN(lng) ||
    !isInRange(lat, -90, 90) ||
    !isInRange(lng, -180, 180)
  ) {
    res.send({ error: "Invalid coordinates!" });
  } else if (days > 1000) {
    res.send({ error: "days can be maximum 1000!" });
  } else {
    const place = findPlace(lat, lng);
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    res.send({ place, times });
  }
}

async function getTimesForGPS(req: Request, res: Response) {
  const { lat, lng, lang } = getParamsForPlaceSearch(req);
  const { date, days, tzOffset, calculateMethod } =
    getCommonTimeRequestParameters(req);
  if (
    isNaN(lat) ||
    isNaN(lng) ||
    !isInRange(lat, -90, 90) ||
    !isInRange(lng, -180, 180)
  ) {
    res.send({ error: "Invalid coordinates!" });
  } else if (days > 1000) {
    res.send({ error: "days can be maximum 1000!" });
  } else {
    const [place] = await getNearbyPlaces(lat, lng, lang, 1);
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    res.send({ place, times });
  }
}

async function searchPlaces(req: Request, res: Response) {
  const q = (req.query["q"] ?? "") as string;
  const { lat, lng, lang, resultCount, countryCode } =
    getParamsForPlaceSearch(req);
  res.send(
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

async function nearByPlaces(req: Request, res: Response) {
  const { lat, lng, lang, resultCount } = getParamsForPlaceSearch(req);

  res.send(await getNearbyPlaces(lat, lng, lang, resultCount));
}

function getPlaceData(req: Request, res: Response) {
  const lat = Number(req.query["lat"] as string);
  const lng = Number(req.query["lng"] as string);
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    res.send({ error: "INVALID coordinates!" });
  } else {
    res.send(findPlace(lat, lng));
  }
}

async function getTimesForPlace(req: Request, res: Response) {
  const placeId = Number(req.query["id"]);
  if (Number.isNaN(placeId)) {
    res.send({ error: "Id should be a positive integer!" });
    return;
  }
  const { date, days, tzOffset, calculateMethod } =
    getCommonTimeRequestParameters(req);
  const { lang } = getParamsForPlaceSearch(req);
  const place = await getPlaceById(placeId, lang);

  if (!place) {
    res.send({ error: "Place cannot be found!" });
  } else if (days > 1000) {
    res.send({ error: "days can be maximum 1000!" });
  } else {
    const lat = place.latitude;
    const lng = place.longitude;
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    res.send({ place, times });
  }
}

async function placeById(req: Request, res: Response) {
  const placeId = Number(req.query["id"]);
  if (Number.isNaN(placeId)) {
    res.send({ error: "Id should be a positive integer!" });
    return;
  }
  const { lang } = getParamsForPlaceSearch(req);
  const place = await getPlaceById(placeId, lang);

  if (!place) {
    res.send({ error: "Place cannot be found!" });
  } else {
    res.send({ ...place });
  }
}

/**
 * DEPRECATED, use `getTimesForPlace`
 */
function getTimesFromPlace(req: Request, res: Response) {
  const country = req.query["country"] as string;
  const region = req.query["region"] as string;
  const city = req.query["city"] as string;
  const place = getPlace(country, region, city);
  const { date, days, tzOffset, calculateMethod } =
    getCommonTimeRequestParameters(req);
  if (!place) {
    res.send({ error: "Place cannot be found!" });
  } else if (days > 1000) {
    res.send({ error: "days can be maximum 1000!" });
  } else {
    const lat = place.latitude;
    const lng = place.longitude;
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    res.send({ place, times });
  }
}

function getIPAdress(req: Request, res: Response) {
  res.send({ IP: req.headers["x-forwarded-for"] });
}

function logIPAdress(_req: Request, _: Response, next: NextFunction) {
  next();
}
export default app;
