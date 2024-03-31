"use client";
import { Button, Input } from "@nextui-org/react";
import { getWeather } from "@/actions/getWeather";
import { useFormState } from "react-dom";

interface GetWeatherProps {
  city: string;
  country: string;
}

function GetWeather() {
  const [formState, action] = useFormState(getWeather, { errors: {} });
  return (
    <div>
      <form action={action}>
        <Input
          name="city"
          type="text"
          placeholder="City"
          defaultValue={""}
          isInvalid={!!formState.errors.city}
          errorMessage={formState.errors.city?.join(", ")}
        />
        <Input
          name="country"
          type="text"
          placeholder="Country"
          defaultValue={""}
          isInvalid={!!formState.errors.country}
          errorMessage={formState.errors.country?.join(", ")}
        />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}

export default GetWeather;
