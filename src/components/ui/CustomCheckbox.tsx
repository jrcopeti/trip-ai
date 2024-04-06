import React, { useState, ReactNode } from "react";
import { useCheckbox, Chip, ChipProps, VisuallyHidden, tv } from "@nextui-org/react";

import { BsCheck } from "react-icons/bs";

interface CustomCheckboxProps {
  children?: ReactNode;
  value: string;
  isSelected?: boolean;
  onChange?: () => void;
  isDisabled?: boolean;
  color: "primary" | "secondary" | "success" | "warning" | "warning" | "default" | undefined;
}

const checkbox = tv({
  slots: {
    base: "border-shark-300 hover:bg-shark-200",
    content: "text-default-500",
  },
  variants: {
    isSelected: {
      true: {
        base: "border-shark-200 font-semibold bg-neptune-600 hover:bg-shark-200 hover:border-shark-500",
        content: "text-shark-200 pl-1 hover:text-shark-800" ,
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
        startContent={isSelected ? <BsCheck className="ml-1" /> : null}
        variant="faded"
        {...getLabelProps()}
      >
        {children ? children : isSelected ? "Enabled" : "Disabled"}
      </Chip>
    </label>
  );
};

export default CustomCheckbox;