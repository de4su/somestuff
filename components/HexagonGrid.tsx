import React, { useEffect, useRef, useState } from 'react';

interface FeaturedGame {
  id: string;
  steamAppId: string;
  title: string;
}

interface HexagonGridProps {
  games: FeaturedGame[];
  onGameClick: (game: FeaturedGame) => void;
  prefetchCount?: number;
}

const HexagonGrid: React.FC<HexagonGridProps> = ({ games, onGameClick, prefetchCount = 100 }) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Initialize Cache Storage for image prefetching
  useEffect(() => {
    if ('caches' in window) {
      caches.open('hexagon-grid-images-v1').then(() => {
        console.log('Cache Storage initialized');
      });
    }
  }, []);

  // Background prefetch for N images
  useEffect(() => {
    const prefetchImages = async () => {
      if (!('caches' in window)) return;
      
      const cache = await caches.open('hexagon-grid-images-v1');
      const imagesToPrefetch = games.slice(0, prefetchCount);
      
      for (const game of imagesToPrefetch) {
        const imageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`;
        try {
          const cachedResponse = await cache.match(imageUrl);
          if (!cachedResponse) {
            // Note: Using no-cors mode creates opaque responses that can be cached but not read
            // This is acceptable for image prefetching where we only need the browser cache
            const response = await fetch(imageUrl, { mode: 'no-cors' });
            if (response.type === 'opaque') {
              await cache.put(imageUrl, response);
            }
          }
        } catch (error) {
          console.warn(`Failed to prefetch ${game.title}:`, error);
        }
      }
    };

    // Delay prefetch to not block initial render
    const timer = setTimeout(() => {
      prefetchImages();
    }, 100);

    return () => clearTimeout(timer);
  }, [games, prefetchCount]);

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const gameId = entry.target.getAttribute('data-game-id');
            if (gameId) {
              setLoadedImages((prev) => new Set(prev).add(gameId));
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '100px', // Start loading slightly before entering viewport
        threshold: 0.01
      }
    );

    imageRefs.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [games]);

  // Hover prefetch: preload adjacent images on hover
  const handleMouseEnter = async (gameId: string) => {
    setHoveredGame(gameId);
    
    // Prefetch on hover
    const gameIndex = games.findIndex(g => g.id === gameId);
    if (gameIndex === -1) return;

    const adjacentIndices = [gameIndex - 1, gameIndex + 1];
    const adjacentGames = adjacentIndices
      .filter(i => i >= 0 && i < games.length)
      .map(i => games[i]);

    if ('caches' in window) {
      const cache = await caches.open('hexagon-grid-images-v1');
      
      for (const game of adjacentGames) {
        const imageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`;
        try {
          const cachedResponse = await cache.match(imageUrl);
          if (!cachedResponse) {
            fetch(imageUrl, { mode: 'no-cors' })
              .then(response => {
                if (response.type === 'opaque') {
                  return cache.put(imageUrl, response);
                }
              })
              .catch(err => {
                console.debug(`Hover prefetch failed for ${game.title}:`, err);
              });
          }
        } catch (error) {
          console.debug(`Failed to setup hover prefetch for ${game.title}:`, error);
        }
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredGame(null);
  };

  const handleClick = (game: FeaturedGame) => {
    onGameClick(game);
  };

  const handleKeyDown = (e: React.KeyboardEvent, game: FeaturedGame) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onGameClick(game);
    }
  };

  return (
    <div className="hexagon-grid-container mb-16">
      <div className="hexagon-grid">
        {games.map((game, index) => {
          const imageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`;
          const isLoaded = loadedImages.has(game.id);
          const isHovered = hoveredGame === game.id;

          return (
            <div
              key={game.id}
              ref={(el) => {
                if (el) {
                  imageRefs.current.set(game.id, el);
                }
              }}
              data-game-id={game.id}
              className={`hexagon-item ${isLoaded ? 'hexagon-loaded' : ''} ${isHovered ? 'hexagon-hovered' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                className="hexagon-button"
                onClick={() => handleClick(game)}
                onMouseEnter={() => handleMouseEnter(game.id)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter(game.id)}
                onBlur={handleMouseLeave}
                onKeyDown={(e) => handleKeyDown(e, game)}
                aria-label={`View ${game.title} on Steam`}
                tabIndex={0}
              >
                <div className="hexagon-shape">
                  {isLoaded && (
                    <img
                      src={imageUrl}
                      alt={game.title}
                      className="hexagon-image"
                      loading="lazy"
                    />
                  )}
                  <div className="hexagon-overlay">
                    <span className="hexagon-title">{game.title}</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        .hexagon-grid-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 0;
        }

        .hexagon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          justify-items: center;
        }

        .hexagon-item {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hexagon-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .hexagon-button:hover,
        .hexagon-button:focus {
          transform: scale(1.05);
          outline: none;
        }

        .hexagon-button:focus-visible .hexagon-shape {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
        }

        .hexagon-shape {
          position: relative;
          width: 180px;
          height: 180px;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          background: rgba(22, 32, 45, 0.9);
          overflow: hidden;
          transition: all 0.3s ease;
          border: 2px solid rgba(102, 192, 244, 0.2);
        }

        .hexagon-hovered .hexagon-shape {
          border-color: rgba(59, 130, 246, 0.8);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }

        .hexagon-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          animation: imageReveal 0.5s ease-out forwards;
        }

        @keyframes imageReveal {
          from {
            opacity: 0;
            transform: scale(1.1);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .hexagon-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.9) 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .hexagon-button:hover .hexagon-overlay,
        .hexagon-button:focus .hexagon-overlay {
          opacity: 1;
        }

        .hexagon-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Loading state */
        .hexagon-item:not(.hexagon-loaded) .hexagon-shape {
          background: linear-gradient(
            90deg,
            rgba(22, 32, 45, 0.9) 0%,
            rgba(102, 192, 244, 0.1) 50%,
            rgba(22, 32, 45, 0.9) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hexagon-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }

          .hexagon-button {
            width: 150px;
            height: 150px;
          }

          .hexagon-shape {
            width: 140px;
            height: 140px;
          }

          .hexagon-title {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HexagonGrid;
