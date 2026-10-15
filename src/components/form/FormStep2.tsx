"use client";
import { useEffect, useRef } from "react";
import { useCityCheck, useFormFields, useFormSteps } from "@/hooks/useFormData";
import { LIMITS } from "@/lib/schema";

import { TextField, Label, Input, Description, FieldError } from "@heroui/react";
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
  const { currentStep } = useFormSteps();
  const { control, errors, handleSelectionAutocomplete } = useFormFields();
  const {
    countryCode,
    cityCheck: { isCityValid, isLoadingCityValid, message },
  } = useCityCheck();

  // The check lives in FormProvider and outlasts this step: "Try again" after a failed trip
  // remounts the form, and a result already announced must not toast a second time. A
  // restored draft re-checks its city on whatever step it reopens on: a find is step 2's to
  // say, but a failure keeps Next off on any step, so it always says why.
  const announced = useRef(message);

  useEffect(() => {
    if (message === announced.current) return;
    announced.current = message;

    if (isCityValid && !isLoadingCityValid && currentStep === 1) {
      toast.custom(<CustomToaster message={message} />);
    }

    if (!isCityValid && !isLoadingCityValid && message) {
      toast.custom(<ErrorToaster message={message} />);
    }
  }, [isCityValid, isLoadingCityValid, message, currentStep]);

  if (currentStep !== 1) return null;

  return (
    <StepPanel>
      <div className="grid gap-8 sm:grid-cols-2">
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

        <Controller
          name="city"
          control={control}
          render={({ field: { ref, ...fieldProps } }) => (
            <TextField
              {...fieldProps}
              isInvalid={!!errors.city}
              isRequired
              // The check needs a country, so the city waits for one; the hint below says why.
              isDisabled={!countryCode}
              className={field}
            >
              <Label className={fieldLabel}>{destination.city.label}</Label>
              {/* The city check shows inside the field, at its right edge, and
                  is positioned absolutely: as a block under the fields it pushed
                  the buttons down and back, and a quick check was only a jump. */}
              {/* HeroUI gives a disabled input pointer-events: none, so the cursor goes on its wrapper. */}
              <div className={`relative ${countryCode ? "" : "cursor-not-allowed"}`}>
                <Input
                  ref={ref}
                  type="text"
                  maxLength={LIMITS.city}
                  placeholder={destination.city.placeholder}
                  className={`${fieldInput} pr-16 disabled:opacity-45 disabled:hover:border-sorbet-ink/15`}
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
              {/* Always rendered, so its line stays when the hint clears and Next doesn't jump. */}
              <Description className="min-h-5 text-sm text-sorbet-ink/70">
                {!countryCode && destination.city.hint}
              </Description>
              <FieldError className={fieldError}>{errors.city?.message}</FieldError>
            </TextField>
          )}
        />
      </div>

    </StepPanel>
  );
}

export default FormStep2;
