interface Step {
  id: string;
  title: string;
  subtitle: string;
  stepValue: number;
  fields: string[];
}

function FormTitle({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep: number;
}) {
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
