"use client";
import { useFormData } from "@/hooks/useFormData";
import { CheckboxGroup, Label, FieldError, TextField, TextArea } from "@heroui/react";
import { Controller } from "react-hook-form";
import StepPanel from "./StepPanel";
import CustomCheckbox from "./CustomCheckbox";
import { sortedInterest } from "@/data";
import { interests } from "./content";
import { field, fieldError, fieldLabel, fieldTextArea } from "./styles";

function FormStep6() {
  const { currentStep, control, errors } = useFormData();

  if (currentStep !== 5) return null;

  return (
    <StepPanel>
      <div className="flex flex-col gap-10">
        <Controller
          name="interests"
          control={control}
          render={({ field: { value, onChange } }) => (
            <CheckboxGroup
              value={value}
              onChange={onChange}
              isInvalid={!!errors.interests}
              className="flex flex-col gap-3"
            >
              <Label className={fieldLabel}>{interests.label}</Label>
              <div className="flex flex-wrap gap-2">
                {sortedInterest.map((interest) => (
                  <CustomCheckbox
                    key={interest.value}
                    value={interest.value}
                    isDisabled={value.length >= 3 && !value.includes(interest.value)}
                  >
                    {interest.label}
                  </CustomCheckbox>
                ))}
              </div>
              <FieldError className={fieldError}>{errors.interests?.message}</FieldError>
            </CheckboxGroup>
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field: { ref, ...fieldProps } }) => (
            <TextField {...fieldProps} className={`max-w-xl ${field}`}>
              <Label className={fieldLabel}>{interests.notes.label}</Label>
              <TextArea
                ref={ref}
                placeholder={interests.notes.placeholder}
                className={`min-h-32 ${fieldTextArea}`}
              />
            </TextField>
          )}
        />
      </div>
    </StepPanel>
  );
}

export default FormStep6;
