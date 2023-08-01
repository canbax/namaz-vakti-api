import express, {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { ALL_PLACES } from "../data/geoData";
import { getPlace, findPlace, getTimes } from "../src/calculator";
import { dateToString, isInRange, isValidDate } from "../src/util";
import { readFileSync, writeFile } from "fs";

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
  totalVisits++;
  next();
};
const totalVisitCountFile = __dirname + "/total-visit-count.txt";
const userVisitCountFile = __dirname + "/user-visit-count.json";
let totalVisits = readTotalVisitCount();

export const writerTimerID = setInterval(writeTotalVisitCount, 3000);

app.use(allowOriginForAll);
app.use(express.static("public"));
app.use(logIPAdress);

app.get("/api/timesFromCoordinates", getTimesFromCoordinates);
app.get("/api/timesFromPlace", getTimesFromPlace);
app.get("/api/countries", getCountries);
app.get("/api/regions", getRegionsOfCountry);
app.get("/api/cities", getCitiesOfRegion);
app.get("/api/coordinates", getCoordinateData);
app.get("/api/place", getPlaceData);
app.get("/api/ip", getIPAdress);
app.get("/api/totalVisitCount", getTotalVisitCount);
app.get("/api/saveUserStat", saveUserStat);
app.get("/api/getUserStat", getUserStat);

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
  const days = isNaN(daysParam) || daysParam < 1 ? 100 : daysParam; // 50 is default
  const tzParam = Number(req.query.timezoneOffset as string);
  const tzOffset = isNaN(tzParam) ? 0 : tzParam; // 0 is default
  if (
    isNaN(lat) ||
    isNaN(lng) ||
    !isInRange(lat, -90, 90) ||
    !isInRange(lng, -180, 180)
  ) {
    res.send({ error: "Invalid coordinates!" });
  } else {
    const place = findPlace(lat, lng);
    const times = getTimes(lat, lng, date, days, tzOffset);
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
  if (!place) {
    res.send({ error: "Place cannot be found!" });
  } else {
    const lat = place.latitude;
    const lng = place.longitude;
    const times = getTimes(lat, lng, date, days, tzOffset);
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

function getTotalVisitCount(_: Request, res: Response) {
  res.send({ totalVisitCount: readTotalVisitCount() });
}

function getUserStat(_: Request, res: Response) {
  res.send(JSON.parse(readUserVisitsFile()));
}

function readUserVisitsFile(): string {
  return readFileSync(userVisitCountFile, {
    encoding: "utf-8",
  });
}

function saveUserStat(req: Request, res: Response) {
  const country = req.query.country as string;
  const region = req.query.region as string;
  const city = req.query.city as string;
  const dateString = dateToString(new Date());

  const json = JSON.parse(readUserVisitsFile());
  if (country && region && city) {
    if (!json[country]) {
      json[country] = {};
    }
    if (!json[country][region]) {
      json[country][region] = {};
    }
    if (!json[country][region][city]) {
      json[country][region][city] = {};
    }
    if (!json[country][region][city][dateString]) {
      json[country][region][city][dateString] = 0;
    }
    json[country][region][city][dateString] += 1;
    writeFile(userVisitCountFile, JSON.stringify(json), function (err) {
      if (err) {
        res.send({ error: "write file error:" + err });
      } else {
        res.send({ status: "success" });
      }
    });
  } else {
    res.send({ error: "INVALID parameters!" });
  }
}

function readTotalVisitCount(): number {
  const num = Number(
    readFileSync(totalVisitCountFile, {
      encoding: "utf-8",
    })
  );
  if (!isNaN(num)) return num;
  console.log("CANNOT read total visit counts!");
  return 0;
}

export function writeTotalVisitCount() {
  writeFile(totalVisitCountFile, totalVisits + "", function (err) {
    if (err) return console.log(err);
  });
}
