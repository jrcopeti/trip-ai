"use client";
import { useEffect, useState } from "react";
import Geonames from "geonames.js";
import type { useGeoNamesProps, GeoName } from "@/types";

export function useGeoNames({ city, countryCode }: useGeoNamesProps) {
  const [isCityValid, setIsCityValid] = useState<boolean>(false);
  const [isLoadingCityValid, setIsLoadingCityValid] = useState<boolean>(false);
  const [errorCityValid, setErrorCityValid] = useState<string>("");

  useEffect(() => {
    if (city.length < 3 || !countryCode) {
      setIsCityValid(false);
      setErrorCityValid("");
      return;
    }
    const username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
    const geonames = Geonames({
      username: username,
      lan: "en",
      encoding: "JSON",
    });
    const debounce = setTimeout(() => {
      setIsLoadingCityValid(true);
      setIsCityValid(false);
      setErrorCityValid("");
      geonames
        .search({
          q: city,
          country: countryCode,
          maxRows: 5,
          featureClass: "P",
        })
        .then((response) => {
          if (response.totalResultsCount === 0) {
            throw new Error("No location was found. Please try again.");
          }
          const validCity = response.geonames.find((geo: GeoName) => {
            const formattedCity = city.trim().toLowerCase();
            const formattedGeoName = geo.name.trim().toLowerCase();
            return formattedGeoName === formattedCity && geo.population > 1;
          });
          console.log("Valid City", validCity);
          if (!validCity) {
            throw new Error("Location is not valid. Please try again.");
          } else {
            console.log(
              "City and countryCode match found",
              response,
              response.geonames[0],
            );
            setIsCityValid(true);
            setErrorCityValid("");
          }
        })
        .catch((error) => {
          console.error("Error Validating City", error);
          setIsCityValid(false);
          setErrorCityValid(error.message || "An error occurred");
        })
        .finally(() => {
          setIsLoadingCityValid(false);
        });
    }, 500);
    return () => {
      clearTimeout(debounce);
    };
  }, [city, countryCode]);

  return { isCityValid, isLoadingCityValid, errorCityValid };
}
