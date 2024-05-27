import { useEffect, useState } from "react";
import Geonames from "geonames.js";
import type { useGeoNamesProps, GeoName } from "@/types";

export function useGeoNames({ city, countryCode }: useGeoNamesProps) {
  const [status, setStatus] = useState({
    isLoadingCityValid: false,
    isCityValid: false,
    message: "",
  });

  useEffect(() => {
    if (city.length < 3 || !countryCode) {
      setStatus({
        isLoadingCityValid: false,
        isCityValid: false,
        message: "",
      });
      return;
    }
    const username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
    const geonames = Geonames({
      username: username,
      lan: "en",
      encoding: "JSON",
    });
    const debounce = setTimeout(() => {
      setStatus({
        isLoadingCityValid: true,
        isCityValid: false,
        message: "",
      });
      geonames
        .search({
          q: city,
          country: countryCode,
          maxRows: 5,
          featureClass: "P",
        })
        .then((response) => {
          console.log("RESPONSE GEONAMES", response);
          if (response.totalResultsCount === 0) {
            throw new Error("No location has been found. Please try again.");
          }
          const validCity = response.geonames.find((geo: GeoName) => {
            const formattedCity = city.trim().toLowerCase();
            const nameMatches = geo.name.trim().toLowerCase() === formattedCity;
            const toponymNameMatches =
              geo.toponymName.trim().toLowerCase() === formattedCity;
            const populationMatches = geo.population && geo.population > 0;

            return (nameMatches || toponymNameMatches) && populationMatches;
          });

          if (!validCity) {
            throw new Error("Location is not valid. Please try again.");
          } else {
            setStatus({
              isLoadingCityValid: false,
              isCityValid: true,
              message: "Location has been found",
            });
          }
        })
        .catch((error) => {
          console.error(error);
          setStatus({
            isLoadingCityValid: false,
            isCityValid: false,
            message: error.message,
          });
        });
    }, 1000);
    return () => {
      clearTimeout(debounce);
    };
  }, [city, countryCode]);

  return status;
}
