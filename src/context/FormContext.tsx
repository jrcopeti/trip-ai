"use client";
import { useState, useEffect, createContext, useCallback, useMemo } from "react";
import type {
  CityCheckContextType,
  FieldName,
  FormFieldsContextType,
  FormStepsContextType,
  Inputs,
} from "@/types";
import { useCountries } from "@/hooks/useCountries";
import { idleCityCheck, useGeoNames } from "@/hooks/useGeoNames";
import { useFormForecast } from "@/hooks/useFormForecast";
import { useTripGeneration } from "@/hooks/useTripGeneration";
import { SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { steps } from "@/data";
import { FormDataSchema } from "@/lib/schema";
import { toTripRequest } from "@/lib/agent/request";

// Also `useForm`'s defaults, so the two can't drift apart.
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
  interests: [] as unknown as Inputs["interests"],
  note: "",
  startDate: "",
  endDate: "",
  agreement: false,
};

// Three contexts, each memoised, so a keystroke in the city re-renders only what reads the
// city check, and a step change only what reads the step.
const FormStepsContext = createContext<FormStepsContextType>({
  currentStep: 0,
  delta: 0,
  stepValue: 0,
  next: () => {},
  prev: () => {},
});

const FormFieldsContext = createContext<FormFieldsContextType>({
  control: undefined,
  errors: {},
  isValid: false,
  handleSelectionAutocomplete: () => {},
  handleSubmit: () => () => {},
  processForm: () => {},
  fields: [],
  append: () => {},
  insert: () => {},
  remove: () => {},
  setValue: () => {},
  isWeatherSelected: false,
  setIsWeatherSelected: () => {},
  isGenerationPending: false,
  generationError: null,
  resetGeneration: () => {},
});

const CityCheckContext = createContext<CityCheckContextType>({
  cityCheck: idleCityCheck,
});

function FormProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [prevStep, setPrevStep] = useState<number>(0);
  const delta = currentStep - prevStep;

  const [isWeatherSelected, setIsWeatherSelected] = useState<boolean>(false);

  const { handleSubmit, control, watch, trigger, getFieldState, setValue, formState } =
    useForm<Inputs>({
      resolver: zodResolver(FormDataSchema),
      defaultValues: defaultFormData,
    });
  // RHF edits `errors` in place, so the memo below keys on `formState`, a new object per change.
  const { errors, isValid } = formState;

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "requiredItems",
  });

  const {
    generate,
    isPending: isGenerationPending,
    error: generationError,
    reset: resetGeneration,
  } = useTripGeneration();

  const { countries } = useCountries();
  const { generateForecast, forecastData } = useFormForecast();

  // `useWatch`, not `watch`: a root `watch` re-renders `useForm`'s host with a new
  // `formState` on every keystroke, and every context with it.
  const [cityWatch, countryWatch] = useWatch({ control, name: ["city", "country"] });

  const findCountry = countries.find(
    (country) => country.value === countryWatch,
  );
  const countryCode = findCountry?.code.toUpperCase();
  // Here rather than in step 2 and the buttons, so each spelling is one GeoNames call.
  const cityCheck = useGeoNames({ city: cityWatch, countryCode });

  // workaround to get the right value from the autocomplete
  const handleSelectionAutocomplete = useCallback(
    (selectedKey: string | number | null, fieldName: FieldName) => {
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
    },
    [countries, setValue],
  );

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

  const place = cityCheck.place;
  const next = useCallback(async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });
    if (!output) return;

    // Next is disabled until step 2's check finds the city, so its place is here by the dates step.
    if (isWeatherSelected && place && currentStep === steps.length - 3) {
      generateForecast({ lat: place.lat, lon: place.lng });
    }
    setPrevStep(currentStep);
    setCurrentStep((step) => step + 1);
  }, [trigger, isWeatherSelected, place, currentStep, generateForecast]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setPrevStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  }, [currentStep]);

  const processForm: SubmitHandler<Inputs> = useCallback((data) => {
    // From the submitted country, so the code always matches the data it travels with.
    const submittedCode =
      countries.find((c) => c.value === data.country)?.code.toUpperCase() ?? "";
    // Nothing clears here: a failed generation leaves everything filled in for another
    // try, and a trip that comes back leaves /form, whose layout unmounts this provider.
    generate(
      toTripRequest(
        data,
        submittedCode,
        isWeatherSelected ? forecastData : undefined,
      ),
    );
  }, [countries, generate, isWeatherSelected, forecastData]);

  const stepsValue = useMemo(
    () => ({ currentStep, delta, stepValue, next, prev }),
    [currentStep, delta, stepValue, next, prev],
  );

  const fieldsValue = useMemo(
    () => ({
      control,
      errors,
      isValid,
      handleSelectionAutocomplete,
      handleSubmit,
      processForm,
      fields,
      append,
      insert,
      remove,
      setValue,
      isWeatherSelected,
      setIsWeatherSelected,
      isGenerationPending,
      generationError,
      resetGeneration,
    }),
    // `formState` stands in for `errors` and `isValid` (see above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      formState,
      control,
      handleSelectionAutocomplete,
      handleSubmit,
      processForm,
      fields,
      append,
      insert,
      remove,
      setValue,
      isWeatherSelected,
      isGenerationPending,
      generationError,
      resetGeneration,
    ],
  );

  const cityValue = useMemo(() => ({ countryCode, cityCheck }), [countryCode, cityCheck]);

  return (
    <FormStepsContext.Provider value={stepsValue}>
      <FormFieldsContext.Provider value={fieldsValue}>
        <CityCheckContext.Provider value={cityValue}>{children}</CityCheckContext.Provider>
      </FormFieldsContext.Provider>
    </FormStepsContext.Provider>
  );
}

export { FormProvider, FormStepsContext, FormFieldsContext, CityCheckContext };
