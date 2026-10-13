import type { GeoNamesResult } from "@/lib/place";

/** GeoNames `searchJSON` rows (`style=FULL`), trimmed to the fields `matchCity` reads. */
export const lisbonGeoName: GeoNamesResult = {
  geonameId: 2267057,
  name: "Lisbon",
  toponymName: "Lisboa",
  asciiName: "Lisbon",
  alternateNames: [
    { name: "Lisboa", lang: "pt" },
    { name: "Lissabon", lang: "de" },
  ],
  countryCode: "PT",
  countryName: "Portugal",
  lat: "38.71667",
  lng: "-9.13333",
  population: 517802,
  timezone: { timeZoneId: "Europe/Lisbon" },
};

export const munichGeoName: GeoNamesResult = {
  geonameId: 2867714,
  name: "Munich",
  toponymName: "München",
  asciiName: "Munich",
  alternateNames: [{ name: "München", lang: "de" }],
  countryCode: "DE",
  countryName: "Germany",
  lat: "48.13743",
  lng: "11.57549",
  population: 1260391,
  timezone: { timeZoneId: "Europe/Berlin" },
};

export const saoPauloGeoName: GeoNamesResult = {
  geonameId: 3448439,
  name: "São Paulo",
  toponymName: "São Paulo",
  asciiName: "Sao Paulo",
  countryCode: "BR",
  countryName: "Brazil",
  lat: "-23.5475",
  lng: "-46.63611",
  population: 10021295,
  timezone: { timeZoneId: "America/Sao_Paulo" },
};

/** What `searchJSON` answers for "Lisbon" in PT — also the e2e fixture. */
export const geoNamesSearchFixture = {
  totalResultsCount: 1,
  geonames: [lisbonGeoName],
};
