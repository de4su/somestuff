import { GoogleGenAI, Type } from "@google/genai";
import { QuizAnswers, RecommendationResponse, GameRecommendation } from "../types";

const GAME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          steamAppId: { type: Type.STRING, description: "The numeric Steam App ID." },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          genres: { type: Type.ARRAY, items: { type: Type.STRING } },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          mainStoryTime: { type: Type.NUMBER },
          completionistTime: { type: Type.NUMBER },
          suitabilityScore: { type: Type.NUMBER },
          imageUrl: { type: Type.STRING },
          developer: { type: Type.STRING },
          reasonForPick: { type: Type.STRING },
          steamPrice: { type: Type.STRING, description: "The current official price on the Steam store." },
          cheapestPrice: { type: Type.STRING, description: "The absolute lowest price found across all stores via gg.deals." },
          dealUrl: { type: Type.STRING, description: "Link to the game's page on gg.deals." }
        },
        required: ["id", "steamAppId", "title", "description", "mainStoryTime", "completionistTime", "suitabilityScore", "imageUrl", "reasonForPick", "steamPrice", "cheapestPrice", "dealUrl"]
      }
    },
    accuracy: {
      type: Type.OBJECT,
      properties: {
        percentage: { type: Type.NUMBER },
        reasoning: { type: Type.STRING }
      },
      required: ["percentage", "reasoning"]
    }
  },
  required: ["recommendations", "accuracy"]
};

export const getGameRecommendations = async (answers: QuizAnswers): Promise<RecommendationResponse> => {
 const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("API key missing. Set VITE_GEMINI_API_KEY in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Act as an expert Steam data analyst and bargain hunter. Suggest 6 video games available on Steam.
    User Preferences:
    - Genres: ${answers.preferredGenres.join(', ')}
    - Style: ${answers.playstyle}
    - Availability: ${answers.timeAvailability}
    - Keywords: ${answers.specificKeywords}
    
    CRITICAL INSTRUCTIONS:
    1. Identify exact Steam App IDs.
    2. USE GOOGLE SEARCH to find:
       - The current official price on the Steam Store (steamPrice).
       - The absolute cheapest deal currently available anywhere as listed on gg.deals (cheapestPrice).
       - The gg.deals link for that game.
    3. Take the user's region into account for currency if possible (default to USD if unsure).
    4. ACCURATE TIME ESTIMATION: Use HowLongToBeat values for Main Story and Completionist.
    5. SUITABILITY: Score 0-100 based on preferences.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GAME_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      recommendations: parsed.recommendations || [],
      accuracy: parsed.accuracy || { percentage: 0, reasoning: "Evaluation failed." }
    };
  } catch (err) {
    console.error("Gemini Service Failure:", err);
    throw err;
  }
};

export const searchSpecificGame = async (query: string): Promise<GameRecommendation> => {
 const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) throw new Error("API key missing. Set VITE_GEMINI_API_KEY in your environment variables.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Search for the specific video game "${query}". Retrieve its numeric steamAppId, official developer, playtimes (main story/completionist), official Steam price, and absolute cheapest price on gg.deals with the link.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          steamAppId: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          mainStoryTime: { type: Type.NUMBER },
          completionistTime: { type: Type.NUMBER },
          suitabilityScore: { type: Type.NUMBER },
          imageUrl: { type: Type.STRING },
          reasonForPick: { type: Type.STRING },
          steamPrice: { type: Type.STRING },
          cheapestPrice: { type: Type.STRING },
          dealUrl: { type: Type.STRING }
        },
        required: ["id", "steamAppId", "title", "description", "mainStoryTime", "completionistTime", "imageUrl", "reasonForPick", "steamPrice", "cheapestPrice", "dealUrl"]
      },
    },
  });
  return JSON.parse(response.text || '{}');
};
