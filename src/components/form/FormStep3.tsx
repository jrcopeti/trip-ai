"use client";
import { useFormData } from "@/hooks/useFormData";
import { Controller } from "react-hook-form";
import { RadioGroup, Radio, Label, FieldError } from "@heroui/react";
import { motion } from "framer-motion";
import FormTitle from "./FormTitle";
import {
  sortedAccommodations,
  luggageSizes,
  sortedTransports,
  budgets,
  sortedTypes,
} from "@/data";

function FormStep3() {
  const {
    currentStep,
    control,
    errors,
    delta,
  } = useFormData();
  return (
    <>
      {currentStep === 2 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle />

          <div className="mt-6 grid max-w-[80%] grid-cols-1 gap-x-4 gap-y-8 text-sm md:mt-[60px] lg:grid-cols-2 xl:grid-cols-3">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onChange={field.onChange}
                  isInvalid={!!errors.type}
                  isRequired
                  className="flex max-w-[300px] flex-col gap-2"
                >
                  <Label>How do you describe your trip?</Label>
                  {sortedTypes.map((type) => (
                    <Radio key={type.value} value={type.value}>
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content className="font-semibold">
                        {type.label}
                      </Radio.Content>
                    </Radio>
                  ))}
                  <FieldError>{errors.type?.message}</FieldError>
                </RadioGroup>
              )}
            />

            <Controller
              name="accommodation"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onChange={field.onChange}
                  isInvalid={!!errors.accommodation}
                  isRequired
                  className="flex max-w-[300px] flex-col gap-2"
                >
                  <Label>Where are you staying?</Label>
                  {sortedAccommodations.map((accommodation) => (
                    <Radio
                      key={accommodation.value}
                      value={accommodation.value}
                    >
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content className="font-semibold">
                        {accommodation.label}
                      </Radio.Content>
                    </Radio>
                  ))}
                  <FieldError>{errors.accommodation?.message}</FieldError>
                </RadioGroup>
              )}
            />

            <Controller
              name="luggageSize"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onChange={field.onChange}
                  isInvalid={!!errors.luggageSize}
                  isRequired
                  className="flex max-w-[300px] flex-col gap-2"
                >
                  <Label>What&apos;s the size of your luggage?</Label>
                  {luggageSizes.map((luggageSize) => (
                    <Radio key={luggageSize.value} value={luggageSize.value}>
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content className="font-semibold">
                        {luggageSize.label}
                      </Radio.Content>
                    </Radio>
                  ))}
                  <FieldError>{errors.luggageSize?.message}</FieldError>
                </RadioGroup>
              )}
            />

            <Controller
              name="transport"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onChange={field.onChange}
                  isInvalid={!!errors.transport}
                  isRequired
                  className="flex max-w-[300px] flex-col gap-2"
                >
                  <Label>How are you traveling?</Label>
                  {sortedTransports.map((transport) => (
                    <Radio key={transport.value} value={transport.value}>
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content className="font-semibold">
                        {transport.label}
                      </Radio.Content>
                    </Radio>
                  ))}
                  <FieldError>{errors.transport?.message}</FieldError>
                </RadioGroup>
              )}
            />

            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onChange={field.onChange}
                  isInvalid={!!errors.budget}
                  isRequired
                  className="text-tuna-700 flex max-w-[300px] flex-col gap-2"
                >
                  <Label>What&apos;s your budget?</Label>
                  {budgets.map((budget) => (
                    <Radio key={budget.value} value={budget.value}>
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content className="font-semibold">
                        {budget.label}
                      </Radio.Content>
                    </Radio>
                  ))}
                  <FieldError>{errors.budget?.message}</FieldError>
                </RadioGroup>
              )}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep3;
