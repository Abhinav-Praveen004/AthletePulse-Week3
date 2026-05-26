import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      console.log("Available models:");
      data.models.forEach((m: any) => {
        if (m.name.includes('gemini')) {
            console.log(m.name, m.supportedGenerationMethods);
        }
      });
    } else {
      console.log("Error fetching models:", data);
    }
  } catch (error) {
    console.error(error);
  }
}

listModels();
