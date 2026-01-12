import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// UPDATED: Now accepts userContext
export async function getGeminiResponse(prompt, userContext = "") {
  if (!genAI) {
    console.error("Error: Gemini API Key is missing.");
    return "I'm not connected to the AI brain yet. Please check your API key.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // We inject the user's health context secretly into the system prompt
    const systemContext = `
      You are Selene, a helpful, warm, and knowledgeable women's health assistant inside a period tracker app. 
      Keep answers concise, empathetic, and medically responsible.
      
      CURRENT USER CONTEXT:
      ${userContext}
      
      If the user asks for medical diagnosis, strictly advise them to see a doctor.
      Use the context above to answer specific questions about their cycle (e.g., "When is my period?").
      If the context says "No data", ask them to log their first period politely.
    `;
    
    const result = await model.generateContent(`${systemContext}\n\nUser: ${prompt}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting right now. Please try again.";
  }
}