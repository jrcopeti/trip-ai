
import Form from "@/components/Form";
// import GetWeather from "@/components/GetWeather";


function Homepage() {
  return (
    <section className=" p-12 md:ml-auto md:mr-auto md:w-[75%] lg:w-[50%] ">
      <div className="container">
        {/* <GetWeather /> */}
        <Form />
      </div>
    </section>
  );
}

export default Homepage;
