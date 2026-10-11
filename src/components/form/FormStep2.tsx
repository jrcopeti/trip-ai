"use client";
import { useEffect } from "react";
import { useFormData } from "@/hooks/useFormData";
import { useGeoNames } from "@/hooks/useGeoNames";

import { TextField, Label, Input, FieldError } from "@heroui/react";
import { Controller } from "react-hook-form";
import { PuffLoader } from "react-spinners";
import toast from "react-hot-toast";

import StepPanel from "./StepPanel";
import CountryComboBox from "./CountryComboBox";
import CustomToaster from "../ui/CustomToaster";
import ErrorToaster from "../ui/ErrorToaster";
import { SPINNER_INK } from "../ui/Loader";
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
              <Input ref={ref} type="text" placeholder={destination.city.placeholder} className={fieldInput} />
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

      {isLoadingCityValid && (
        <div role="status" aria-label={destination.checking} className="mt-6">
          <PuffLoader size={32} color={SPINNER_INK} />
        </div>
      )}
    </StepPanel>
  );
}

export default FormStep2;
