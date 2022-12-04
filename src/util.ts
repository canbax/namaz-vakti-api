import { DateString, HourString } from "./types";

export function prefix0(n: number) {
  if (n > 99 || n < -99) throw "Can only process 2 digits integers!";
  return (n + "").padStart(2, "0");
}

export function extractTimeFromDate(d: Date): HourString {
  const hour = d.getHours();
  const minute = d.getMinutes();
  return (prefix0(hour) + ":" + prefix0(minute)) as HourString;
}

export function isValidDate(str: string): boolean {
  if (isNil(str)) return false;
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

export function isNil(value: any) {
  return value === null || value === undefined;
}

export function isInRange(a: number, min: number, max: number) {
  return a >= min && a <= max;
}
