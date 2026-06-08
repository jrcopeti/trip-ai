"use client";
import { useFormData } from "@/hooks/useFormData";
import { ProgressBar } from "@heroui/react";

function FormProgressBar() {
  const { stepValue } = useFormData();
  return (
    <section className="max-w-full">
      <ProgressBar.Root
        aria-label="Form progress"
        value={stepValue}
        className="w-full"
      >
        <ProgressBar.Track className="drop-shadow-md border border-shark-200">
          <ProgressBar.Fill
            className="bg-gradient-to-l from-yellorange-300 to-neptune-400"
            style={{ width: `${stepValue}%` }}
          />
        </ProgressBar.Track>
      </ProgressBar.Root>
    </section>
  );
}

export default FormProgressBar;
