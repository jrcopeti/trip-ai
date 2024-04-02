"use server";

import axios from "axios";

import { getPlaiceholder } from "plaiceholder";

const url = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=`;

export const fetchTripImage = async (city: string) => {
  let tripImage = "";
  let base64 = "";

  try {
    const { data } = await axios.get(`${url}${city}`);
    tripImage = data?.results[0]?.urls?.raw;

    const response = await axios.get(tripImage, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data, "binary");
    const plaiceholderRes = await getPlaiceholder(buffer);
    base64 = plaiceholderRes.base64;
    return { tripImage, base64 };
  } catch (error) {
    console.log(error);
  }
};
