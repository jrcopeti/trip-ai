import FormTitle from "./FormTitle";
import ReviewForm from "./ReviewForm";
import { motion } from "framer-motion";
import { Controller } from "react-hook-form";
import { Checkbox, Button } from "@nextui-org/react";
import type { FormStep7Props } from "@/types";

function FormStep7({
  steps,
  currentStep,
  delta,
  isWeatherSelected,
  control,
  isValid,
  reviewFormData,
}: FormStep7Props) {
  return (
    <>
      {currentStep === 6 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle steps={steps} currentStep={currentStep} />
          <ReviewForm
            weather={isWeatherSelected}
            reviewFormData={reviewFormData}
          />
          <div className="mt-4 flex max-w-md flex-col gap-4">
            <Controller
              name="agreement"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onValueChange={field.onChange}
                  className="font-semibold"
                >
                  <small>
                    By agreeing, you consent to share your information with
                    OpenAI. Please note, this application is designed only for
                    entertainment purposes{" "}
                  </small>
                </Checkbox>
              )}
            />
            {currentStep === steps.length - 1 && (
              <Button
                type="submit"
                size="lg"
                isDisabled={!isValid}
                className="text-gallery-50"
              >
                Submit
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep7;