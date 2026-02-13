import React, { useMemo, useRef, useEffect, useCallback } from 'react';

const HEX_GAMES_POOL = [
  // your app IDs - unchanged
];

const HexBackground: React.FC = () => {
  const lastHoveredHexRef = useRef<HTMLElement | null>(null);

  const gridData = useMemo(() => {
    const rows = 15;
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

  // FIXED: Simpler throttling - direct RAF without performance.now()
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
    const hexElement = elementsAtPoint.find((el: Element) =>
      el.classList?.contains('hex')
    ) as HTMLElement | undefined;

    // Clear previous hover
    if (lastHoveredHexRef.current) {
      lastHoveredHexRef.current.classList.remove('is-hovered');
    }

    // Set new hover
    if (hexElement) {
      hexElement.classList.add('is-hovered');
    }

    lastHoveredHexRef.current = hexElement || null;
  }, []);

  useEffect(() => {
    let rafId: number;
    
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => handleMouseMove(e));
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
                      // FIXED: Don't hide on error, just stop trying to animate it
                      (e.target as HTMLImageElement).style.opacity = '0.3';
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
