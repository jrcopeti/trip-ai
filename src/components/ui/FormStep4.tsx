import { motion } from "framer-motion";
import FormTitle from "./FormTitle";
import { Controller } from "react-hook-form";
import { Button, Input } from "@nextui-org/react";
import type { FormStep4Props } from "@/types";

function FormStep4({
  steps,
  currentStep,
  fields,
  control,
  append,
  remove,
  delta,
}: FormStep4Props) {
  return (
    <>
      {currentStep === 3 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle steps={steps} currentStep={currentStep} />

          <div className="mt-10 flex max-h-fit max-w-[600px] flex-col gap-8 lg:mt-[100px]  ">
            {fields.map((field, index) => (
              <div className="flex items-center gap-2" key={field.id}>
                <Controller
                  control={control}
                  name={`requiredItems[${index}].item` as any}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={`Item ${index + 1}`}
                      className="max-w-lg text-tuna-700 "
                      radius="sm"
                      variant="faded"
                      color="primary"
                    />
                  )}
                />
                <Button
                  className=" bg-yellorange-700 text-gallery-50"
                  type="button"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  X
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              className="place-items-center bg-neptune-600 text-gallery-50"
              type="button"
              onClick={() => append({ item: "" })}
            >
              Add Item
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep4;
