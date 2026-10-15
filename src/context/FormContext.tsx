"use client";
import { useState, useEffect, createContext } from "react";
import type {
  FieldName,
  FinalDataTypes,
  FormContextType,
  Inputs,
} from "@/types";
import { useCountries } from "@/hooks/useCountries";
import { idleCityCheck, useGeoNames } from "@/hooks/useGeoNames";
import { useWeather } from "@/hooks/useWeather";
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
  agreement: false,
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
  cityCheck: idleCityCheck,
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

  const {
    handleSubmit,
    control,
    watch,
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
      agreement: false,
    },
  });

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "requiredItems",
  });

  const { generateResponseAI } = useTripResponse();

  const { countries } = useCountries();
  const { generateForecast, forecastData } = useWeather();

  const cityWatch = watch("city");
  const countryWatch = watch("country");
  const reviewFormData = getValues();

  const findCountry = countries.find(
    (country) => country.value === countryWatch,
  );
  const countryCode = findCountry?.code.toUpperCase();
  // Here rather than in step 2 and the buttons, so each spelling is one GeoNames call.
  const cityCheck = useGeoNames({ city: cityWatch, countryCode });

  // workaround to get the right value from the autocomplete
  const handleSelectionAutocomplete = (
    selectedKey: string | number | null,
    fieldName: FieldName,
  ) => {
    // Emptying the input selects `null`: clear the field, or the previous
    // country would stay in the form and pass validation.
    if (selectedKey === null) {
      setValue(fieldName, "");
      return;
    }
    const selectedCountry = countries.find(
      (country) => country.code === selectedKey,
    );
    if (selectedCountry) {
      setValue(fieldName, selectedCountry.value);
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

  const stepValue = steps[currentStep].stepValue;

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });
    if (!output) return;

    // Next is disabled until step 2's check finds the city, so its place is here by the dates step.
    if (isWeatherSelected && cityCheck.place && currentStep === steps.length - 3) {
      generateForecast({ lat: cityCheck.place.lat, lon: cityCheck.place.lng });
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
    // From the submitted country, so the code always matches the data it travels with.
    const submittedCode =
      countries.find((c) => c.value === data.country)?.code.toUpperCase() ?? "";
    // Nothing clears here: a failed generation leaves everything filled in for another
    // try, and a trip that comes back leaves /form, whose layout unmounts this provider.
    generateResponseAI(
      toTripRequest(
        data,
        submittedCode,
        isWeatherSelected ? forecastData : undefined,
      ),
    );

    const finalData: FinalDataTypes = {
      ...data,
      userName: formattedUserName,
      city: formattedCity,
      note: formattedNote,
      requiredItems: transformedRequiredItems,
      byWeather: isWeatherSelected,
      countryCode: submittedCode,
      lat: cityCheck.place?.lat ?? null,
      lng: cityCheck.place?.lng ?? null,
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
        cityCheck,
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
