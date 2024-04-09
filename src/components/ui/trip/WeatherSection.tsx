import { Card, CardBody, CardHeader } from "@nextui-org/react";
import Image from "next/image";

interface WeatherSectionProps {
  temperature: number;
  tempMin: number;
  tempMax: number;
  condition: string | undefined;
  weatherIconSrc: string | undefined;
}

function WeatherSection({
  temperature,
  tempMin,
  tempMax,
  condition,
  weatherIconSrc,
}: WeatherSectionProps) {
  return (
    <>
      {/* <Card className="py-4">
        <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
          <p className="text-tiny font-bold uppercase">{temperature}ºC</p>
          <small className="text-default-500">
            min {tempMin} max {tempMax}
          </small>
          <h4 className="text-large font-bold">{condition}</h4>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Image
            alt="Card background"
            className="rounded-xl object-cover"
            src={weatherIconSrc ?? ""}
            width={100}
            height={100}
          />
        </CardBody>
      </Card>
      <Card>
        <CardBody className=" bg-gradient-to-r from-cabaret-100 via-cabaret-200 to-gallery-100">
          <div className="grid grid-cols-6 items-center justify-center gap-6 md:grid-cols-12 md:gap-4">
            <div className="relative col-span-2 bg-gallery-500 p-4 md:col-span-2">
              <Image
                alt="Album cover"
                className="object-cover"
                height={100}
                src={weatherIconSrc ?? ""}
                width={100}
              />
            </div>
            <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
              <p className="text-tiny font-bold uppercase">{temperature}ºC</p>
              <small className="text-default-500">
                min {tempMin} max {tempMax}
              </small>
              <h4 className="text-large font-bold">{condition}</h4>
            </CardHeader>
          </div>
        </CardBody>
      </Card> */}
      <div className="mx-0 my-[2.5rem] w-full max-w-[40.625rem] flex-col items-center rounded-[24px] bg-gallery-100 px-[50px] py-[3.125rem] text-center sm:mx-0 sm:my-0 sm:w-[75dvw] sm:flex-row sm:pl-[1.25rem] sm:pr-[1.875rem] sm:text-start">
        <Image
          src={weatherIconSrc}
          alt="weather-icon"
          width={100}
          height={100}
          className="h-[45vw] w-[45vw] rounded-[50%] -mt-[140px] mb-[30px] ml-[65px]  "
        />

        <div>
          <h2 className="mb-[0.65rem] mr-0 mt-0 text-2xl font-semibold sm:mr-[1.875rem] sm:text-3xl">
            Kaye Morris
          </h2>
          <h3 className="text-lg">UX Developer</h3>
          <p className="text-md m-0 font-semibold opacity-70 sm:max-w-[360px]">
            Empowering users through captivating interfaces, turning ideas into
            pixel-perfect realities.
          </p>
          <small>max min</small>
        </div>
      </div>
    </>
  );
}

export default WeatherSection;
