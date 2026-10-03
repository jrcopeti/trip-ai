import Form from "@/components/form/Form";
import Container from "@/components/ui/Container";
import GradientBg from "@/components/ui/GradientBg";

function FormPage() {
  return (
    <>
      <Container overflow="overflow-hidden" height="h-[calc(100dvh-4rem)]">
        <GradientBg />
        <Form />
      </Container>
    </>
  );
}

export default FormPage;
