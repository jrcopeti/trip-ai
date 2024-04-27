import { NextApiRequest, NextApiResponse } from "next";
import { fetchResponseAI } from "./openaiApi";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    try {
      const aiResponse = await fetchResponseAI(prompt);
      res.status(200).json(aiResponse);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to fetch response from AI" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
