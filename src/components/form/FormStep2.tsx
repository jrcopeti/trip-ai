"use client";
import { useEffect } from "react";
import { useFormData } from "@/hooks/useFormData";
import { useGeoNames } from "@/hooks/useGeoNames";

import { TextField, Label, Input, FieldError } from "@heroui/react";
import { Controller } from "react-hook-form";
import toast from "react-hot-toast";

import StepPanel from "./StepPanel";
import CountryComboBox from "./CountryComboBox";
import CustomToaster from "../ui/CustomToaster";
import ErrorToaster from "../ui/ErrorToaster";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import { destination } from "./content";
import { field, fieldError, fieldInput, fieldLabel } from "./styles";

function FormStep2() {
  const {
    currentStep,
    control,
    errors,
    handleSelectionAutocomplete,
    cityWatch,
    countryCode,
  } = useFormData();
  const { isCityValid, isLoadingCityValid, message } = useGeoNames({
    city: cityWatch,
    countryCode: countryCode,
  });

  useEffect(() => {
    if (isCityValid && !isLoadingCityValid) {
      toast.custom(<CustomToaster message={message} />);
    }

    if (!isCityValid && !isLoadingCityValid && message) {
      toast.custom(<ErrorToaster message={message} />);
    }
  }, [isCityValid, isLoadingCityValid, message]);

  if (currentStep !== 1) return null;

  return (
    <StepPanel>
      <div className="grid gap-8 sm:grid-cols-2">
        <Controller
          name="city"
          control={control}
          render={({ field: { ref, ...fieldProps } }) => (
            <TextField {...fieldProps} isInvalid={!!errors.city} isRequired className={field}>
              <Label className={fieldLabel}>{destination.city.label}</Label>
              {/* The city check shows inside the field, at its right edge, and
                  is positioned absolutely: as a block under the fields it pushed
                  the buttons down and back, and a quick check was only a jump. */}
              <div className="relative">
                <Input
                  ref={ref}
                  type="text"
                  placeholder={destination.city.placeholder}
                  className={`${fieldInput} pr-16`}
                />
                {isLoadingCityValid && (
                  <div
                    role="status"
                    aria-label={destination.checking}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <SquiggleLoader className="h-6 w-10 text-sorbet-ink" />
                  </div>
                )}
              </div>
              <FieldError className={fieldError}>{errors.city?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          name="country"
          control={control}
          render={({ field: { value } }) => (
            <CountryComboBox
              label={destination.country.label}
              placeholder={destination.country.placeholder}
              value={value}
              onSelect={(key) => handleSelectionAutocomplete(key, "country")}
              error={errors.country?.message}
            />
          )}
        />
      </div>

    </StepPanel>
  );
}

export default FormStep2;
