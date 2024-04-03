import axios from "axios";
import { useState, useEffect } from "react";

const COUNTRY_MAX_LENGTH = 25;

interface Country {
  value: string;
  label: string;
  code: string;
  flagUrl: string;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      } catch (error) {
        console.error("Error fetching country flags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, isLoading };
}
