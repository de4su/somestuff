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

// Multiple CORS proxies as fallbacks
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => url // Try direct fetch as last resort
];

const getSteamImageUrl = (steamAppId: string): string => {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/header.jpg`;
};

const createGGDealsSlug = (title: string): string => {
  return title.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchSteamGameDetails = async (steamAppId: string) => {
  const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${steamAppId}&cc=us`;
  
  // Try each proxy in sequence
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i](steamUrl);
      console.log(`Attempting Steam fetch for ${steamAppId} using proxy ${i + 1}/${CORS_PROXIES.length}`);
      
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        console.warn(`Proxy ${i + 1} failed with status ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const gameData = data[steamAppId]?.data;
      
      if (!gameData || data[steamAppId]?.success === false) {
        console.warn(`No valid data for Steam App ID: ${steamAppId}`);
        return null;
      }

      const priceData = gameData.price_overview;
      const steamPrice = priceData ? `$${(priceData.final / 100).toFixed(2)}` : "Free";
      
      console.log(`✅ Successfully fetched ${gameData.name} using proxy ${i + 1}`);
      
      return {
        title: gameData.name || "Unknown Game",
        description: gameData.short_description || gameData.detailed_description || "No description available",
        developer: gameData.developers?.[0] || "Unknown",
        steamPrice
      };
      
    } catch (error) {
      console.warn(`Proxy ${i + 1} error for ${steamAppId}:`, error.message);
      
      // If not the last proxy, continue to next
      if (i < CORS_PROXIES.length - 1) {
        await delay(500); // Small delay before trying next proxy
        continue;
      }
    }
  }
  
  // All proxies failed
  console.error(`All proxies failed for Steam App ID: ${steamAppId}`);
  return null;
};

const fetchGGDealsInfo = async (steamAppId: string, title: string) => {
  const ggDealsApiKey = import.meta.env.VITE_GGDEALS_API_KEY || '';
  
  // Fallback with slug generation
  let cheapestPrice = "View Deals";
  let dealUrl = `https://gg.deals/game/${createGGDealsSlug(title)}/`;

  if (ggDealsApiKey) {
    try {
      // Search by Steam App ID (much more reliable!)
      const ggResponse = await fetch(`https://api.gg.deals/v1/games?key=${ggDealsApiKey}&steamAppId=${steamAppId}`);
      const ggData = await ggResponse.json();
      
      if (ggData.data && ggData.data.length > 0) {
        const gameData = ggData.data[0];
        
        // Get the correct gg.deals URL
        if (gameData.url) {
          dealUrl = `https://gg.deals${gameData.url}`;
        }
        
        // Get cheapest price
        if (gameData.price?.amount) {
          cheapestPrice = `$${gameData.price.amount}`;
        }
        
        console.log(`✅ Found gg.deals data for App ID ${steamAppId}: ${dealUrl}`);
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

  const prompt = `Act as an expert Steam game curator. Suggest 6 video games available on Steam.
    User Preferences:
    - Genres: ${answers.preferredGenres.join(', ')}
    - Style: ${answers.playstyle}
    - Availability: ${answers.timeAvailability}
    - Keywords: ${answers.specificKeywords}
    
    CRITICAL: Provide EXACT VALID Steam App IDs that exist on Steam. Use accurate HowLongToBeat times. Score 0-100 based on preference match.`;

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

    const enrichedGames = [];
    for (let i = 0; i < recommendations.length; i++) {
      const game = recommendations[i];
      
      if (i > 0) await delay(300);
      
      const steamDetails = await fetchSteamGameDetails(game.steamAppId);
      
      if (!steamDetails) {
        console.warn(`Skipping game with invalid App ID: ${game.steamAppId}`);
        continue;
      }
      
      const ggDealsInfo = await fetchGGDealsInfo(game.steamAppId, steamDetails.title);
      
      game.title = steamDetails.title;
      game.description = steamDetails.description;
      game.developer = steamDetails.developer;
      game.imageUrl = getSteamImageUrl(game.steamAppId);
      game.steamPrice = steamDetails.steamPrice;
      game.cheapestPrice = ggDealsInfo.cheapestPrice;
      game.dealUrl = ggDealsInfo.dealUrl;
      
      enrichedGames.push(game);
    }

    return {
      recommendations: enrichedGames,
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

  const prompt = `Find the video game "${query}". Provide its exact VALID Steam App ID that exists on Steam, and accurate HowLongToBeat playtimes.`;
  
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
  
  if (!steamDetails) {
    throw new Error(`Could not find game data for: ${query}`);
  }
  
  const ggDealsInfo = await fetchGGDealsInfo(game.steamAppId, steamDetails.title);
  
  game.title = steamDetails.title;
  game.description = steamDetails.description;
  game.developer = steamDetails.developer;
  game.imageUrl = getSteamImageUrl(game.steamAppId);
  game.steamPrice = steamDetails.steamPrice;
  game.cheapestPrice = ggDealsInfo.cheapestPrice;
  game.dealUrl = ggDealsInfo.dealUrl;
  
  return game;
};
