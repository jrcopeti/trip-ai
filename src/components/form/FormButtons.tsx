"use client";
import Link from "next/link";
import { useFormState } from "react-hook-form";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { steps } from "@/data";
import { useCityCheck, useFormFields, useFormSteps } from "@/hooks/useFormData";
import { useOpenTrip } from "@/hooks/useOpenTrip";
import { tripPath } from "@/lib/generation";
import { buttons, openTrip as openTripCopy } from "./content";
import { inkPill, limePill, quietButton } from "./styles";
import StartOver from "./StartOver";

/**
 * Back and Next, or Back and Submit on the last step. Inside the `<form>`, so
 * Submit is a real submit button; Back and Next are `type="button"` and only
 * move between steps. "Start over" sits beside Back once there is anything to clear.
 * While this browser's last trip is unanswered, Submit is off, with a note and a View to it below.
 */
function FormButtons() {
  const { currentStep, next, prev, startOver } = useFormSteps();
  const { isValid, control } = useFormFields();
  // Read here, not in the context: a flip would re-render the whole form from `Form` down.
  const { isDirty } = useFormState({ control });
  const { cityCheck } = useCityCheck();
  const openTrip = useOpenTrip();
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
        <button
          key="submit"
          type="submit"
          disabled={!isValid || openTrip !== null}
          aria-describedby={openTrip ? "open-trip-note" : undefined}
          className={`ml-auto ${inkPill}`}
        >
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

      {/* A row of its own under the pills, after "Start over"'s on a phone. */}
      {isLast && openTrip && (
        <p id="open-trip-note" className="order-last w-full text-sm text-sorbet-ink/70 sm:text-right">
          {openTripCopy.note}{" "}
          <Link href={tripPath(openTrip)} className={quietButton}>
            {openTripCopy.view}
          </Link>
        </p>
      )}
    </div>
  );
}

export default FormButtons;
