import { useCountries } from "@/hooks/useCountries";

import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { PulseLoader } from "react-spinners";
import { MdOutlineCheckCircle } from "react-icons/md";
import { MdOutlineErrorOutline } from "react-icons/md";

import FormTitle from "./FormTitle";
import type { FormStep2Props } from "@/types";

function FormStep2({
  currentStep,
  control,
  errors,
  handleSelectionAutocomplete,
  delta,
  isCityValid,
  isLoadingCityValid,
  errorCityValid,
}: FormStep2Props) {
  const { countries } = useCountries();

  return (
    <>
      {currentStep === 1 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle currentStep={currentStep} />

          <div className="mt-10 grid grid-cols-1 justify-between gap-x-6 gap-y-[5rem] sm:grid-cols-2 md:mt-[75px] ">
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="City"
                  id="city"
                  type="text"
                  placeholder="Where are you going?"
                  className="max-w-lg"
                  radius="sm"
                  variant="faded"
                  color="primary"
                  size="lg"
                  errorMessage={errors.city?.message}
                  isInvalid={!!errors.city}
                  isDisabled={isLoadingCityValid}
                  isRequired
                />
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  id="country"
                  defaultItems={countries}
                  label="Country"
                  placeholder="Select a country"
                  className="max-w-lg"
                  radius="sm"
                  variant="faded"
                  color="primary"
                  size="lg"
                  onSelectionChange={(selectedKey) =>
                    handleSelectionAutocomplete(selectedKey, "country")
                  }
                  errorMessage={errors.country?.message}
                  isInvalid={!!errors.country}
                  isDisabled={isLoadingCityValid}
                  isRequired
                >
                  {(country) => (
                    <AutocompleteItem key={country.code}>
                      {country.label}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
            <div>
              {isLoadingCityValid && (
                <p className="text-sm text-gallery-500">
                  <PulseLoader color="#656565" />
                </p>
              )}
              {isCityValid && (
                <p className="flex items-center gap-2 text-center text-lg font-semibold text-neptune-500 md:text-xl">
                  <MdOutlineCheckCircle /> The location was found
                </p>
              )}
              {errorCityValid && (
                <p className=" flex items-center gap-2 text-center text-base text-deeporange-700 md:text-lg">
                  <MdOutlineErrorOutline /> {errorCityValid}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep2;
