import { useEffect } from "react";
import { useFormData } from "@/hooks/useFormData";
import { useGeoNames } from "@/hooks/useGeoNames";
import { useCountries } from "@/hooks/useCountries";

import { motion } from "framer-motion";
import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
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
          <FormTitle currentStep={currentStep} />

          <div className="mt-10 grid grid-cols-1 justify-between gap-x-6 gap-y-[5rem] sm:grid-cols-2 md:mt-[75px] ">
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Location"
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
                  popoverProps={{ placement: "top" }}
                  errorMessage={errors.country?.message}
                  isInvalid={!!errors.country}
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
