import { NextApiRequest, NextApiResponse } from "next";
import { fetchResponseAI } from "./openaiApi";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;
  const response = await fetchResponseAI(prompt);
  res.status(200).json(response);
}
