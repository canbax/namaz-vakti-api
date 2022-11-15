export function getTimes(date, coordinates, timezone) {}

// convert Gregorian date to Julian day
// Ref: Astronomical Algorithms by Jean Meeus
function gregorianToJulianDay(year, month, day) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  let A = Math.floor(year / 100);
  let B = 2 - A + Math.floor(A / 4);

  let JD =
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5;
  return JD;
}
