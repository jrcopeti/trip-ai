import HomepageComponent from "@/components/home/HomepageComponent";
import Container from "@/components/ui/Container";
import GradientBg from "@/components/ui/GradientBg";

function Homepage() {
  return (
    <>
      <Container overflow="overflow-hidden">
        <GradientBg
          from="from-violay-300"
          to="to-neptune-300"
          blur="blur-[150px]"
        />
        <HomepageComponent />
      </Container>
    </>
  );
}

export default Homepage;
