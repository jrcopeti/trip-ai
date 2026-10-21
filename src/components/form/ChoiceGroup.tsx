"use client";
import { FieldError, Label, Radio, RadioGroup } from "@heroui/react";
import ChipCheck from "./ChipCheck";
import { chip, chipField, fieldError, fieldLabel } from "./styles";

type Option = { value: string; label: string };

type Props = {
  label: string;
  options: readonly Option[];
  value: string | undefined;
  onChange: (value: string) => void;
  /** A `tints` entry from styles.ts. */
  tint: string;
  error?: string;
};

/**
 * A single-choice question as a row of chips. HeroUI's `RadioGroup` keeps the
 * radio semantics and arrow-key behaviour; the native control is visually
 * replaced by the chip, which fills with the group's pastel and gets a check in
 * its corner once chosen — the check, not only the colour, says which one is on.
 */
function ChoiceGroup({ label, options, value, onChange, tint, error }: Props) {
  return (
    <RadioGroup
      // The form's empty value is "": react-aria takes it as a selection matching no radio
      // and gives every radio tabIndex -1, so Tab skipped the group.
      value={value || null}
      onChange={onChange}
      isInvalid={!!error}
      isRequired
      className="flex flex-col gap-3"
    >
      <Label className={fieldLabel}>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Radio key={option.value} value={option.value} className={chipField}>
            {/* The label holding the input, and the only part with `data-focus-visible`. */}
            <Radio.Content className={chip(tint)}>
              {option.label}
              <ChipCheck />
            </Radio.Content>
          </Radio>
        ))}
      </div>
      <FieldError className={fieldError}>{error}</FieldError>
    </RadioGroup>
  );
}

export default ChoiceGroup;
