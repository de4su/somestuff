# SteamQuest: Game Discovery

SteamQuest is a sophisticated Steam game recommendation engine that helps you discover your next favorite game. Using intelligent AI analysis, it determines playtimes, suitability scores, and provides visual previews based on your preferences.

## Features

- **Personalized Recommendations**: Get game suggestions based on your playstyle, preferred genres, and time availability
- **Detailed Game Information**: View playtimes, genres, tags, and Steam integration
- **Smart Search**: Search for specific games with instant results
- **Visual Previews**: See game screenshots and descriptions before you commit
- **Steam Login**: Sign in with your Steam account to unlock profile features
- **Quiz History**: Completed quizzes are cached to your Supabase profile and displayed on your Profile page

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment:
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Gemini AI (required for game recommendations)
   VITE_GEMINI_API_KEY=your_gemini_api_key

   # Steam (required for Steam login and user profiles)
   STEAM_API_KEY=your_steam_web_api_key
   AUTH_SECRET=a_random_secret_string_at_least_32_chars
   APP_URL=http://localhost:3000

   # Supabase (required for quiz result caching and profile history)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   - **Gemini API key**: [Google AI Studio](https://aistudio.google.com/)
   - **Steam API key**: [Steam Web API](https://steamcommunity.com/dev/apikey)
   - **Supabase**: [supabase.com](https://supabase.com/) — create a project and copy the URL & anon key from *Settings → API*

3. Create the Supabase `quiz_results` table:

   Run the following SQL in your Supabase SQL editor (*Database → SQL Editor*):

   ```sql
   CREATE TABLE IF NOT EXISTS quiz_results (
     id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
     steam_id    text        NOT NULL,
     answers_hash text       NOT NULL,
     answers     jsonb       NOT NULL,
     results     jsonb       NOT NULL,
     created_at  timestamptz DEFAULT now()
   );

   CREATE UNIQUE INDEX IF NOT EXISTS quiz_results_steam_id_answers_hash
     ON quiz_results (steam_id, answers_hash);
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

> **Note for Steam login during local development:** Steam OpenID requires a publicly reachable callback URL.  
> Either use a tunnel like [ngrok](https://ngrok.com/) (`ngrok http 3000`) and set `APP_URL` to the tunnel URL, or test the Steam login flow on your Vercel deployment where the callback URL is public.

## Vercel Deployment

All environment variables listed above (except `APP_URL` which should be your Vercel deployment URL, e.g. `https://yourapp.vercel.app`) must be configured in your Vercel project settings under *Settings → Environment Variables*.

The `STEAM_API_KEY` and `AUTH_SECRET` variables are **server-side only** (no `VITE_` prefix) and are never exposed to the browser.

## Tech Stack

- React 19 with TypeScript
- Vite for fast development and building
- AI-powered game recommendations (Google Gemini)
- Supabase for quiz result persistence
- Steam OpenID for authentication
- Tailwind CSS for styling

