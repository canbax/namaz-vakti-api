import express, {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { ALL_PLACES } from "../data/geoData";
import { getPlace, findPlace, getTimes } from "../src/calculator";
import {
  getCalculationMethodParameter,
  isInRange,
  isValidDate,
} from "../src/util";

export const app: Express = express();

/** use this function like `app.use(allowOriginForAll);` for an express app
 * Make API accessible for all clients. Not for only clients from a specific domain.
 */
const allowOriginForAll: RequestHandler = (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

app.use(allowOriginForAll);
app.use(express.static("public"));
app.use(logIPAdress);
app.use(express.json());

app.get("/api/timesFromCoordinates", getTimesFromCoordinates);
app.get("/api/timesFromPlace", getTimesFromPlace);
app.get("/api/countries", getCountries);
app.get("/api/regions", getRegionsOfCountry);
app.get("/api/cities", getCitiesOfRegion);
app.get("/api/coordinates", getCoordinateData);
app.get("/api/place", getPlaceData);
app.get("/api/ip", getIPAdress);
app.post("/api/timesFromCoordinates", getTimesFromCoordinates);
app.post("/api/timesFromPlace", getTimesFromPlace);
app.post("/api/countries", (_: Request, res: Response) => {
  const r = [];
  for (const c in ALL_PLACES) {
    r.push({ code: ALL_PLACES[c].code, name: c });
  }
  const arr = r.sort((a, b) => a.name.localeCompare(b.name));
  res.send({ content: arr });
});
app.post("/api/regions", getRegionsOfCountry);
app.post("/api/cities", getCitiesOfRegion);
app.post("/api/coordinates", getCoordinateData);
app.post("/api/place", getPlaceData);
app.post("/api/ip", getIPAdress);

app.post("/api/graph", (req: Request, res: Response) => {
  console.log("req body", req.body);
  console.log("req params", req.params);

  setTimeout(() => {
    res.send([
      {
        __nodes__: [
          {
            __id: -1,
            __labels: ["Person"],
            name: "Roddy Piper",
          },
          {
            __id: -2,
            __labels: ["Person"],
            name: "Allen Wearer",
          },
          {
            __id: -3,
            __labels: ["Person"],
            name: "James McAllistor",
          },
        ],
        __links__: [],
      },
    ]);
  }, 100);
});

app.post("/ping", (req: Request, res: Response) => {
  console.log("req body", req.body);
  console.log("req params", req.params);

  res.send([
    {
      __pingNodes__: req.body._selection.nodeIds,
    },
  ]);
});

app.post("/movies", (req: Request, res: Response) => {
  console.log("req body", req.body);
  console.log("req params", req.params);

  res.send([
    { id: 0, value: "The Matrix" },
    { id: 1, value: "The Matrix Reloaded" },
  ]);
});

app.post("/actors", (req: Request, res: Response) => {
  if (req.body.movie == 0) {
    res.send([
      { id: 0, value: "A" },
      { id: 1, value: "B" },
    ]);
  } else {
    res.send([
      { id: 2, value: "C" },
      { id: 3, value: "D" },
    ]);
  }
});

app.post("/defaults", (req: Request, res: Response) => {
  res.send({
    movie: { id: 12, value: "The Matrix 3" },
    actor: { id: 13, value: "John" },
  });
});

const PORT = process.env.PORT || 3000;
export const httpServer = app.listen(PORT);

/** get a list of countries
 * @param  {} _
 * @param  {} res
 */
function getCountries(_: Request, res: Response) {
  const r = [];
  for (const c in ALL_PLACES) {
    r.push({ code: ALL_PLACES[c].code, name: c });
  }
  res.send(r.sort((a, b) => a.name.localeCompare(b.name)));
}

function getRegionsOfCountry(req: Request, res: Response) {
  const country = req.query.country as string;
  if (ALL_PLACES[country]) {
    res.send(
      Object.keys(ALL_PLACES[country].regions).sort((a, b) =>
        a.localeCompare(b)
      )
    );
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

function getCitiesOfRegion(req: Request, res: Response) {
  const country = req.query.country as string;
  const region = req.query.region as string;
  if (ALL_PLACES[country] && ALL_PLACES[country].regions[region]) {
    res.send(
      Object.keys(ALL_PLACES[country].regions[region]).sort((a, b) =>
        a.localeCompare(b)
      )
    );
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

function getCoordinateData(req: Request, res: Response) {
  const country = req.query.country as string;
  const region = req.query.region as string;
  const city = req.query.city as string;
  const coords = getPlace(country, region, city);
  if (coords) {
    res.send(coords);
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

function getTimesFromCoordinates(req: Request, res: Response) {
  const lat = Number(req.query.lat as string);
  const lng = Number(req.query.lng as string);
  const dateStr = req.query.date as string;
  const date = isValidDate(dateStr) ? new Date(dateStr) : new Date(); // use today if invalid
  const daysParam = Number(req.query.days as string);
  const days = isNaN(daysParam) || daysParam < 1 ? 100 : daysParam; // 100 is default
  const tzParam = Number(req.query.timezoneOffset as string);
  const tzOffset = isNaN(tzParam) ? 0 : tzParam; // 0 is default
  const calculateMethod = getCalculationMethodParameter(
    req.query.calculationMethod as string
  );
  if (
    isNaN(lat) ||
    isNaN(lng) ||
    !isInRange(lat, -90, 90) ||
    !isInRange(lng, -180, 180)
  ) {
    res.send({ error: "Invalid coordinates!" });
  } else {
    const place = findPlace(lat, lng);
    const times = getTimes(lat, lng, date, days, tzOffset, calculateMethod);
    res.send({ place, times });
  }
}

function getPlaceData(req: Request, res: Response) {
  const lat = Number(req.query.lat as string);
  const lng = Number(req.query.lng as string);
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    res.send({ error: "INVALID coordinates!" });
  } else {
    res.send(findPlace(lat, lng));
  }
}

function getTimesFromPlace(req: Request, res: Response) {
  const country = req.query.country as string;
  const region = req.query.region as string;
  const city = req.query.city as string;
  const place = getPlace(country, region, city);
  const dateStr = req.query.date as string;
  const date = isValidDate(dateStr) ? new Date(dateStr) : new Date(); // use today if invalid
  const daysParam = Number(req.query.days as string);
  const days = isNaN(daysParam) || daysParam < 1 ? 100 : daysParam; // 50 is default
  const tzParam = Number(req.query.timezoneOffset as string);
  const tzOffset = isNaN(tzParam) ? 0 : tzParam; // 0 is default
  const calculateMethod = getCalculationMethodParameter(
    req.query.calculationMethod as string
  );
  if (!place) {
    res.send({ error: "Place cannot be found!" });
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

function logIPAdress(req: Request, _: Response, next: NextFunction) {
  console.log("IP address:", req.headers["x-forwarded-for"]);
  next();
}
