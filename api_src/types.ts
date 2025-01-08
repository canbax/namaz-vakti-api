export type Place = {
  countryCode: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
};

export type CountryData = {
  code: string;
  regions: Record<string, Record<string, [number, number]>>;
};

type _1To9 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type _0To9 = 0 | _1To9;
type _0To5 = 0 | 1 | 2 | 3 | 4 | 5;
type _0To3 = 0 | 1 | 2 | 3;

export type HourString =
  | `${0 | 1}${_0To9}:${_0To5}${_0To9}`
  | `${2}${_0To3}:${_0To5}${_0To9}`;

type MM = `0${_1To9}` | `1${0 | 1 | 2}`;
type DD = `${0}${_1To9}` | `${1 | 2}${_0To9}` | `3${0 | 1}`;

// YYYY-MM-DD formatted string
export type DateString = `${number}-${MM}-${DD}`;

export type TimesData = Record<DateString, HourString[]>;
