import { GoogleGenAI, Type } from "@google/genai";
import { QuizAnswers, RecommendationResponse, GameRecommendation } from "../types";
import { supabase } from "./supabaseClient";

function hashAnswers(answers: QuizAnswers): string {
  const normalized = {
    genres: [...answers.preferredGenres].sort().join(','),
    playstyle: answers.playstyle,
    time: answers.timeAvailability,
    keywords: answers.specificKeywords.trim().toLowerCase(),
    difficulty: answers.difficultyPreference,
  };
  return btoa(JSON.stringify(normalized));
}

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
          mainStoryTime: { type: Type.NUMBER, description: "Realistic main story hours based on actual game" },
          completionistTime: { type: Type.NUMBER, description: "Realistic 100% completion hours" },
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

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => url
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
  
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i](steamUrl);
      console.log(`Attempting Steam fetch for ${steamAppId} using proxy ${i + 1}/${CORS_PROXIES.length}`);
      
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(10000)
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
      
      if (i < CORS_PROXIES.length - 1) {
        await delay(500);
        continue;
      }
    }
  }
  
  console.error(`All proxies failed for Steam App ID: ${steamAppId}`);
  return null;
};

const fetchGGDealsInfo = async (steamAppId: string, title: string) => {
  const ggDealsApiKey = import.meta.env.VITE_GGDEALS_API_KEY || '';
  
  let cheapestPrice = "View Deals";
  let dealUrl = `https://gg.deals/game/${createGGDealsSlug(title)}/`;

  if (ggDealsApiKey) {
    try {
      const ggResponse = await fetch(`https://api.gg.deals/v1/games?key=${ggDealsApiKey}&steamAppId=${steamAppId}`);
      const ggData = await ggResponse.json();
      
      if (ggData.data && ggData.data.length > 0) {
        const gameData = ggData.data[0];
        
        if (gameData.url) {
          dealUrl = `https://gg.deals${gameData.url}`;
        }
        
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

export const getGameRecommendations = async (answers: QuizAnswers, steamId?: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("API key missing. Set VITE_GEMINI_API_KEY in your environment variables.");
  }

  const answersHash = hashAnswers(answers);
  if (steamId) {
    try {
      const { data: cached } = await supabase
        .from('quiz_results')
        .select('results')
        .eq('steam_id', steamId)
        .eq('answers_hash', answersHash)
        .maybeSingle();
      if (cached?.results) {
        console.log('✅ Returning cached quiz result from Supabase');
        return cached.results as RecommendationResponse;
      }
    } catch (cacheErr) {
      console.warn('Supabase cache lookup failed, proceeding with Gemini:', cacheErr);
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Act as an expert Steam game curator with deep knowledge of game lengths. Suggest 6 video games available on Steam.
    
    User Preferences:
    - Genres: ${answers.preferredGenres.join(', ')}
    - Style: ${answers.playstyle}
    - Availability: ${answers.timeAvailability}
    - Keywords: ${answers.specificKeywords}
    
    CRITICAL REQUIREMENTS:
    1. Provide EXACT VALID Steam App IDs that actually exist on Steam
    2. Provide ACCURATE playtime estimates based on the real game's actual length:
       - mainStoryTime = typical playthrough to see credits (main story only)
       - completionistTime = 100% completion with all achievements/collectibles
       - Example: Baldur's Gate 3 is ~50hrs main, ~150hrs completionist
       - Example: Portal is ~3hrs main, ~6hrs completionist
       - DO NOT make up random numbers - use your knowledge of each specific game
    3. Score 0-100 based on how well the game matches user preferences
    4. Explain why each game fits the user's preferences`;

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

    const finalResult: RecommendationResponse = {
      recommendations: enrichedGames,
      accuracy: parsed.accuracy || { percentage: 0, reasoning: "Evaluation failed." }
    };

    if (steamId) {
      try {
        await supabase.from('quiz_results').upsert({
          steam_id: steamId,
          answers_hash: answersHash,
          answers,
          results: finalResult,
        }, { onConflict: 'steam_id,answers_hash' });
      } catch (cacheWriteErr) {
        console.warn('Supabase cache write failed:', cacheWriteErr);
      }
    }

    return finalResult;
  } catch (err) {
    console.error("Gemini Service Failure:", err);
    throw err;
  }
};

export const searchSpecificGame = async (query: string): Promise<GameRecommendation> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) throw new Error("API key missing.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Find the video game "${query}". Provide its exact VALID Steam App ID and ACCURATE playtime estimates based on the real game's actual length.`;
  
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
