
import { GoogleGenAI } from "@google/genai";
import { promtData } from "../components/home";

let ansValue = ""

const ai = new GoogleGenAI({
    apiKey : "AIzaSyDm_IxyzHdGgaPX0zB0wF_jDgLxyt7i9_0"
});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
  });
  ansValue = response.text
}

await main();

export const ans = ansValue