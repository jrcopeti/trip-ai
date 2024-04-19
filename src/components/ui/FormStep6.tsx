import { motion } from "framer-motion";
import { Controller } from "react-hook-form";
import FormTitle from "./FormTitle";
import CustomCheckbox from "./CustomCheckbox";
import { CheckboxGroup, Textarea } from "@nextui-org/react";
import { sortedInterest } from "@/data";
import type { FormStep3Props } from "@/types";

function FormStep6({
  currentStep,
  control,
  errors,
  delta,
}: FormStep3Props) {
  return (
    <>
      {currentStep === 5 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle currentStep={currentStep} />

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8  ">
            <Controller
              name="interests"
              control={control}
              render={({ field }) => (
                <CheckboxGroup
                  {...field}
                  name="interests"
                  className="max-w-2xl gap-4"
                  label="Select up to 3 interest"
                  orientation="horizontal"
                  errorMessage={errors.interests?.message}
                >
                  {sortedInterest.map((interest) => (
                    <CustomCheckbox
                      color="primary"
                      key={interest.value}
                      value={interest.value}
                      isDisabled={
                        field.value.length >= 3 &&
                        !field.value.includes(interest.value)
                      }
                    >
                      {interest.label}
                    </CustomCheckbox>
                  ))}
                </CheckboxGroup>
              )}
            />

            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Notes"
                  id="notes"
                  placeholder="Anything you want to add?"
                  className="max-w-lg"
                  radius="none"
                  variant="faded"
                  color="primary"
                />
              )}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep6;
