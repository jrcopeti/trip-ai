import Form from "@/components/Form";
import GetWeather from "@/components/GetWeather";
import { Button } from "@nextui-org/react";

function Homepage() {
  return (
    <section className=" md:ml-auto md:mr-auto md:w-[75%] lg:w-[50%] p-12 ">
      <div className="container">
        {/* <GetWeather /> */}
        <Form />
      </div>
    </section>
  );
}

export default Homepage;
