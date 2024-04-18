import Form from "@/components/Form";
import GradientConic from "@/components/ui/GradientConic";

function FormPage() {
  return (
    <>
      <div className="relative flex h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden ">
        <div className="absolute left-0 top-0 -z-20 h-full w-full bg-gradient-to-b from-gallery-100 to-gallery-100  "></div>
        <GradientConic
          left="-left-[90%] lg:-left-[70%]"
          top="-top-[30%]"
          from="from-neptune-500"
          to="to-yellorange-400"
        />

        <GradientConic
          left="left-[55%] lg:left-[70%]"
          top="-top-[30%]"
          from="from-violay-500"
          to="to-deeporange-500"
        />

        <GradientConic
          left="left-[55%] lg:left-[70%]"
          top="top-[70%]"
          from="from-neptune-500"
          to="to-yellorange-400"
        />

        <GradientConic
          left="-left-[90%] lg:-left-[70%]"
          top="top-[70%]"
          from="from-violay-500"
          to="to-deeporange-500"
        />
        <Form />
      </div>
    </>
  );
}

export default FormPage;
