
import React, { useState } from 'react';
import { QuizAnswers } from '../types';

interface QuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

const GENRES = ['Action', 'RPG', 'Strategy', 'Indie', 'Adventure', 'Simulation', 'Horror', 'Puzzle', 'Sports', 'Racing'];

const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    preferredGenres: [],
    playstyle: 'balanced',
    timeAvailability: 'medium',
    specificKeywords: '',
    difficultyPreference: 'normal'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleGenre = (genre: string) => {
    setAnswers(prev => ({
      ...prev,
      preferredGenres: prev.preferredGenres.includes(genre)
        ? prev.preferredGenres.filter(g => g !== genre)
        : [...prev.preferredGenres, genre]
    }));
  };

  return (
    <div className="max-w-2xl mx-auto steam-card p-8 rounded-xl blue-glow">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-blue-400 mb-2">
          <span>Step {step + 1} of 4</span>
          <span>{Math.round(((step + 1) / 4) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-800 h-1 rounded-full">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-300" 
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {step === 0 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold mb-6 text-white">What genres do you love?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`p-3 rounded-md border text-sm transition-all ${
                  answers.preferredGenres.includes(genre)
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold mb-6 text-white">What's your gaming playstyle?</h2>
          <div className="space-y-4 mb-8">
            {['casual', 'balanced', 'hardcore'].map((style) => (
              <button
                key={style}
                onClick={() => setAnswers({...answers, playstyle: style as any})}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  answers.playstyle === style
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400'
                }`}
              >
                <div className="capitalize font-bold mb-1">{style}</div>
                <div className="text-xs opacity-80">
                  {style === 'casual' && "I play to relax and enjoy the story."}
                  {style === 'balanced' && "I like a bit of a challenge but nothing too crazy."}
                  {style === 'hardcore' && "I live for high skill ceilings and mastery."}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold mb-6 text-white">How much time do you have?</h2>
          <div className="grid grid-cols-1 gap-4 mb-8">
            {[
              { id: 'short', label: 'Coffee Breaks (< 15 hrs)', desc: 'I prefer concise, impactful experiences.' },
              { id: 'medium', label: 'Weekend Warrior (15 - 50 hrs)', desc: 'Give me a world I can spend a few weeks in.' },
              { id: 'long', label: 'Life Commitment (50+ hrs)', desc: 'I want to get lost in a massive universe.' }
            ].map((time) => (
              <button
                key={time.id}
                onClick={() => setAnswers({...answers, timeAvailability: time.id as any})}
                className={`p-4 rounded-lg border text-left transition-all ${
                  answers.timeAvailability === time.id
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400'
                }`}
              >
                <div className="font-bold">{time.label}</div>
                <div className="text-xs opacity-80">{time.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold mb-2 text-white">Any final preferences?</h2>
          <p className="text-sm text-gray-400 mb-6">Mention specific themes, settings (e.g., Cyberpunk, Fantasy), or "souls-like".</p>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 mb-8 h-32"
            placeholder="Type anything else you're looking for..."
            value={answers.specificKeywords}
            onChange={(e) => setAnswers({...answers, specificKeywords: e.target.value})}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        {step > 0 ? (
          <button 
            onClick={prevStep}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        {step < 3 ? (
          <button 
            onClick={nextStep}
            disabled={step === 0 && answers.preferredGenres.length === 0}
            className={`px-8 py-3 rounded-md font-bold transition-all ${
              step === 0 && answers.preferredGenres.length === 0
              ? 'bg-gray-700 cursor-not-allowed text-gray-500'
              : 'bg-blue-500 hover:bg-blue-400 text-white blue-glow'
            }`}
          >
            Continue
          </button>
        ) : (
          <button 
            onClick={() => onComplete(answers)}
            className="px-10 py-4 bg-green-600 hover:bg-green-500 text-white rounded-md font-bold blue-glow transition-all"
          >
            Reveal My Games
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
