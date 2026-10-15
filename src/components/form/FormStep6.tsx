"use client";
import { useFormFields, useFormSteps } from "@/hooks/useFormData";
import { Label, FieldError, TextField, TextArea } from "@heroui/react";
import { Controller } from "react-hook-form";
import StepPanel from "./StepPanel";
import ChipCheckGroup from "./ChipCheckGroup";
import { sortedInterest } from "@/data";
import { LIMITS } from "@/lib/schema";
import { interests } from "./content";
import { field, fieldError, fieldLabel, fieldTextArea } from "./styles";

function FormStep6() {
  const { currentStep } = useFormSteps();
  const { control, errors } = useFormFields();

  if (currentStep !== 5) return null;

  return (
    <StepPanel>
      <div className="flex flex-col gap-10">
        <Controller
          name="interests"
          control={control}
          render={({ field: { value, onChange } }) => (
            <ChipCheckGroup
              label={interests.label}
              options={sortedInterest}
              value={value}
              onChange={onChange}
              max={LIMITS.interests}
              error={errors.interests?.message}
            />
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field: { ref, ...fieldProps } }) => (
            <TextField {...fieldProps} isInvalid={!!errors.note} className={`max-w-xl ${field}`}>
              <Label className={fieldLabel}>{interests.notes.label}</Label>
              <TextArea
                ref={ref}
                placeholder={interests.notes.placeholder}
                maxLength={LIMITS.note}
                className={`min-h-32 ${fieldTextArea}`}
              />
              <FieldError className={fieldError}>{errors.note?.message}</FieldError>
            </TextField>
          )}
        />
      </div>
    </StepPanel>
  );
}

export default FormStep6;
