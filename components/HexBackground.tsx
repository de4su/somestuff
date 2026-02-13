import React, { useMemo, useRef, useEffect, useCallback } from 'react';

const HEX_GAMES_POOL = [
  // your 100+ app IDs here - unchanged
];

const HexBackground: React.FC = () => {
  const lastHoveredHexRef = useRef<HTMLElement | null>(null);

  const gridData = useMemo(() => {
    const rows = 15;  // your 15x15
    const cols = 15;

    const getShuffledId = (r: number, c: number) => {
      const hash = (r * 127 + c * 13) % HEX_GAMES_POOL.length;
      return HEX_GAMES_POOL[hash];
    };

    return Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: cols }).map((_, c) => ({
        id: `hex-${r}-${c}`,
        appId: getShuffledId(r, c),
        initialOpacity: Math.random() * 0.15 + 0.1,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  // OPTIMIZED: throttle mousemove to 15 FPS (instead of 60)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
    const hexElement = elementsAtPoint.find((el: Element) =>
      (el as Element).classList?.contains('hex')
    ) as HTMLElement | undefined;

    if (hexElement !== lastHoveredHexRef.current) {
      if (lastHoveredHexRef.current) {
        lastHoveredHexRef.current.classList.remove('is-hovered');
      }
      if (hexElement) {
        hexElement.classList.add('is-hovered');
      }
      lastHoveredHexRef.current = hexElement || null;
    }
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastCall = 0;

    const throttledMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastCall < 66) return; // ~15 FPS (1000/15 = 66ms)

      rafId = requestAnimationFrame(() => {
        handleMouseMove(e);
        lastCall = performance.now();
      });
    };

    window.addEventListener('mousemove', throttledMouseMove);
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleMouseMove]);

  return (
    <div className="hex-wrapper">
      <div className="hex-grid">
        {gridData.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className="hex-row">
            {row.map(cell => (
              <div
                key={cell.id}
                id={cell.id}
                className="hex"
                style={{
                  opacity: cell.initialOpacity,
                  '--delay': cell.delay,
                } as React.CSSProperties}
              >
                <div className="hex-content">
                  <img
                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${cell.appId}/header.jpg`}
                    className="hex-image"
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="vignette" />
    </div>
  );
};

export default HexBackground;
