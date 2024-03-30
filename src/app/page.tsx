import Form from "@/components/Form";
import GetWeather from "@/components/GetWeather";
import { Button } from "@nextui-org/react";

function Homepage() {
  return (
    <section className="p-24">
      <div className="container">
        {/* <GetWeather /> */}
        <Form />
      </div>
    </section>
  );
}

export default Homepage;
