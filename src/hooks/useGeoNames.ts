"use client";
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
            setStatus({
              isLoadingCityValid: false,
              isCityValid: true,
              message: "Location found and valid",
            });
          }
        })
        .catch((error) => {
          console.error("Error Validating City", error);
          setStatus({
            isLoadingCityValid: false,
            isCityValid: false,
            message: error.message,
          });
        });
    }, 800);
    return () => {
      clearTimeout(debounce);
    };
  }, [city, countryCode]);

  return status;
}
