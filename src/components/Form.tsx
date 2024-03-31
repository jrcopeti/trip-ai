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
} from "@nextui-org/react";
import CustomCheckbox from "./CustomCheckbox";
import { z } from "zod";

import { useState } from "react";
import { DatePicker } from "./DatePicker";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FormDataSchema } from "@/lib/schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Inputs = z.infer<typeof FormDataSchema>;

const steps = [
  {
    id: "step 1",
    name: "Personal Information",
    stepValue: 0,
    fields: ["username", "age", "nationality"],
  },
  {
    id: "step 2",
    name: "Destination",
    stepValue: 25,
    fields: ["city", "country", "type"],
  },
  {
    id: "step 3",
    name: "Dates of Travel and Weather Preferences",
    stepValue: 50,
    fields: ["luggageSize", "accommodation", "requiredItems"],
  },
  {
    id: "step 4",
    name: "Interests and Notes",
    stepValue: 75,
    fields: ["startDate", "endDate", "weatherForecast"],
  },
  {
    id: "step 5",
    name: "Review and Submit",
    stepValue: 100,
    fields: ["interests", "notes"],
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
  { value: "gastonomy", label: "Gastronomy" },
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
  const [checkboxTypes, setCheckboxTypes] = useState<string[]>([]);
  const [checkboxInterests, setCheckboxInterests] = useState<string[]>([]);
  const { countries, isLoading: isLoadingCountries } = useCountries();

  const {
    register,
    handleSubmit,
    control,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
  });

  const stepValue = steps[currentStep].stepValue;

  // if (isLoadingCountries) {
  //   return <div>Loading countries...</div>;
  // }

  type FieldName = keyof Inputs;

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], { shouldFocus: true });

    if (currentStep < steps.length - 1) {
      if (currentStep === 4) {
        await handleSubmit(processForm)();
      }

      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  const processForm = (data: Inputs) => {
    console.log(data);
  };

  return (
    <>
      <section
        onSubmit={handleSubmit(processForm)}
        className="flex w-full max-w-xl flex-col gap-6"
      >
        <Progress color="default" aria-label="Loading..." value={stepValue} />
      </section>

      <form className="mt-6 max-w-3xl py-2">
        {currentStep === 0 && (
          <>
            <h2 className="font-bold text-primary">Personal Information</h2>
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
                    type="text"
                    placeholder="What's your name?"
                    errorMessage={errors?.userName?.message}
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
                    type="text"
                    placeholder="How old are you?"
                    errorMessage={errors?.age?.message}
                  />
                )}
              />

              <Controller
                name="nationality"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    items={countries}
                    label="Nationality"
                    placeholder="Select a country"
                    className="max-w-md"
                    value={value}
                    onChange={onChange}
                    errorMessage={errors?.nationality?.message}
                  >
                    {(country) => (
                      <SelectItem key={country.value}>
                        {country.label}
                      </SelectItem>
                    )}
                  </Select>
                )}
              />
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <h2 className="font-bold text-primary">Travel Destination</h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              Tell us where you want to go
            </p>

            <div className="mt-10 grid grid-cols-1 justify-items-center gap-x-6 gap-y-8 ">
              <Input
                label="City"
                id="city"
                type="text"
                placeholder="Where do you want to go?"
                className="max-w-md"
              />
              <Select
                items={countries}
                label="Country"
                placeholder="Select a country"
                className="max-w-md"
              >
                {(country) => (
                  <SelectItem key={country.value}>{country.label}</SelectItem>
                )}
              </Select>

              {/* <Select
                items={sortedTypes}
                label="Type of Travel"
                id="type"
                placeholder="What describes your trip?"
                className="max-w-md"
              >
                {(type) => (
                  <SelectItem key={type.value}>{type.label}</SelectItem>
                )}
              </Select> */}
              <div className="justify-items-center">
                <CheckboxGroup
                  id="interests"
                  className="gap-4"
                  label="How do you describe your trip?"
                  orientation="horizontal"
                  value={checkboxTypes}
                  onChange={setCheckboxTypes}
                >
                  {sortedTypes.map((type) => (
                    <CustomCheckbox
                      key={type.value}
                      value={type.value}
                      isSelected={checkboxTypes.includes(type.value)}
                      isDisabled={
                        checkboxTypes.length >= 3 &&
                        !checkboxTypes.includes(type.value)
                      }
                    >
                      {type.label}
                    </CustomCheckbox>
                  ))}
                </CheckboxGroup>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="font-bold text-primary">Date of travel</h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              If you want to your answer based on weather forecast, select
            </p>

            <div className="mt-10 grid grid-cols-1 justify-items-center gap-8 lg:grid-cols-2   ">
              <Select
                items={luggageSizes}
                label="Luggage Size"
                id="luggageSize"
                placeholder="How big is your luggage"
                className="max-w-xs"
              >
                {(lugaggeSize) => (
                  <SelectItem key={lugaggeSize.value}>
                    {lugaggeSize.label}
                  </SelectItem>
                )}
              </Select>

              <Select
                items={sortedAccommodations}
                label="Accommodation Type"
                id="accomodation"
                placeholder="Where are you staying?"
                className="max-w-xs"
              >
                {(accomodation) => (
                  <SelectItem key={accomodation.value}>
                    {accomodation.label}
                  </SelectItem>
                )}
              </Select>
            </div>

            <h2 className="mb-2 mt-4 flex justify-center">Required Items</h2>
            <p className=" mb-2 mt-1 flex justify-center text-sm leading-6 text-default-400">
              Something you can't forget to take with you
            </p>
            <div className="grid grid-cols-2 gap-8 ">
              <Input
                label="Required Items"
                id="requiredItems"
                type="text"
                placeholder="Item 1"
                className="max-w-xs"
              />
              <Input
                label="Required Items"
                id="requiredItems"
                type="text"
                placeholder="Item 2"
                className="max-w-xs"
              />

              <Input
                label="Required Items"
                id="requiredItems"
                type="text"
                placeholder="Item 3"
                className="max-w-xs"
              />
              <Input
                label="Required Items"
                id="requiredItems"
                type="text"
                placeholder="Item 4"
                className="max-w-xs"
              />
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <h2 className="font-bold text-primary">Date of travel</h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              If you want to your answer based on weather forecast, select
            </p>

            <div className="md mt-10 flex flex-col gap-x-6 gap-y-8 md:flex-row ">
              <Checkbox
                isSelected={isWeatherSelected}
                onValueChange={setIsWeatherSelected}
              >
                Weather forecast
              </Checkbox>
              {!isWeatherSelected ? (
                <>
                  <DatePicker
                    label="Start Date"
                    id="startDate"
                    placeholder="When do your trip start?"
                  />
                  <DatePicker
                    label="End Date"
                    id="endDate"
                    placeholder="When does it end?"
                  />
                </>
              ) : (
                <div>Go to next step</div>
              )}
            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            <h2 className="font-bold text-primary">Date of travel</h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              Interests and personal notes
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8  ">
              <CheckboxGroup
                id="interests"
                className="gap-4"
                label="Select up to 3 interest"
                orientation="horizontal"
                value={checkboxInterests}
                onChange={setCheckboxInterests}
              >
                {sortedInterest.map((interest) => (
                  <CustomCheckbox
                    key={interest.value}
                    value={interest.value}
                    isSelected={checkboxInterests.includes(interest.value)}
                    isDisabled={
                      checkboxInterests.length >= 3 &&
                      !checkboxInterests.includes(interest.value)
                    }
                  >
                    {interest.label}
                  </CustomCheckbox>
                ))}
              </CheckboxGroup>

              <Textarea
                label="Notes"
                id="notes"
                placeholder="Anything you want to add?"
                className="max-w-md"
              />
            </div>
          </>
        )}

        {currentStep === 5 && (
          <>
            <h2 className="font-bold text-primary">Date of travel</h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              If you want to your answer based on weather forecast, select
            </p>
          </>
        )}
      </form>

      <div className="mt-8 max-w-xl pt-5">
        <div className="flex justify-between">
          <Button type="button" size="lg" onClick={prev}>
            Previous
          </Button>

          <Button type="button" size="lg" onClick={next}>
            {currentStep === 4 ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Form;
