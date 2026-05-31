import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";
import { ALL_PLACES } from "../data/geoData.js";
import { HourString, Place, TimesData } from "./types.js";
import { extractTimeFromDate, dateToStandardString } from "./util.js";

// Simple LRU cache: evict the oldest entry when max size is reached
const TIMES_CACHE_MAX = 5000;
const timesCache = new Map<string, TimesData>();
const findPlaceCache = new Map<string, Place>();

// Pre-flatten the locations list once at startup for highly optimized linear lookup
const flatPlaces: Place[] = [];
for (const country in ALL_PLACES) {
  const countryObj = ALL_PLACES[country];
  for (const region in countryObj.regions) {
    const regionObj = countryObj.regions[region];
    for (const city in regionObj) {
      const [lat, lng] = regionObj[city];
      flatPlaces.push({
        countryCode: countryObj.code,
        country,
        region,
        city,
        latitude: lat,
        longitude: lng,
      });
    }
  }
}

export function getTimes(
  lat: number,
  lng: number,
  date: Date,
  days: number,
  timezoneOffset: number,
  calculationMethod: keyof typeof CalculationMethod = "Turkey",
): TimesData {
  const startDateStr = dateToStandardString(new Date(date));
  const cacheKey = `${lat.toFixed(4)}|${lng.toFixed(4)}|${startDateStr}|${days}|${timezoneOffset}|${calculationMethod}`;
  if (timesCache.has(cacheKey)) return timesCache.get(cacheKey)!;

  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod[calculationMethod]();
  params.madhab = Madhab.Shafi;
  const r: TimesData = {};
  for (let i = 0; i < days; i++) {
    const times = new PrayerTimes(coordinates, date, params);
    const arr: HourString[] = [];
    arr.push(extractTimeFromDate(times.fajr, timezoneOffset));
    arr.push(extractTimeFromDate(times.sunrise, timezoneOffset));
    arr.push(extractTimeFromDate(times.dhuhr, timezoneOffset));
    arr.push(extractTimeFromDate(times.asr, timezoneOffset));
    arr.push(extractTimeFromDate(times.maghrib, timezoneOffset));
    arr.push(extractTimeFromDate(times.isha, timezoneOffset));
    r[dateToStandardString(date)] = arr;
    date.setDate(date.getDate() + 1);
  }

  if (timesCache.size >= TIMES_CACHE_MAX) {
    timesCache.delete(timesCache.keys().next().value!);
  }
  timesCache.set(cacheKey, r);
  return r;
}

export function findPlace(lat2: number, lng: number): Place {
  const cacheKey = `${lat2.toFixed(2)}|${lng.toFixed(2)}`;
  if (findPlaceCache.has(cacheKey)) return findPlaceCache.get(cacheKey)!;

  let minDiff = Number.MAX_SAFE_INTEGER;
  let place: Place = {
    countryCode: "",
    country: "",
    region: "",
    city: "null",
    latitude: 0,
    longitude: 0,
  };

  for (let i = 0; i < flatPlaces.length; i++) {
    const p = flatPlaces[i];
    const diff = Math.abs(p.latitude - lat2) + Math.abs(p.longitude - lng);
    if (diff < minDiff) {
      place = p;
      minDiff = diff;
    }
  }

  if (findPlaceCache.size >= TIMES_CACHE_MAX) {
    findPlaceCache.delete(findPlaceCache.keys().next().value!);
  }
  findPlaceCache.set(cacheKey, place);

  return place;
}

export function getPlace(country: string, region: string, city: string) {
  if (
    ALL_PLACES[country] &&
    ALL_PLACES[country].regions[region] &&
    ALL_PLACES[country].regions[region][city]
  ) {
    const p: Place = {
      country,
      countryCode: ALL_PLACES[country].code,
      city,
      region,
      latitude: ALL_PLACES[country].regions[region][city][0],
      longitude: ALL_PLACES[country].regions[region][city][1],
    };
    return p;
  }
  return null;
}
