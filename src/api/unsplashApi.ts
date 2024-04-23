"use server";

import axios from "axios";

import { getPlaiceholder } from "plaiceholder";

const url = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=`;
const orientation = "&orientation=landscape";

export const fetchTripImage = async (city: string) => {
  let tripImage = "";
  let tripImage2 = "";
  let tripImage3 = "";
  let tripImage4 = "";
  let tripImage5 = "";
  let placeholder = "";

  try {
    const { data } = await axios.get(`${url}${city}`);

    console.log("ImageData", data);
    tripImage = data?.results[0]?.urls.regular;
    tripImage2 = data?.results[1]?.urls?.regular;
    tripImage3 = data?.results[2]?.urls?.regular;
    tripImage4 = data?.results[3]?.urls?.regular;
    tripImage5 = data?.results[4]?.urls?.regular;

    const response = await axios.get(tripImage, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "binary");

    const plaiceholderRes = await getPlaiceholder(buffer);

    placeholder = plaiceholderRes.base64;

    console.log("placeholder", placeholder);
    console.log("tripImage", tripImage);
    console.log("tripImage2", tripImage2);
    console.log("tripImage3", tripImage3);
    console.log("tripImage4", tripImage4);
    console.log("tripImage5", tripImage5);

    return {
      tripImage,
      tripImage2,
      tripImage3,
      tripImage4,
      tripImage5,
      placeholder,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching image");
  }
};
