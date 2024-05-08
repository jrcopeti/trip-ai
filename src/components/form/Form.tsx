"use client";

import { memo, useState } from "react";
import { useCountries } from "@/hooks/useCountries";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import { useWeather } from "@/hooks/useWeather";
import { useFormData } from "@/hooks/useFormData";
import { useGeoNames } from "@/hooks/useGeoNames";

import { FormDataSchema } from "@/lib/schema";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ProgressBar from "./Progress";
import FormStep1 from "./FormStep1";
import FormStep2 from "./FormStep2";
import FormStep3 from "./FormStep3";
import FormStep4 from "./FormStep4";
import FormStep5 from "./FormStep5";
import FormStep6 from "./FormStep6";
import FormStep7 from "./FormStep7";
import Loader from "../ui/Loader";
import FormButtons from "./FormButtons";
import FormContainer from "./FormContainer";
import NotFoundComponent from "../ui/NotFoundComponent";
import Container from "../ui/Container";
import GradientBg from "../ui/GradientBg";
import LoaderResponseAI from "../ui/LoaderResponseAI";
import { steps } from "@/data";
import type {
  FinalDataTypes,
  ProcessFormType,
  Inputs,
  FieldName,
} from "@/types";
import { selectDailyForecasts } from "@/lib/utils";

const Form = memo(function Form() {
  const { isPendingResponseAI, isNavigating, errorResponseAI } =
    useTripResponse();
  const { isLoading: isLoadingCountries } = useCountries();
  const { handleSubmit, processForm } = useFormData();

  if (isLoadingCountries) {
    return <Loader />;
  }

  if (isPendingResponseAI || isNavigating) {
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
    <Container overflow="overflow-hidden" height="h-[calc(100dvh-3.5rem)]">
      <GradientBg />
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
    </Container>
  );
});

export default Form;
