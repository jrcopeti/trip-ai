import { useFormData } from "@/hooks/useFormData";
import { Progress } from "@nextui-org/react";

function ProgressBar() {
  const {stepValue} = useFormData()
  return (
    <section className="max-w-full ">
      <Progress
        classNames={{
          base: "w-full",
          track: "drop-shadow-md border border-shark-200",
          indicator: "bg-gradient-to-l from-yellorange-300 to-neptune-400",
          value: "text-shark-500/60",
        }}
        aria-label="Loading..."
        title="Progress Bar"
        value={stepValue}
      />
    </section>
  );
}

export default ProgressBar;
