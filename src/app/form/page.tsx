import Form from "@/components/Form";
import Container from "@/components/ui/Container";
import GradientBg from "@/components/ui/GradientBg";

function FormPage() {
  return (
    <>
      <Container overflow="overflow-hidden">
        <GradientBg
          from="from-violay-300"
          to="to-deeporange-200"
          blur="blur-[190px]"
        />
        <Form />
      </Container>
    </>
  );
}

export default FormPage;
