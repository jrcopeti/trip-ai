"use client";
import { Checkbox } from "@heroui/react";
import { tv } from "tailwind-variants";
import { BsCheck } from "react-icons/bs";

interface CustomCheckboxProps {
  children?: React.ReactNode;
  value: string;
  isDisabled?: boolean;
}

const chip = tv({
  base: "inline-flex cursor-pointer select-none items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold transition-colors duration-200 border-shark-800",
  variants: {
    isSelected: {
      true: "bg-neptune-600 text-gallery-50 hover:bg-neptune-500",
      false: "bg-transparent text-shark-800 hover:bg-neptune-300",
    },
    isFocusVisible: {
      true: "outline-none ring-2 ring-offset-2",
    },
    isDisabled: {
      true: "cursor-not-allowed opacity-50",
    },
  },
  defaultVariants: {
    isSelected: false,
  },
});

function CustomCheckbox({ children, value, isDisabled }: CustomCheckboxProps) {
  return (
    <Checkbox value={value} isDisabled={isDisabled} className="m-0 p-0">
      {({ isSelected, isFocusVisible }) => (
        <div
          className={chip({
            isSelected,
            isFocusVisible,
            isDisabled: isDisabled ?? false,
          })}
        >
          {isSelected && <BsCheck className="text-gallery-50" />}
          {children || (isSelected ? "Enabled" : "Disabled")}
        </div>
      )}
    </Checkbox>
  );
}

export default CustomCheckbox;
