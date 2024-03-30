"use client";

import { useCountries } from "@/hooks/useCountries";
import { Progress, Select, Input, SelectItem } from "@nextui-org/react";

import { useState } from "react";
import { DatePicker } from "./DatePicker";

const steps = [
  { id: "step 1", name: "Personal Information" },
  { id: "step 2", name: "Destination" },
  { id: "step 3", name: "Dates of Travel and Weather Preferences" },
  { id: "step 4", name: "Interests and Notes" },
];

function Form() {
  const [currentStep, setCurrentStep] = useState(0);
  const { countries, isLoading: isLoadingCountries } = useCountries();
  console.log(countries);

  if (isLoadingCountries) {
    return <div>Loading countries...</div>;
  }

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
        <Progress color="default" aria-label="Loading..." value={currentStep} />
      </section>

      <form className="mt-12 max-w-5xl py-12">
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
              />
              <Input
                label="Age"
                name="age"
                type="number"
                placeholder="How old are you?"
              />
              <Select
                items={countries}
                label="Nationality"
                placeholder="Select a country"
                className="max-w-xs"
              >
                {(country) => (
                  <SelectItem key={country.value}>{country.label}</SelectItem>
                )}
              </Select>

              <DatePicker />
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <h1>Step 2</h1>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h1>Step 3</h1>
          </>
        )}

        {currentStep === 3 && (
          <>
            <h1>Step 4</h1>
          </>
        )}
      </form>
    </>
  );
}

export default Form;
