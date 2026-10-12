import { useFormData } from "@/hooks/useFormData";
import { stepCopy } from "./content";

/** The step's title is the page's h1: there is no other heading on `/form`. */
function FormTitle() {
  const { currentStep } = useFormData();
  const { title, subtitle } = stepCopy[currentStep];

  return (
    <>
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-sorbet-ink">
        {title}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-sorbet-ink/70">{subtitle}</p>
    </>
  );
}

export default FormTitle;
