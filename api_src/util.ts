import { CalculationMethod } from "adhan";
import { DateString, HourString } from "./types.js";
import { Context } from "hono";

export function prefix0(n: number) {
  if (n > 99 || n < -99) throw new Error("Can only process 2 digits integers!");
  return (n + "").padStart(2, "0");
}

export function isDefined<T>(a: T | undefined | null): a is NonNullable<T> {
  return a !== undefined && a !== null;
}

export function extractTimeFromDate(
  d: Date,
  timezoneOffset: number,
): HourString {
  d.setMinutes(d.getMinutes() + timezoneOffset);
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  return (prefix0(hour) + ":" + prefix0(minute)) as HourString;
}

export function isValidDate(str: string | null | undefined): boolean {
  if (isNil(str)) return false;
  str = str as string;
  const regexMatch = str.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
  if (!regexMatch) return false;
  const [y, m, d] = str.split("-").map((x) => Number(x));
  if (!isDefined(y) || !isDefined(m) || !isDefined(d)) return false;
  if (y < 1000 || y > 3000 || m < 1 || m > 12 || d < 1 || d > 31) return false;

  return true;
}

export function getCalculationMethodParameter(
  calculationMethod: string | undefined,
): keyof typeof CalculationMethod {
  const val = calculationMethod as keyof typeof CalculationMethod;
  return val && CalculationMethod[val] ? val : "Turkey";
}

export function dateToStandardString(date: Date): DateString {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${prefix0(month)}-${prefix0(day)}` as DateString;
}

export function isNil(value: string | null | undefined) {
  return value === null || value === undefined;
}

export function isInRange(a: number, min: number, max: number) {
  return a >= min && a <= max;
}

export function isHourStringsClose(
  s1: HourString,
  s2: HourString,
  minuteDiff = 5,
): boolean {
  const [hour1, min1] = s1.split(":").map((x) => Number(x));
  const [hour2, min2] = s2.split(":").map((x) => Number(x));

  if (
    !isDefined(hour1) ||
    !isDefined(hour2) ||
    !isDefined(min1) ||
    !isDefined(min2)
  )
    return false;
  return Math.abs(hour1 * 60 + min1 - hour2 * 60 - min2) <= minuteDiff;
}

export function getParamsForPlaceSearch(c: Context) {
  const query = c.req.query();
  const lat = Number(query["lat"] as string);
  const lng = Number(query["lng"] as string);
  const resultCount = query["resultCount"] ? Number(query["resultCount"]) : 5;
  const lang = (query["lang"] as string) || "en";
  const countryCode = query["countryCode"] as string;

  return { lat, lng, lang, resultCount, countryCode };
}

export function getCommonTimeRequestParameters(c: Context) {
  const query = c.req.query();
  const dateStr = query["date"] as string;
  const date = isValidDate(dateStr) ? new Date(dateStr) : new Date(); // use today if invalid
  const daysParam = Number(query["days"] as string);
  const days = isNaN(daysParam) || daysParam < 1 ? 1 : daysParam; // 1 is default
  const tzParam = Number(query["timezoneOffset"] as string);
  const tzOffset = isNaN(tzParam) ? 0 : tzParam; // 0 is default
  const calculateMethod = getCalculationMethodParameter(
    query["calculationMethod"] as string,
  );
  return { date, days, tzOffset, calculateMethod };
}
