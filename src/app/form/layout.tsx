import FormProviders from "./providers";

function FormLayout({ children }: { children: React.ReactNode }) {
  return <FormProviders>{children}</FormProviders>;
}

export default FormLayout;
