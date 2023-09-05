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

app.post("/api/timesFromCoordinates", getTimesFromCoordinates);
app.post("/api/timesFromPlace", getTimesFromPlace);
app.post("/api/countries", getCountries);
app.post("/api/regions", getRegionsOfCountry);
app.post("/api/cities", getCitiesOfRegion);
app.post("/api/coordinates", getCoordinateData);
app.post("/api/place", getPlaceData);
app.post("/api/ip", getIPAdress);

function wrapWithContent(obj: object[] | object) {
  return { content: obj };
}

app.post("/api/graph", (req: Request, res: Response) => {
  console.log("req body", req.body);
  console.log("req params", req.params);

  setTimeout(() => {
    res.send(
      wrapWithContent([
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
      ])
    );
  }, 100);
});

app.post("/api/ping", (req: Request, res: Response) => {
  console.log("req body", req.body);
  console.log("req params", req.params);

  const arr = [
    {
      __pingNodes__: req.body._selection.nodeIds,
    },
  ];
  res.send(wrapWithContent(arr));
});

app.post("/api/movies", (req: Request, res: Response) => {
  console.log("req body", req.body);
  console.log("req params", req.params);

  res.send(
    wrapWithContent([
      { id: 0, value: "The Matrix" },
      { id: 1, value: "The Matrix Reloaded" },
    ])
  );
});

app.post("/api/actors", (req: Request, res: Response) => {
  if (req.body.movie == 0) {
    res.send(
      wrapWithContent([
        { id: 0, value: "A" },
        { id: 1, value: "B" },
      ])
    );
  } else {
    res.send(
      wrapWithContent([
        { id: 2, value: "C" },
        { id: 3, value: "D" },
      ])
    );
  }
});

app.post("/api/defaults", (req: Request, res: Response) => {
  res.send(
    wrapWithContent({
      movie: { id: 12, value: "The Matrix 3" },
      actor: { id: 13, value: "John" },
    })
  );
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
    r.push({ id: ALL_PLACES[c].code, value: c });
  }
  const arr = r.sort((a, b) => a.value.localeCompare(b.value));
  res.send(wrapWithContent(arr));
}

function getRegionsOfCountry(req: Request, res: Response) {
  const country = req.body.inputParameters.country as string;
  if (ALL_PLACES[country]) {
    const arr = Object.keys(ALL_PLACES[country].regions).sort((a, b) =>
      a.localeCompare(b)
    );
    res.send(
      wrapWithContent(
        arr.map((x) => {
          return { id: x, value: x };
        })
      )
    );
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

function getCitiesOfRegion(req: Request, res: Response) {
  const country = req.body.inputParameters.country as string;
  const region = req.body.inputParameters.region as string;
  if (ALL_PLACES[country] && ALL_PLACES[country].regions[region]) {
    const arr = Object.keys(ALL_PLACES[country].regions[region]).sort((a, b) =>
      a.localeCompare(b)
    );
    res.send(
      wrapWithContent(
        arr.map((x) => {
          return { id: x, value: x };
        })
      )
    );
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

function getCoordinateData(req: Request, res: Response) {
  const country = req.body.inputParameters.country as string;
  const region = req.body.inputParameters.region as string;
  const city = req.body.inputParameters.city as string;
  const coords = getPlace(country, region, city);
  if (coords) {
    res.send(coords);
  } else {
    res.send({ error: "NOT FOUND!" });
  }
}

function getTimesFromCoordinates(req: Request, res: Response) {
  const lat = Number(req.body.inputParameters.lat as string);
  const lng = Number(req.body.inputParameters.lng as string);
  const dateStr = req.body.inputParameters.date as string;
  const date = isValidDate(dateStr) ? new Date(dateStr) : new Date(); // use today if invalid
  const daysParam = Number(req.body.inputParameters.days as string);
  const days = isNaN(daysParam) || daysParam < 1 ? 100 : daysParam; // 100 is default
  const tzParam = Number(req.body.inputParameters.timezoneOffset as string);
  const tzOffset = isNaN(tzParam) ? 0 : tzParam; // 0 is default
  const calculateMethod = getCalculationMethodParameter(
    req.body.inputParameters.calculationMethod as string
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
  const lat = Number(req.body.inputParameters.lat as string);
  const lng = Number(req.body.inputParameters.lng as string);
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    res.send({ error: "INVALID coordinates!" });
  } else {
    res.send(findPlace(lat, lng));
  }
}

function getTimesFromPlace(req: Request, res: Response) {
  const country = req.body.inputParameters.country as string;
  const region = req.body.inputParameters.region as string;
  const city = req.body.inputParameters.city as string;
  const place = getPlace(country, region, city);
  const dateStr = req.body.inputParameters.date as string;
  const date = isValidDate(dateStr) ? new Date(dateStr) : new Date(); // use today if invalid
  const daysParam = Number(req.body.inputParameters.days as string);
  const days = isNaN(daysParam) || daysParam < 1 ? 100 : daysParam; // 50 is default
  const tzParam = Number(req.body.inputParameters.timezoneOffset as string);
  const tzOffset = isNaN(tzParam) ? 0 : tzParam; // 0 is default
  const calculateMethod = getCalculationMethodParameter(
    req.body.inputParameters.calculationMethod as string
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
