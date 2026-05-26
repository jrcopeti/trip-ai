"use client";
import { useFormData } from "@/hooks/useFormData";
import { Checkbox, Button } from "@heroui/react";
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
          <FormTitle />
          <ReviewForm />
          <div className="mt-4 flex max-w-md flex-col gap-4">
            <Controller
              name="agreement"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onChange={field.onChange}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <small className="text-tuna-900">
                      By agreeing, you consent to share your information with
                      OpenAI. Please note, this application is designed only for
                      entertainment purposes{" "}
                    </small>
                  </Checkbox.Content>
                </Checkbox>
              )}
            />
            {currentStep === steps.length - 1 && (
              <Button
                type="submit"
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
