import express, { Express, Request, Response } from "express";
import { COUNTRIES } from "../staticData";
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
const getCountryList = (req: Request, res: Response) => {
  res.send(COUNTRIES);
};

app.use(allowOrigin4All);
app.use(express.static("public"));

app.get("/api/countries", getCountryList);

app.get("/api/ip", (req: Request, res: Response) => {
  res.send(req.headers["x-forwarded-for"]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("namaz vakti API listening on 3000"));
