import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";
import { ALL_PLACES } from "../staticData";
import { HourString, Place, TimesData } from "./types";
import { extractTimeFromDate, dateToString } from "./util";

export function getTimes(
  lat: number,
  lng: number,
  date: Date,
  days: number
): TimesData {
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

export function getPlace(lat: number, lng: number): Place {
  let minDiff = Number.MAX_SAFE_INTEGER;
  let place: Place = {
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
}
