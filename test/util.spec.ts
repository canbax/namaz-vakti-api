import {
  prefix0,
  extractTimeFromDate,
  isValidDate,
  dateToString,
  isHourStringsClose,
} from "../src/util";

test("should detect close hour strings for the same hour values", () => {
  expect(isHourStringsClose("00:00", "00:03")).toBe(true);
});

test("should detect close hour strings for the different hour values", () => {
  expect(isHourStringsClose("09:00", "08:57")).toBe(true);
});

test("should detect distant hour strings", () => {
  expect(isHourStringsClose("19:52", "19:59")).toBe(false);
});

test("should prefix 0 for a 1 digit number", () => {
  expect(prefix0(1)).toBe("01");
});

test("should not prefix 0 for a 2 digit number", () => {
  expect(prefix0(12)).toBe("12");
});

test("should throw error for numbers more than 2 digits", () => {
  expect(() => {
    prefix0(123);
  }).toThrow();
});

test("should extract hours and minutes in UTC timezone from a Date object when timezone offset is 0", () => {
  const d = new Date(Date.UTC(2022, 10, 20, 10, 32));
  expect(extractTimeFromDate(d, 0)).toBe("10:32");
});

test("should extract hours and minutes in UTC timezone from a Date object when timezone offset is positive", () => {
  const d = new Date(Date.UTC(2022, 10, 20, 10, 32));
  expect(extractTimeFromDate(d, 150)).toBe("13:02");
});

test("should extract hours and minutes in UTC timezone from a Date object when timezone offset is negative", () => {
  const d = new Date(Date.UTC(2022, 10, 20, 10, 32));
  expect(extractTimeFromDate(d, -150)).toBe("08:02");
});

test("should extract hours and minutes in UTC timezone from a Date object even if the day decreases", () => {
  const d = new Date(Date.UTC(2022, 10, 20, 1, 32));
  expect(extractTimeFromDate(d, -150)).toBe("23:02");
});

test("should extract hours and minutes in UTC timezone from a Date object even if the day increases", () => {
  const d = new Date(Date.UTC(2022, 10, 20, 23, 32));
  expect(extractTimeFromDate(d, 150)).toBe("02:02");
});

test("should not except date string if year is less than 1000 ", () => {
  expect(isValidDate("100-1-10")).toBe(false);
});

test("should not except date string if year is greater than 3000 ", () => {
  expect(isValidDate("3100-1-10")).toBe(false);
});

test("should not except month is less than 1 ", () => {
  expect(isValidDate("1994-00-10")).toBe(false);
});

test("should not except month is greater than 12 ", () => {
  expect(isValidDate("1994-13-10")).toBe(false);
});

test("should not except day is less than 1 ", () => {
  expect(isValidDate("1994-06-00")).toBe(false);
});

test("should not except day is greater than 31 ", () => {
  expect(isValidDate("1994-07-32")).toBe(false);
});

test("should not except if day is not 2 characters ", () => {
  expect(isValidDate("1994-07-3")).toBe(false);
});

test("should not except if month is not 2 characters ", () => {
  expect(isValidDate("1994-7-03")).toBe(false);
});

test("should except date string even if February is not that long", () => {
  expect(isValidDate("1995-02-30")).toBe(true);
});

test("should convert Date object into 'DateString' when day and month are 2 digits", () => {
  expect(dateToString(new Date(2022, 10, 10))).toBe("2022-11-10");
});

test("should convert Date object into 'DateString' when day and month are 1 digit", () => {
  expect(dateToString(new Date(2022, 2, 4))).toBe("2022-03-04");
});
