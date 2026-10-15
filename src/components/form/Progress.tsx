"use client";
import { useFormSteps } from "@/hooks/useFormData";
import { ProgressBar } from "@heroui/react";
import { steps } from "@/data";
import { progress } from "./content";

function FormProgressBar() {
  const { stepValue, currentStep } = useFormSteps();

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
        {progress.step(currentStep + 1, steps.length)}
      </p>
      <ProgressBar.Root aria-label={progress.label} value={stepValue} className="w-full">
        <ProgressBar.Track className="h-2 rounded-full bg-sorbet-ink/15">
          <ProgressBar.Fill
            className="rounded-full bg-sorbet-ink transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${stepValue}%` }}
          />
        </ProgressBar.Track>
      </ProgressBar.Root>
    </section>
  );
}

export default FormProgressBar;
