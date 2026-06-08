"use client";
import { Button } from "@heroui/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { steps } from "@/data";
import { useFormData } from "@/hooks/useFormData";
import { useGeoNames } from "@/hooks/useGeoNames";

function FormButtons() {
  const { currentStep, next, prev, cityWatch, countryCode } = useFormData();
  const { isCityValid } = useGeoNames({
    city: cityWatch,
    countryCode: countryCode,
  });
  return (
    <>
      <div className="absolute left-16 top-[95%] z-50 -translate-y-1/2 transform lg:top-1/2">
        <Button
          type="button"
          isDisabled={currentStep === 0}
          onPress={prev}
          className="bg-transparent text-3xl text-tuna-800 md:text-4xl"
          aria-label="Previous Step"
        >
          <FaAngleLeft />
        </Button>
      </div>
      <div className="absolute right-16 top-[95%] z-50 -translate-y-1/2 transform lg:top-1/2">
        <Button
          type="button"
          onPress={next}
          isDisabled={
            currentStep === steps.length - 1 ||
            (currentStep > 0 && !isCityValid)
          }
          className="bg-transparent text-3xl text-tuna-800 md:text-4xl"
          aria-label="Next Step"
        >
          <FaAngleRight />
        </Button>
      </div>
    </>
  );
}

export default FormButtons;
