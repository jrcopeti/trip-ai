import { useEffect, useState } from "react";
import { resolvePlace } from "@/app/api/geoNamesApi";
import { destination } from "@/components/form/content";
import { FormFieldsSchema } from "@/lib/schema";
import type { CityCheck, useGeoNamesProps } from "@/types";

export const idleCityCheck: CityCheck = {
  isLoadingCityValid: false,
  isCityValid: false,
  message: "",
  place: null,
};

export function useGeoNames({ city, countryCode }: useGeoNamesProps) {
  const [status, setStatus] = useState<CityCheck>(idleCityCheck);

  useEffect(() => {
    if (city.trim().length < 3 || !countryCode) {
      setStatus(idleCityCheck);
      return;
    }
    // Next waits on this check, so a spelling the schema refuses says why here, not on the field.
    const refused = FormFieldsSchema.shape.city.safeParse(city);
    if (!refused.success) {
      setStatus({ ...idleCityCheck, message: refused.error.issues[0].message });
      return;
    }
    // Loading from the first keystroke, so Next can't pass on the previous spelling's result.
    setStatus({ ...idleCityCheck, isLoadingCityValid: true });
    // A slower answer for an earlier spelling must not overwrite the current one.
    let current = true;
    const debounce = setTimeout(() => {
      resolvePlace(city, countryCode)
        .catch(() => ({ ok: false, error: "unavailable" }) as const)
        .then((result) => {
          if (!current) return;
          setStatus(
            result.ok
              ? {
                  isLoadingCityValid: false,
                  isCityValid: true,
                  message: destination.found(result.place.name, result.place.country),
                  place: result.place,
                }
              : {
                  ...idleCityCheck,
                  message:
                    result.error === "not-found" ? destination.notFound : destination.unavailable,
                },
          );
        });
    }, 1000);
    return () => {
      current = false;
      clearTimeout(debounce);
    };
  }, [city, countryCode]);

  return status;
}
