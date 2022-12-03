import { Request, Response } from "express";
import { ALL_PLACES } from "../staticData";
import { getPlace, getTimes } from "./calculator";
import { isValidDate } from "./util";

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
  const dateStr = req.query.date as string;
  const date = isValidDate(dateStr) ? new Date(dateStr) : new Date(); // use today if invalid
  const daysParam = Number(req.query.days as string);
  const days = isNaN(daysParam) || daysParam < 1 ? 50 : daysParam; // 50 is default
  if (isNaN(lat) || isNaN(lng)) {
    res.send("INVALID coordinates!");
  } else {
    const place = getPlace(lat, lng);
    const times = getTimes(lat, lng, date, days);
    res.send({ place, times });
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
