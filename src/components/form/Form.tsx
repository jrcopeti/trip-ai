"use client";

import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { generateTripKey, stopGeneration } from "@/hooks/useTripGeneration";
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
  const { handleSubmit, processForm, isGenerationPending, generationError, resetGeneration } =
    useFormFields();
  const { isDraftRestored } = useFormSteps();
  // Also one from before /form last unmounted: the form behind it would send a second trip.
  const isGenerating = useIsMutating({ mutationKey: generateTripKey }) > 0;
  const queryClient = useQueryClient();

  if (isGenerationPending || isGenerating) {
    // Leaving the cache doesn't clear this provider's own pending state; `resetGeneration` does.
    const cancel = () => {
      stopGeneration(queryClient);
      resetGeneration();
    };
    return <LoaderResponseAI onCancel={cancel} />;
  }

  if (generationError) {
    // Clearing the error shows the form again, still on the review step with
    // every answer: it is cleared only when a trip comes back.
    return (
      <NotFoundComponent
        message={failure.message}
        button={failure.button}
        onAction={resetGeneration}
      />
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
