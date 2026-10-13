"use client";
import { useFormData } from "@/hooks/useFormData";
import { TextField, Label, Input, FieldError } from "@heroui/react";
import { Controller } from "react-hook-form";
import { ageRanges, travellers } from "@/data";
import StepPanel from "./StepPanel";
import ChoiceGroup from "./ChoiceGroup";
import ChipCheckGroup from "./ChipCheckGroup";
import CountryComboBox from "./CountryComboBox";
import { personal } from "./content";
import { field, fieldError, fieldInput, fieldLabel, tints } from "./styles";

function FormStep1() {
  const { currentStep, control, errors, handleSelectionAutocomplete } = useFormData();

  if (currentStep !== 0) return null;

  return (
    <StepPanel>
      <div className="flex flex-col gap-10">
        <div className="max-w-xl">
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
        </div>

        <Controller
          name="travellers"
          control={control}
          render={({ field: { value, onChange } }) => (
            <ChoiceGroup
              label={personal.travellers}
              options={travellers}
              value={value}
              onChange={onChange}
              tint={tints.lavender}
              error={errors.travellers?.message}
            />
          )}
        />

        <Controller
          name="ageRanges"
          control={control}
          render={({ field: { value, onChange } }) => (
            <ChipCheckGroup
              label={personal.ageRanges}
              options={ageRanges}
              value={value}
              onChange={onChange}
              error={errors.ageRanges?.message}
            />
          )}
        />

        <div className="max-w-xl">
          <Controller
            name="passport"
            control={control}
            render={({ field: { value } }) => (
              <CountryComboBox
                label={personal.passport.label}
                placeholder={personal.passport.placeholder}
                description={personal.passport.description}
                value={value}
                onSelect={(key) => handleSelectionAutocomplete(key, "passport")}
                isRequired={false}
              />
            )}
          />
        </div>
      </div>
    </StepPanel>
  );
}

export default FormStep1;
