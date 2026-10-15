import { useQuery } from "@tanstack/react-query";
import type { Country } from "@/types";
import { flagUrl } from "@/lib/place";

const COUNTRY_MAX_LENGTH = 25;
const NOT_COUNTRIES = new Set(["eu", "un"]);
// One empty list, so the form's memoised context doesn't change on every render while it loads.
const NO_COUNTRIES: Country[] = [];

async function fetchCountries(): Promise<Country[]> {
  try {
    const response = await fetch("https://flagcdn.com/en/codes.json");
    if (!response.ok) throw new Error(`flagcdn: ${response.status}`);
    const data: Record<string, string> = await response.json();

    // flagcdn also lists US states and the EU and UN; the UK's nations stay.
    const countryOptions: Country[] = Object.entries(data)
      .filter(([code]) => !code.startsWith("us-") && !NOT_COUNTRIES.has(code))
      .map(([code, name]) => ({
        value: name,
        label:
          name.slice(0, COUNTRY_MAX_LENGTH) +
          (name.length > COUNTRY_MAX_LENGTH ? "..." : ""),
        code: code,
        flagUrl: flagUrl(code),
      }));
    return countryOptions.sort((a, b) => a.value.localeCompare(b.value));
  } catch (error: unknown) {
    console.error(error);
    throw error;
  }
}

// The list never changes in a session: one request, however many readers and visits to /form.
export function useCountries() {
  const { data, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: Infinity,
    gcTime: Infinity,
    // Once, not TanStack's three: the country fields stay disabled while it loads.
    retry: 1,
  });

  return { countries: data ?? NO_COUNTRIES, isLoading };
}
