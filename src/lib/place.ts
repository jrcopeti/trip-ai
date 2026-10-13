/** One row of GeoNames' `searchJSON` with `style=FULL` — only the fields read here. */
export interface GeoNamesResult {
  geonameId: number;
  name: string;
  toponymName: string;
  asciiName?: string;
  alternateNames?: { name: string; lang?: string }[];
  countryCode: string;
  countryName: string;
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

function names(result: GeoNamesResult) {
  return [
    result.name,
    result.toponymName,
    result.asciiName,
    ...(result.alternateNames ?? []).map((alt) => alt.name),
  ].filter((name): name is string => !!name);
}

/** The most populous inhabited place in `countryCode` that goes by `input`, or null. */
export function matchCity(
  input: string,
  results: GeoNamesResult[],
  countryCode: string,
): Place | null {
  const wanted = normalise(input);
  if (!wanted) return null;

  const best = results
    .filter(
      (result) =>
        result.population > 0 &&
        result.countryCode.toUpperCase() === countryCode.toUpperCase() &&
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
