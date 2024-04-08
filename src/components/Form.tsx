"use client";

import { useCountries } from "@/hooks/useCountries";
import {
  Progress,
  Select,
  Input,
  SelectItem,
  Button,
  Checkbox,
  ButtonGroup,
  CheckboxGroup,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import CustomCheckbox from "./ui/CustomCheckbox";
import { z } from "zod";

import React, { useState } from "react";
import DatePicker from "./ui/DatePicker";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FormDataSchema } from "@/lib/schema";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useTrip } from "@/hooks/useTrip";
import { useImage } from "@/hooks/useImage";

import { useWeather } from "@/hooks/useWeather";
import { useFormData } from "@/hooks/useFormData";

import {
  sortedTypes,
  luggageSizes,
  sortedAccommodations,
  budgets,
  sortedInterest,
} from "@/data";
import { motion } from "framer-motion";
import { FinalDataTypes } from "@/types";

type Inputs = z.infer<typeof FormDataSchema>;
type FieldName = keyof Inputs;

const steps = [
  {
    id: "step 1",
    title: "Personal Information",
    subtitle: "Let's get to know you better!",
    stepValue: 0,
    fields: ["userName", "age", "nationality"],
  },
  {
    id: "step 2",
    title: "Destination",
    subtitle: "What's your next trip ?",
    stepValue: 16,
    fields: ["city", "country", "type"],
  },
  {
    id: "step 3",
    title: "Travel Details",
    subtitle: "How do you like to travel?",
    stepValue: 32,
    fields: ["luggageSize", "accommodation"],
  },
  {
    id: "step 4",
    title: "Required Items",
    subtitle: "What you can't forget to pack!",
    stepValue: 48,
    fields: ["luggageSize", "accommodation"],
  },
  {
    id: "step 5",
    title: "Dates and Weather",
    subtitle:
      "Choose between trip plans based on weather forecast or actual dates",
    stepValue: 64,
    fields: ["startDate", "endDate"],
  },
  {
    id: "step 6",
    title: "Interests and Notes",
    subtitle: "What you like to do and any special requests",
    stepValue: 80,
    fields: ["interests"],
  },
  {
    id: "step 7",
    title: "Review and Submit",
    subtitle: "Check your details and submit",
    stepValue: 100,
    fields: [],
  },
];

function Form() {
  const [currentStep, setCurrentStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const delta = currentStep - prevStep;

  const [isWeatherSelected, setIsWeatherSelected] = useState(false);

  const { countries, isLoading: isLoadingCountries } = useCountries();

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
      requiredItems: [{ item: "" }],
      interests: [""],
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

  const { generateResponseAI, isPendingResponseAI } = useTrip();
  const { generateForecast, forecastData } = useWeather();
  const { setFormData } = useFormData();
  const { generateImage } = useImage();

  const forecastDataString = JSON.stringify(forecastData);

  const stepValue = steps[currentStep].stepValue;

  // workaround to get the right value from the autocomplete
  const handleSelectionAutocomplete = (
    selectedKey: string | number,
    fieldName: any,
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

  if (isLoadingCountries) {
    return <div>Loading countries...</div>;
  }

  if (isPendingResponseAI) {
    return <div>Loading...</div>;
  }

  const cityWatch = watch("city");
  const countryWatch = watch("country");

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    // if (!output) return;

    // if (currentStep === steps.length - 2) {
    //   console.log("get image unsplash!!!!!!!!!!!");
    //   generateImage(cityWatch);
    // }

    // if (isWeatherSelected && currentStep === steps.length - 2) {
    //   generateForecast({city:cityWatch, country: countryWatch);
    // }

    setPrevStep(currentStep);
    setCurrentStep((step) => step + 1);
  };

  const prev = () => {
    if (currentStep > 0) {
      setPrevStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  interface ProcessFormType {
    (data: Inputs): void;
  }

  const processForm: ProcessFormType = (data: Inputs) => {
    const transformedRequiredItems =
      data.requiredItems?.map((item) => item.item) ?? [];

    const promptModel = `${data.userName}, a ${data.age}-year-old traveler from ${data.nationality}, is planning a ${data.type} trip to ${data.city}, ${data.country} with a ${data.budget} budget. The trip is scheduled from ${data.startDate} to ${data.endDate}. ${data.userName} prefers to travel with a ${data.luggageSize} size suitcase and wants to ensure he/she packs everything needed. For that, he/she requires the following items: ${transformedRequiredItems}. If there is no required items, return an empty array. Staying in a ${data.accommodation}, ${data.userName} is interested in ${data.interests}. Additionally, ${data.userName} has noted he/she would specifically like to have: ${data.note}. If there is no note, skip the note part. Based on ${data.userName}'s preferences and trip details, plus the average weather for ${data.city}, ${data.country} during the trip, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includes ${data.userName}, the city, and the country, a brief description highlighting the essence of their journey, and three must-do activities with 2 paragraphs each.`;

    const promptModelWeather = `${data.userName}, a ${data.age}-year-old traveler from ${data.nationality}, is planning a ${data.type} trip to ${data.city}, ${data.country} with a ${data.budget} budget. ${data.userName} prefers to travel with a ${data.luggageSize} size suitcase and wants to ensure he/she packs everything needed. For that, he/she requires the following items: ${transformedRequiredItems}. If there is no required items, return an empty array. Staying in a ${data.accommodation}, ${data.userName} is interested in ${data.interests}. Additionally, ${data.userName} has noted he/she would specifically like to have: ${data.note}. If there is no note, skip the note part. Based on ${data.userName}'s preferences and trip details, plus the weather forecast that is in the end of the prompt, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includes ${data.userName}, the city, and the country, a brief description highlighting the essence of their journey, and three must-do activities with 2 paragraphs each. Weather forecast for ${data.city}, ${data.country}: ${forecastDataString}.`;
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
      <section className=" max-w-full ">
        <Progress
          classNames={{
            base: "w-full",
            track: "drop-shadow-md border border-shark-200",
            indicator: "bg-gradient-to-l from-violay-500 to-deeporange-400",
            value: "text-shark-500/60",
          }}
          aria-label="Loading..."
          value={stepValue}
        />
      </section>

      <form
        onSubmit={handleSubmit(processForm)}
        className="relative h-full w-full overflow-auto bg-shark-100 p-6 md:p-8 lg:p-10"
      >
        {/* Step 1 */}

        {currentStep === 0 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-extrabold text-shark-700 md:text-5xl">
              {steps[currentStep].title}
            </h2>
            <p className="s mt-2 font-bold leading-6 tracking-wide text-cabaret-800 md:text-xl	">
              {steps[currentStep].subtitle}
            </p>

            <div className="md:mt-18 mt-10 flex flex-col justify-between gap-x-6 gap-y-[5rem] md:flex-row ">
              <Controller
                name="userName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Name"
                    id="userName"
                    type="text"
                    placeholder="What's your name?"
                    className="max-w-lg"
                    errorMessage={errors.userName?.message}
                    isInvalid={!!errors.userName}
                  />
                )}
              />

              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Age"
                    id="age"
                    type="text"
                    placeholder="How old are you?"
                    className="max-w-lg"
                    errorMessage={errors.age?.message}
                  />
                )}
              />

              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    id="nationality"
                    defaultItems={countries}
                    label="Nationality"
                    placeholder="Select a country"
                    className="max-w-lg"
                    onSelectionChange={(selectedKey) =>
                      handleSelectionAutocomplete(selectedKey, "nationality")
                    }
                    errorMessage={errors.nationality?.message}
                  >
                    {(country) => (
                      <AutocompleteItem key={country.code}>
                        {country.label}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
              />
            </div>
          </motion.div>
        )}

        {/* Step 2 */}

        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-extrabold text-shark-700 md:text-5xl">
              {steps[currentStep].title}
            </h2>
            <p className="s mt-2 font-bold leading-6 tracking-wide text-yellorange-700 md:text-xl	">
              {steps[currentStep].subtitle}
            </p>

            <div className="md:mt-18 mt-10 grid grid-cols-2 justify-between gap-x-6 gap-y-[5rem] ">
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="City"
                    id="city"
                    type="text"
                    placeholder="What's your name?"
                    className="max-w-lg"
                    errorMessage={errors.city?.message}
                  />
                )}
              />

              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    id="country"
                    color="primary"
                    defaultItems={countries}
                    label="Country"
                    placeholder="Select a country"
                    className="max-w-lg"
                    onSelectionChange={(selectedKey) =>
                      handleSelectionAutocomplete(selectedKey, "country")
                    }
                    errorMessage={errors.country?.message}
                  >
                    {(country) => (
                      <AutocompleteItem key={country.code}>
                        {country.label}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
              />

              <div>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      id="type"
                      color="secondary"
                      label="How do you describe your trip?"
                      orientation="horizontal"
                      errorMessage={errors.type?.message}
                    >
                      {sortedTypes.map((type) => (
                        <Radio key={type.value} value={type.value}>
                          {type.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {currentStep === 2 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-extrabold text-shark-700 lg:text-5xl ">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-lg font-bold leading-6 tracking-wide text-yellorange-700">
              {steps[currentStep].subtitle}
            </p>

            <div className="mt-10 grid grid-cols-1 justify-items-center gap-8 lg:grid-cols-2   ">
              <Controller
                name="luggageSize"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    id="luggageSize"
                    label="What's the size of your luggage?"
                    orientation="horizontal"
                    errorMessage={errors.luggageSize?.message}
                  >
                    {luggageSizes.map((luggageSize) => (
                      <Radio key={luggageSize.value} value={luggageSize.value}>
                        {luggageSize.label}
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
              />

              <Controller
                name="accommodation"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    id="accommodation"
                    label="Where are you staying?"
                    orientation="horizontal"
                    errorMessage={errors.accommodation?.message}
                  >
                    {sortedAccommodations.map((accommodation) => (
                      <Radio
                        key={accommodation.value}
                        value={accommodation.value}
                      >
                        {accommodation.label}
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
              />

              <Controller
                name="budget"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    id="budget"
                    label="Where are you staying?"
                    orientation="horizontal"
                    errorMessage={errors.budget?.message}
                  >
                    {budgets.map((budget) => (
                      <Radio key={budget.value} value={budget.value}>
                        {budget.label}
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>
          </motion.div>
        )}

        {/* Step 4 */}

        {currentStep === 3 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-extrabold text-shark-700 lg:text-5xl ">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-lg font-bold leading-6 tracking-wide text-yellorange-700">
              {steps[currentStep].subtitle}
            </p>
            <div className="grid max-h-fit grid-cols-1 gap-8 ">
              {fields.map((field, index) => (
                <div className="flex" key={field.id}>
                  <Controller
                    control={control}
                    name={`requiredItems[${index}].item` as any}
                    render={({ field }) => (
                      <Input {...field} label={`Item ${index + 1}`} />
                    )}
                  />
                  <Button type="button" onClick={() => remove(index)}>
                    X
                  </Button>
                </div>
              ))}
              <div>
                <Button
                  className="place-items-center"
                  type="button"
                  onClick={() => append({ item: "" })}
                >
                  Add Item
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5 */}

        {currentStep === 4 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-extrabold text-shark-700 lg:text-5xl ">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-lg font-bold leading-6 tracking-wide text-yellorange-700">
              {steps[currentStep].subtitle}
            </p>

            <div className="md mt-10 flex flex-col gap-x-6 gap-y-8  ">
              <Checkbox
                isSelected={isWeatherSelected}
                onValueChange={setIsWeatherSelected}
              >
                Weather forecast
              </Checkbox>
              {!isWeatherSelected ? (
                <>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Start Date"
                        id="startDate"
                        placeholder="When do your trip start?"
                      />
                    )}
                  />
                  {errors.startDate?.message && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.startDate.message}
                    </p>
                  )}

                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="End Date"
                        id="endDate"
                        placeholder="When does it end?"
                      />
                    )}
                  />
                  {errors.endDate?.message && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.endDate.message}
                    </p>
                  )}
                </>
              ) : (
                <div>Go to next step</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 6 */}

        {currentStep === 5 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-extrabold text-shark-700 lg:text-5xl ">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-lg font-bold leading-6 tracking-wide text-yellorange-700">
              {steps[currentStep].subtitle}
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8  ">
              <Controller
                name="interests"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    {...field}
                    name="interests"
                    className="gap-4"
                    label="Select up to 3 interest"
                    orientation="horizontal"
                    errorMessage={errors.interests?.message}
                  >
                    {sortedInterest.map((interest) => (
                      <CustomCheckbox
                        key={interest.value}
                        value={interest.value}
                        color="secondary"
                        isDisabled={
                          field.value.length >= 3 &&
                          !field.value.includes(interest.value)
                        }
                      >
                        {interest.label}
                      </CustomCheckbox>
                    ))}
                  </CheckboxGroup>
                )}
              />

              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Notes"
                    id="notes"
                    placeholder="Anything you want to add?"
                    className="max-w-md"
                  />
                )}
              />
            </div>
          </motion.div>
        )}

        {/* Step 7 */}

        {currentStep === 6 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-extrabold text-shark-700 lg:text-5xl ">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-lg font-bold leading-6 tracking-wide text-yellorange-700">
              {steps[currentStep].subtitle}
            </p>

            <Controller
              name="agreement"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onValueChange={field.onChange}
                ></Checkbox>
              )}
            />
            <div className="mt-8 max-w-xl pt-5">
              {currentStep === steps.length - 1 && (
                <Button type="submit" size="lg" isDisabled={!isValid}>
                  Submit
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="absolute bottom-[0%] left-1/2 -translate-y-[50%]">
          <ButtonGroup>
            <Button
              type="button"
              size="lg"
              isDisabled={currentStep === steps.length - 7}
              onClick={prev}
              className="bg-gradient-to-r from-neptune-400 via-neptune-500 to-neptune-600 hover:bg-neptune-400"
            >
              <FaAngleLeft />
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={next}
              isDisabled={currentStep === steps.length - 1}
              className="bg-gradient-to-l from-neptune-400 via-neptune-500 to-neptune-600 hover:bg-neptune-400"
            >
              <FaAngleRight />
            </Button>
          </ButtonGroup>
        </div>
      </form>
    </>
  );
}

export default Form;
