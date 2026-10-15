import { FormProvider } from "@/context/FormContext";

// Only /form reads the form's state; mounted here, it goes when the traveller leaves.
function FormLayout({ children }: { children: React.ReactNode }) {
  return <FormProvider>{children}</FormProvider>;
}

export default FormLayout;
