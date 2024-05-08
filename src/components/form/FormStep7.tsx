import { useFormData } from "@/hooks/useFormData";
import { Checkbox, Button } from "@nextui-org/react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import FormTitle from "./FormTitle";
import ReviewForm from "./ReviewForm";
import { steps } from "@/data";

function FormStep7() {
  const { currentStep, delta, isWeatherSelected, control, isValid } =
    useFormData();
  return (
    <>
      {currentStep === 6 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle currentStep={currentStep} />
          <ReviewForm />
          <div className="mt-4 flex max-w-md flex-col gap-4">
            <Controller
              name="agreement"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onValueChange={field.onChange}
                  className="font-semibold text-gallery-50"
                >
                  <small className="text-tuna-900">
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
