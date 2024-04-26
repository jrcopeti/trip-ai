"use client";
import axios from "axios";
import { useEffect, useState } from "react";
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

    const source = axios.CancelToken.source();
    const username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
    const url = `https://api.geonames.org/searchJSON?q=${encodeURIComponent(city)}&country=${countryCode}&maxRows=10&featureClass=P&username=${username}`;
    const debounce = setTimeout(async function validateCityCountry() {
      setIsCityValid(false);
      setIsLoadingCityValid(true);
      setErrorCityValid("");
      axios
        .get(url, { cancelToken: source.token })
        .then((response) => {
          if (response.data.totalResultsCount === 0) {
            throw new Error("Location is not valid. Please try again.");
          }

          const validCity = response.data.geonames.find((geo: GeoName) => {
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
              response.data,
              response.data.geonames[0],
            );
            setIsCityValid(true);
            setErrorCityValid("");
          }
        })

        .catch((error) => {
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          } else {
            console.error("Error Validating City", error);
            setIsCityValid(false);
            setErrorCityValid(error.message);
          }
        })
        .finally(() => {
          setIsLoadingCityValid(false);
        });
    }, 500);
    return () => {
      clearTimeout(debounce);
      source.cancel("Request canceled by the user");
    };
  }, [city, countryCode]);

  return { isCityValid, isLoadingCityValid, errorCityValid };
}
