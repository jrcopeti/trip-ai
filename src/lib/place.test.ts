import { describe, expect, it } from "vitest";
import { matchCity, normalise } from "@/lib/place";
import {
  glasgowGeoName,
  lisbonGeoName,
  londonGeoName,
  munichGeoName,
  saoPauloGeoName,
} from "@/test/fixtures";

describe("normalise", () => {
  it("trims, lowercases and strips accents", () => {
    expect(normalise("  São Paulo ")).toBe("sao paulo");
    expect(normalise("MÜNCHEN")).toBe("munchen");
  });
});

describe("matchCity", () => {
  it("matches the English name and the local one", () => {
    expect(matchCity("Lisbon", [lisbonGeoName], "PT")?.name).toBe("Lisbon");
    expect(matchCity("Lisboa", [lisbonGeoName], "PT")?.name).toBe("Lisbon");
    expect(matchCity("lissabon", [lisbonGeoName], "pt")?.name).toBe("Lisbon");
  });

  it("matches with or without accents", () => {
    expect(matchCity("München", [munichGeoName], "DE")?.name).toBe("Munich");
    expect(matchCity("Munchen", [munichGeoName], "DE")?.name).toBe("Munich");
    expect(matchCity("Sao Paulo", [saoPauloGeoName], "BR")?.name).toBe("São Paulo");
    expect(matchCity("são paulo", [saoPauloGeoName], "BR")?.name).toBe("São Paulo");
  });

  it("returns the canonical place with numeric coordinates", () => {
    expect(matchCity("Lisboa", [lisbonGeoName], "PT")).toEqual({
      name: "Lisbon",
      country: "Portugal",
      lat: 38.71667,
      lng: -9.13333,
      timezone: "Europe/Lisbon",
      geonameId: 2267057,
    });
  });

  it("matches an alternate name with no language", () => {
    expect(matchCity("Olisipo", [lisbonGeoName], "PT")?.name).toBe("Lisbon");
  });

  it("rejects alternates that are codes or links, not names", () => {
    for (const code of ["LIS", "LPPT", "1100", "PTLIS", "Q597", "https://en.wikipedia.org/wiki/Lisbon"]) {
      expect(matchCity(code, [lisbonGeoName], "PT")).toBeNull();
    }
  });

  it("rejects a name that is not the city's", () => {
    expect(matchCity("Porto", [lisbonGeoName], "PT")).toBeNull();
    expect(matchCity("   ", [lisbonGeoName], "PT")).toBeNull();
  });

  it("rejects a place with no population — the search returns uninhabited places too", () => {
    expect(matchCity("Lisbon", [{ ...lisbonGeoName, population: 0 }], "PT")).toBeNull();
  });

  it("rejects a city in the wrong country", () => {
    expect(matchCity("Lisbon", [lisbonGeoName], "BR")).toBeNull();
  });

  it("rejects a city in another UK nation when one is given", () => {
    expect(matchCity("Glasgow", [glasgowGeoName], "GB", "ENG")).toBeNull();
    expect(matchCity("Glasgow", [glasgowGeoName], "GB", "SCT")?.name).toBe("Glasgow");
  });

  it("matches any nation under plain GB", () => {
    const uk = [londonGeoName, glasgowGeoName];
    expect(matchCity("Glasgow", uk, "GB")?.name).toBe("Glasgow");
    expect(matchCity("London", uk, "GB")?.name).toBe("London");
  });

  it("prefers the most populous match", () => {
    const smallLisbon = { ...lisbonGeoName, geonameId: 1, population: 900 };
    expect(matchCity("Lisbon", [smallLisbon, lisbonGeoName], "PT")?.geonameId).toBe(2267057);
  });
});
