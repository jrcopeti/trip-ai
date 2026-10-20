"use client";

import { useGenerationState, useTripGeneration } from "@/hooks/useTripGeneration";
import { isLoading } from "@/lib/generation";
import { useFormFields, useFormSteps } from "@/hooks/useFormData";

import ProgressBar from "./Progress";
import FormStep1 from "./FormStep1";
import FormStep2 from "./FormStep2";
import FormStep3 from "./FormStep3";
import FormStep4 from "./FormStep4";
import FormStep5 from "./FormStep5";
import FormStep6 from "./FormStep6";
import FormStep7 from "./FormStep7";
import FormButtons from "./FormButtons";
import NotFoundComponent from "../ui/NotFoundComponent";
import LoaderResponseAI from "../ui/LoaderResponseAI";
import { failure } from "./content";

function Form() {
  const { handleSubmit, processForm } = useFormFields();
  const { isDraftRestored } = useFormSteps();
  // The app's generation, not this form's: one started before /form last unmounted counts too.
  const { cancel, clearResult } = useTripGeneration();
  // Through the redirect too: a trip on its way keeps the loader, not the spent form, on screen.
  const loading = useGenerationState(isLoading);
  const inFlight = useGenerationState((state) => state.pending !== null);
  const failed = useGenerationState((state) => state.result?.kind === "failed");

  if (loading) {
    // While the trip is on its way to its page there's nothing left to cancel.
    return <LoaderResponseAI onCancel={inFlight ? cancel : undefined} />;
  }

  if (failed) {
    // "Try again" shows the form again, on the review step with every answer: the draft
    // is cleared only when a trip comes back.
    return (
      <NotFoundComponent message={failure.message} button={failure.button} onAction={clearResult} />
    );
  }

  return (
    // `overflow-hidden` contains the step slide; popovers portal out of it. Invisible, not
    // absent, until a saved draft is back in, so step 1 doesn't flash before it.
    <div
      className={`overflow-hidden rounded-3xl bg-white p-6 sm:p-10 ${isDraftRestored ? "" : "invisible"}`}
    >
      <ProgressBar />
      <form onSubmit={handleSubmit(processForm)} noValidate className="mt-10">
        <FormStep1 />
        <FormStep2 />
        <FormStep3 />
        <FormStep4 />
        <FormStep5 />
        <FormStep6 />
        <FormStep7 />
        <FormButtons />
      </form>
    </div>
  );
}

export default Form;
