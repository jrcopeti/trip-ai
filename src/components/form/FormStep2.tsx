"use client";
import { useEffect } from "react";
import { useFormData } from "@/hooks/useFormData";
import { useGeoNames } from "@/hooks/useGeoNames";
import { useCountries } from "@/hooks/useCountries";

import { motion } from "framer-motion";
import {
  TextField,
  Label,
  Input,
  FieldError,
  ComboBox,
  ListBox,
  ListBoxItem,
  IconChevronDown,
} from "@heroui/react";
import { Controller } from "react-hook-form";
import { PuffLoader } from "react-spinners";

import FormTitle from "./FormTitle";
import CustomToaster from "../ui/CustomToaster";
import ErrorToaster from "../ui/ErrorToaster";
import toast from "react-hot-toast";

function FormStep2() {
  const { countries } = useCountries();
  const {
    currentStep,
    control,
    errors,
    handleSelectionAutocomplete,
    delta,
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

  return (
    <>
      {currentStep === 1 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle />
          <div className="mt-10 grid grid-cols-1 justify-between gap-x-6 gap-y-[5rem] sm:grid-cols-2 md:mt-[75px]">
            <Controller
              name="city"
              control={control}
              render={({ field: { ref, ...fieldProps } }) => (
                <TextField
                  {...fieldProps}
                  isInvalid={!!errors.city}
                  isRequired
                  className="max-w-lg"
                >
                  <Label className="text-tuna-700">Location</Label>
                  <Input
                    ref={ref}
                    type="text"
                    placeholder="Where are you going?"
                  />
                  <FieldError>{errors.city?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field }) => {
                const selectedCountry = countries.find(
                  (c) => c.value === field.value,
                );
                const defaultCode = selectedCountry?.code ?? undefined;
                const defaultLabel = selectedCountry?.label ?? undefined;
                return (
                  <ComboBox<{ code: string; label: string }>
                    key={defaultCode}
                    items={countries}
                    defaultValue={defaultCode}
                    defaultInputValue={defaultLabel}
                    onChange={(key) =>
                      handleSelectionAutocomplete(key, "country")
                    }
                    isInvalid={!!errors.country}
                    isRequired
                    className="max-w-lg"
                  >
                    <Label>Country</Label>
                    <ComboBox.InputGroup>
                      <Input placeholder="Select a country" />
                      <ComboBox.Trigger>
                        <IconChevronDown />
                      </ComboBox.Trigger>
                    </ComboBox.InputGroup>
                    <FieldError>{errors.country?.message}</FieldError>
                    <ComboBox.Popover placement="top">
                      <ListBox<{ code: string; label: string }>>
                        {(country) => (
                          <ListBoxItem id={country.code}>
                            {country.label}
                          </ListBoxItem>
                        )}
                      </ListBox>
                    </ComboBox.Popover>
                  </ComboBox>
                );
              }}
            />

            {isLoadingCityValid && (
              <div className="text-sm text-gallery-500">
                <PuffLoader color="#4e888c" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep2;
