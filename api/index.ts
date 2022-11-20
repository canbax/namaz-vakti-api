import express, { Express, Request, Response } from "express";
import { ALL_PLACES } from "../staticData";
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";

const app: Express = express();

/** use this function like `app.use(allowOrigion4All);` for an express app
 * Make API accessiable for all clients. Not for only clients from a specific domain.
 */
function allowOrigin4All(_: any, res: any, next: any) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
}

/** get a list of countries
 * @param  {} _
 * @param  {} res
 */
const getCountries = (_: Request, res: Response) => {
  res.send(Object.keys(ALL_PLACES));
};

const getRegionsOfCountry = (req: Request, res: Response) => {
  const country = req.query.country as string;
  if (ALL_PLACES[country]) {
    res.send(Object.keys(ALL_PLACES[country].regions));
  } else {
    res.send("NOT FOUND!");
  }
};

const getCitiesOfRegion = (req: Request, res: Response) => {
  const country = req.query.country as string;
  const region = req.query.region as string;
  if (ALL_PLACES[country] && ALL_PLACES[country].regions[region]) {
    res.send(Object.keys(ALL_PLACES[country].regions[region]));
  } else {
    res.send("NOT FOUND!");
  }
};

const getCoordinateData = (req: Request, res: Response) => {
  const country = req.query.country as string;
  const region = req.query.region as string;
  const city = req.query.city as string;
  if (
    ALL_PLACES[country] &&
    ALL_PLACES[country].regions[region] &&
    ALL_PLACES[country].regions[region][city]
  ) {
    res.send(ALL_PLACES[country].regions[region][city]);
  } else {
    res.send("NOT FOUND!");
  }
};

const getTime = (lat: number, lng: number, date: Date) => {
  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.Turkey();
  params.madhab = Madhab.Hanafi;
  const times = new PrayerTimes(coordinates, date, params);
  return times;
};

const getTimesFromCoordinates = (req: Request, res: Response) => {
  const lat = Number(req.query.lat as string);
  const lng = Number(req.query.lng as string);
  if (isNaN(lat) || isNaN(lng)) {
    res.send("INVALID coordinates!");
  } else {
    const place = getPlace(lat, lng);
    const time = getTime(lat, lng, new Date());
    res.send({ place, time });
  }
};

const getPlace = (lat: number, lng: number) => {
  let minDiff = 1000000;
  let place: {
    countryCode: string;
    country: string;
    region: string;
    city: string;
  } = {
    countryCode: "",
    country: "",
    region: "",
    city: "null",
  };
  for (let country in ALL_PLACES) {
    for (let region in ALL_PLACES[country].regions) {
      for (let city in ALL_PLACES[country].regions[region]) {
        const [lat1, lng1] = ALL_PLACES[country].regions[region][city];
        const diff = Math.abs(lat1 - lat) + Math.abs(lng1 - lng);
        if (diff < minDiff) {
          place = {
            countryCode: ALL_PLACES[country].code,
            country,
            region,
            city,
          };
          minDiff = diff;
        }
      }
    }
  }
  return place;
};

const getPlaceData = (req: Request, res: Response) => {
  const lat = Number(req.query.lat as string);
  const lng = Number(req.query.lng as string);
  if (isNaN(lat) || isNaN(lng)) {
    res.send("INVALID coordinates!");
  } else {
    res.send(getPlace(lat, lng));
  }
};

app.use(allowOrigin4All);
app.use(express.static("public"));

app.get("/api/countries", getCountries);
app.get("/api/regions", getRegionsOfCountry);
app.get("/api/cities", getCitiesOfRegion);
app.get("/api/coordinates", getCoordinateData);
app.get("/api/getPlaceData", getPlaceData);
app.get("/api/times", getTimesFromCoordinates);

app.get("/api/ip", (req: Request, res: Response) => {
  res.send(req.headers["x-forwarded-for"]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("namaz vakti API listening on 3000"));
