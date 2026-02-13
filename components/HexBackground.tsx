import React, { useMemo, useEffect, useState } from 'react';

// Pool of Steam App IDs for hexagonal background tiles
const STEAM_APP_IDS = [
  '1091500', // Cyberpunk 2077
  '1174180', // Red Dead Redemption 2
  '1245620', // Elden Ring
  '1237970', // Titanfall 2
  '813780',  // Age of Empires II: Definitive Edition
  '730',     // Counter-Strike 2
  '570',     // Dota 2
  '1086940', // Baldur's Gate 3
  '271590',  // Grand Theft Auto V
  '292030',  // The Witcher 3
  '1203220', // NARAKA: BLADEPOINT
  '582010',  // Monster Hunter: World
  '1716740', // Titanfall 2
  '489830',  // The Elder Scrolls V: Skyrim Special Edition
  '1172470', // Apex Legends
  '413150',  // Stardew Valley
  '381210',  // Dead by Daylight
  '774361',  // Temtem
  '460930',  // Tom Clancy's Rainbow Six Siege
  '945360',  // Among Us
  '252490',  // Rust
  '440',     // Team Fortress 2
  '359550',  // Tom Clancy's Rainbow Six Siege
  '578080',  // PUBG: BATTLEGROUNDS
  '1172380', // Star Wars Jedi: Fallen Order
  '1085660', // Destiny 2
  '220',     // Half-Life 2
  '400',     // Portal 2
  '620',     // Portal
  '892970',  // Valheim
];

interface HexTile {
  id: string;
  appId: string;
  delay: number;
}

const HexBackground: React.FC = () => {
  const [activeTiles, setActiveTiles] = useState<Set<string>>(new Set());
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Generate hex grid data
  const hexGrid = useMemo(() => {
    const rows = 15;
    const colsPerRow = 25;
    const grid: HexTile[][] = [];

    for (let row = 0; row < rows; row++) {
      const rowTiles: HexTile[] = [];
      const cols = row % 2 === 0 ? colsPerRow : colsPerRow - 1;
      
      for (let col = 0; col < cols; col++) {
        const index = row * colsPerRow + col;
        // Use deterministic assignment to avoid repetition patterns
        const appId = STEAM_APP_IDS[index % STEAM_APP_IDS.length];
        rowTiles.push({
          id: `hex-${row}-${col}`,
          appId,
          delay: (row * 0.05) + (col * 0.03),
        });
      }
      grid.push(rowTiles);
    }
    
    return grid;
  }, []);

  // Touch device glance behavior - periodically reveal random tiles
  useEffect(() => {
    if (!isTouchDevice) return;

    const glanceInterval = setInterval(() => {
      // Get all hex tile IDs
      const allTileIds = hexGrid.flat().map(tile => tile.id);
      
      // Select 3-5 random tiles to reveal
      const numTilesToReveal = Math.floor(Math.random() * 3) + 3;
      const newActiveTiles = new Set<string>();
      
      for (let i = 0; i < numTilesToReveal; i++) {
        const randomIndex = Math.floor(Math.random() * allTileIds.length);
        newActiveTiles.add(allTileIds[randomIndex]);
      }
      
      setActiveTiles(newActiveTiles);
      
      // Clear active tiles after 2 seconds
      setTimeout(() => {
        setActiveTiles(new Set());
      }, 2000);
    }, 5000); // Glance every 5 seconds

    return () => clearInterval(glanceInterval);
  }, [isTouchDevice, hexGrid]);

  // Mouse move handler for desktop
  const handleMouseMove = (e: React.MouseEvent, tileId: string) => {
    if (isTouchDevice) return;
    
    setActiveTiles(prev => {
      const newSet = new Set(prev);
      newSet.add(tileId);
      return newSet;
    });
  };

  const handleMouseLeave = (tileId: string) => {
    if (isTouchDevice) return;
    
    setActiveTiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(tileId);
      return newSet;
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="hex-wrapper">
      <div className="hex-grid">
        {hexGrid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="hex-row">
            {row.map(tile => (
              <div
                key={tile.id}
                className={`hex ${activeTiles.has(tile.id) ? 'active' : ''}`}
                onMouseEnter={(e) => handleMouseMove(e, tile.id)}
                onMouseLeave={() => handleMouseLeave(tile.id)}
              >
                <div className="hex-content">
                  <img
                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${tile.appId}/header.jpg`}
                    alt=""
                    className="hex-image loaded"
                    loading="lazy"
                    style={{ '--delay': `${tile.delay}s` } as React.CSSProperties}
                    onError={handleImageError}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="vignette"></div>
    </div>
  );
};

export default HexBackground;
