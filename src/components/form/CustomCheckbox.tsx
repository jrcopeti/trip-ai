"use client";
import { Checkbox } from "@heroui/react";
import ChipCheck from "./ChipCheck";
import { chip, chipField, tints } from "./styles";

interface CustomCheckboxProps {
  children?: React.ReactNode;
  value: string;
  isDisabled?: boolean;
}

/** One interest as a chip: lime once chosen, with a check so colour is not the only cue. */
function CustomCheckbox({ children, value, isDisabled }: CustomCheckboxProps) {
  return (
    <Checkbox value={value} isDisabled={isDisabled} className={chipField}>
      {/* The label holding the input, and the only part with `data-focus-visible`. */}
      <Checkbox.Content className={chip(tints.lime)}>
        {children}
        <ChipCheck />
      </Checkbox.Content>
    </Checkbox>
  );
}

export default CustomCheckbox;
