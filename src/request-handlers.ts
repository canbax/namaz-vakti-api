import { Request, Response } from "express";
import { ALL_PLACES } from "../data/geoData";
import { getPlace, findPlace, getTimes } from "./calculator";
import { isInRange, isValidDate } from "./util";

/** get a list of countries
 * @param  {} _
 * @param  {} res
 */
export function getCountries(_: Request, res: Response) {
  const r = [];
  for (const c in ALL_PLACES) {
    r.push({ code: ALL_PLACES[c].code, name: c });
  }
  res.send(r);
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
  const coords = getPlace(country, region, city);
  if (coords) {
    res.send(coords);
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
  const days = isNaN(daysParam) || daysParam < 1 ? 100 : daysParam; // 50 is default
  const tzParam = Number(req.query.timezoneOffset as string);
  const tzOffset = isNaN(tzParam) ? 180 : tzParam; // 180 is default
  if (
    isNaN(lat) ||
    isNaN(lng) ||
    !isInRange(lat, -90, 90) ||
    !isInRange(lng, -180, 180)
  ) {
    res.send("Invalid coordinates!");
  } else {
    const place = findPlace(lat, lng);
    const times = getTimes(lat, lng, date, days, tzOffset);
    res.send({ place, times });
  }
}

export function getPlaceData(req: Request, res: Response) {
  const lat = Number(req.query.lat as string);
  const lng = Number(req.query.lng as string);
  if (isNaN(lat) || isNaN(lng)) {
    res.send("INVALID coordinates!");
  } else {
    res.send(findPlace(lat, lng));
  }
}

export function getTimesFromPlace(req: Request, res: Response) {
  const country = req.query.country as string;
  const region = req.query.region as string;
  const city = req.query.city as string;
  const place = getPlace(country, region, city);
  const dateStr = req.query.date as string;
  const date = isValidDate(dateStr) ? new Date(dateStr) : new Date(); // use today if invalid
  const daysParam = Number(req.query.days as string);
  const days = isNaN(daysParam) || daysParam < 1 ? 100 : daysParam; // 50 is default
  const tzParam = Number(req.query.timezoneOffset as string);
  const tzOffset = isNaN(tzParam) ? 180 : tzParam; // 180 is default
  if (!place) {
    res.send("Place cannot be found!");
  } else {
    const lat = place.latitude;
    const lng = place.longitude;
    const times = getTimes(lat, lng, date, days, tzOffset);
    res.send({ place, times });
  }
}

export function getIPAdress(req: Request, res: Response) {
  res.send(req.headers["x-forwarded-for"]);
}
