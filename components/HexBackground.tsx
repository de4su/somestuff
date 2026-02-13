import React, { useMemo, useState, useEffect } from 'react';

const HEX_GAMES_POOL = [
  '1245620', '1091500', '1086940', '271590', '1174180', '489830', '377160', '570', '440', '730', 
  '252490', '346110', '292030', '1145360', '1938090', '582010', '236430', '374320', '814380', '1446780', 
  '400', '620', '218620', '413150', '105600', '211820', '219740', '200710', '201810', '220', '240', 
  '322330', '367520', '381210', '431960', '435150', '444090', '444200', '47000', '476600', 
  '534380', '550', '578080', '632360', '646570', '739630', '782330', '812140', '883710', '892970', 
  '945360', '960090', '976730', '1151640', '1172470', '1238810', '1238840', '1284190', 
  '1313860', '1426210', '1449850', '1466860', '1506830', '1593500', '1659040', '1811260', '1817070', 
  '1817190', '1966720', '2050650', '2124490', '227300', '230410', '232090', '23310', '236850', '238960', 
  '239140', '242760', '250900', '252950', '261550', '264710', '268500', '275850', '281990', '289070', 
  '291550', '294100', '304050', '304930', '306130', '311690', '359550', '365360', '410320', '424840',
  '427520', '433340', '438640', '444090', '466560', '480490', '482400', '487000', '495200', '504230'
];

const HexBackground: React.FC = () => {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());

  const gridData = useMemo(() => {
    const rows = 20; // Optimized from 30 to 20
    const cols = 20; // Optimized from 30 to 20
    
    const getShuffledId = (r: number, c: number) => {
        const hash = (r * 127 + c * 13) % HEX_GAMES_POOL.length;
        return HEX_GAMES_POOL[hash];
    };

    return Array.from({ length: rows }).map((_, r) => 
      Array.from({ length: cols }).map((_, c) => {
        return {
          id: `hex-${r}-${c}`,
          appId: getShuffledId(r, c),
          initialOpacity: Math.random() * 0.15 + 0.1,
          delay: Math.random() * 5 
        };
      })
    );
  }, []);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    const interval = setInterval(() => {
      const newActive = new Set<string>();
      for (let i = 0; i < 2; i++) { // Reduced from 3 to 2
        const randRow = Math.floor(Math.random() * 20);
        const randCol = Math.floor(Math.random() * 20);
        newActive.add(`hex-${randRow}-${randCol}`);
      }
      
      setActiveIds(prev => new Set([...prev, ...newActive]));

      setTimeout(() => {
        setActiveIds(prev => {
          const next = new Set(prev);
          newActive.forEach(id => next.delete(id));
          return next;
        });
      }, 1000); // Reduced from 1500

    }, 4000); // Increased from 2500

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hex-wrapper">
      <div className="hex-grid">
        {gridData.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className="hex-row">
            {row.map((cell) => (
              <div 
                key={cell.id} 
                className={`hex ${activeIds.has(cell.id) ? 'active' : ''}`}
                style={{ 
                  opacity: cell.initialOpacity,
                  '--delay': cell.delay
                } as React.CSSProperties}
              >
                <div className="hex-content">
                  <img 
                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${cell.appId}/header.jpg`}
                    className="hex-image"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
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
