import express, { Express } from "express";
import {
  getCountries,
  getRegionsOfCountry,
  getCitiesOfRegion,
  getCoordinateData,
  getPlaceData,
  getTimesFromCoordinates,
  getIPAdress,
} from "../src/request-handlers";

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

app.use(allowOrigin4All);
app.use(express.static("public"));

app.get("/api/times", getTimesFromCoordinates);
app.get("/api/countries", getCountries);
app.get("/api/regions", getRegionsOfCountry);
app.get("/api/cities", getCitiesOfRegion);
app.get("/api/coordinates", getCoordinateData);
app.get("/api/place", getPlaceData);
app.get("/api/ip", getIPAdress);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("namaz vakti API listening on 3000"));
