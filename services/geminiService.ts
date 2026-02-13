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
          developer: { type: Type.STRING },
          reasonForPick: { type: Type.STRING }
        },
        required: ["id", "steamAppId", "title", "description", "mainStoryTime", "completionistTime", "suitabilityScore", "reasonForPick"]
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

// Helper: Generate correct Steam image URL
const getSteamImageUrl = (steamAppId: string): string => {
  return `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/header.jpg`;
};

// Helper: Fetch real prices from Steam and gg.deals
const fetchRealPrices = async (steamAppId: string, title: string) => {
  try {
    // Get Steam price
    const steamResponse = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamAppId}&cc=us`);
    const steamData = await steamResponse.json();
    const priceData = steamData[steamAppId]?.data?.price_overview;
    const steamPrice = priceData ? `$${(priceData.final / 100).toFixed(2)}` : "Free";

    // Get gg.deals info
    const ggDealsApiKey = import.meta.env.VITE_GGDEALS_API_KEY || '';
    let cheapestPrice = "Check gg.deals";
    let dealUrl = `https://gg.deals/game/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`;

    if (ggDealsApiKey) {
      try {
        const ggResponse = await fetch(`https://api.gg.deals/v1/games?key=${ggDealsApiKey}&title=${encodeURIComponent(title)}`);
        const ggData = await ggResponse.json();
        if (ggData.data && ggData.data.length > 0) {
          const gameData = ggData.data[0];
          cheapestPrice = gameData.price?.amount ? `$${gameData.price.amount}` : cheapestPrice;
          dealUrl = `https://gg.deals${gameData.url}`;
        }
      } catch (ggError) {
        console.warn("gg.deals API error:", ggError);
      }
    }

    return { steamPrice, cheapestPrice, dealUrl };
  } catch (error) {
    console.error("Price fetch error:", error);
    return { steamPrice: "N/A", cheapestPrice: "N/A", dealUrl: "" };
  }
};

export const getGameRecommendations = async (answers: QuizAnswers): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("API key missing. Set VITE_GEMINI_API_KEY in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Act as an expert Steam data analyst. Suggest 6 video games available on Steam.
    User Preferences:
    - Genres: ${answers.preferredGenres.join(', ')}
    - Style: ${answers.playstyle}
    - Availability: ${answers.timeAvailability}
    - Keywords: ${answers.specificKeywords}
    
    CRITICAL INSTRUCTIONS:
    1. Identify exact Steam App IDs.
    2. Use HowLongToBeat values for Main Story and Completionist times.
    3. SUITABILITY: Score 0-100 based on how well the game matches user preferences.
    4. Provide accurate game descriptions and genres.`;

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
    const recommendations = parsed.recommendations || [];

    // Enrich each game with real data
    for (let game of recommendations) {
      game.imageUrl = getSteamImageUrl(game.steamAppId);
      const prices = await fetchRealPrices(game.steamAppId, game.title);
      game.steamPrice = prices.steamPrice;
      game.cheapestPrice = prices.cheapestPrice;
      game.dealUrl = prices.dealUrl;
    }

    return {
      recommendations,
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

  const prompt = `Search for the specific video game "${query}". Retrieve its numeric steamAppId, official developer, and playtimes (main story/completionist). Provide accurate game description.`;
  
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
          developer: { type: Type.STRING },
          reasonForPick: { type: Type.STRING }
        },
        required: ["id", "steamAppId", "title", "description", "mainStoryTime", "completionistTime", "reasonForPick"]
      },
    },
  });
  
  const game = JSON.parse(response.text || '{}');
  
  // Enrich with real data
  game.imageUrl = getSteamImageUrl(game.steamAppId);
  const prices = await fetchRealPrices(game.steamAppId, game.title);
  game.steamPrice = prices.steamPrice;
  game.cheapestPrice = prices.cheapestPrice;
  game.dealUrl = prices.dealUrl;
  
  return game;
};
