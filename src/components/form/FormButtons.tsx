"use client";
import { useFormState } from "react-hook-form";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { steps } from "@/data";
import { useCityCheck, useFormFields, useFormSteps } from "@/hooks/useFormData";
import { buttons } from "./content";
import { inkPill, limePill } from "./styles";
import StartOver from "./StartOver";

/**
 * Back and Next, or Back and Submit on the last step. Inside the `<form>`, so
 * Submit is a real submit button; Back and Next are `type="button"` and only
 * move between steps. "Start over" sits beside Back once there is anything to clear.
 */
function FormButtons() {
  const { currentStep, next, prev, startOver } = useFormSteps();
  const { isValid, control } = useFormFields();
  // Read here, not in the context: a flip would re-render the whole form from `Form` down.
  const { isDirty } = useFormState({ control });
  const { cityCheck } = useCityCheck();
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-sorbet-ink/15 pt-8">
      <button
        type="button"
        onClick={prev}
        disabled={currentStep === 0}
        className={limePill}
      >
        <FaArrowLeft size={14} aria-hidden />
        {buttons.back}
      </button>

      {/* Its own row below the pills on a phone, where three don't fit on one. */}
      {(isDirty || currentStep > 0) && (
        <StartOver onConfirm={startOver} className="order-last w-full sm:order-none sm:w-auto" />
      )}

      {/* Separate keys: React swaps in a new element rather than turning the
          Next button that was just clicked into a submit button. Reusing it
          leaves whether that click also submits to event timing. */}
      {isLast ? (
        <button key="submit" type="submit" disabled={!isValid} className={`ml-auto ${inkPill}`}>
          {buttons.submit}
          <FaArrowRight size={14} aria-hidden />
        </button>
      ) : (
        <button
          key="next"
          type="button"
          onClick={next}
          disabled={currentStep > 0 && !cityCheck.isCityValid}
          className={`ml-auto ${inkPill}`}
        >
          {buttons.next}
          <FaArrowRight size={14} aria-hidden />
        </button>
      )}
    </div>
  );
}

export default FormButtons;
