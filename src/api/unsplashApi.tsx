"use server";

import axios from "axios";

import { getPlaiceholder } from "plaiceholder";

const url = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=`;

export const fetchTripImage = async (city: string) => {
  let tripImage = "";
  let tripImage2 = "";
  let tripImage3 = "";
  let tripImage4 = "";
  let placeholder = "";

  try {
    const { data } = await axios.get(`${url}${city}`);
    tripImage = data?.results[0]?.urls?.raw;
    tripImage2 = data?.results[1]?.urls?.raw;
    tripImage3 = data?.results[2]?.urls?.raw;
    tripImage4 = data?.results[3]?.urls?.raw;

    const response = await axios.get(tripImage, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "binary");

    const plaiceholderRes = await getPlaiceholder(buffer);

    placeholder = plaiceholderRes.base64;

    console.log("placeholder", placeholder);

    return {
      tripImage,
      tripImage2,
      tripImage3,
      tripImage4,
      placeholder,
    };
  } catch (error) {
    console.log(error);
  }
};
