import { useState, useEffect } from "react";
import type { Country } from "@/types";
import { flagUrl } from "@/lib/place";

const COUNTRY_MAX_LENGTH = 25;
const NOT_COUNTRIES = new Set(["eu", "un"]);

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://flagcdn.com/en/codes.json");
        if (!response.ok) throw new Error(`flagcdn: ${response.status}`);
        const data: Record<string, string> = await response.json();

        // flagcdn also lists US states and the EU and UN; the UK's nations stay.
        const countryOptions: Country[] = Object.entries(data)
          .filter(([code]) => !code.startsWith("us-") && !NOT_COUNTRIES.has(code))
          .map(
          ([code, name]) => ({
            value: name,
            label:
              name.slice(0, COUNTRY_MAX_LENGTH) +
              (name.length > COUNTRY_MAX_LENGTH ? "..." : ""),
            code: code,
            flagUrl: flagUrl(code),
          }),
        );
        setCountries(
          countryOptions.sort((a, b) => a.value.localeCompare(b.value)),
        );
      } catch (error: unknown) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, isLoading };
}
