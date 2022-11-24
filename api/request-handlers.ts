import { Request, Response } from "express";
import { ALL_PLACES } from "../staticData";
import { getPlace, getPrayTimes } from "./calculator";

/** get a list of countries
 * @param  {} _
 * @param  {} res
 */
export function getCountries(_: Request, res: Response) {
  res.send(Object.keys(ALL_PLACES));
}

export function getRegionsOfCountry(req: Request, res: Response) {
  const country = req.query.country as string;
  if (ALL_PLACES[country]) {
    res.send(Object.keys(ALL_PLACES[country].regions));
  } else {
    res.send("NOT FOUND!");
  }
}

export function getCitiesOfRegion(req: Request, res: Response) {
  const country = req.query.country as string;
  const region = req.query.region as string;
  if (ALL_PLACES[country] && ALL_PLACES[country].regions[region]) {
    res.send(Object.keys(ALL_PLACES[country].regions[region]));
  } else {
    res.send("NOT FOUND!");
  }
}

export function getCoordinateData(req: Request, res: Response) {
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
}

export function getTimesFromCoordinates(req: Request, res: Response) {
  const lat = Number(req.query.lat as string);
  const lng = Number(req.query.lng as string);
  if (isNaN(lat) || isNaN(lng)) {
    res.send("INVALID coordinates!");
  } else {
    const place = getPlace(lat, lng);
    const time = getPrayTimes(lat, lng, new Date());
    res.send({ place, time });
  }
}

export function getPlaceData(req: Request, res: Response) {
  const lat = Number(req.query.lat as string);
  const lng = Number(req.query.lng as string);
  if (isNaN(lat) || isNaN(lng)) {
    res.send("INVALID coordinates!");
  } else {
    res.send(getPlace(lat, lng));
  }
}

export function getIPAdress(req: Request, res: Response) {
  res.send(req.headers["x-forwarded-for"]);
}
