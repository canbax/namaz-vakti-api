import request from "supertest";
import { app, httpServer } from "../api/index";
import { ANKARA_PLACE_DATA } from "../data/mockData";

describe("API endpoint tests", () => {
  it("should be able to bring all countries", async () => {
    const res = await request(app).get("/api/countries");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toContainEqual({ code: "CN", name: "China" });
    expect(res.body).toContainEqual({ code: "TR", name: "Turkey" });
  });

  it("should be able to bring times from coordinates for 'Ankara'", async () => {
    const url =
      "/api/timesFromCoordinates?lat=39.91987&lng=32.85427&date=2023-10-29&days=100";
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

  it("should be able to bring times from locale for 'Ankara'", async () => {
    const url =
      "/api/timesFromPlace?country=Turkey&region=Ankara&city=Ankara&date=2023-10-29&days=100";
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

  it("should be able to bring cities or states of a country", async () => {
    const url = "/api/regions?country=Germany";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual([
      "Hessen",
      "Hamburg",
      "Bayern",
      "Nordrhein-Westfalen",
      "Rheinland-Pfalz",
      "Berlin",
      "Baden-Wurttemberg",
      "Schleswig-Holstein",
      "Sachsen",
      "Bremen",
      "Saarland",
      "Niedersachsen",
      "Sachsen-Anhalt",
      "Mecklenburg-Vorpommern",
      "Thuringen",
      "Brandenburg",
    ]);
  });

  it("should be able to bring cities or districts of a country", async () => {
    const url = "/api/cities?country=Turkey&region=Isparta";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual([
      "Isparta",
      "Sarkikaraagac",
      "Egirdir",
      "Yalvac",
      "Senirkent",
      "Gelendost",
      "Keciborlu",
      "Yenisarbademli",
      "Anamas",
      "Gonen",
      "Atabey",
      "Uluborlu",
      "Erenler",
    ]);
  });

  it("should be able to find geographic coordinates of a locale", async () => {
    const url = "/api/coordinates?country=Turkey&region=Ankara&city=Ankara";
    const res = await request(app).get(url);
    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual(ANKARA_PLACE_DATA);
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
