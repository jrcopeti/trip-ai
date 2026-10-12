"use client";
import { useFormData } from "@/hooks/useFormData";
import { Checkbox } from "@heroui/react";
import { Controller } from "react-hook-form";
import StepPanel from "./StepPanel";
import ReviewForm from "./ReviewForm";
import { review } from "./content";

/** The review, and the agreement Submit waits on. Submit itself is in `FormButtons`. */
function FormStep7() {
  const { currentStep, control } = useFormData();

  if (currentStep !== 6) return null;

  return (
    <StepPanel>
      <ReviewForm />
      <Controller
        name="agreement"
        control={control}
        render={({ field }) => (
          <Checkbox
            isSelected={field.value}
            onChange={field.onChange}
            className="mt-10 max-w-xl cursor-pointer items-start rounded-3xl bg-sorbet-lime px-5 py-4"
          >
            <Checkbox.Control className="mt-0.5">
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <span className="text-sm leading-relaxed text-sorbet-ink">{review.agreement}</span>
            </Checkbox.Content>
          </Checkbox>
        )}
      />
    </StepPanel>
  );
}

export default FormStep7;
