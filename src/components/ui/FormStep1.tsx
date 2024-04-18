import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import FormTitle from "./FormTitle";
import type { Step } from "@/types";
import type { FormStepProps } from "@/types";
import type { Control } from "react-hook-form";
import { useCountries } from "@/hooks/useCountries";

function FormStep1({
  currentStep,
  steps,
  control,
  errors,
  handleSelectionAutocomplete,
  delta,
}: FormStepProps) {
  const { countries, isLoading: isLoadingCountries } = useCountries();
  if (isLoadingCountries) {
    return <p>Loading countries...</p>;
  }
  return (
    <>
      {currentStep === 0 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle steps={steps} currentStep={currentStep} />

          <div className="mt-10 flex flex-col justify-between gap-x-6 gap-y-[5rem] md:mt-[100px] md:flex-row ">
            <Controller
              name="userName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Name"
                  id="userName"
                  type="text"
                  placeholder="What's your name?"
                  className="max-w-lg text-tuna-700 "
                  radius="sm"
                  variant="faded"
                  color="primary"
                  errorMessage={errors.userName?.message}
                  isInvalid={!!errors.userName}
                  isRequired
                />
              )}
            />

            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Age"
                  id="age"
                  type="text"
                  placeholder="How old are you?"
                  className="max-w-lg text-tuna-700  "
                  radius="sm"
                  variant="faded"
                  color="primary"
                  isInvalid={!!errors.age}
                  errorMessage={errors.age?.message}
                  isRequired
                />
              )}
            />

            <Controller
              name="nationality"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  id="nationality"
                  defaultItems={countries}
                  label="Nationality"
                  placeholder="Select a country"
                  className="max-w-lg text-tuna-700  "
                  radius="sm"
                  variant="faded"
                  color="primary"
                  onSelectionChange={(selectedKey) =>
                    handleSelectionAutocomplete(selectedKey, "nationality")
                  }
                  isInvalid={!!errors.nationality}
                  isRequired
                  errorMessage={errors.nationality?.message}
                >
                  {(country) => (
                    <AutocompleteItem key={country.code}>
                      {country.label}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep1;
