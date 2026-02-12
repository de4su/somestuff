
import React, { useState, lazy, Suspense } from 'react';
import { QuizAnswers, RecommendationResponse } from './types.ts';
import { getGameRecommendations, searchSpecificGame } from './services/geminiService.ts';
import Quiz from './components/Quiz.tsx';
import GameCard from './components/GameCard.tsx';

// Lazy load HexagonGrid for better performance
const HexagonGrid = lazy(() => import('./components/HexagonGrid.tsx'));

// Curated featured games for welcome view
const FEATURED_GAMES = [
  { id: 'elden-ring', steamAppId: '1245620', title: 'Elden Ring' },
  { id: 'baldurs-gate-3', steamAppId: '1086940', title: "Baldur's Gate 3" },
  { id: 'cyberpunk-2077', steamAppId: '1091500', title: 'Cyberpunk 2077' },
  { id: 'hollow-knight', steamAppId: '367520', title: 'Hollow Knight' },
  { id: 'stardew-valley', steamAppId: '413150', title: 'Stardew Valley' },
  { id: 'red-dead-2', steamAppId: '1174180', title: 'Red Dead Redemption 2' }
];

const App: React.FC = () => {
  const [view, setView] = useState<'welcome' | 'quiz' | 'loading' | 'results'>('welcome');
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuizComplete = async (answers: QuizAnswers) => {
    setView('loading');
    setError(null);
    try {
      const data = await getGameRecommendations(answers);
      setResults(data);
      setView('results');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading recommendations. Please ensure your API key is set in Vercel.');
      setView('welcome');
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setView('loading');
    setError(null);
    try {
      const game = await searchSpecificGame(searchQuery);
      setResults({
        recommendations: [game],
        accuracy: { percentage: 100, reasoning: 'Direct search match.' }
      });
      setView('results');
    } catch (err) {
      console.error(err);
      setError('Game not found or API error.');
      setView('welcome');
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen steam-gradient pb-20">
      <nav className="p-6 border-b border-white/5 mb-8 sticky top-0 bg-[#171a21]/95 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div onClick={() => setView('welcome')} className="text-2xl font-black text-white cursor-pointer tracking-tighter flex items-center gap-2">
            <span className="bg-blue-600 px-2 py-0.5 rounded-sm">STEAM</span>
            <span className="text-blue-400">QUEST</span>
          </div>
          <form onSubmit={handleManualSearch} className="relative w-full md:w-96">
            <input 
              type="text"
              placeholder="Search specific game..."
              className="w-full bg-black/50 border border-white/10 rounded px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {view === 'welcome' && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-8">
            <div className="py-20">
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
                FIND YOUR NEXT<br/><span className="text-blue-400">STEAM ADVENTURE</span>
              </h1>
              <p className="text-gray-400 mb-12 max-w-xl mx-auto">
                Answer a few questions about your playstyle and availability to discover hand-picked Steam games with estimated playtimes and trailers.
              </p>
              <button 
                onClick={() => setView('quiz')}
                className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded font-black text-xl shadow-xl transition-all active:scale-95"
              >
                START THE QUIZ
              </button>
              {error && <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 text-red-400 font-mono text-sm rounded max-w-md mx-auto">{error}</div>}
            </div>
            
            {/* Featured Games Grid */}
            <div className="py-12">
              <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">
                <span className="text-blue-400">Featured</span> Games
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Explore some of the most acclaimed games available on Steam
              </p>
              <Suspense fallback={
                <div className="py-20 text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              }>
                <HexagonGrid 
                  games={FEATURED_GAMES} 
                  onGameClick={(game) => window.open(`https://store.steampowered.com/app/${game.steamAppId}`, '_blank')}
                  prefetchCount={100}
                />
              </Suspense>
            </div>
          </div>
        )}

        {view === 'loading' && (
          <div className="py-40 text-center flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-black text-white tracking-widest uppercase">Consulting the Archives...</h3>
          </div>
        )}

        {view === 'results' && results && (
          <div className="animate-results">
            <div className="mb-12 p-8 steam-card border-l-4 border-l-blue-500 flex flex-col md:flex-row justify-between items-center gap-6 rounded-r-lg">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Quiz Match Accuracy</h2>
                <p className="text-gray-400 max-w-xl">{results.accuracy?.reasoning}</p>
              </div>
              <div className="text-5xl font-stats text-blue-400">{results.accuracy?.percentage || 0}%</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(results.recommendations || []).map((game, idx) => (
                <GameCard key={game.id || idx} game={game} />
              ))}
            </div>
            <div className="mt-16 text-center">
              <button 
                onClick={() => setView('quiz')}
                className="text-blue-400 hover:text-white transition-colors uppercase font-black tracking-widest text-sm"
              >
                &larr; Take the quiz again
              </button>
            </div>
          </div>
        )}

        {view === 'quiz' && <Quiz onComplete={handleQuizComplete} />}
      </main>
    </div>
  );
};

export default App;
