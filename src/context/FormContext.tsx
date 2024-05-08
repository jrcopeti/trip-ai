"use client";
import { useState, createContext } from "react";
import type {
  FieldName,
  FinalDataTypes,
  FormContextType,
  Inputs,
  ProcessFormType,
} from "@/types";
import { useCountries } from "@/hooks/useCountries";
import { useWeather } from "@/hooks/useWeather";
import { useFormData } from "@/hooks/useFormData";
import { useImage } from "@/hooks/useImage";
import { useGeoNames } from "@/hooks/useGeoNames";
import { steps } from "@/data";
import { useTripResponse } from "@/hooks/useTripResponse";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDataSchema } from "@/lib/schema";
import { Control, FieldErrors } from "react-hook-form";

const defaultFormData: Inputs = {
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
  interests: [""],
  note: "",
  startDate: "",
  endDate: "",
  weatherForecast: "",
  agreement: false,
  flagUrl: "",
};

function transformInputsToFinalData(inputs: Inputs): FinalDataTypes {
  const transformedRequiredItems =
    inputs.requiredItems?.map((i) => i.item) ?? [];

  return {
    ...inputs,
    requiredItems: transformedRequiredItems,
    weatherForecast: inputs.weatherForecast || "",
  };
}
const initialFinalData = transformInputsToFinalData(defaultFormData);

const defaultContextValue: FormContextType = {
  formData: initialFinalData,
  setFormData: () => {},
  currentStep: 0,
  delta: 0,
  control: null,
  errors: {},
  handleSelectionAutocomplete: () => {},
  handleSubmit: () => () => {},
  processForm: () => {},
  stepValue: 0,
  cityWatch: "",
  countryCode: "",
  fields: [],
  append: () => {},
  remove: () => {},
  setValue: () => {},
  isWeatherSelected: false,
  setIsWeatherSelected: () => {},
  isValid: false,
  reviewFormData: defaultFormData,
  next: () => {},
  prev: () => {},
};

const FormContext = createContext<FormContextType>(defaultContextValue);

function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FinalDataTypes>(initialFinalData);
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
      startDate: "",
      endDate: "",
      weatherForecast: "",
      agreement: false,
      flagUrl: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requiredItems",
  });

  const { generateResponseAI } = useTripResponse();

  const { countries } = useCountries();
  const { generateForecast, forecastData } = useWeather();
  console.log("forecastData", forecastData);
  const { generateImage } = useImage();

  const cityWatch = watch("city");
  const countryWatch = watch("country");
  const reviewFormData = getValues();

  const findCountry = countries.find(
    (country) => country.value === countryWatch,
  );
  const countryCode = findCountry?.code.toUpperCase();

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

  const stepValue = steps[currentStep].stepValue;

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    // if (!output) return;

    if (isWeatherSelected && currentStep === steps.length - 3) {
      generateForecast({
        city: cityWatch,
        country: countryWatch,
      });
    }

    if (currentStep === steps.length - 2) {
      generateImage(cityWatch);
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

  const processForm: SubmitHandler<Inputs> = (data) => {
    console.log("data", data);
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
    } = data;

    const transformedRequiredItems =
      requiredItems?.map((requiredItem) =>
        requiredItem.item.trim().toLowerCase(),
      ) ?? [];

    const formattedUserName = userName.trim().toLowerCase();
    const formattedCity = city.trim().toLowerCase();
    const formattedNote = note?.trim().toLowerCase();
    const forecastDataString = JSON.stringify(forecastData);

    const promptModel = `${formattedUserName}, a ${age}-year-old traveler from ${nationality}, is planning a ${type} trip to ${formattedCity}, ${country} with a ${budget} budget. The trip is scheduled from ${startDate} to ${endDate}. ${formattedUserName} prefers to travel by ${transport}, with a ${luggageSize} lugagge size and wants to ensure he/she packs everything needed. For that, he/she requires the following items: ${transformedRequiredItems}. (If there is no required items, return an empty array). Staying in a ${accommodation}, he/she is interested in ${interests}. Additionally, he/she has noted he/she would specifically like to have: ${formattedNote} (If there is no note, skip this part). Based on ${formattedUserName}'s preferences and trip details, plus the average weather for ${formattedCity}, ${country} during the trip, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includes ${formattedUserName}, ${formattedCity}, and ${country}, a brief description highlighting the essence of their journey, and three must-do activities with maximum three paragraphs each. Finally, especify a tip taking in consideration the transport, luggage size, weather and notes.`;

    const promptModelWeather = `${formattedUserName}, a ${age}-year-old traveler from ${nationality}, is planning a ${type} trip to ${formattedCity}, ${country} with a ${budget} budget. ${userName} prefers to travel by ${transport}, with a ${luggageSize} luggage size and wants to ensure he/she packs everything needed. For that, he/she requires the following items: ${transformedRequiredItems}. (If there is no required items, return an empty array). Staying in a ${accommodation}, he/she is interested in ${interests}. Additionally, he/she has noted he/she would specifically like to have: ${formattedNote} (If there is no note, skip this part). Based on ${userName}'s preferences and trip details, plus the weather forecast that is in the end of the prompt, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includes ${userName}, ${formattedCity}, and ${country}, a brief description highlighting the essence of their journey, and three must-do activities with maximum three paragraphs each. Finally, especify a tip taking in consideration the transport, luggage size, weather and notes. Weather forecast for ${formattedCity}, ${country}: ${forecastDataString}.`;

    if (isWeatherSelected) {
      console.log("weathersubmitted");
      setValue("weatherForecast", forecastDataString);
      generateResponseAI(promptModelWeather);
    } else {
      console.log("submitted");
      generateResponseAI(promptModel);
    }

    const finalData: FinalDataTypes = {
      ...data,
      userName: formattedUserName,
      city: formattedCity,
      note: formattedNote,
      requiredItems: transformedRequiredItems,
      weatherForecast: forecastDataString,
    };
    setFormData(finalData);
    reset();
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        setFormData,
        currentStep,
        delta,
        control,
        errors,
        handleSelectionAutocomplete,
        handleSubmit,
        processForm,
        cityWatch,
        countryCode,
        fields,
        append,
        remove,
        setValue,
        isWeatherSelected,
        setIsWeatherSelected,
        isValid,
        reviewFormData,
        stepValue,
        next,
        prev,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export { FormProvider, FormContext };
