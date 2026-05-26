"use client";
import { useFormData } from "@/hooks/useFormData";
import { useCountries } from "@/hooks/useCountries";
import {
  TextField,
  Label,
  Input,
  FieldError,
  ComboBox,
  ListBox,
  ListBoxItem,
  IconChevronDown,
} from "@heroui/react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import FormTitle from "./FormTitle";

function FormStep1() {
  const { countries, isLoading: isLoadingCountries } = useCountries();
  const { currentStep, control, errors, handleSelectionAutocomplete, delta } =
    useFormData();

  return (
    <>
      {currentStep === 0 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle />
          <div className="mt-10 flex flex-col justify-between gap-x-6 gap-y-12 md:mt-[100px] md:flex-row lg:gap-y-20">
            <Controller
              name="userName"
              control={control}
              render={({ field: { ref, ...fieldProps } }) => (
                <TextField
                  {...fieldProps}
                  isInvalid={!!errors.userName}
                  isRequired
                  className="max-w-lg"
                >
                  <Label className="text-tuna-700">Name</Label>
                  <Input
                    ref={ref}
                    type="text"
                    placeholder="What's your name?"
                    className="text-tuna-700"
                  />
                  <FieldError>{errors.userName?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              name="age"
              control={control}
              render={({ field: { ref, ...fieldProps } }) => (
                <TextField
                  {...fieldProps}
                  isInvalid={!!errors.age}
                  isRequired
                  className="max-w-lg"
                >
                  <Label className="text-tuna-700">Age</Label>
                  <Input
                    ref={ref}
                    type="text"
                    placeholder="How old are you?"
                    className="text-tuna-700"
                  />
                  <FieldError>{errors.age?.message}</FieldError>
                </TextField>
              )}
            />

            <Controller
              name="nationality"
              control={control}
              render={({ field }) => {
                const selectedCountry = countries.find(
                  (c) => c.value === field.value,
                );
                const defaultCode = selectedCountry?.code ?? undefined;
                const defaultLabel = selectedCountry?.label ?? undefined;
                return (
                  <ComboBox<{ code: string; label: string }>
                    key={defaultCode}
                    items={countries}
                    defaultValue={defaultCode}
                    defaultInputValue={defaultLabel}
                    onChange={(key) =>
                      handleSelectionAutocomplete(key, "nationality")
                    }
                    isDisabled={isLoadingCountries}
                    isInvalid={!!errors.nationality}
                    isRequired
                    className="max-w-lg"
                  >
                    <Label className="text-tuna-700">Nationality</Label>
                    <ComboBox.InputGroup>
                      <Input placeholder="Select a country" />
                      <ComboBox.Trigger>
                        <IconChevronDown />
                      </ComboBox.Trigger>
                    </ComboBox.InputGroup>
                    <FieldError>{errors.nationality?.message}</FieldError>
                    <ComboBox.Popover placement="top">
                      <ListBox<{ code: string; label: string }>>
                        {(country) => (
                          <ListBoxItem id={country.code}>
                            {country.label}
                          </ListBoxItem>
                        )}
                      </ListBox>
                    </ComboBox.Popover>
                  </ComboBox>
                );
              }}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep1;
