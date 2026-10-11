"use client";
import { useFormData } from "@/hooks/useFormData";
import { TextField, Label, Input, FieldError } from "@heroui/react";
import { Controller } from "react-hook-form";
import StepPanel from "./StepPanel";
import CountryComboBox from "./CountryComboBox";
import { personal } from "./content";
import { field, fieldError, fieldInput, fieldLabel } from "./styles";

function FormStep1() {
  const { currentStep, control, errors, handleSelectionAutocomplete } = useFormData();

  if (currentStep !== 0) return null;

  return (
    <StepPanel>
      <div className="grid gap-8 sm:grid-cols-2">
        <Controller
          name="userName"
          control={control}
          render={({ field: { ref, ...fieldProps } }) => (
            <TextField {...fieldProps} isInvalid={!!errors.userName} isRequired className={field}>
              <Label className={fieldLabel}>{personal.name.label}</Label>
              <Input ref={ref} type="text" placeholder={personal.name.placeholder} className={fieldInput} />
              <FieldError className={fieldError}>{errors.userName?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          name="age"
          control={control}
          render={({ field: { ref, ...fieldProps } }) => (
            <TextField {...fieldProps} isInvalid={!!errors.age} isRequired className={field}>
              <Label className={fieldLabel}>{personal.age.label}</Label>
              <Input
                ref={ref}
                type="text"
                inputMode="numeric"
                placeholder={personal.age.placeholder}
                className={fieldInput}
              />
              <FieldError className={fieldError}>{errors.age?.message}</FieldError>
            </TextField>
          )}
        />

        <div className="sm:col-span-2">
          <Controller
            name="nationality"
            control={control}
            render={({ field: { value } }) => (
              <CountryComboBox
                label={personal.nationality.label}
                placeholder={personal.nationality.placeholder}
                value={value}
                onSelect={(key) => handleSelectionAutocomplete(key, "nationality")}
                error={errors.nationality?.message}
              />
            )}
          />
        </div>
      </div>
    </StepPanel>
  );
}

export default FormStep1;
