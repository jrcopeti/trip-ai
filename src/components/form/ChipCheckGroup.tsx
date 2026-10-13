"use client";
import { CheckboxGroup, Description, FieldError, Label } from "@heroui/react";
import CustomCheckbox from "./CustomCheckbox";
import { fieldError, fieldLabel } from "./styles";

type Option = { value: string; label: string };

type Props = {
  label: string;
  options: readonly Option[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Once this many are chosen, the rest are disabled; with 1, a new pick replaces the old. */
  max?: number;
  description?: string;
  error?: string;
};

/** A multi-choice question as a row of chips — `ChoiceGroup`'s checkbox sibling. */
function ChipCheckGroup({ label, options, value, onChange, max, description, error }: Props) {
  // With one allowed, keep only the new pick; unchecking the chosen one leaves none.
  const handleChange = (next: string[]) =>
    onChange(max === 1 ? next.filter((option) => !value.includes(option)) : next);

  return (
    <CheckboxGroup
      value={value}
      onChange={handleChange}
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
            isDisabled={
              max !== undefined && max > 1 && value.length >= max && !value.includes(option.value)
            }
          >
            {option.label}
          </CustomCheckbox>
        ))}
      </div>
      {description && (
        <Description className="text-sm text-sorbet-ink/70">{description}</Description>
      )}
      <FieldError className={fieldError}>{error}</FieldError>
    </CheckboxGroup>
  );
}

export default ChipCheckGroup;
