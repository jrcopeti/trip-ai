"use client";
import { useState, useEffect, createContext } from "react";
import { usePathname } from "next/navigation";
import type {
  FieldName,
  FinalDataTypes,
  FormContextType,
  Inputs,
} from "@/types";
import { useCountries } from "@/hooks/useCountries";
import { useWeather } from "@/hooks/useWeather";
import { useImage } from "@/hooks/useImage";
import { useTripResponse } from "@/hooks/useTripResponse";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { steps } from "@/data";
import { FormDataSchema } from "@/lib/schema";
import { transformInputsToFinalData } from "@/lib/formData";
import { toTripRequest } from "@/lib/agent/request";

const defaultFormData: Inputs = {
  userName: "",
  travellers: "",
  ageRanges: [] as unknown as Inputs["ageRanges"],
  passport: "",
  type: "",
  pace: "",
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

const initialFinalData = transformInputsToFinalData(defaultFormData);

const defaultContextValue: FormContextType = {
  formData: initialFinalData,
  setFormData: () => {},
  currentStep: 0,
  delta: 0,
  control: undefined,
  errors: {},
  handleSelectionAutocomplete: () => {},
  handleSubmit: () => () => {},
  processForm: () => {},
  stepValue: 0,
  cityWatch: "",
  countryCode: "",
  fields: [],
  append: () => {},
  insert: () => {},
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
  const [clearOnLeave, setClearOnLeave] = useState(false);
  const pathname = usePathname();

  const {
    handleSubmit,
    control,
    watch,
    reset,
    trigger,
    getValues,
    getFieldState,
    setValue,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      userName: "",
      travellers: "",
      ageRanges: [],
      passport: "",
      type: "",
      pace: "",
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

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "requiredItems",
  });

  const { generateResponseAI } = useTripResponse();

  const { countries } = useCountries();
  const { generateForecast, forecastData } = useWeather();
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
    selectedKey: string | number | null,
    fieldName: FieldName,
  ) => {
    // Emptying the input selects `null`: clear the field, or the previous
    // country would stay in the form and pass validation.
    if (selectedKey === null) {
      setValue(fieldName, "");
      if (fieldName === "country") {
        setValue("flagUrl", "");
      }
      return;
    }
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

  // Errors appear on Next (`trigger` in `next`), but should go as soon as the
  // field is fixed. Any value change re-checks the current step's fields that
  // are showing one — a watch, not RHF's `mode`, because the comboboxes and
  // choice groups write without a blur, and an end date's error can be fixed
  // by changing the start date.
  useEffect(() => {
    const { unsubscribe } = watch((_, { name }) => {
      if (!name) return;
      const stale = (steps[currentStep].fields as FieldName[]).filter(
        (field) => getFieldState(field).error,
      );
      if (stale.length) trigger(stale);
    });
    return unsubscribe;
  }, [watch, trigger, getFieldState, currentStep]);

  // Cleared once the traveller has left /form after a trip came back: clearing on
  // success itself drew an empty step 1 while router.replace was still navigating.
  useEffect(() => {
    if (!clearOnLeave || !pathname || pathname === "/form") return;
    reset();
    setCurrentStep(0);
    setIsWeatherSelected(false);
    setClearOnLeave(false);
  }, [clearOnLeave, pathname, reset]);

  const stepValue = steps[currentStep].stepValue;

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });
    if (!output) return;

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
    const { userName, city, note, requiredItems } = data;

    const transformedRequiredItems =
      requiredItems?.map((requiredItem) =>
        requiredItem.item.trim().toLowerCase(),
      ) ?? [];

    const formattedUserName = userName.trim().toLowerCase();
    const formattedCity = city.trim().toLowerCase();
    const formattedNote = note?.trim().toLowerCase();
    const forecastDataString = JSON.stringify(forecastData);

    if (isWeatherSelected) {
      setValue("weatherForecast", forecastDataString);
    }
    // From the submitted country, so the code always matches the data it travels with.
    const submittedCode =
      countries.find((c) => c.value === data.country)?.code.toUpperCase() ?? "";
    // The form clears only after a trip is back (see `clearOnLeave`), so a
    // failed generation leaves everything filled in for another try.
    generateResponseAI(
      toTripRequest(
        data,
        submittedCode,
        isWeatherSelected ? forecastData : undefined,
      ),
      { onSuccess: () => setClearOnLeave(true) },
    );

    const finalData: FinalDataTypes = {
      ...data,
      userName: formattedUserName,
      city: formattedCity,
      note: formattedNote,
      requiredItems: transformedRequiredItems,
      weatherForecast: forecastDataString,
    };
    setFormData(finalData);
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
        insert,
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
