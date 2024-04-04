"use server";

import axios from "axios";

import { getPlaiceholder } from "plaiceholder";

const url = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=`;

export const fetchTripImage = async (city: string) => {
  let tripImage = "";
  let tripImage2 = "";
  let tripImage3 = "";
  let placeholder = "";
  let placeholder2 = "";
  let placeholder3 = "";

  try {
    const { data } = await axios.get(`${url}${city}`);
    tripImage = data?.results[0]?.urls?.raw;
    tripImage2 = data?.results[1]?.urls?.raw;
    tripImage3 = data?.results[2]?.urls?.raw;

    const response = await axios.get(tripImage, {
      responseType: "arraybuffer",
    });
    const response2 = await axios.get(tripImage2, {
      responseType: "arraybuffer",
    });
    const response3 = await axios.get(tripImage3, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "binary");
    const buffer2 = Buffer.from(response2.data, "binary");
    const buffer3 = Buffer.from(response3.data, "binary");
    
    const plaiceholderRes = await getPlaiceholder(buffer);
    const plaiceholderRes2 = await getPlaiceholder(buffer2);
    const plaiceholderRes3 = await getPlaiceholder(buffer3);

    placeholder = plaiceholderRes.base64;
    placeholder2 = plaiceholderRes2.base64;
    placeholder3 = plaiceholderRes3.base64;

    console.log("placeholder", placeholder, placeholder2, placeholder3);

    return {
      tripImage,
      tripImage2,
      tripImage3,
      placeholder,
      placeholder2,
      placeholder3,
    };
  } catch (error) {
    console.log(error);
  }
};
