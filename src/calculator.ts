import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";
import { ALL_PLACES } from "../data/geoData";
import { HourString, Place, TimesData } from "./types";
import { extractTimeFromDate, dateToString } from "./util";

export function getTimes(lat: number, lng: number, date: Date, days: number) {
  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.Turkey();
  params.madhab = Madhab.Shafi;
  const r: TimesData = {};
  for (let i = 0; i < days; i++) {
    const times = new PrayerTimes(coordinates, date, params);
    let arr: HourString[] = [];
    arr.push(extractTimeFromDate(times.fajr));
    arr.push(extractTimeFromDate(times.sunrise));
    arr.push(extractTimeFromDate(times.dhuhr));
    arr.push(extractTimeFromDate(times.asr));
    arr.push(extractTimeFromDate(times.maghrib));
    arr.push(extractTimeFromDate(times.isha));
    r[dateToString(date)] = arr;
    date.setDate(date.getDate() + 1);
  }
  return r;
}

export function findPlace(lat: number, lng: number): Place {
  let minDiff = Number.MAX_SAFE_INTEGER;
  let place: Place = {
    countryCode: "",
    country: "",
    region: "",
    city: "null",
    latitude: 0,
    longitude: 0,
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
            latitude: lat1,
            longitude: lng1,
          };
          minDiff = diff;
        }
      }
    }
  }
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
