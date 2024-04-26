import { useCountries } from "@/hooks/useCountries";
import { AnimatePresence, motion } from "framer-motion";

import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { Controller } from "react-hook-form";
import { PulseLoader } from "react-spinners";
import { MdOutlineCheckCircle } from "react-icons/md";
import { MdOutlineErrorOutline } from "react-icons/md";

import FormTitle from "./FormTitle";
import type { FormStep2Props } from "@/types";

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

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
            <div>
              <AnimatePresence mode="popLayout" initial={false}>
                {isLoadingCityValid && (
                  <motion.div
                    key="loading"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    transition={{
                      duration: 0.4,
                      delay: 0.1,
                      ease: "easeInOut",
                    }}
                    className="text-sm text-gallery-500"
                  >
                    <PulseLoader color="#656565" />
                  </motion.div>
                )}
                {isCityValid && !isLoadingCityValid && (
                  <motion.div
                    key="success"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: "easeInOut",
                    }}
                    className="flex items-center gap-2 text-center text-lg text-tuna-900 md:text-xl"
                  >
                    <MdOutlineCheckCircle color="#4e888c" /> {message}
                  </motion.div>
                )}
                {!isCityValid && !isLoadingCityValid && message && (
                  <motion.p
                    key="error"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: "easeInOut",
                    }}
                    className="flex items-center gap-2 text-center text-base text-tuna-900 md:text-lg"
                  >
                    <MdOutlineErrorOutline color="#c2150c" /> {message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep2;
