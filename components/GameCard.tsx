import React, { useState, useRef, useEffect } from 'react';
import { GameRecommendation } from '../types.ts';

interface GameCardProps {
  game: GameRecommendation;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const staticImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`;
  const videoTrailer = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/microtrailer.mp4`;
  const storeUrl = `https://store.steampowered.com/app/${game.steamAppId}`;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 border-green-500 bg-green-500/20';
    if (score >= 75) return 'text-blue-400 border-blue-500 bg-blue-500/20';
    return 'text-yellow-400 border-yellow-500 bg-yellow-500/20';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(storeUrl, '_blank');
  };

  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(err => console.debug("Autoplay prevented:", err));
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <div 
      className="steam-card rounded-lg overflow-hidden flex flex-col h-full group border border-white/5 hover:border-blue-500/30 cursor-pointer shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative h-56 w-full overflow-hidden bg-black">
        <div className="w-full h-full relative">
          <img 
            src={staticImage} 
            alt={game.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
          />
          <video 
            ref={videoRef}
            src={videoTrailer}
            muted
            loop
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        
        <div className={`absolute top-0 left-0 m-4 px-3 py-1.5 rounded border-2 text-base font-black z-10 shadow-2xl backdrop-blur-md ${getScoreColor(game.suitabilityScore)}`}>
          {game.suitabilityScore}%
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-transparent to-transparent opacity-40"></div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors mb-6 tracking-tight leading-none uppercase">
          {game.title}
        </h3>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] leading-none mb-1.5">MAIN</span>
              <span className="text-3xl font-stats text-blue-100 leading-none">{game.mainStoryTime}<span className="text-sm ml-1 text-blue-400/50">h</span></span>
            </div>
          </div>

          <div className="h-12 w-[1px] bg-white/5 mx-2"></div>

          <div className="flex items-center gap-3 text-right">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] leading-none mb-1.5">COMPLETIONIST</span>
              <span className="text-3xl font-stats text-purple-300 leading-none">{game.completionistTime}<span className="text-sm ml-1 text-purple-500/50">h</span></span>
            </div>
            <div className="bg-purple-500/10 p-2.5 rounded-lg border border-purple-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed italic opacity-80">
          "{game.description}"
        </p>

        <div className="mt-auto pt-5 border-t border-white/5">
          <div className="flex gap-4">
            <div className="shrink-0 mt-1">
              <div className="bg-blue-600/20 p-2 rounded-md border border-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">CURATOR NOTES</span>
              <p className="text-[11px] text-blue-200/60 leading-snug font-medium">
                {game.reasonForPick}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
