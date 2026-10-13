"use client";
import { CheckboxGroup, FieldError, Label } from "@heroui/react";
import CustomCheckbox from "./CustomCheckbox";
import { fieldError, fieldLabel } from "./styles";

type Option = { value: string; label: string };

type Props = {
  label: string;
  options: readonly Option[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Once this many are chosen, the rest are disabled. */
  max?: number;
  error?: string;
};

/** A multi-choice question as a row of chips — `ChoiceGroup`'s checkbox sibling. */
function ChipCheckGroup({ label, options, value, onChange, max, error }: Props) {
  return (
    <CheckboxGroup
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      isRequired
      className="flex flex-col gap-3"
    >
      <Label className={fieldLabel}>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <CustomCheckbox
            key={option.value}
            value={option.value}
            isDisabled={max !== undefined && value.length >= max && !value.includes(option.value)}
          >
            {option.label}
          </CustomCheckbox>
        ))}
      </div>
      <FieldError className={fieldError}>{error}</FieldError>
    </CheckboxGroup>
  );
}

export default ChipCheckGroup;
