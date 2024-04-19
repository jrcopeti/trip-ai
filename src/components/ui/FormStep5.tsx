import { motion } from "framer-motion";
import FormTitle from "./FormTitle";
import { Controller } from "react-hook-form";
import { Checkbox } from "@nextui-org/react";
import DatePicker from "./DatePicker";
import type { FormStep5Props } from "@/types";

function FormStep5({
  currentStep,
  delta,
  isWeatherSelected,
  setIsWeatherSelected,
  control,
  errors,
}: FormStep5Props) {
  return (
    <>
      {currentStep === 4 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle currentStep={currentStep} />

          <div className="mt-10 flex flex-col gap-x-6 gap-y-8 ">
            <Checkbox
              isSelected={isWeatherSelected}
              onValueChange={setIsWeatherSelected}
              color="default"
              className="font-semibold"
            >
              Weather Forecast
            </Checkbox>
            {!isWeatherSelected ? (
              <>
                <h3 className="text-tuna-800">Or</h3>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Start Date"
                      id="startDate"
                      placeholder="When do your trip start?"
                    />
                  )}
                />
                {errors.startDate?.message && (
                  <p className="text-xs text-red-500">
                    {errors.startDate.message}
                  </p>
                )}

                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="End Date"
                      id="endDate"
                      placeholder="When does it end?"
                    />
                  )}
                />
                {errors.endDate?.message && (
                  <p className="text-xs text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </>
            ) : (
              <p className="text-inherit">
                Your trip plans is based on the weather forecast for the next 7
                days.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep5;
