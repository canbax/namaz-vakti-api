import { DateString, HourString } from "./types";

export function prefix0(n: number) {
  if (n > 99 || n < -99) throw new Error("Can only process 2 digits integers!");
  return (n + "").padStart(2, "0");
}

export function extractTimeFromDate(
  d: Date,
  timezoneOffset: number
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
  if (y < 1000 || y > 3000 || m < 1 || m > 12 || d < 1 || d > 31) return false;

  return true;
}

export function dateToString(date: Date): DateString {
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
  minuteDiff = 5
): boolean {
  const [hour1, min1] = s1.split(":").map((x) => Number(x));
  const [hour2, min2] = s2.split(":").map((x) => Number(x));

  return Math.abs(hour1 * 60 + min1 - hour2 * 60 - min2) <= minuteDiff;
}
