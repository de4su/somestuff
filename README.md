# SteamQuest: Game Discovery

SteamQuest is an AI-powered Steam game recommendation and discovery engine. Tell it your playstyle, preferred genres, and available time — it returns a curated list of Steam games with accurate playtime estimates, pricing, and deal links.

## Features

- **AI-Powered Recommendations** — Google Gemini analyses your quiz answers and returns 6 personalised Steam game picks with suitability scores and reasoning.
- **Accurate Playtime Data** — Main story and 100% completion hours are based on real game knowledge, not random estimates.
- **Live Pricing** — Each recommendation shows the current Steam Store price and the cheapest deal found on [gg.deals](https://gg.deals).
- **RAWG Game Search** — Full-text game search with filtering by platform, genre, and tag via the [RAWG API](https://rawg.io/apidocs).
- **Developer & Publisher Browsing** — Search by developer or publisher name and browse their full catalogue.
- **Advanced Filters** — Filter search results by platform, genre, tag, and sort order.
- **Screenshot Previews** — Game cards load in-game screenshots on hover.
- **Steam Login** — Sign in with your Steam account via OpenID to unlock profile features.
- **Quiz History** — Completed quizzes are cached to Supabase and shown on your profile page, so repeated identical searches are instant.
- **Favourites** — Save games to your personal favourites list (requires Steam login).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| AI | Google Gemini 2.5 Flash Lite |
| Game Data | RAWG Video Games Database API |
| Auth | Steam OpenID |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Deployment | Vercel (serverless API routes) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Google Gemini AI (required — game recommendations)
VITE_GEMINI_API_KEY=your_gemini_api_key

# RAWG Video Games Database (required — game search)
VITE_RAWG_API_KEY=your_rawg_api_key

# Steam (required — Steam login and user profiles)
STEAM_API_KEY=your_steam_web_api_key
AUTH_SECRET=a_random_secret_string_at_least_32_chars
APP_URL=http://localhost:3000

# Supabase (required — quiz caching and favourites)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# gg.deals (optional — cheapest price lookups)
VITE_GGDEALS_API_KEY=your_ggdeals_api_key
```

**Where to get each key:**

- **Gemini API key** — [Google AI Studio](https://aistudio.google.com/)
- **RAWG API key** — [rawg.io/apidocs](https://rawg.io/apidocs) (free tier available)
- **Steam API key** — [Steam Web API](https://steamcommunity.com/dev/apikey)
- **Supabase** — [supabase.com](https://supabase.com/) — create a project and copy the URL & anon key from *Settings → API*
- **gg.deals API key** — [gg.deals/developers](https://gg.deals/developers/) (optional)

### 3. Set Up Supabase Tables

Run the following SQL in your Supabase SQL editor (*Database → SQL Editor*):

```sql
-- Quiz result cache (deduplicates identical quiz submissions)
CREATE TABLE IF NOT EXISTS quiz_results (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  steam_id     text        NOT NULL,
  answers_hash text        NOT NULL,
  answers      jsonb       NOT NULL,
  results      jsonb       NOT NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS quiz_results_steam_id_answers_hash
  ON quiz_results (steam_id, answers_hash);

-- User favourites
CREATE TABLE IF NOT EXISTS user_favorites (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  steam_id    text        NOT NULL,
  game_id     text        NOT NULL,
  game_source text        NOT NULL CHECK (game_source IN ('rawg', 'steam')),
  game_title  text        NOT NULL,
  game_image  text,
  game_data   jsonb,
  created_at  timestamptz DEFAULT now()
);
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Steam Login Note:** Steam OpenID requires a publicly reachable callback URL.
> During local development, use a tunnel like [ngrok](https://ngrok.com/) (`ngrok http 3000`)
> and set `APP_URL` to the tunnel URL. Alternatively, test Steam login on your Vercel deployment.

### 5. Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Vercel Deployment

All environment variables listed above must be added in *Vercel → Project → Settings → Environment Variables*.

- Set `APP_URL` to your Vercel deployment URL (e.g. `https://yourapp.vercel.app`).
- `STEAM_API_KEY` and `AUTH_SECRET` are **server-side only** (no `VITE_` prefix) and are never exposed to the browser.

## Usage Guide

### AI Game Recommendations

1. Click **START THE QUIZ** on the home page.
2. Answer five questions about your preferred genres, playstyle, time budget, keywords, and difficulty.
3. SteamQuest sends your answers to Gemini, which returns 6 curated picks.
4. Each card shows playtime, suitability score, current Steam price, and a gg.deals link.

### Game Search

1. Type any game, developer, or publisher name into the search bar.
2. Select a suggestion from the dropdown.
   - **Games** → search results page with filter panel
   - **Developers / Publishers** → browse their full catalogue
3. Click any game card to get an AI-enriched detail view.

### Filters

In the search results view, click **Filters** to narrow results by:
- **Platform** (PC, PlayStation, Xbox, Nintendo, etc.)
- **Genre** (Action, RPG, Strategy, etc.)
- **Tag** (Singleplayer, Co-op, Open World, etc.)
- **Sort order** (rating, release date, metacritic, etc.)

## Project Structure

```
.
├── App.tsx                        # Root component and routing logic
├── index.tsx                      # React entry point
├── index.html                     # HTML shell
├── types.ts                       # Root type barrel (re-exports from types/)
│
├── types/                         # Organized type definitions
│   ├── index.ts                   # Re-exports all types
│   ├── api/
│   │   ├── rawg.types.ts          # RAWG API types
│   │   ├── steam.types.ts         # Steam auth types
│   │   └── gemini.types.ts        # Recommendation & quiz types
│   └── database/
│       ├── favorites.types.ts     # Favourites table types
│       └── quizResults.types.ts   # Quiz cache table types
│
├── services/                      # Data fetching and business logic
│   ├── rawgService.ts             # Re-exports from services/api/rawg/ (compat)
│   ├── geminiService.ts           # Google Gemini AI integration
│   ├── favoritesService.ts        # Supabase favourites CRUD
│   ├── supabaseClient.ts          # Supabase client singleton
│   └── api/
│       └── rawg/
│           ├── rawgClient.ts      # Base fetch, cache, abort controllers
│           ├── games.ts           # Game search and detail functions
│           ├── developers.ts      # Developer search
│           ├── publishers.ts      # Publisher search
│           ├── filters.ts         # Platform/genre/tag list fetchers
│           └── search.ts          # Autocomplete suggestions
│
├── components/                    # React UI components
│   ├── Quiz.tsx                   # Five-step quiz form
│   ├── GameCard.tsx               # AI recommendation card
│   ├── RawgGameCard.tsx           # RAWG search result card
│   ├── SearchAutocomplete.tsx     # Search bar with typeahead
│   ├── SearchFilters.tsx          # Platform/genre/tag filter panel
│   ├── FavoriteButton.tsx         # Add/remove favourite toggle
│   ├── ProfilePage.tsx            # Steam profile and quiz history
│   ├── LoginButton.tsx            # Steam login/logout button
│   └── HexBackground.tsx          # Animated background
│
├── api/                           # Vercel serverless API routes
│   ├── auth/
│   │   ├── steam.ts               # Initiate Steam OpenID login
│   │   ├── steam-callback.ts      # Handle Steam OpenID callback
│   │   ├── me.ts                  # Return current session user
│   │   └── logout.ts              # Clear session cookie
│   └── steam-appdetails.ts        # Server-side Steam Store proxy
│
├── config/                        # Application configuration
│   ├── env.ts                     # Environment variable validation
│   └── api.config.ts              # API base URLs and constants
│
└── utils/                         # Shared utility functions
    ├── constants/
    │   └── platforms.ts           # RAWG platform ID mappings
    └── formatters/
        ├── platformFormatter.ts   # Platform ID → condensed labels
        ├── numberFormatter.ts     # 12345 → "12.3K"
        └── dateFormatter.ts       # ISO dates → human-readable strings
```

## API Services

### RAWG Video Games Database

All RAWG communication flows through `services/api/rawg/`:

| Module | Functions |
|---|---|
| `rawgClient.ts` | `rawgFetch`, `getController`, `applyFilters` |
| `games.ts` | `searchGames`, `searchGamesWithFilters`, `getGameDetails`, `getGameScreenshots`, `getGamesByDeveloper`, `getGamesByPublisher` |
| `developers.ts` | `searchDevelopers` |
| `publishers.ts` | `searchPublishers` |
| `filters.ts` | `fetchPlatforms`, `fetchGenres`, `fetchTags` |
| `search.ts` | `fetchSuggestions` |

All responses are cached in-memory by request URL. AbortControllers ensure that only the latest typeahead or search request is active at any time.

### Google Gemini AI (`services/geminiService.ts`)

- Builds a structured prompt from quiz answers.
- Uses `gemini-2.5-flash-lite` with a JSON response schema to get consistent output.
- Enriches each recommendation with real Steam Store data via CORS proxy chain.
- Optionally fetches cheapest deal from gg.deals API.
- Caches results in Supabase so identical quiz submissions skip the Gemini call entirely.

### Supabase (`services/supabaseClient.ts`, `services/favoritesService.ts`)

- `quiz_results` table: caches quiz responses keyed by `(steam_id, answers_hash)`.
- `user_favorites` table: stores per-user game favourites.

## Troubleshooting

| Problem | Solution |
|---|---|
| Recommendations fail with "API key missing" | Add `VITE_GEMINI_API_KEY` to `.env.local` |
| No search results | Add `VITE_RAWG_API_KEY` to `.env.local` |
| Steam login fails locally | Use ngrok and set `APP_URL` to the tunnel URL |
| Favourites not saving | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and ensure the `user_favorites` table exists |
| Prices missing | Steam Store API is rate-limited; brief delays between requests help |
| Build error: `@vercel/node` not found | This only affects TypeScript type-checking of serverless functions; the Vite build is unaffected |

