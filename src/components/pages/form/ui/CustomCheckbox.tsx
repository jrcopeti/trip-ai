import React, { useState, ReactNode } from "react";
import {
  useCheckbox,
  Chip,
  ChipProps,
  VisuallyHidden,
  tv,
} from "@nextui-org/react";

import { BsCheck } from "react-icons/bs";

interface CustomCheckboxProps {
  children?: ReactNode;
  value: string;
  isSelected?: boolean;
  onChange?: () => void;
  isDisabled?: boolean;
  color:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "warning"
    | "default"
    | undefined;
}

const checkbox = tv({
  slots: {
    base: "border-shark-800 hover:bg-neptune-300 ",
    content: "text-shark-800 font-semibold duration-300 ease-in-out",
  },
  variants: {
    isSelected: {
      true: {
        base: "border-shark-800 font-semibold bg-neptune-600 hover:bg-neptune-500 hover:border-shark-500 ",
        content: "text-gallery-50 pl-1 duration-300 ease-in-out",
      },
    },
    isFocusVisible: {
      true: {
        base: "outline-none ring-2 ring-focus ring-offset-2 ring-offset-background",
      },
    },
  },
});

const CustomCheckbox: React.FC<CustomCheckboxProps> = (props) => {
  const {
    children,
    isSelected,
    isFocusVisible,
    getBaseProps,
    getLabelProps,
    getInputProps,
  } = useCheckbox({
    ...props,
  });

  const styles = checkbox({ isSelected, isFocusVisible });

  return (
    <label {...getBaseProps()}>
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <Chip
        classNames={{
          base: styles.base(),
          content: styles.content(),
        }}
        color="primary"
        startContent={
          isSelected ? <BsCheck className="ml-1 text-gallery-50" /> : null
        }
        variant="faded"
        {...(getLabelProps() as any)}
      >
        {children ? children : isSelected ? "Enabled" : "Disabled"}
      </Chip>
    </label>
  );
};

export default CustomCheckbox;
