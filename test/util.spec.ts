import {
  prefix0,
  extractTimeFromDate,
  isValidDate,
  dateToString,
  isHourStringsClose,
  getCalculationMethodParameter,
  parseValidDaysCount,
} from "../src/util";

describe("utils.ts", () => {
  describe("parseValidDaysCount", () => {
    it.each(["0", "-1", "-100", "-0", "+0"])(
      "should return 1 if lower than 1: %s",
      (x) => {
        expect(parseValidDaysCount(x)).toBe(1);
      }
    );

    it.each([
      "999999",
      "129123881378712812871237712381281827123712371",
      "100201",
      "100201.1",
    ])("should return 1 if greater than 1000: %s", (x) => {
      expect(parseValidDaysCount(x)).toBe(1);
    });

    it.each([".2", ",2", "p", "ş", "ÖÇŞĞÜ"])(
      "should return 1 if invalid integer %s",
      (x) => {
        expect(parseValidDaysCount(x)).toBe(1);
      }
    );

    it.each(["3", "19", "100"])("should return proper integer %s", (x) => {
      expect(parseValidDaysCount(x)).toBe(Number(x));
    });

    it.each(["3.1", "19.99", "100.5"])(
      "should round down floating numbers %s",
      (x) => {
        expect(parseValidDaysCount(x)).toBe(Math.floor(Number(x)));
      }
    );
  });

  describe("isHourStringsClose", () => {
    it("should detect close hour strings for the same hour values", () => {
      expect(isHourStringsClose("00:00", "00:03")).toBe(true);
    });

    it("should detect close hour strings for the different hour values", () => {
      expect(isHourStringsClose("09:00", "08:57")).toBe(true);
    });

    it("should detect distant hour strings", () => {
      expect(isHourStringsClose("19:52", "19:59")).toBe(false);
    });
  });

  describe("prefix0", () => {
    it("should prefix 0 for a 1 digit number", () => {
      expect(prefix0(1)).toBe("01");
    });

    it("should not prefix 0 for a 2 digit number", () => {
      expect(prefix0(12)).toBe("12");
    });

    it("should throw error for numbers more than 2 digits", () => {
      expect(() => {
        prefix0(123);
      }).toThrow();
    });
  });

  describe("extractTimeFromDate", () => {
    it("should extract hours and minutes in UTC timezone from a Date object when timezone offset is 0", () => {
      const d = new Date(Date.UTC(2022, 10, 20, 10, 32));
      expect(extractTimeFromDate(d, 0)).toBe("10:32");
    });

    it("should extract hours and minutes in UTC timezone from a Date object when timezone offset is positive", () => {
      const d = new Date(Date.UTC(2022, 10, 20, 10, 32));
      expect(extractTimeFromDate(d, 150)).toBe("13:02");
    });

    it("should extract hours and minutes in UTC timezone from a Date object when timezone offset is negative", () => {
      const d = new Date(Date.UTC(2022, 10, 20, 10, 32));
      expect(extractTimeFromDate(d, -150)).toBe("08:02");
    });

    it("should extract hours and minutes in UTC timezone from a Date object even if the day decreases", () => {
      const d = new Date(Date.UTC(2022, 10, 20, 1, 32));
      expect(extractTimeFromDate(d, -150)).toBe("23:02");
    });

    it("should extract hours and minutes in UTC timezone from a Date object even if the day increases", () => {
      const d = new Date(Date.UTC(2022, 10, 20, 23, 32));
      expect(extractTimeFromDate(d, 150)).toBe("02:02");
    });
  });

  describe("isValidDate", () => {
    it("should not except date string if nil ", () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    it("should not except date string if year is less than 1000 ", () => {
      expect(isValidDate("100-1-10")).toBe(false);
    });

    it("should not except date string if year is greater than 3000 ", () => {
      expect(isValidDate("3100-1-10")).toBe(false);
    });

    it("should not except month is less than 1 ", () => {
      expect(isValidDate("1994-00-10")).toBe(false);
    });

    it("should not except month is greater than 12 ", () => {
      expect(isValidDate("1994-13-10")).toBe(false);
    });

    it("should not except day is less than 1 ", () => {
      expect(isValidDate("1994-06-00")).toBe(false);
    });

    it("should not except day is greater than 31 ", () => {
      expect(isValidDate("1994-07-32")).toBe(false);
    });

    it("should not except if day is not 2 characters ", () => {
      expect(isValidDate("1994-07-3")).toBe(false);
    });

    it("should not except if month is not 2 characters ", () => {
      expect(isValidDate("1994-7-03")).toBe(false);
    });

    it("should except date string even if February is not that long", () => {
      expect(isValidDate("1995-02-30")).toBe(true);
    });
  });

  describe("dateToString", () => {
    it("should convert Date object into 'DateString' when day and month are 2 digits", () => {
      expect(dateToString(new Date(2022, 10, 10))).toBe("2022-11-10");
    });

    it("should convert Date object into 'DateString' when day and month are 1 digit", () => {
      expect(dateToString(new Date(2022, 2, 4))).toBe("2022-03-04");
    });
  });

  describe("getCalculationMethodParameter", () => {
    it("Should get default calculation method of if undefined", () => {
      expect(getCalculationMethodParameter(undefined)).toBe("Turkey");
    });

    it("Should get default calculation method of if invalid parameter value is passed", () => {
      expect(getCalculationMethodParameter("my invalid method")).toBe("Turkey");
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
    ])("Should calculation method for valid string %s", (x) => {
      expect(getCalculationMethodParameter(x)).toBe(x);
    });
  });
});
