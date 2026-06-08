"use client";
import { useFormData } from "@/hooks/useFormData";
import { Controller } from "react-hook-form";
import { TextField, Label, Input, Button } from "@heroui/react";
import { motion } from "framer-motion";
import FormTitle from "./FormTitle";

function FormStep4() {
  const { currentStep, fields, control, append, remove, delta } = useFormData();
  return (
    <>
      {currentStep === 3 && (
        <motion.div
          initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
        >
          <FormTitle />

          <div className="mt-10 flex max-h-fit max-w-[600px] flex-col gap-8 lg:mt-[100px]">
            {fields.map((field, index) => (
              <div className="flex items-end gap-2" key={field.id}>
                <Controller
                  control={control}
                  name={`requiredItems[${index}].item` as any}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <TextField {...fieldProps} className="max-w-lg">
                      <Label className="text-tuna-700">Item {index + 1}</Label>
                      <Input ref={ref} />
                    </TextField>
                  )}
                />
                <Button
                  className="bg-yellorange-700 text-gallery-50"
                  type="button"
                  onPress={() => remove(index)}
                >
                  X
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              className="bg-neptune-600 text-gallery-50"
              type="button"
              onPress={() => append({ item: "" })}
            >
              Add another item
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default FormStep4;
