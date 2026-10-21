"use client";
import { useState, useEffect, createContext, useCallback, useMemo } from "react";
import type {
  CityCheckContextType,
  FieldName,
  FormFieldsContextType,
  FormStepsContextType,
  Inputs,
} from "@/types";
import { countries } from "@/data/countries";
import { idleCityCheck, useGeoNames } from "@/hooks/useGeoNames";
import { useTripGeneration } from "@/hooks/useTripGeneration";
import {
  type Control,
  SubmitHandler,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { steps } from "@/data";
import { FormDataSchema, isPassport } from "@/lib/schema";
import { toTripRequest } from "@/lib/agent/request";
import { clearFormDraft, readFormDraft, resumeStep, writeFormDraft } from "@/lib/formDraft";
import { weatherDates } from "@/lib/utils";

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
  startOver: () => {},
  isDraftRestored: true,
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
});

const CityCheckContext = createContext<CityCheckContextType>({
  cityCheck: idleCityCheck,
});

function FormProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [prevStep, setPrevStep] = useState<number>(0);
  const delta = currentStep - prevStep;

  const [isWeatherSelected, setIsWeatherSelected] = useState<boolean>(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [startOvers, setStartOvers] = useState(0);

  const {
    handleSubmit,
    control,
    watch,
    trigger,
    getFieldState,
    setValue,
    setFocus,
    reset,
    formState,
  } =
    useForm<Inputs>({
      resolver: zodResolver(FormDataSchema),
      defaultValues: defaultFormData,
    });
  // RHF edits `errors` in place, so the memo below keys on `formState`, a new object per change.
  const { errors, isValid } = formState;

  // After mount, not in `useForm`'s defaults: the server has no sessionStorage, so reading
  // it during render would hydrate a different form. `keepDefaultValues` keeps `isDirty`
  // measured against the empty form, which is what shows "Start over".
  useEffect(() => {
    const draft = readFormDraft();
    if (draft) {
      const values = { ...defaultFormData, ...draft.values };
      // A weather plan starts now, as ticking the box does; a picked date that has passed
      // reopens its step with the error showing, or Submit would be off with no reason.
      if (draft.isWeatherSelected) Object.assign(values, weatherDates());
      // The combobox can't show or clear a passport the list no longer offers, so it comes
      // back as none; kept, it would hold step 1 with an empty field.
      if (values.passport && !isPassport(values.passport)) values.passport = "";
      const { step, invalid } = resumeStep(values, draft.step);
      reset(values, { keepDefaultValues: true });
      setPrevStep(step);
      setCurrentStep(step);
      setIsWeatherSelected(draft.isWeatherSelected);
      if (invalid.length) trigger(invalid);
    }
    setIsDraftRestored(true);
  }, [reset, trigger]);

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "requiredItems",
  });

  const { generateTrip } = useTripGeneration();


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
    [setValue],
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

  const next = useCallback(async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });
    if (!output) return;

    setPrevStep(currentStep);
    setCurrentStep((step) => step + 1);
  }, [trigger, currentStep]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setPrevStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  }, [currentStep]);

  const startOver = useCallback(() => {
    reset(defaultFormData);
    setPrevStep(0);
    setCurrentStep(0);
    setIsWeatherSelected(false);
    clearFormDraft();
    setStartOvers((n) => n + 1);
  }, [reset]);

  // The "Start over" button that opened the dialog is gone with the answers, so the dialog
  // has nowhere to hand focus back: put it on step 1's first field instead.
  useEffect(() => {
    if (startOvers > 0) setFocus("userName");
  }, [startOvers, setFocus]);

  const processForm: SubmitHandler<Inputs> = useCallback((data) => {
    // From the submitted country, so the code always matches the data it travels with.
    const submittedCode =
      countries.find((c) => c.value === data.country)?.code.toUpperCase() ?? "";
    // Nothing clears here: a failed generation leaves everything filled in for another
    // try, and a trip that comes back clears the draft and leaves /form.
    generateTrip(toTripRequest(data, submittedCode, isWeatherSelected));
  }, [generateTrip, isWeatherSelected]);

  const stepsValue = useMemo(
    () => ({ currentStep, delta, stepValue, next, prev, startOver, isDraftRestored }),
    [currentStep, delta, stepValue, next, prev, startOver, isDraftRestored],
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
    ],
  );

  const cityValue = useMemo(() => ({ countryCode, cityCheck }), [countryCode, cityCheck]);

  return (
    <FormStepsContext.Provider value={stepsValue}>
      <FormFieldsContext.Provider value={fieldsValue}>
        <CityCheckContext.Provider value={cityValue}>
          {children}
          {/* Only once restored, so its first write is the draft, not the empty form. */}
          {isDraftRestored && (
            <FormDraftSaver
              control={control}
              step={currentStep}
              isWeatherSelected={isWeatherSelected}
            />
          )}
        </CityCheckContext.Provider>
      </FormFieldsContext.Provider>
    </FormStepsContext.Provider>
  );
}

/**
 * Writes the draft as the answers change. Its own component, so watching every field
 * re-renders only this, not the provider (2e-b). An untouched form is no draft at all.
 */
function FormDraftSaver({
  control,
  step,
  isWeatherSelected,
}: {
  control: Control<Inputs>;
  step: number;
  isWeatherSelected: boolean;
}) {
  const values = useWatch({ control });
  const { isDirty } = useFormState({ control });

  useEffect(() => {
    if (!isDirty && step === 0 && !isWeatherSelected) clearFormDraft();
    else writeFormDraft({ values: values as Inputs, step, isWeatherSelected });
  }, [values, isDirty, step, isWeatherSelected]);

  return null;
}

export { FormProvider, FormStepsContext, FormFieldsContext, CityCheckContext };
