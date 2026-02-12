import React, { useState } from 'react';
import { QuizAnswers, RecommendationResponse } from './types.ts';
import { getGameRecommendations, searchSpecificGame } from './services/geminiService.ts';
import Quiz from './components/Quiz.tsx';
import GameCard from './components/GameCard.tsx';
import HexagonGrid from './components/HexagonGrid.tsx';

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
      {view === 'welcome' && <HexagonGrid />}
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
          <div className="text-center py-32 animate-in fade-in slide-in-from-bottom-8">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
              FIND YOUR NEXT<br/><span className="text-blue-400">STEAM ADVENTURE</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
              A sophisticated engine that deciphers your playstyle to reveal 
              hidden gems and blockbusters tailored just for you.
            </p>
            <button 
              onClick={() => setView('quiz')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-5 rounded-sm text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] uppercase tracking-widest"
            >
              Initialize Search
            </button>
          </div>
        )} 

        {view === 'quiz' && (
          <Quiz onComplete={handleQuizComplete} />
        )} 

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
            <p className="text-blue-400 font-black tracking-widest uppercase animate-pulse">Analyzing Library Patterns...</p>
          </div>
        )} 

        {view === 'results' && results && (
          <div className="animate-results">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Analysis Complete</h2>
                <p className="text-gray-500 font-medium">Found {results.recommendations.length} primary matches based on your directives.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-sm backdrop-blur-md">
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Confidence Rating</div>
                <div className="text-2xl font-stats text-blue-400">{results.accuracy.percentage}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.recommendations.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            <div className="mt-20 p-8 border border-white/5 bg-black/20 rounded-sm">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Neural Logic</h3>
              <p className="text-gray-400 leading-relaxed italic">\"{results.accuracy.reasoning}\"</p>
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setView('welcome')}
                className="text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
              >
                Reset Parameters
              </button>
            </div>
          </div>
        )} 

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-sm text-center mb-8">
            <div className="font-black mb-2 uppercase tracking-widest">System Error</div>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;