import request from "supertest";
import { app, httpServer } from "../api/index";
import { ANKARA_PLACE_DATA } from "../data/mockData";

describe("API endpoint tests", () => {
  jest.mock("fs");
  jest.mock("console");

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });

  it("should be able to bring all countries", async () => {
    const res = await request(app).get("/api/countries");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toContainEqual({ code: "CN", name: "China" });
    expect(res.body).toContainEqual({ code: "TR", name: "Turkey" });
  });

  it("should be able to bring times from coordinates for 'Ankara'", async () => {
    const url =
      "/api/timesFromCoordinates?lat=39.91987&lng=32.85427&date=2023-10-29&days=100&timezoneOffset=180";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    const { place, times } = res.body;
    expect(place).toEqual(ANKARA_PLACE_DATA);
    expect(times["2023-11-04"]).not.toBe(undefined);
    expect(times["2023-11-04"]).toEqual([
      "05:48",
      "07:13",
      "12:37",
      "15:24",
      "17:50",
      "19:10",
    ]);
  });

  it("should be able to bring times for proper negative coordinates ", async () => {
    const url = "/api/timesFromCoordinates?lat=-1&lng=-37";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    const { place, times } = res.body;
    expect(place).toBeTruthy();
    expect(times).toBeTruthy();
  });

  it("should respond error if latitude is not given properly for times request", async () => {
    const url = "/api/timesFromCoordinates?lat=A&lng=32.85427";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ error: "Invalid coordinates!" });
  });

  it("should respond error if longtitude is not given properly for times request", async () => {
    const url = "/api/timesFromCoordinates?lat=1&lng=B";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ error: "Invalid coordinates!" });
  });

  it("should respond error if latitude is not in range for times request", async () => {
    const url = "/api/timesFromCoordinates?lat=100&lng=32.85427";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ error: "Invalid coordinates!" });
  });

  it("should respond error if longtitude is not in range for times request", async () => {
    const url = "/api/timesFromCoordinates?lat=10&lng=-190";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ error: "Invalid coordinates!" });
  });

  it("should be able to bring times from locale for 'Ankara'", async () => {
    const url =
      "/api/timesFromPlace?country=Turkey&region=Ankara&city=Ankara&date=2023-10-29&days=100&timezoneOffset=180";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    const { place, times } = res.body;
    expect(place).toEqual(ANKARA_PLACE_DATA);
    expect(times["2023-11-04"]).not.toBe(undefined);
    expect(times["2023-11-04"]).toEqual([
      "05:48",
      "07:13",
      "12:37",
      "15:24",
      "17:50",
      "19:10",
    ]);
  });

  it("should be able to respond to bring times from locale that is not found", async () => {
    const url = "/api/timesFromPlace?country=A&region=Ankara&city=Ankara";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ error: "Place cannot be found!" });
  });

  it("should be able to get IP address", async () => {
    const url = "/api/ip";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
  });

  it("should be able to bring cities or states of a country", async () => {
    const url = "/api/regions?country=Germany";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual([
      "Baden-Wurttemberg",
      "Bayern",
      "Berlin",
      "Brandenburg",
      "Bremen",
      "Hamburg",
      "Hessen",
      "Mecklenburg-Vorpommern",
      "Niedersachsen",
      "Nordrhein-Westfalen",
      "Rheinland-Pfalz",
      "Saarland",
      "Sachsen",
      "Sachsen-Anhalt",
      "Schleswig-Holstein",
      "Thuringen",
    ]);
  });

  it("should give error response if country not found", async () => {
    const url = "/api/regions?country=XXXX";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual({ error: "NOT FOUND!" });
  });

  it("should be able to bring cities of a region", async () => {
    const url = "/api/cities?country=Turkey&region=Isparta";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual([
      "Atabey",
      "Eğirdir",
      "Gelendost",
      "Gönen",
      "Isparta",
      "Keçiborlu",
      "Şarkikaraağaç",
      "Senirkent",
      "Uluborlu",
      "Yalvaç",
      "Yenişarbademli",
    ]);
  });

  it("should give error response if a region is not found", async () => {
    const url = "/api/cities?country=Turkey&region=XXXX";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual({ error: "NOT FOUND!" });
  });

  it("should be able to find geographic coordinates of a locale", async () => {
    const url = "/api/coordinates?country=Turkey&region=Ankara&city=Ankara";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual(ANKARA_PLACE_DATA);
  });

  it("should be able to return not found for coordinates if locale not found", async () => {
    const url = "/api/coordinates?country=X&region=Y&city=Z";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual({ error: "NOT FOUND!" });
  });

  it("should give error to 'place' request if coordinates are wrong", async () => {
    const url = "/api/place?lat=a&lng=g";
    const res = await request(app).get(url);
    expect(res.body).toEqual({ error: "INVALID coordinates!" });
    expect(res.statusCode).toEqual(200);
  });

  it("should be able to find a locale from coordinates", async () => {
    const url = "/api/place?lat=39.91986&lng=32.85424";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(ANKARA_PLACE_DATA);
  });

  afterAll(() => {
    httpServer.close();
  });
});
