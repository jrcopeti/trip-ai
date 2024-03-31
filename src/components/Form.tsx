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
} from "@nextui-org/react";
import CustomCheckbox from "./CustomCheckbox";


import { useState } from "react";
import { DatePicker } from "./DatePicker";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const steps = [
  { id: "step 1", name: "Personal Information", stepValue: 0 },
  { id: "step 2", name: "Destination", stepValue: 25 },
  {
    id: "step 3",
    name: "Dates of Travel and Weather Preferences",
    stepValue: 50,
  },
  { id: "step 4", name: "Interests and Notes", stepValue: 75 },
  { id: "step 5", name: "Review and Submit", stepValue: 100 },
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
  { value: "hostel", label: "hostel" },
  { value: "apartment", label: "apartment" },
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
  { value: "wellness", label: "wellness" },
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
  const [checkboxSelected, setCheckboxSelected] = useState<string[]>([]);
  const { countries, isLoading: isLoadingCountries } = useCountries();

  const stepValue = steps[currentStep].stepValue;

  // if (isLoadingCountries) {
  //   return <div>Loading countries...</div>;
  // }

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  return (
    <>
      <section className="flex w-full max-w-xl flex-col gap-6">
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
              <Input
                label="Name"
                name="userName"
                type="text"
                placeholder="What's your name?"
                variant="underlined"
              />
              <Input
                label="Age"
                name="age"
                type="number"
                placeholder="How old are you?"
              />
              <Select
                items={countries}
                name="nationality"
                label="Nationality"
                placeholder="Select a country"
                className="max-w-md"
              >
                {(country) => (
                  <SelectItem key={country.value}>{country.label}</SelectItem>
                )}
              </Select>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <h2 className="font-bold text-primary">Travel Destination</h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              Tell us where you want to go
            </p>

            <div className="md mt-10 flex flex-col gap-x-6 gap-y-8 md:flex-row ">
              <Input
                label="City"
                name="city"
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

              <Select
                items={sortedTypes}
                label="Type of Travel"
                name="type"
                placeholder="What describes your trip?"
                className="max-w-md"
              >
                {(type) => (
                  <SelectItem key={type.value}>{type.label}</SelectItem>
                )}
              </Select>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="font-bold text-primary">Date of travel</h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              If you want to your answer based on weather forecast, select
            </p>

            <div className="mt-10 grid grid-cols-1 justify-items-center gap-y-6 lg:grid-cols-2   ">
              <Select
                items={luggageSizes}
                label="Luggage Size"
                name="luggageSize"
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
                name="accomodation"
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

            <div className="mt-6 grid grid-cols-2 gap-8 lg:grid-cols-3">
              <Input
                label="Required Items"
                name="requiredItems"
                type="text"
                placeholder="Something you can't forget to take with you"
              />
              <Input
                label="Required Items"
                name="requiredItems"
                type="text"
                placeholder="Something you can't forget to take with you"
              />

              <Input
                label="Required Items"
                name="requiredItems"
                type="text"
                placeholder="Something you can't forget to take with you"
                className="col-span-2 lg:col-auto"
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
                    name="startDate"
                    placeholder="When do your trip start?"
                  />
                  <DatePicker
                    label="End Date"
                    name="endDate"
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
              If you want to your answer based on weather forecast, select
            </p>

            <h2 className="font-bold text-primary">Date of travel</h2>
            <p className="mt-1 text-sm leading-6 text-default-400">
              If you want to your answer based on weather forecast, select
            </p>

            <div className="md mt-10 flex flex-col gap-x-6 gap-y-8 md:flex-row ">
              <CheckboxGroup
                name="interests"
                className="gap-1"
                label="Select up to 3 interest"
                orientation="horizontal"
                value={checkboxSelected}
                onChange={setCheckboxSelected}
              >
                {sortedInterest.map((interest) => (
                  <CustomCheckbox key={interest.value} value={interest.value}>
                    {interest.label}
                  </CustomCheckbox>
                ))}
              </CheckboxGroup>
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
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

export default Form;
