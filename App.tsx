
import React from 'react';
import { GameRecommendation } from './types.ts';
import GameCard from './components/GameCard.tsx';

// Static featured games list
const FEATURED_GAMES: GameRecommendation[] = [
  {
    id: '1',
    steamAppId: '1091500',
    title: 'Cyberpunk 2077',
    description: 'An open-world, action-adventure RPG set in the dark future of Night City.',
    genres: ['RPG', 'Action'],
    tags: ['Open World', 'Cyberpunk', 'RPG'],
    mainStoryTime: 25,
    completionistTime: 103,
    suitabilityScore: 92,
    imageUrl: '',
    developer: 'CD PROJEKT RED',
    reasonForPick: 'A stunning open-world RPG with deep customization and an engaging story.'
  },
  {
    id: '2',
    steamAppId: '1174180',
    title: 'Red Dead Redemption 2',
    description: 'An epic tale of life in America\'s unforgiving heartland.',
    genres: ['Action', 'Adventure'],
    tags: ['Open World', 'Western', 'Story Rich'],
    mainStoryTime: 50,
    completionistTime: 173,
    suitabilityScore: 96,
    imageUrl: '',
    developer: 'Rockstar Games',
    reasonForPick: 'One of the most immersive open-world experiences ever created.'
  },
  {
    id: '3',
    steamAppId: '1245620',
    title: 'Elden Ring',
    description: 'A massive fantasy action RPG adventure set in a world created by Hidetaka Miyazaki and George R.R. Martin.',
    genres: ['RPG', 'Action'],
    tags: ['Souls-like', 'Dark Fantasy', 'Open World'],
    mainStoryTime: 53,
    completionistTime: 132,
    suitabilityScore: 94,
    imageUrl: '',
    developer: 'FromSoftware',
    reasonForPick: 'A masterful blend of challenging combat and exploration in a breathtaking world.'
  },
  {
    id: '4',
    steamAppId: '1203220',
    title: 'Naraka: Bladepoint',
    description: 'A 60-player PVP action battle royale with melee combat.',
    genres: ['Action', 'Battle Royale'],
    tags: ['Multiplayer', 'Action', 'PvP'],
    mainStoryTime: 15,
    completionistTime: 45,
    suitabilityScore: 85,
    imageUrl: '',
    developer: '24 Entertainment',
    reasonForPick: 'Unique melee-focused battle royale with stunning martial arts combat.'
  },
  {
    id: '5',
    steamAppId: '1817070',
    title: 'Marvel\'s Spider-Man Remastered',
    description: 'Experience the critically acclaimed hit in this complete edition with the base game and all DLC.',
    genres: ['Action', 'Adventure'],
    tags: ['Superhero', 'Open World', 'Action'],
    mainStoryTime: 17,
    completionistTime: 34,
    suitabilityScore: 93,
    imageUrl: '',
    developer: 'Insomniac Games',
    reasonForPick: 'The definitive Spider-Man experience with fluid web-slinging and engaging combat.'
  },
  {
    id: '6',
    steamAppId: '1172470',
    title: 'Apex Legends',
    description: 'A free-to-play hero shooter where legendary characters battle for glory.',
    genres: ['Action', 'Battle Royale'],
    tags: ['Free to Play', 'FPS', 'Multiplayer'],
    mainStoryTime: 12,
    completionistTime: 50,
    suitabilityScore: 88,
    imageUrl: '',
    developer: 'Respawn Entertainment',
    reasonForPick: 'Fast-paced hero shooter with excellent movement mechanics and team play.'
  }
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen steam-gradient pb-20">
      <nav className="p-6 border-b border-white/5 mb-8 sticky top-0 bg-[#171a21]/95 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <div className="text-2xl font-black text-white cursor-pointer tracking-tighter flex items-center gap-2">
            <span className="bg-blue-600 px-2 py-0.5 rounded-sm">STEAM</span>
            <span className="text-blue-400">QUEST</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-8">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
            DISCOVER AMAZING<br/><span className="text-blue-400">STEAM GAMES</span>
          </h1>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto">
            Explore our curated collection of featured Steam games with detailed playtimes, suitability scores, and previews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURED_GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
