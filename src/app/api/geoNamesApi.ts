"use server";
import { matchCity, type GeoNamesResult, type Place } from "@/lib/place";
import { geoNamesSearchFixture, useE2EFixtures } from "./e2eFixtures";

export type ResolvePlaceResult =
  | { ok: true; place: Place }
  | { ok: false; error: "not-found" | "unavailable" };

async function searchGeoNames(city: string, countryCode: string): Promise<GeoNamesResult[]> {
  if (useE2EFixtures) return geoNamesSearchFixture.geonames;

  const params = new URLSearchParams({
    q: city,
    country: countryCode,
    featureClass: "P",
    maxRows: "10",
    style: "FULL",
    orderby: "population",
    lang: "en",
    username: process.env.GEONAMES_USERNAME ?? "",
  });
  const response = await fetch(`https://secure.geonames.org/searchJSON?${params}`);
  const data = await response.json();
  // GeoNames answers errors (bad username, quota) with a 200 and a `status` body.
  if (!response.ok || data.status) {
    throw new Error(`GeoNames: ${data.status?.message ?? response.status}`);
  }
  return data.geonames ?? [];
}

/** The city as GeoNames knows it, checked on the server so the username stays private. */
export async function resolvePlace(city: string, countryCode: string): Promise<ResolvePlaceResult> {
  const trimmed = city.trim();
  if (trimmed.length < 3 || trimmed.length > 100 || !/^[A-Za-z]{2}$/.test(countryCode)) {
    return { ok: false, error: "not-found" };
  }

  try {
    const place = matchCity(trimmed, await searchGeoNames(trimmed, countryCode), countryCode);
    return place ? { ok: true, place } : { ok: false, error: "not-found" };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "unavailable" };
  }
}
