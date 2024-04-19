import {
  sortedAccommodations,
  luggageSizes,
  sortedTransports,
  budgets,
} from "@/data";
import FormTitle from "./FormTitle";
import { Radio, RadioGroup } from "@nextui-org/react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import type { FormStep3Props } from "@/types";
import { steps } from "@/data";

function FormStep3({
  currentStep,
  control,
  errors,
  delta,
}: FormStep3Props) {
  return (
    <>
      {currentStep === 2 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle currentStep={currentStep} />

          <div className="mt-6 grid max-w-[80%] grid-cols-1 gap-x-4 gap-y-8  text-sm md:mt-[75px] lg:grid-cols-2">
            <Controller
              name="luggageSize"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  id="luggageSize"
                  label="What's the size of your luggage?"
                  orientation="horizontal"
                  color="success"
                  className="max-w-[300px]"
                  errorMessage={errors.luggageSize?.message}
                  isInvalid={!!errors.luggageSize}
                  isRequired
                >
                  {luggageSizes.map((luggageSize) => (
                    <Radio
                      key={luggageSize.value}
                      value={luggageSize.value}
                      className="font-semibold"
                    >
                      {luggageSize.label}
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            />

            <Controller
              name="accommodation"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  id="accommodation"
                  label="Where are you staying?"
                  orientation="horizontal"
                  color="success"
                  className="max-w-[300px]"
                  errorMessage={errors.accommodation?.message}
                  isInvalid={!!errors.accommodation}
                  isRequired
                >
                  {sortedAccommodations.map((accommodation) => (
                    <Radio
                      key={accommodation.value}
                      value={accommodation.value}
                      className="font-semibold"
                    >
                      {accommodation.label}
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            />

            <Controller
              name="transport"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  id="transport"
                  label="How are you traveling?"
                  orientation="horizontal"
                  color="success"
                  className="max-w-[300px]"
                  errorMessage={errors.transport?.message}
                  isInvalid={!!errors.transport}
                  isRequired
                >
                  {sortedTransports.map((transport) => (
                    <Radio
                      key={transport.value}
                      value={transport.value}
                      className="font-semibold"
                    >
                      {transport.label}
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            />

            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  id="budget"
                  label="What's your budget?"
                  orientation="horizontal"
                  color="success"
                  className="max-w-[300px]"
                  errorMessage={errors.budget?.message}
                  isInvalid={!!errors.budget}
                  isRequired
                >
                  {budgets.map((budget) => (
                    <Radio
                      key={budget.value}
                      value={budget.value}
                      className="font-semibold"
                    >
                      {budget.label}
                    </Radio>
                  ))}
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
