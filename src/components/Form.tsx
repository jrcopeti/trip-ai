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
import CustomCheckbox from "./CustomCheckbox";
import { z } from "zod";

import React, { useState } from "react";
import DatePicker from "./DatePicker";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FormDataSchema } from "@/lib/schema";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { on } from "events";

type Inputs = z.infer<typeof FormDataSchema>;

const steps = [
  {
    id: "step 1",
    title: "Personal Information",
    stepValue: 0,
    fields: ["userName", "age", "nationality"],
  },
  {
    id: "step 2",
    title: "Destination",
    stepValue: 20,
    fields: ["city", "country", "type"],
  },
  {
    id: "step 3",
    title: "Dates of Travel and Weather Preferences",
    stepValue: 40,
    fields: ["luggageSize", "accommodation"],
  },
  {
    id: "step 4",
    title: "Interests and Notes",
    stepValue: 60,
    fields: ["startDate", "endDate"],
  },
  {
    id: "step 5",
    title: "Review and Submit",
    stepValue: 80,
    fields: ["interests"],
  },
  {
    id: "step 6",
    title: "Review and Submit",
    stepValue: 100,
    fields: [],
  },
];

const types = [
  { value: "family", label: "Family" },
  { value: "adventure", label: "Adventure" },
  { value: "romantic", label: "Romantic" },
  { value: "solo", label: "Solo" },
  { value: "business", label: "Business" },
  { value: "cultural", label: "Cultural" },
  { value: "festival", label: "Festival" },
  { value: "gastronomy", label: "Gastronomy" },
  { value: "nature", label: "Nature" },
];
const sortedTypes = [...types.sort((a, b) => a.label.localeCompare(b.label))];

const luggageSizes = [
  { value: "backpack", label: "Backpack" },
  { value: "carry-on", label: "carry-on" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

const accommodations = [
  { value: "hotel", label: "Hotel" },
  { value: "private acommodation", label: "Private Accomodation" },
  { value: "hostel", label: "Hostel" },
  { value: "apartment", label: "Apartment" },
  { value: "friend's house", label: "Friend's Place" },
  { value: "bed and breakfast", label: "Bed and Breakfast" },
  { value: "resort", label: "Resort" },
  { value: "cabin", label: "Cabin" },
  { value: "camping", label: "Camping" },
];
const sortedAccommodations = [
  ...accommodations.sort((a, b) => a.label.localeCompare(b.label)),
];

const interests = [
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "history", label: "History" },
  { value: "nature", label: "Nature" },
  { value: "shopping", label: "Shopping" },
  { value: "art", label: "Art" },
  { value: "wildlife", label: "Wildlife" },
  { value: "nightlife", label: "Beach" },
  { value: "photography", label: "Photography" },
  { value: "museums", label: "Museums" },
  { value: "wine", label: "wine" },
  { value: "coffee", label: "Coffee" },
  { value: "wellness", label: "Wellness" },
  { value: "dating", label: "Dating" },
  { value: "music", label: "Music" },
  { value: "hiking", label: "Hiking" },
  { value: "surfing", label: "Susports" },
  { value: "sports", label: "Sports" },
  { value: "cinema", label: "Cinema" },
  { value: "dance", label: "Dance" },
  { value: "books", label: "Books" },
  { value: "politics", label: "Politics" },
  { value: "architecture", label: "Architecture" },
  { value: "games", label: "Games" },
];
const sortedInterest = [
  ...interests.sort((a, b) => a.label.localeCompare(b.label)),
];

function Form() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isWeatherSelected, setIsWeatherSelected] = useState(false);

  const { countries, isLoading: isLoadingCountries } = useCountries();

  const {
    register,
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
      requiredItems: [{ item: "" }],
      interests: [],
      note: "",
      startDate: "",
      endDate: "",
      weatherForecast: "",
      agreement: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requiredItems",
  });
  console.log("is valid", isValid);

  const stepValue = steps[currentStep].stepValue;
  console.log(currentStep);

  // workaround to get the right value from the autocomplete
  const handleSelectionAutocomplete = (selectedKey: any, fieldName: any) => {
    const selectedCountry = countries.find(
      (country) => country.code === selectedKey,
    );
    if (selectedCountry) {
      setValue(fieldName, selectedCountry.value);
    }
  };

  // if (isLoadingCountries) {
  //   return <div>Loading countries...</div>;
  // }

  type FieldName = keyof Inputs;

  const next = async () => {
    // if (currentStep < steps.length - 1) {
    //   const fields = steps[currentStep].fields;
    //   const output = await trigger(fields as FieldName[], {
    //     shouldFocus: true,
    //   });
    //   if (!output) return;
    //   setCurrentStep((step) => step + 1);
    // } else {
    //   return;
    // }
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });
    if (!output) return;

    setCurrentStep((step) => step + 1);

    // if (currentStep === 5) {
    //   await handleSubmit(processForm)();
    // }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  const processForm = (data: Inputs) => {
    console.log("hi");
    console.log(data);
  };

  const calculatedSteps = currentStep < steps.length - 1 ? "yes" : "no";
  console.log(calculatedSteps);

  return (
    <>
      <section className="flex w-full max-w-xl flex-col gap-6">
        <Progress color="default" aria-label="Loading..." value={stepValue} />
      </section>

      <form
        onSubmit={handleSubmit(processForm)}
        className="mt-6 max-w-3xl py-2"
      >
        {currentStep === 0 && (
          <>
            <h2 className="font-bold text-primary">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              Provide your personal details
            </p>

            <div className="md mt-10 flex flex-col gap-x-6 gap-y-8 md:flex-row ">
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
                    className="max-w-md"
                    isInvalid={!!errors.userName}
                    errorMessage={errors.userName?.message}
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
                    className="max-w-md"
                    isInvalid={!!errors.age}
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
                    className="max-w-md"
                    onSelectionChange={(selectedKey) =>
                      handleSelectionAutocomplete(selectedKey, "nationality")
                    }
                    isInvalid={!!errors.nationality}
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
          </>
        )}

        {currentStep === 1 && (
          <>
            <h2 className="font-bold text-primary">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              Tell us where you want to go
            </p>

            <div className="mt-10 grid grid-cols-1 justify-items-center gap-x-6 gap-y-8 ">
              <div>
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
                      className="max-w-md"
                      isInvalid={!!errors.city}
                      errorMessage={errors.city?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    id="country"
                    defaultItems={countries}
                    label="Country"
                    placeholder="Select a country"
                    className="max-w-md"
                    onSelectionChange={(selectedKey) =>
                      handleSelectionAutocomplete(selectedKey, "country")
                    }
                    isInvalid={!!errors.country}
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

              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    id="type"
                    label="How do you describe your trip?"
                    orientation="horizontal"
                    isInvalid={!!errors.type}
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
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="font-bold text-primary">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              Tell us more about your trip
            </p>

            <div className="mt-10 grid grid-cols-1 justify-items-center gap-8 lg:grid-cols-2   ">
              {/* <Controller
                name="luggageSize"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    items={luggageSizes}
                    label="Luggage Size"
                    id="luggageSize"
                    placeholder="How big is your luggage"
                    isInvalid={!!errors.luggageSize}
                    errorMessage={errors.luggageSize?.message}
                    className="max-w-xs"
                  >
                    {(luggageSize) => (
                      <SelectItem key={luggageSize.value}>
                        {luggageSize.label}
                      </SelectItem>
                    )}
                  </Select>
                )}
              /> */}

              <Controller
                name="luggageSize"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    id="luggageSize"
                    label="What's the size of your luggage?"
                    orientation="horizontal"
                    isInvalid={!!errors.luggageSize}
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

              {/* <Controller
                name="accommodation"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    items={sortedAccommodations}
                    label="Accommodation Type"
                    id="accomodation"
                    placeholder="Where are you staying?"
                    isInvalid={!!errors.accommodation}
                    errorMessage={errors.accommodation?.message}
                    className="max-w-xs"
                  >
                    {(accomodation) => (
                      <SelectItem key={accomodation.value}>
                        {accomodation.label}
                      </SelectItem>
                    )}
                  </Select>
                )}
              /> */}

              <Controller
                name="accommodation"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    id="accommodation"
                    label="Where are you staying?"
                    orientation="horizontal"
                    isInvalid={!!errors.accommodation}
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
            </div>

            <h2 className="mb-2 mt-4 flex justify-center">Required Items</h2>
            <p className=" mb-2 mt-1 flex justify-center text-sm leading-6 text-default-400">
              Something you can't forget to take with you
            </p>
            <div className="grid grid-cols-1 gap-8 ">
              {fields.map((field, index) => (
                <div className="flex" key={field.id}>
                  <Controller
                    control={control}
                    name={`requiredItems[${index}].item`}
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
          </>
        )}

        {currentStep === 3 && (
          <>
            <h2 className="font-bold text-primary">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              If you want to your answer based on weather forecast, select
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
                </>
              ) : (
                <div>Go to next step</div>
              )}
              {errors.endDate?.message && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            <h2 className="font-bold text-primary">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              Interests and personal notes
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
                    isInvalid={!!errors.interests}
                    errorMessage={errors.interests?.message}
                  >
                    {sortedInterest.map((interest) => (
                      <CustomCheckbox
                        key={interest.value}
                        value={interest.value}
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
          </>
        )}

        {currentStep === 5 && (
          <>
            <h2 className="font-bold text-primary">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              Do you agree with the terms?
            </p>

            <Controller
              name="agreement"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onValueChange={field.onChange}
                  isInvalid={!!errors.agreement}
                ></Checkbox>
              )}
            />
          </>
        )}
        <div className="mt-8 max-w-xl pt-5">
          <div className="flex justify-between">
            {currentStep === steps.length - 1 && (
              <Button type="submit" size="lg" isDisabled={!isValid}>
                Submit
              </Button>
            )}
          </div>
        </div>
      </form>
      {currentStep > 0 && (
        <Button type="button" size="lg" onClick={prev}>
          Previous
        </Button>
      )}

      {currentStep < steps.length - 1 && (
        <Button type="button" size="lg" onClick={next}>
          Next
        </Button>
      )}
    </>
  );
}

export default Form;
