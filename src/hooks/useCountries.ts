import axios from "axios";
import { useState, useEffect } from "react";
import type { Country } from "@/types";

const COUNTRY_MAX_LENGTH = 25;

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchCountries = async () => {
      try {
        const { data } = await axios.get<Record<string, string>>(
          "https://flagcdn.com/en/codes.json",
        );

        const countryOptions: Country[] = Object.entries(data).map(
          ([code, name]) => ({
            value: name,
            label:
              name.slice(0, COUNTRY_MAX_LENGTH) +
              (name.length > COUNTRY_MAX_LENGTH ? "..." : ""),
            code: code,
            flagUrl: `https://flagcdn.com/${code}.svg`,
          }),
        );
        setCountries(countryOptions);
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
