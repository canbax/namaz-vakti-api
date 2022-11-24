import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";
import { ALL_PLACES } from "../staticData";
import { extractTimeFromDate } from "./util";

export function getPrayTimes(lat: number, lng: number, date: Date) {
  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.Turkey();
  params.madhab = Madhab.Shafi;
  const times = new PrayerTimes(coordinates, date, params);
  let arr: string[] = [];
  arr.push(extractTimeFromDate(times.fajr));
  arr.push(extractTimeFromDate(times.sunrise));
  arr.push(extractTimeFromDate(times.dhuhr));
  arr.push(extractTimeFromDate(times.asr));
  arr.push(extractTimeFromDate(times.maghrib));
  arr.push(extractTimeFromDate(times.isha));
  return arr;
}

export function getPlace(lat: number, lng: number) {
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
}
