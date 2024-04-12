import Form from "@/components/Form";

function FormPage() {
  return (
    <div className="tours-section relative flex h-screen items-center justify-center overflow-x-hidden ">
      <div className="absolute left-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-gallery-50 to-shark-200 bg-cover bg-center  "></div>
      <Form />
    </div>
  );
}

export default FormPage;
