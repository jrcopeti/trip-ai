"use client";
import { useFormData } from "@/hooks/useFormData";
import { Controller } from "react-hook-form";
import StepPanel from "./StepPanel";
import ChoiceGroup from "./ChoiceGroup";
import { details } from "./content";
import { tints } from "./styles";
import {
  sortedAccommodations,
  luggageSizes,
  sortedTransports,
  budgets,
  sortedTypes,
  paces,
} from "@/data";

/** Six questions, the pastel rotating so neighbouring groups read apart. */
const questions = [
  { name: "type", label: details.type, options: sortedTypes, tint: tints.lavender },
  { name: "pace", label: details.pace, options: paces, tint: tints.lime },
  { name: "accommodation", label: details.accommodation, options: sortedAccommodations, tint: tints.blush },
  { name: "luggageSize", label: details.luggageSize, options: luggageSizes, tint: tints.lime },
  { name: "transport", label: details.transport, options: sortedTransports, tint: tints.lavender },
  { name: "budget", label: details.budget, options: budgets, tint: tints.blush },
] as const;

function FormStep3() {
  const { currentStep, control, errors } = useFormData();

  if (currentStep !== 2) return null;

  return (
    <StepPanel>
      <div className="flex flex-col gap-10">
        {questions.map((q) => (
          <Controller
            key={q.name}
            name={q.name}
            control={control}
            render={({ field }) => (
              <ChoiceGroup
                label={q.label}
                options={q.options}
                value={field.value}
                onChange={field.onChange}
                tint={q.tint}
                error={errors[q.name]?.message}
              />
            )}
          />
        ))}
      </div>
    </StepPanel>
  );
}

export default FormStep3;
