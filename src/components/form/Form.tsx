"use client";

import { useTripResponse } from "@/hooks/useTripResponse";
import { useFormData } from "@/hooks/useFormData";

import ProgressBar from "./Progress";
import FormStep1 from "./FormStep1";
import FormStep2 from "./FormStep2";
import FormStep3 from "./FormStep3";
import FormStep4 from "./FormStep4";
import FormStep5 from "./FormStep5";
import FormStep6 from "./FormStep6";
import FormStep7 from "./FormStep7";
import FormButtons from "./FormButtons";
import FormContainer from "./FormContainer";
import NotFoundComponent from "../ui/NotFoundComponent";
import LoaderResponseAI from "../ui/LoaderResponseAI";

function Form() {
  const { isPendingResponseAI, errorResponseAI } = useTripResponse();
  const { handleSubmit, processForm } = useFormData();

  if (isPendingResponseAI) {
    return <LoaderResponseAI />;
  }

  if (errorResponseAI) {
    return (
      <NotFoundComponent
        message="There was an error generating the trip. Please try again."
        path="/form"
        button="Back to Form"
      />
    );
  }

  return (
    <>
      <FormContainer>
        <ProgressBar />
        <form
          onSubmit={handleSubmit(processForm)}
          className="z-30 px-4 py-4 lg:p-8"
        >
          <FormStep1 />
          <FormStep2 />
          <FormStep3 />
          <FormStep4 />
          <FormStep5 />
          <FormStep6 />
          <FormStep7 />
        </form>
      </FormContainer>
      <FormButtons />
    </>
  );
}

export default Form;
