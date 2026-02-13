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
          genres: { type: Type.ARRAY, items: { type: Type.STRING } },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          mainStoryTime: { type: Type.NUMBER },
          completionistTime: { type: Type.NUMBER },
          suitabilityScore: { type: Type.NUMBER },
          reasonForPick: { type: Type.STRING }
        },
        required: ["id", "steamAppId", "mainStoryTime", "completionistTime", "suitabilityScore", "reasonForPick"]
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

const getSteamImageUrl = (steamAppId: string): string => {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/header.jpg`;
};

const fetchSteamGameDetails = async (steamAppId: string) => {
  try {
    // Call YOUR API route instead of Steam directly
    const response = await fetch(`/api/steam?appid=${steamAppId}`);
    const data = await response.json();
    const gameData = data[steamAppId]?.data;
    
    if (!gameData) {
      return {
        title: "Unknown Game",
        description: "Game details not available",
        developer: "Unknown",
        steamPrice: "N/A"
      };
    }

    const priceData = gameData.price_overview;
    const steamPrice = priceData ? `$${(priceData.final / 100).toFixed(2)}` : "Free";
    
    return {
      title: gameData.name || "Unknown Game",
      description: gameData.short_description || gameData.detailed_description || "No description available",
      developer: gameData.developers?.[0] || "Unknown",
      steamPrice
    };
  } catch (error) {
    console.error("Steam API error for", steamAppId, error);
    return {
      title: "Unknown Game",
      description: "Error fetching game details",
      developer: "Unknown",
      steamPrice: "N/A"
    };
  }
};

const fetchGGDealsInfo = async (title: string) => {
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

  return { cheapestPrice, dealUrl };
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
    1. Identify exact Steam App IDs only.
    2. Use HowLongToBeat values for Main Story and Completionist times.
    3. SUITABILITY: Score 0-100 based on how well the game matches user preferences.
    4. Explain why you picked each game in reasonForPick.`;

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

    for (let game of recommendations) {
      const steamDetails = await fetchSteamGameDetails(game.steamAppId);
      const ggDealsInfo = await fetchGGDealsInfo(steamDetails.title);
      
      game.title = steamDetails.title;
      game.description = steamDetails.description;
      game.developer = steamDetails.developer;
      game.imageUrl = getSteamImageUrl(game.steamAppId);
      game.steamPrice = steamDetails.steamPrice;
      game.cheapestPrice = ggDealsInfo.cheapestPrice;
      game.dealUrl = ggDealsInfo.dealUrl;
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
  if (!apiKey) throw new Error("API key missing.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Search for the specific video game "${query}". Retrieve ONLY its numeric Steam App ID and playtimes (main story/completionist).`;
  
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
          mainStoryTime: { type: Type.NUMBER },
          completionistTime: { type: Type.NUMBER },
          suitabilityScore: { type: Type.NUMBER },
          reasonForPick: { type: Type.STRING }
        },
        required: ["id", "steamAppId", "mainStoryTime", "completionistTime", "reasonForPick"]
      },
    },
  });
  
  const game = JSON.parse(response.text || '{}');
  
  const steamDetails = await fetchSteamGameDetails(game.steamAppId);
  const ggDealsInfo = await fetchGGDealsInfo(steamDetails.title);
  
  game.title = steamDetails.title;
  game.description = steamDetails.description;
  game.developer = steamDetails.developer;
  game.imageUrl = getSteamImageUrl(game.steamAppId);
  game.steamPrice = steamDetails.steamPrice;
  game.cheapestPrice = ggDealsInfo.cheapestPrice;
  game.dealUrl = ggDealsInfo.dealUrl;
  
  return game;
};
