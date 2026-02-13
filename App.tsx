import React, { useState } from 'react';
import { QuizAnswers, RecommendationResponse } from './types';
import { getGameRecommendations, searchSpecificGame } from './services/geminiService';
import Quiz from './components/Quiz';
import GameCard from './components/GameCard';
import HexBackground from './components/HexBackground';

const App: React.FC = () => {
  const [view, setView] = useState<'welcome' | 'quiz' | 'loading' | 'results'>('welcome');
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      setError(err.message || 'Connection to the Steam archives lost. Check your API key.');
      setView('welcome');
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
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
      setError('Target game not found in known sectors.');
      setView('welcome');
    } finally {
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <HexBackground />

      {/* CRITICAL FIX: Add pointer-events-none here */}
      <div className="relative z-10 min-h-screen flex flex-col pointer-events-none">
        
        {/* Nav needs pointer-events-auto */}
        <nav className="p-6 border-b border-white/5 sticky top-0 bg-[#171a21]/70 backdrop-blur-2xl z-50 pointer-events-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div 
              onClick={() => setView('welcome')} 
              className="text-2xl font-black text-white cursor-pointer tracking-tighter flex items-center gap-2 group"
            >
              <span className="bg-blue-600 px-2 py-0.5 rounded-sm group-hover:bg-blue-500 transition-colors">STEAM</span>
              <span className="text-blue-400 group-hover:text-white transition-colors">QUEST</span>
            </div>
            <form onSubmit={handleManualSearch} className="relative w-full md:w-96">
              <input 
                type="text"
                placeholder="Direct search..."
                className="w-full bg-black/60 border border-white/10 rounded-full px-6 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600 shadow-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full flex flex-col items-center justify-center">
          {view === 'welcome' && (
            <div className="text-center py-20 welcome-container pointer-events-auto">
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] select-none pointer-events-none">
                DISCOVER YOUR<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">NEXT OBSESSION</span>
              </h1>
              <p className="text-gray-300 mb-12 max-w-xl mx-auto text-lg font-medium bg-black/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 select-none pointer-events-none">
                Our AI analyzes thousands of Steam titles to find games that match your specific playstyle and time constraints.
              </p>
              <button 
                onClick={() => setView('quiz')}
                className="px-16 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xl shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all active:scale-95 hover:scale-110 active:shadow-none"
              >
                START THE QUIZ
              </button>
              {error && (
                <div className="mt-12 p-4 bg-red-950/40 border border-red-500/30 text-red-200 font-mono text-sm rounded-lg max-w-md mx-auto backdrop-blur-md">
                  {error}
                </div>
              )}
            </div>
          )}

          {view === 'loading' && (
            <div className="py-40 text-center flex flex-col items-center animate-pulse pointer-events-none">
              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(37,99,235,0.3)]"></div>
              <h3 className="text-2xl font-black text-white tracking-widest uppercase">Querying Steam Database...</h3>
              <p className="text-gray-500 mt-2">Determining playtimes and compatibility scores</p>
            </div>
          )}

          {view === 'results' && results && (
            <div className="animate-results w-full pointer-events-auto">
              <div className="mb-10 p-10 steam-card border-l-8 border-l-blue-600 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Curation Complete</h2>
                  <p className="text-gray-400 text-lg max-w-2xl font-medium leading-relaxed italic">
                    "{results.accuracy?.reasoning}"
                  </p>
                </div>
                <div className="flex flex-col items-center bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
                  <span className="text-6xl font-stats text-blue-500 drop-shadow-[0_0_10px_rgba(102,192,244,0.3)]">{results.accuracy?.percentage || 0}%</span>
                  <span className="text-[10px] font-black text-blue-500 tracking-widest mt-1">MATCH STRENGTH</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.recommendations.map((game, idx) => (
                  <GameCard key={game.id || idx} game={game} />
                ))}
              </div>

              <div className="mt-20 text-center">
                <button 
                  onClick={() => setView('quiz')}
                  className="px-10 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all text-sm font-black tracking-widest uppercase border border-white/5 backdrop-blur-xl"
                >
                  &larr; Refine Parameters
                </button>
              </div>
            </div>
          )}

          {view === 'quiz' && (
            <div className="w-full pointer-events-auto">
              <Quiz onComplete={handleQuizComplete} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
