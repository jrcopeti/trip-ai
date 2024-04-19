"use client";

import { useState } from "react";
import { useCountries } from "@/hooks/useCountries";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import { useWeather } from "@/hooks/useWeather";
import { useFormData } from "@/hooks/useFormData";

import { FormDataSchema } from "@/lib/schema";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ProgressBar from "./ui/Progress";
import FormStep1 from "./ui/FormStep1";
import FormStep2 from "./ui/FormStep2";
import FormStep3 from "./ui/FormStep3";
import FormStep4 from "./ui/FormStep4";
import FormStep5 from "./ui/FormStep5";
import FormStep6 from "./ui/FormStep6";
import FormStep7 from "./ui/FormStep7";
import FormButtons from "./ui/FormButtons";
import { steps } from "@/data";
import type { FinalDataTypes, ProcessFormType } from "@/types";
import type { Inputs, FieldName } from "@/types";
import FormContainer from "./ui/FormContainer";

function Form() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [prevStep, setPrevStep] = useState<number>(0);
  const delta = currentStep - prevStep;

  const [isWeatherSelected, setIsWeatherSelected] = useState<boolean>(false);

  const {
    handleSubmit,
    control,
    watch,
    reset,
    trigger,
    getValues,
    setValue,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      userName: "",
      age: "",
      nationality: "",
      type: "",
      city: "",
      country: "",
      luggageSize: "",
      accommodation: "",
      budget: "",
      transport: "",
      requiredItems: [{ item: "" }],
      interests: [],
      note: "",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      weatherForecast: "",
      agreement: false,
      flagUrl: "",
      tripUrl: crypto.randomUUID().slice(0, 5),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requiredItems",
  });
  const { countries, isLoading: isLoadingCountries } = useCountries();
  const { generateResponseAI, isPendingResponseAI } = useTripResponse();
  const { generateForecast, forecastData } = useWeather();
  const { setFormData } = useFormData();
  const { generateImage } = useImage();

  const forecastDataString = JSON.stringify(forecastData);

  const stepValue = steps[currentStep].stepValue;

  // workaround to get the right value from the autocomplete
  const handleSelectionAutocomplete = (
    selectedKey: string | number,
    fieldName: FieldName,
  ) => {
    const selectedCountry = countries.find(
      (country) => country.code === selectedKey,
    );
    if (selectedCountry) {
      setValue(fieldName, selectedCountry.value);
      if (fieldName === "country") {
        setValue("flagUrl", selectedCountry.flagUrl);
      }
    }
  };

  if (isPendingResponseAI) {
    return <div>Loading...</div>;
  }

  const cityWatch = watch("city");
  const countryWatch = watch("country");

  const reviewFormData = getValues();
  console.log("reviewFormData", reviewFormData);

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    // if (!output) return;

    if (currentStep === steps.length - 3) {
      console.log("get image unsplash");
      generateImage(cityWatch);
    }

    if (isWeatherSelected && currentStep === steps.length - 2) {
      console.log("get weather in the form");
      generateForecast({ city: cityWatch, country: countryWatch });
    }

    setPrevStep(currentStep);
    setCurrentStep((step) => step + 1);
  };

  const prev = () => {
    if (currentStep > 0) {
      setPrevStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  const processForm: ProcessFormType = (data: Inputs) => {
    const {
      userName,
      age,
      nationality,
      city,
      country,
      type,
      startDate,
      endDate,
      requiredItems,
      accommodation,
      interests,
      note,
      transport,
      luggageSize,
      budget,
      weatherForecast,
    } = data;

    const transformedRequiredItems =
      requiredItems?.map((requiredItem) => requiredItem.item) ?? [];

    const promptModel = `${userName}, a ${age}-year-old traveler from ${nationality}, is planning a ${type} trip to ${city}, ${country} with a ${budget} budget. The trip is scheduled from ${startDate} to ${endDate}. ${userName} prefers to travel by ${transport}, with a ${luggageSize} size suitcase and wants to ensure he/she packs everything needed. For that, he/she requires the following items: ${transformedRequiredItems}. (If there is no required items, return an empty array). Staying in a ${accommodation}, he/she is interested in ${interests}. Additionally, he/she has noted he/she would specifically like to have: ${note}. (If there is no note, skip this part). Based on ${userName}'s preferences and trip details, plus the average weather for ${city}, ${country} during the trip, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includuserName}, the city, and the country, a brief description highlighting the essence of their journey, and three must-do activities with maximum three paragraphs each. If ${city} does not exist or it is not located in the ${country}, or it's population is less than 1, return { trip: null }, with no additional characters.`;
    const promptModelWeather = `${userName}, a ${age}-year-old traveler from ${nationality}, is planning a ${type} trip to ${city}, ${country} with a ${budget} budget. ${userName} prefers to travel by ${transport}, with a ${luggageSize} size suitcase and wants to ensure he/she packs everything needed. For that, he/she requires the following items: ${transformedRequiredItems}. If there is no required items, return an empty array. Staying in a ${accommodation}, he/she is interested in ${interests}. Additionally, he/she has noted he/she would specifically like to have: ${note}. If there is no note, skip the note part. Based on ${userName}'s preferences and trip details, plus the weather forecast that is in the end of the prompt, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includes ${userName}, the city, and the country, a brief description highlighting the essence of their journey, and three must-do activities with maximum three paragraphs each. Weather forecast for ${city}, ${country}: ${weatherForecast}. If ${city} does not exist or it is not located in the ${country}, or it's population is less than 1, return { trip: null }, with no additional characters.`;

    if (isWeatherSelected) {
      setValue("weatherForecast", forecastDataString);
      generateResponseAI(promptModelWeather);
    } else {
      generateResponseAI(promptModel);
    }

    const finalData: FinalDataTypes = {
      ...data,
      requiredItems: transformedRequiredItems,
      weatherForecast: forecastDataString,
    };

    setFormData(finalData);
    reset();
  };

  return (
    <>
      <FormContainer>
        <ProgressBar stepValue={stepValue} />

        <form
          onSubmit={handleSubmit(processForm)}
          className="z-30 overflow-auto px-4 py-4 lg:p-8"
        >
          <FormStep1
            currentStep={currentStep}
            delta={delta}
            control={control}
            errors={errors}
            handleSelectionAutocomplete={handleSelectionAutocomplete}
          />

          <FormStep2
            currentStep={currentStep}
            delta={delta}
            control={control}
            errors={errors}
            handleSelectionAutocomplete={handleSelectionAutocomplete}
          />

          <FormStep3
            currentStep={currentStep}
            delta={delta}
            control={control}
            errors={errors}
          />

          <FormStep4
            currentStep={currentStep}
            delta={delta}
            control={control}
            errors={errors}
            fields={fields}
            append={append}
            remove={remove}
          />

          <FormStep5
            currentStep={currentStep}
            delta={delta}
            control={control}
            errors={errors}
            isWeatherSelected={isWeatherSelected}
            setIsWeatherSelected={setIsWeatherSelected}
          />

          <FormStep6
            currentStep={currentStep}
            control={control}
            errors={errors}
            delta={delta}
          />

          <FormStep7
            currentStep={currentStep}
            control={control}
            delta={delta}
            isWeatherSelected={isWeatherSelected}
            isValid={isValid}
            reviewFormData={reviewFormData}
          />
        </form>
      </FormContainer>
      <FormButtons currentStep={currentStep} next={next} prev={prev} />
    </>
  );
}

export default Form;
