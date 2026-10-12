"use client";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { steps } from "@/data";
import { useFormData } from "@/hooks/useFormData";
import { useGeoNames } from "@/hooks/useGeoNames";
import { buttons } from "./content";
import { inkPill, limePill } from "./styles";

/**
 * Back and Next, or Back and Submit on the last step. Inside the `<form>`, so
 * Submit is a real submit button; Back and Next are `type="button"` and only
 * move between steps. The wiring is `FormContext`'s, unchanged.
 */
function FormButtons() {
  const { currentStep, next, prev, cityWatch, countryCode, isValid } = useFormData();
  const { isCityValid } = useGeoNames({ city: cityWatch, countryCode });
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t border-sorbet-ink/15 pt-8">
      <button
        type="button"
        onClick={prev}
        disabled={currentStep === 0}
        className={limePill}
      >
        <FaArrowLeft size={14} aria-hidden />
        {buttons.back}
      </button>

      {/* Separate keys: React swaps in a new element rather than turning the
          Next button that was just clicked into a submit button. Reusing it
          leaves whether that click also submits to event timing. */}
      {isLast ? (
        <button key="submit" type="submit" disabled={!isValid} className={inkPill}>
          {buttons.submit}
          <FaArrowRight size={14} aria-hidden />
        </button>
      ) : (
        <button
          key="next"
          type="button"
          onClick={next}
          disabled={currentStep > 0 && !isCityValid}
          className={inkPill}
        >
          {buttons.next}
          <FaArrowRight size={14} aria-hidden />
        </button>
      )}
    </div>
  );
}

export default FormButtons;
