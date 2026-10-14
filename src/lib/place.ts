/** One row of GeoNames' `searchJSON` with `style=FULL` — only the fields read here. */
export interface GeoNamesResult {
  geonameId: number;
  name: string;
  toponymName: string;
  asciiName?: string;
  alternateNames?: { name: string; lang?: string }[];
  countryCode: string;
  countryName: string;
  /** For UK places, the nation: ENG, SCT, WLS or NIR. */
  adminCode1?: string;
  lat: string;
  lng: string;
  population: number;
  timezone?: { timeZoneId: string };
}

export interface Place {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  geonameId: number;
}

/** Trim, lowercase and strip accents, so "  München" and "munchen" compare equal. */
export function normalise(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
}

// GeoNames' pseudo-languages: codes and links, not names, so "LIS" or "1100" never match Lisbon.
const NOT_NAMES = new Set(["post", "iata", "icao", "faac", "abbr", "link", "wkdt", "unlc"]);

function names(result: GeoNamesResult) {
  return [
    result.name,
    result.toponymName,
    result.asciiName,
    ...(result.alternateNames ?? [])
      .filter((alt) => !alt.lang || !NOT_NAMES.has(alt.lang))
      .map((alt) => alt.name),
  ].filter((name): name is string => !!name);
}

/** The most populous inhabited place in `countryCode` that goes by `input`, or null. */
export function matchCity(
  input: string,
  results: GeoNamesResult[],
  countryCode: string,
  adminCode1?: string,
): Place | null {
  const wanted = normalise(input);
  if (!wanted) return null;

  const best = results
    .filter(
      (result) =>
        result.population > 0 &&
        result.countryCode.toUpperCase() === countryCode.toUpperCase() &&
        (!adminCode1 || result.adminCode1?.toUpperCase() === adminCode1.toUpperCase()) &&
        names(result).some((name) => normalise(name) === wanted),
    )
    .sort((a, b) => b.population - a.population)[0];

  if (!best) return null;
  return {
    name: best.name,
    country: best.countryName,
    lat: Number(best.lat),
    lng: Number(best.lng),
    timezone: best.timezone?.timeZoneId ?? "",
    geonameId: best.geonameId,
  };
}

/** flagcdn's flag for "PT" or "GB-SCT", the code a trip row keeps. */
export function flagUrl(countryCode: string) {
  return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
}
