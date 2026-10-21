"use client";
import { useFormFields, useFormSteps } from "@/hooks/useFormData";
import { Controller } from "react-hook-form";
import { Checkbox } from "@heroui/react";
import DatePicker from "./DatePicker";
import StepPanel from "./StepPanel";
import { weatherDates } from "@/lib/utils";
import { dates } from "./content";
import { fieldError } from "./styles";

function FormStep5() {
  const { currentStep } = useFormSteps();
  const { isWeatherSelected, setIsWeatherSelected, control, errors, setValue } = useFormFields();

  const handleCheckboxChange = () => {
    setIsWeatherSelected(!isWeatherSelected);
    const { startDate, endDate } = weatherDates();
    setValue("startDate", startDate);
    setValue("endDate", endDate);
  };

  if (currentStep !== 4) return null;

  return (
    <StepPanel>
      <div className="flex flex-col gap-8">
        <Checkbox
          isSelected={isWeatherSelected}
          onChange={handleCheckboxChange}
          className="w-fit cursor-pointer rounded-3xl bg-sorbet-lavender px-5 py-4"
        >
          {/* The label holding the input: the box outside it can't be clicked. */}
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <span className="text-base font-semibold text-sorbet-ink">{dates.weather}</span>
          </Checkbox.Content>
        </Checkbox>

        {!isWeatherSelected ? (
          <>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
              {dates.or}
            </p>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label={dates.start.label}
                      id="startDate"
                      placeholder={dates.start.placeholder}
                      invalid={!!errors.startDate}
                    />
                  )}
                />
                {errors.startDate?.message && (
                  <p className={fieldError}>{errors.startDate.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label={dates.end.label}
                      id="endDate"
                      placeholder={dates.end.placeholder}
                      invalid={!!errors.endDate}
                    />
                  )}
                />
                {errors.endDate?.message && <p className={fieldError}>{errors.endDate.message}</p>}
              </div>
            </div>
          </>
        ) : (
          <p className="text-lg text-sorbet-ink/70">{dates.weatherNote}</p>
        )}
      </div>
    </StepPanel>
  );
}

export default FormStep5;
