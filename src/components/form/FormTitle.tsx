import { useFormData } from "@/hooks/useFormData";
import { steps } from "@/data";

function FormTitle() {
  const { currentStep } = useFormData();
  return (
    <>
      <h2 className="text-3xl font-extrabold text-tuna-800 lg:text-5xl ">
        {steps[currentStep].title}
      </h2>
      <p className="mt-1 text-lg font-bold leading-6 tracking-wide text-neptune-500">
        {steps[currentStep].subtitle}
      </p>
    </>
  );
}

export default FormTitle;
