"use client";
import axios from "axios";
import { useEffect, useState } from "react";

interface useGeoNamesProps {
  city: string;
  countryCode?: string;
}

export function useGeoNames({ city, countryCode }: useGeoNamesProps) {
  const [isCityValid, setIsCityValid] = useState<boolean>(false);
  const [isLoadingCityValid, setIsLoadingCityValid] = useState<boolean>(false);
  const [errorCityValid, setErrorCityValid] = useState<string>("");

  useEffect(() => {
    if (!city || !countryCode) {
      setIsCityValid(false);
      setErrorCityValid("");
      return;
    }

    const source = axios.CancelToken.source();
    const username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
    const url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(city)}&country=${countryCode}&maxRows=1&username=${username}`;
    const debounce = setTimeout(async function validateCityCountry() {
      setIsLoadingCityValid(true);
      axios
        .get(url, { cancelToken: source.token })
        .then((response) => {
          if (response.data.totalResultsCount === 0) {
            throw new Error("City not found");
          }
          console.log(
            "City and countryCode match found",
            response.data.geonames[0],
            response.data.geonames[0].countryName,
          );
          setIsCityValid(true);
          setErrorCityValid("");
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          } else {
            console.error("Error accessing GeoNames API", error);
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
