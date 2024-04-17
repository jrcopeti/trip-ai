import Form from "@/components/Form";
import GradientConic from "@/components/ui/GradientConic";

function FormPage() {
  return (
    <>
      <div className="tours-section relative flex h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden ">
        <div className="absolute left-0 top-0 -z-20 h-full w-full bg-gradient-to-b from-gallery-100 to-gallery-100  "></div>
        <GradientConic
          left="-70%"
          top="-30%"
          from="from-neptune-500"
          to="to-yellorange-300"
        />

        <GradientConic
          left="70%"
          top="-30%"
          from="from-violay-500"
          to="to-deeporange-500"
        />

        <GradientConic
          left="70%"
          top="70%"
          from="from-neptune-500"
          to="to-yellorange-300"
        />

        <GradientConic
          left="-70%"
          top="70%"
          from="from-violay-500"
          to="to-deeporange-500"
        />

        <Form />
      </div>
    </>
  );
}

export default FormPage;
