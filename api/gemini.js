export const config = {
  runtime: "nodejs",
};

import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!req.body?.prompt) {
      return res.status(400).json({ error: "Prompt missing" });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(req.body.prompt);

    const text = result?.response?.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error("🔥 GEMINI FUNCTION ERROR:", err);
    return res.status(500).json({
      error: err.message || "Internal Server Error",
    });
  }
}
