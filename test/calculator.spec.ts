import { getTimes, findPlace, getPlace } from "../api_src/calculator";
import { DateString } from "../api_src/types";
import { isHourStringsClose } from "../api_src/util";
import { DATA_ANKARA_1 } from "../data/mockData";
import { CalculationMethod } from "adhan";
import { it, expect, describe } from "vitest";

describe("calculator tests", () => {
  it("should bring times data similar to https://namazvakitleri.diyanet.gov.tr/tr-TR for Ankara in 2022-12-10 for 31 days", () => {
    const utcDate = new Date(2022, 11, 10);
    const times = getTimes(39.91987, 32.85427, utcDate, 31, 180);
    for (const k in DATA_ANKARA_1) {
      const ds = k as DateString;
      for (let i = 0; i < times[ds].length; i++) {
        const b = isHourStringsClose(times[ds][i], DATA_ANKARA_1[ds][i], 3);
        expect(b).toBe(true);
      }
    }
  });

  it.each([
    "MuslimWorldLeague",
    "Egyptian",
    "Karachi",
    "UmmAlQura",
    "Dubai",
    "MoonsightingCommittee",
    "NorthAmerica",
    "Kuwait",
    "Qatar",
    "Singapore",
    "Tehran",
    "Turkey",
    "Other",
  ] as (keyof typeof CalculationMethod)[])(
    "Should get valid times data for calculation method %s",
    (x) => {
      const times = getTimes(39.91987, 32.85427, new Date(), 1, 0, x);
      expect(times).toBeDefined();
      expect(Object.keys(times).length).toBe(1);
      expect(Object.values(times).length).toBe(1);
      expect(Object.values(times)[0].length).toBe(6);
    },
  );

  it("should find closest place to 0,0", () => {
    const p = findPlace(0, 0);
    expect(p.country).toBe("Ghana");
    expect(p.countryCode).toBe("GH");
    expect(p.region).toBe("Greater Accra");
    expect(p.city).toBe("Tema");
  });

  it("should find closest place to Ankara", () => {
    const p = findPlace(39.91986, 32.85426);
    expect(p.country).toBe("Turkey");
    expect(p.countryCode).toBe("TR");
    expect(p.region).toBe("Ankara");
    expect(p.city).toBe("Ankara");
  });

  it("should find closest place less then 100 ms", () => {
    const t1 = new Date().getTime();
    findPlace(39.91986, 32.85426);
    const deltaT = new Date().getTime() - t1;
    expect(deltaT < 100).toBe(true);
  });

  it("should be able to get an existing place ", () => {
    const p = getPlace("Turkey", "Ankara", "Ankara");
    expect(p).not.toBe(null);
  });

  it("should give null for non existing place ", () => {
    const p = getPlace("Turkey", "Anksara", "Ankara");
    expect(p).toBe(null);
  });

  it("should be able to get place in less than 10 ms", () => {
    const t1 = new Date().getTime();
    getPlace("Turkey", "Ankara", "Ankara");
    const deltaT = new Date().getTime() - t1;
    expect(deltaT < 10).toBe(true);
  });
});
