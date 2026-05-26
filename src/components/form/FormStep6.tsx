"use client";
import { useFormData } from "@/hooks/useFormData";
import { CheckboxGroup, Label, FieldError, TextField, TextArea } from "@heroui/react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import FormTitle from "./FormTitle";
import CustomCheckbox from "./CustomCheckbox";
import { sortedInterest } from "@/data";

function FormStep6() {
  const { currentStep, control, errors, delta } = useFormData();
  return (
    <>
      {currentStep === 5 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle />

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8">
            <Controller
              name="interests"
              control={control}
              render={({ field }) => (
                <CheckboxGroup
                  value={field.value}
                  onChange={field.onChange}
                  className="max-w-2xl"
                >
                  <Label>Select up to 3 interests</Label>
                  <div className="flex flex-wrap gap-4">
                    {sortedInterest.map((interest) => (
                      <CustomCheckbox
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
                  </div>
                  <FieldError>{errors.interests?.message}</FieldError>
                </CheckboxGroup>
              )}
            />

            <Controller
              name="note"
              control={control}
              render={({ field: { ref, ...fieldProps } }) => (
                <TextField
                  {...fieldProps}
                  className="max-w-lg"
                >
                  <Label>Notes</Label>
                  <TextArea
                    ref={ref}
                    placeholder="Anything you want to add?"
                    className="min-h-[100px]"
                  />
                </TextField>
              )}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep6;
