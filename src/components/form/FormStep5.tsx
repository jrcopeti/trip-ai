import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Checkbox } from "@nextui-org/react";
import DatePicker from "./DatePicker";
import FormTitle from "./FormTitle";
import type { FormStep5Props } from "@/types";
import dayjs from "dayjs";

function FormStep5({
  currentStep,
  delta,
  isWeatherSelected,
  setIsWeatherSelected,
  control,
  errors,
  setValue,
}: FormStep5Props) {
  const handleCheckboxChange = () => {
    setIsWeatherSelected(!isWeatherSelected);
    const startDate = dayjs();
    setValue("startDate", startDate.toISOString());
    const endDate = startDate.add(1, "day");
    setValue("endDate", endDate.toISOString());
  };
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
              onValueChange={handleCheckboxChange}
              color="default"
              size="lg"
              title="Weather forecast"
              className="font-semibold text-gallery-50"
            >
              <p className="text-tuna-900">Based on the weather</p>
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
              <p className="text-tuna-900">
                Your trip plans will be based on the weather forecast for the
                next 7 days.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep5;
