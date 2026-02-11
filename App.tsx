
import React, { useState } from 'react';
import { QuizAnswers, RecommendationResponse } from './types';
import { getGameRecommendations, searchSpecificGame } from './services/geminiService';
import Quiz from './components/Quiz';
import GameCard from './components/GameCard';

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
      setError(err.message || 'Error loading recommendations.');
      setView('welcome');
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setView('loading');
    try {
      const game = await searchSpecificGame(searchQuery);
      setResults({
        recommendations: [game],
        accuracy: { percentage: 100, reasoning: 'Direct search match.' }
      });
      setView('results');
    } catch (err) {
      setError('Game not found.');
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
              className="w-full bg-black/50 border border-white/10 rounded px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {view === 'welcome' && (
          <div className="text-center py-32 animate-in fade-in slide-in-from-bottom-8">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
              FIND YOUR NEXT<br/><span className="text-blue-400">STEAM ADVENTURE</span>
            </h1>
            <button 
              onClick={() => setView('quiz')}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded font-black text-xl shadow-xl transition-all active:scale-95"
            >
              START THE QUIZ
            </button>
            {error && <div className="mt-8 text-red-400 font-mono text-sm">{error}</div>}
          </div>
        )}

        {view === 'loading' && (
          <div className="py-40 text-center flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-black text-white">CONSULTING THE ARCHIVES...</h3>
          </div>
        )}

        {view === 'results' && results && (
          <div className="animate-results">
            <div className="mb-12 p-8 steam-card border-l-4 border-l-blue-500 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-2xl font-black text-white">QUIZ MATCH ACCURACY</h2>
                <p className="text-gray-400 max-w-xl">{results.accuracy?.reasoning}</p>
              </div>
              <div className="text-5xl font-stats text-blue-400">{results.accuracy?.percentage || 0}%</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(results.recommendations || []).map((game, idx) => (
                <GameCard key={game.id || idx} game={game} />
              ))}
            </div>
          </div>
        )}

        {view === 'quiz' && <Quiz onComplete={handleQuizComplete} />}
      </main>
    </div>
  );
};

export default App;
