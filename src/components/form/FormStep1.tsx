"use client";
import { useFormData } from "@/hooks/useFormData";
import { TextField, Label, Input, FieldError } from "@heroui/react";
import { Controller, useController } from "react-hook-form";
import { ageRanges, travellers } from "@/data";
import { AGE_RANGE_RULES, fitsGroup } from "@/lib/schema";
import StepPanel from "./StepPanel";
import ChoiceGroup from "./ChoiceGroup";
import ChipCheckGroup from "./ChipCheckGroup";
import CountryComboBox from "./CountryComboBox";
import { personal } from "./content";
import { field, fieldError, fieldInput, fieldLabel, tints } from "./styles";

function FormStep1() {
  const { currentStep, control, errors, handleSelectionAutocomplete } = useFormData();
  const { field: group } = useController({ name: "travellers", control });
  const { field: ages } = useController({ name: "ageRanges", control });

  if (currentStep !== 0) return null;

  const ageOptions = ageRanges.filter((option) => fitsGroup(option.value, group.value));

  // A new group keeps the youngest picks that fit it, up to its cap.
  const fitAges = (next: string) => {
    const kept = ageRanges
      .map((option) => option.value as string)
      .filter((range) => ages.value.includes(range) && fitsGroup(range, next))
      .slice(0, AGE_RANGE_RULES[next]?.max);
    if (kept.length !== ages.value.length) ages.onChange(kept);
  };

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

        <ChoiceGroup
          label={personal.travellers}
          options={travellers}
          value={group.value}
          onChange={(next) => {
            group.onChange(next);
            fitAges(next);
          }}
          tint={tints.lavender}
          error={errors.travellers?.message}
        />

        <ChipCheckGroup
          label={personal.ageRanges}
          options={ageOptions}
          value={ages.value}
          onChange={ages.onChange}
          max={AGE_RANGE_RULES[group.value]?.max}
          description={personal.ageRangesHint[group.value]}
          error={errors.ageRanges?.message}
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
