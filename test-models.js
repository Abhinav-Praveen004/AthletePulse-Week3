import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);

async function run() {
  console.log("Key length:", process.env.VITE_GEMINI_API_KEY?.length);
  // We can't easily list models without an admin key in the new SDK sometimes, but wait, there's no listModels in @google/generative-ai
}
run();
