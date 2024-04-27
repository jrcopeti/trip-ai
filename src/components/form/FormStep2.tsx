import { useCountries } from "@/hooks/useCountries";
import { AnimatePresence, motion } from "framer-motion";

import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { Controller } from "react-hook-form";
import { PulseLoader } from "react-spinners";
import { MdOutlineCheckCircle } from "react-icons/md";
import { MdOutlineErrorOutline } from "react-icons/md";
import { BiMessageSquareCheck } from "react-icons/bi";
import { BiMessageSquareError } from "react-icons/bi";

import FormTitle from "./FormTitle";
import type { FormStep2Props } from "@/types";
import CustomToaster from "../ui/CustomToaster";
import toast from "react-hot-toast";
import ErrorToaster from "../ui/ErrorToaster";
import { useEffect } from "react";

function FormStep2({
  currentStep,
  control,
  errors,
  handleSelectionAutocomplete,
  delta,
  isCityValid,
  isLoadingCityValid,
  message,
}: FormStep2Props) {
  const { countries } = useCountries();

  console.log(isCityValid, isLoadingCityValid, message);

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
                <PulseLoader color="#7c7c7c" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep2;
