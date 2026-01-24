import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!req.body || !req.body.prompt) {
      return res.status(400).json({ error: "Prompt missing" });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found");
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: req.body.prompt }],
        },
      ],
    });

    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

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
