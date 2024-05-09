import { useFormData } from "@/hooks/useFormData";
import { Controller } from "react-hook-form";
import { Radio, RadioGroup } from "@nextui-org/react";
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
  const { currentStep, control, errors, delta } = useFormData();
  return (
    <>
      {currentStep === 2 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle />

          <div className="mt-6 grid max-w-[80%] grid-cols-1 gap-x-4 gap-y-8 text-sm md:mt-[60px] lg:grid-cols-2 xl:grid-cols-3 ">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  id="type"
                  label="How do you describe your trip?"
                  color="success"
                  className="max-w-[300px]"
                  errorMessage={errors.type?.message}
                  isInvalid={!!errors.type}
                  isRequired
                >
                  {sortedTypes.map((type) => (
                    <Radio
                      key={type.value}
                      value={type.value}
                      className="font-semibold"
                    >
                      {type.label}
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
              name="luggageSize"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  id="luggageSize"
                  label="What's the size of your luggage?"
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
              name="transport"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  id="transport"
                  label="How are you traveling?"
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
