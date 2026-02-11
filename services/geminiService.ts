
import { GoogleGenAI, Type } from "@google/genai";
import { QuizAnswers, RecommendationResponse, GameRecommendation } from "../types";

// This pulls the key from Vercel's Environment Variables safely.
// Do NOT paste your key here.
const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

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
          reasonForPick: { type: Type.STRING }
        },
        required: ["id", "steamAppId", "title", "description", "mainStoryTime", "completionistTime", "suitabilityScore", "imageUrl", "reasonForPick"]
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
  if (!API_KEY) {
    throw new Error("API_KEY is missing. Please set it in Vercel Environment Variables.");
  }

  const prompt = `Act as a world-class Steam curator. Suggest 6 real video games.
    Genres: ${answers.preferredGenres.join(', ')}, Playstyle: ${answers.playstyle}, Time: ${answers.timeAvailability}, Keywords: ${answers.specificKeywords}.
    Identify correct Steam App IDs. Estimate playtimes. Calculate suitabilityScore (0-100).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GAME_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      recommendations: parsed.recommendations || [],
      accuracy: parsed.accuracy || { percentage: 0, reasoning: "Unknown" }
    };
  } catch (err) {
    console.error("Gemini Error:", err);
    return { recommendations: [], accuracy: { percentage: 0, reasoning: "Failed to generate results." } };
  }
};

export const searchSpecificGame = async (query: string): Promise<GameRecommendation> => {
  if (!API_KEY) throw new Error("API_KEY missing.");

  const prompt = `Search for "${query}". Provide its numeric steamAppId and full metadata.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
          reasonForPick: { type: Type.STRING }
        },
        required: ["id", "steamAppId", "title", "description", "mainStoryTime", "completionistTime", "imageUrl", "reasonForPick"]
      },
    },
  });
  return JSON.parse(response.text || '{}');
};
