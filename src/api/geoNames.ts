import axios from "axios";

export const validateCityCountry = async ({
  city,
  country,
}: {
  city: string;
  country?: string;
}) => {
  const username = process.env.GEONAMES_USERNAME;
  const url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(city)}&country=${country}&maxRows=1&username=${username}`;

  try {
    const response = await axios.get(url);
    if (response.data.totalResultsCount === 0) {
      console.log("No city found matching the query in the specified country.");
      return false;
    }

    const locationData = response.data.geonames[0];
    console.log(
      "City and country match found:",
      locationData.name,
      locationData.countryName,
    );
    return true;
  } catch (error) {
    console.error("Error accessing GeoNames API:", error);
    return false;
  }
};
