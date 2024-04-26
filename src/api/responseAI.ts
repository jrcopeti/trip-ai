import { NextApiRequest, NextApiResponse } from "next";
import { fetchResponseAI } from "./openaiApi";

export const config = {
  api: {
    maxDuration: 35,
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const response = await fetchResponseAI(req.body);
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
}
