import React, { useState, useRef, useCallback, useEffect } from 'react';

const TILE_PX = 32; // pixels per tile in grid display
const MAX_TILES = 17; // max tiles per side (17x17 = ~400x400 ft at 24"/tile)

const DEFAULT_COLORS = [
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Red', hex: '#CC2200' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Gold', hex: '#C9A84C' },
  { name: 'Forest Green', hex: '#2D5A27' },
  { name: 'Burgundy', hex: '#7A1B2A' },
  { name: 'Royal Blue', hex: '#2850A0' },
  { name: 'Orange', hex: '#D4581A' },
  { name: 'Purple', hex: '#5C2D7A' },
  { name: 'Teal', hex: '#1A6B6B' },
  { name: 'Brown', hex: '#5C3A1E' },
  { name: 'Gray', hex: '#A0A0A0' },
];

function makGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill('#F5F5F5'));
}

export default function SquaresTileGrid({ tierColor, onChange }) {
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [grid, setGrid] = useState(() => makGrid(4, 4));
  const [activeColor, setActiveColor] = useState('#F5F5F5');
  const [surfaceType, setSurfaceType] = useState('carpet');
  const [isPainting, setIsPainting] = useState(false);
  const gridRef = useRef(null);

  const totalSqFt = cols * rows * 4; // each tile = 24"x24" = 4 sq ft
  const totalTiles = cols * rows;

  const resizeGrid = (newRows, newCols) => {
    setGrid(prev => {
      const next = Array.from({ length: newRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) =>
          prev[r]?.[c] ?? '#F5F5F5'
        )
      );
      return next;
    });
    setRows(newRows);
    setCols(newCols);
  };

  const paintTile = useCallback((r, c) => {
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = activeColor;
      return next;
    });
  }, [activeColor]);

  const handleTileMouseDown = (r, c, e) => {
    e.preventDefault();
    setIsPainting(true);
    paintTile(r, c);
  };

  const handleTileMouseEnter = (r, c) => {
    if (isPainting) paintTile(r, c);
  };

  const handleMouseUp = () => setIsPainting(false);

  // Notify parent on grid change
  useEffect(() => {
    if (onChange) onChange({ grid, rows, cols, surfaceType, totalSqFt, totalTiles });
  }, [grid, rows, cols, surfaceType]);

  const fillAll = () => {
    setGrid(Array.from({ length: rows }, () => Array(cols).fill(activeColor)));
  };

  const clearGrid = () => {
    setGrid(makGrid(rows, cols));
  };

  return (
    <div className="space-y-5" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

      {/* Surface Type */}
      <div>
        <p className="text-sm font-semibold mb-2 text-gray-600">Surface Type</p>
        <div className="flex gap-3">
          {['carpet', 'smooth'].map(type => (
            <button
              key={type}
              onClick={() => setSurfaceType(type)}
              className="px-5 py-2 rounded-xl font-bold capitalize transition-all text-sm"
              style={{
                border: `3px solid ${surfaceType === type ? tierColor : '#e5e7eb'}`,
                backgroundColor: surfaceType === type ? `${tierColor}15` : '#fff',
                color: surfaceType === type ? tierColor : '#343634',
              }}
            >
              {type === 'carpet' ? '🧶 Carpet Squares' : '🪟 Smooth Squares'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Size Controls */}
      <div>
        <p className="text-sm font-semibold mb-2 text-gray-600">
          Grid Size — {cols} × {rows} tiles &nbsp;·&nbsp; {totalSqFt} sq ft &nbsp;·&nbsp; {totalTiles} tiles
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500">WIDE</label>
            <button onClick={() => cols > 1 && resizeGrid(rows, cols - 1)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-lg leading-none">−</button>
            <span className="w-8 text-center font-black">{cols}</span>
            <button onClick={() => cols < MAX_TILES && resizeGrid(rows, cols + 1)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-lg leading-none">+</button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500">TALL</label>
            <button onClick={() => rows > 1 && resizeGrid(rows - 1, cols)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-lg leading-none">−</button>
            <span className="w-8 text-center font-black">{rows}</span>
            <button onClick={() => rows < MAX_TILES && resizeGrid(rows + 1, cols)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-lg leading-none">+</button>
          </div>
          {/* Quick presets */}
          <div className="flex gap-2 flex-wrap">
            {[[2,2],[3,3],[4,4],[5,5],[4,6],[6,4]].map(([c,r]) => (
              <button key={`${c}x${r}`} onClick={() => resizeGrid(r, c)}
                className="text-xs px-2 py-1 rounded-lg border border-gray-200 font-semibold hover:border-gray-400 transition-colors">
                {c}×{r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <p className="text-sm font-semibold mb-2 text-gray-600">Active Paint Color — click tiles to paint</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {DEFAULT_COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => setActiveColor(c.hex)}
              title={c.name}
              className="w-8 h-8 rounded-lg border-2 transition-all flex-shrink-0"
              style={{
                backgroundColor: c.hex,
                borderColor: activeColor === c.hex ? tierColor : '#e5e7eb',
                transform: activeColor === c.hex ? 'scale(1.25)' : 'scale(1)',
                boxShadow: activeColor === c.hex ? `0 0 0 2px white, 0 0 0 4px ${tierColor}` : undefined,
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={fillAll} className="text-xs px-3 py-1.5 rounded-lg border-2 font-bold" style={{ borderColor: tierColor, color: tierColor }}>Fill All</button>
          <button onClick={clearGrid} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-semibold text-gray-500">Reset</button>
        </div>
      </div>

      {/* Tile Grid */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Click or drag to paint · Right-click to paint with active color</p>
        <div
          ref={gridRef}
          className="inline-block border-2 rounded-xl overflow-hidden select-none"
          style={{ borderColor: tierColor, cursor: 'crosshair' }}
          onContextMenu={e => e.preventDefault()}
        >
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((color, c) => (
                <div
                  key={c}
                  onMouseDown={(e) => handleTileMouseDown(r, c, e)}
                  onMouseEnter={() => handleTileMouseEnter(r, c)}
                  onContextMenu={(e) => { e.preventDefault(); paintTile(r, c); }}
                  style={{
                    width: TILE_PX,
                    height: TILE_PX,
                    backgroundColor: color,
                    borderRight: c < cols - 1 ? '1px solid rgba(0,0,0,0.12)' : undefined,
                    borderBottom: r < rows - 1 ? '1px solid rgba(0,0,0,0.12)' : undefined,
                    transition: 'background-color 0.05s',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">{cols} × {rows} = {totalTiles} tiles · Each tile 24"×24" · Total: {totalSqFt} sq ft</p>
      </div>
    </div>
  );
}