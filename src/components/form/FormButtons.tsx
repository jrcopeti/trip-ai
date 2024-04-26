import { FormButtonsProps } from "@/types";
import { Button } from "@nextui-org/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { steps } from "@/data";

function FormButtons({ currentStep, next, prev, isCityValid }: FormButtonsProps) {

  console.log("currentStep", currentStep);
  console.log("isCityValid", isCityValid);
  return (
    <>
      <div className="absolute left-16 top-[95%] z-50  -translate-y-1/2 transform lg:top-1/2 ">
        <Button
          type="button"
          size="sm"
          isDisabled={currentStep === 0}
          onClick={prev}
          className="bg-transparent text-3xl text-neptune-600 md:text-4xl"
          title="Previous Step"
        >
          <FaAngleLeft />
        </Button>
      </div>
      <div className="absolute right-16 top-[95%] z-50 -translate-y-1/2 transform lg:top-1/2">
        <Button
          type="button"
          size="sm"
          onClick={next}
          isDisabled={currentStep === steps.length - 1 || (currentStep > 0 && !isCityValid )}
          className="bg-transparent text-3xl text-neptune-600 md:text-4xl"
          aria-label="Next Step"
          title="Next Step"
        >
          <FaAngleRight />
        </Button>
      </div>
    </>
  );
}

export default FormButtons;
