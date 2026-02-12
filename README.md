# SteamQuest: Game Discovery

SteamQuest is a sophisticated Steam game recommendation engine that helps you discover your next favorite game. Using intelligent AI analysis, it determines playtimes, suitability scores, and provides visual previews based on your preferences.

## Features

- **Personalized Recommendations**: Get game suggestions based on your playstyle, preferred genres, and time availability
- **Detailed Game Information**: View playtimes, genres, tags, and Steam integration
- **Smart Search**: Search for specific games with instant results
- **Visual Previews**: See game screenshots and descriptions before you commit

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key: `VITE_GEMINI_API_KEY=your_api_key_here`
   - Obtain a Gemini API key and set VITE_GEMINI_API_KEY in your environment variables

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Tech Stack

- React 19 with TypeScript
- Vite for fast development and building
- AI-powered game recommendations
- Tailwind CSS for styling
