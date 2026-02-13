
import React, { useState, useRef, useEffect } from 'react';
import { GameRecommendation } from '../types';

interface GameCardProps {
  game: GameRecommendation;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const staticImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`;
  // Using the high-quality microtrailer for that smooth "glance" discovery
  const videoTrailer = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/microtrailer.mp4`;
  const storeUrl = `https://store.steampowered.com/app/${game.steamAppId}`;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 border-green-500 bg-green-500/20';
    if (score >= 75) return 'text-blue-400 border-blue-500 bg-blue-500/20';
    return 'text-yellow-400 border-yellow-500 bg-yellow-500/20';
  };

  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().then(() => setVideoLoaded(true)).catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoLoaded(false);
    }
  }, [isHovered]);

  return (
    <div 
      className="steam-card rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer shadow-2xl relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(storeUrl, '_blank')}
    >
      {/* Cinematic Header with Microtrailer */}
      <div className="relative h-56 w-full overflow-hidden bg-black group-hover:shadow-[0_0_30px_rgba(102,192,244,0.3)] transition-all duration-500">
        <img 
          src={staticImage} 
          alt={game.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${isHovered ? 'scale-110 opacity-40 blur-sm' : 'scale-100 opacity-100 blur-0'}`}
        />
        
        {/* The Live Video Element */}
        <video 
          ref={videoRef}
          src={videoTrailer}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isHovered && videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Live Indicator - Visible when video plays */}
        {isHovered && videoLoaded && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md border border-red-500/50 rounded text-[10px] font-black text-white z-20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-red"></span>
            LIVE PREVIEW
          </div>
        )}

        <div className={`absolute top-4 left-4 px-3 py-1 rounded-md border font-black text-xs z-10 backdrop-blur-xl ${getScoreColor(game.suitabilityScore)} shadow-lg`}>
          {game.suitabilityScore}% MATCH
        </div>

        {/* Loading Spinner for video */}
        {isHovered && !videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors line-clamp-1 uppercase tracking-tight flex-1">
            {game.title}
          </h3>
          <span className="text-[10px] font-mono text-gray-500 ml-2">ID: {game.steamAppId}</span>
        </div>

        {/* Tech Stats Section */}
        <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden mb-6">
          <div className="bg-[#1b2838]/80 p-4 flex flex-col items-center">
            <div className="text-[9px] text-blue-400/70 font-black uppercase tracking-[0.2em] mb-1">Main Quest</div>
            <div className="text-2xl font-stats text-white leading-none">{game.mainStoryTime}<span className="text-xs text-blue-500 font-normal ml-0.5">hrs</span></div>
          </div>
          <div className="bg-[#1b2838]/80 p-4 flex flex-col items-center">
            <div className="text-[9px] text-purple-400/70 font-black uppercase tracking-[0.2em] mb-1">Completionist</div>
            <div className="text-2xl font-stats text-white leading-none">{game.completionistTime}<span className="text-xs text-purple-500 font-normal ml-0.5">hrs</span></div>
          </div>
        </div>

        {/* Suitability Heat Bar */}
        <div className="mb-6">
           <div className="flex justify-between text-[10px] font-black text-gray-600 mb-1 uppercase">
             <span>Suitability Index</span>
             <span>{game.suitabilityScore}/100</span>
           </div>
           <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex">
             <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-1000 delay-300" style={{ width: isHovered ? `${game.suitabilityScore}%` : '0%' }}></div>
           </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed italic opacity-75 group-hover:opacity-100 transition-opacity">
          "{game.description}"
        </p>

        {/* Engine Logic Tag */}
        <div className="mt-auto flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
          <div className="bg-blue-600 p-1 rounded">
             <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <p className="text-[11px] text-blue-300/80 font-semibold leading-tight">{game.reasonForPick}</p>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
