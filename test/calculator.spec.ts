import { getTimes, findPlace, getPlace } from "../src/calculator";
import { DateString } from "../src/types";
import { isHourStringsClose } from "../src/util";
import { DATA_ANKARA_1 } from "./mockData";

test("should bring times data similar to https://namazvakitleri.diyanet.gov.tr/tr-TR for Ankara in 2022-12-10 for 31 days", function () {
  const utcDate = new Date(2022, 11, 10);
  const times = getTimes(39.91987, 32.85427, utcDate, 31, 180);
  for (const k in DATA_ANKARA_1) {
    const ds = k as DateString;
    for (let i = 0; i < times[ds].length; i++) {
      expect(isHourStringsClose(times[ds][i], DATA_ANKARA_1[ds][i], 3)).toBe(
        true
      );
    }
  }
});

test("should find closest place to 0,0", function () {
  const p = findPlace(0, 0);
  expect(p.country).toBe("Ghana");
  expect(p.countryCode).toBe("GH");
  expect(p.region).toBe("Greater Accra");
  expect(p.city).toBe("Tema");
});

test("should find closest place to Ankara", function () {
  const p = findPlace(39.91986, 32.85426);
  expect(p.country).toBe("Turkey");
  expect(p.countryCode).toBe("TR");
  expect(p.region).toBe("Ankara");
  expect(p.city).toBe("Ankara");
});

test("should find closest place less then 100 ms", function () {
  const t1 = new Date().getTime();
  findPlace(39.91986, 32.85426);
  const deltaT = new Date().getTime() - t1;
  expect(deltaT < 100).toBe(true);
});

test("should be able to get an existing place ", function () {
  const p = getPlace("Turkey", "Ankara", "Ankara");
  expect(p).not.toBe(null);
});

test("should give null for non existing place ", function () {
  const p = getPlace("Turkey", "Anksara", "Ankara");
  expect(p).toBe(null);
});

test("should be able to get place in less than 10 ms", function () {
  const t1 = new Date().getTime();
  getPlace("Turkey", "Ankara", "Ankara");
  const deltaT = new Date().getTime() - t1;
  expect(deltaT < 10).toBe(true);
});
