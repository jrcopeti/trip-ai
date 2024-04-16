import Form from "@/components/Form";
import Image from "next/image";
import graph from "@/assets/graph.png";

function FormPage() {
  return (
    <>
      <div className="tours-section relative flex h-screen items-center justify-center overflow-hidden ">
        <div className="absolute left-0 top-0 -z-20 h-full w-full bg-gradient-to-b from-gallery-50 to-gallery-100  "></div>
        <div className="absolute inset-0 -left-[800px] -top-[192px] flex justify-center">
          <div className="ml-[8rem] h-[520px] w-[520px] rounded-full bg-gradient-radial from-violay-500 opacity-50 blur-[60px] filter"></div>
          <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-deeporange-500 opacity-50  mix-blend-color-burn blur-[60px] filter  "></div>
          {/* <div className="h-[520px] w-[520px] rounded-full from bg-gradient-conic mix-blend-color-burn  from-violay-500 to-deeporange-500 opacity-50 blur-[30px] filter  "></div> */}
        </div>
        <div className="absolute inset-0 left-[35%] top-[80%] flex justify-center">
          <div className="ml-[8rem] h-[520px] w-[520px] rounded-full bg-violay-500 opacity-60  blur-[150px] filter md:blur-[100px] "></div>
          <div className="mr-[8rem] h-[520px] w-[520px] rounded-full bg-deeporange-500 opacity-50  mix-blend-color-burn blur-[150px] filter md:blur-[100px]  "></div>
        </div>

        <Form />
      </div>
    </>
  );
}

export default FormPage;
