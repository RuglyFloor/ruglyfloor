import React, { useState, useRef, useCallback, useEffect } from 'react';

const MAX_TILES_PER_SIDE = 200;
const MIN_TILE_PX = 8;
const MAX_TILE_PX = 40;

// Tiered pricing: base per tile + $2.50 per paint color per tile
export function calcSquaresPrice(totalTiles, numPaintColors) {
  let baseRate;
  if (totalTiles <= 4) baseRate = 25;
  else if (totalTiles <= 10) baseRate = 20;
  else baseRate = 17.50;
  const baseCost = totalTiles * baseRate;
  const paintCost = totalTiles * (numPaintColors * 2.50);
  return Math.round(baseCost + paintCost);
}

export function countPaintColors(grid) {
  const colors = new Set();
  grid.forEach(row => row.forEach(cell => {
    if (cell && cell !== '#F5F5F5') colors.add(cell);
  }));
  return colors.size;
}

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

const UNITS = ['tiles', 'feet', 'meters'];

// Each tile = 24" = 2ft = 0.6096m
function toTiles(value, unit) {
  const v = parseFloat(value);
  if (isNaN(v) || v <= 0) return 1;
  if (unit === 'tiles') return Math.max(1, Math.min(MAX_TILES_PER_SIDE, Math.round(v)));
  if (unit === 'feet') return Math.max(1, Math.min(MAX_TILES_PER_SIDE, Math.max(1, Math.round(v / 2))));
  if (unit === 'meters') return Math.max(1, Math.min(MAX_TILES_PER_SIDE, Math.max(1, Math.round(v / 0.6096))));
  return 1;
}

function fromTiles(tiles, unit) {
  if (unit === 'tiles') return String(tiles);
  if (unit === 'feet') return String(tiles * 2);
  if (unit === 'meters') return (tiles * 0.6096).toFixed(2);
  return String(tiles);
}

function makGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill('#F5F5F5'));
}

export default function SquaresTileGrid({ tierColor, onChange }) {
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [widthInput, setWidthInput] = useState('8'); // default 4 tiles = 8 ft
  const [heightInput, setHeightInput] = useState('8');
  const [widthUnit, setWidthUnit] = useState('feet');
  const [heightUnit, setHeightUnit] = useState('feet');
  const [grid, setGrid] = useState(() => makGrid(4, 4));
  const [activeColor, setActiveColor] = useState('#F5F5F5');
  const [surfaceType, setSurfaceType] = useState('carpet');
  const [isPainting, setIsPainting] = useState(false);

  const totalSqFt = cols * rows * 4;
  const totalTiles = cols * rows;
  const numPaintColors = countPaintColors(grid);
  const price = calcSquaresPrice(totalTiles, numPaintColors);
  const tilePx = Math.max(MIN_TILE_PX, Math.min(MAX_TILE_PX, Math.floor(320 / Math.max(cols, rows))));

  const applyDimensions = (newRows, newCols) => {
    const cr = Math.min(MAX_TILES_PER_SIDE, Math.max(1, newRows));
    const cc = Math.min(MAX_TILES_PER_SIDE, Math.max(1, newCols));
    setGrid(prev => Array.from({ length: cr }, (_, r) =>
      Array.from({ length: cc }, (_, c) => prev[r]?.[c] ?? '#F5F5F5')
    ));
    setRows(cr);
    setCols(cc);
  };

  const handleWidthChange = (val, unit) => {
    setWidthInput(val);
    const newCols = toTiles(val, unit || widthUnit);
    applyDimensions(rows, newCols);
  };

  const handleHeightChange = (val, unit) => {
    setHeightInput(val);
    const newRows = toTiles(val, unit || heightUnit);
    applyDimensions(newRows, cols);
  };

  const handleWidthUnitChange = (unit) => {
    setWidthUnit(unit);
    setWidthInput(fromTiles(cols, unit));
  };

  const handleHeightUnitChange = (unit) => {
    setHeightUnit(unit);
    setHeightInput(fromTiles(rows, unit));
  };

  const applyPreset = (r, c) => {
    applyDimensions(r, c);
    setWidthInput(fromTiles(c, widthUnit));
    setHeightInput(fromTiles(r, heightUnit));
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

  useEffect(() => {
    if (onChange) onChange({ grid, rows, cols, surfaceType, totalSqFt, totalTiles, numPaintColors, price });
  }, [grid, rows, cols, surfaceType]);

  const fillAll = () => setGrid(Array.from({ length: rows }, () => Array(cols).fill(activeColor)));
  const clearGrid = () => setGrid(makGrid(rows, cols));

  const unitLabel = (unit) => ({ tiles: 'Tiles', feet: 'Feet', meters: 'Meters' }[unit]);

  return (
    <div className="space-y-5" onMouseUp={() => setIsPainting(false)} onMouseLeave={() => setIsPainting(false)}>

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

      {/* Grid Size Controls with Unit Switching */}
      <div>
        <p className="text-sm font-semibold mb-1 text-gray-600">
          Dimensions — {cols} × {rows} tiles &nbsp;·&nbsp; {cols * 2}′ × {rows * 2}′ &nbsp;·&nbsp; {(cols * 0.6096).toFixed(1)}m × {(rows * 0.6096).toFixed(1)}m &nbsp;·&nbsp; {totalSqFt} sq ft
        </p>
        <p className="text-xs text-gray-400 mb-3">Each tile is 24″ × 24″ (2ft / 0.61m). Enter dimensions in tiles, feet, or meters.</p>

        <div className="flex flex-wrap gap-4 items-start mb-3">
          {/* Width */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">WIDTH</label>
            <div className="flex items-center gap-1">
              <button onClick={() => handleWidthChange(String(parseFloat(widthInput || 0) - (widthUnit === 'meters' ? 0.6096 : widthUnit === 'feet' ? 2 : 1)), null)}
                className="w-7 h-9 rounded-lg bg-gray-100 font-bold text-lg leading-none">−</button>
              <input
                type="number" min={0} value={widthInput}
                onChange={e => handleWidthChange(e.target.value, null)}
                className="w-20 text-center font-black border border-gray-200 rounded-lg py-1.5 text-sm"
              />
              <button onClick={() => handleWidthChange(String(parseFloat(widthInput || 0) + (widthUnit === 'meters' ? 0.6096 : widthUnit === 'feet' ? 2 : 1)), null)}
                className="w-7 h-9 rounded-lg bg-gray-100 font-bold text-lg leading-none">+</button>
            </div>
            <div className="flex gap-1">
              {UNITS.map(u => (
                <button key={u} onClick={() => handleWidthUnitChange(u)}
                  className="text-xs px-2 py-0.5 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: widthUnit === u ? tierColor : '#f3f4f6',
                    color: widthUnit === u ? '#fff' : '#6b7280',
                  }}
                >{unitLabel(u)}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center mt-5 text-gray-400 font-bold text-xl">×</div>

          {/* Height */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">LENGTH</label>
            <div className="flex items-center gap-1">
              <button onClick={() => handleHeightChange(String(parseFloat(heightInput || 0) - (heightUnit === 'meters' ? 0.6096 : heightUnit === 'feet' ? 2 : 1)), null)}
                className="w-7 h-9 rounded-lg bg-gray-100 font-bold text-lg leading-none">−</button>
              <input
                type="number" min={0} value={heightInput}
                onChange={e => handleHeightChange(e.target.value, null)}
                className="w-20 text-center font-black border border-gray-200 rounded-lg py-1.5 text-sm"
              />
              <button onClick={() => handleHeightChange(String(parseFloat(heightInput || 0) + (heightUnit === 'meters' ? 0.6096 : heightUnit === 'feet' ? 2 : 1)), null)}
                className="w-7 h-9 rounded-lg bg-gray-100 font-bold text-lg leading-none">+</button>
            </div>
            <div className="flex gap-1">
              {UNITS.map(u => (
                <button key={u} onClick={() => handleHeightUnitChange(u)}
                  className="text-xs px-2 py-0.5 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: heightUnit === u ? tierColor : '#f3f4f6',
                    color: heightUnit === u ? '#fff' : '#6b7280',
                  }}
                >{unitLabel(u)}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 self-center">Presets:</span>
          {[
            { label: "2′×6′ runner", c: 1, r: 3 },
            { label: "4′×6′", c: 2, r: 3 },
            { label: "6′×8′", c: 3, r: 4 },
            { label: "8′×10′", c: 4, r: 5 },
            { label: "10′×12′", c: 5, r: 6 },
            { label: "12′×20′ room", c: 6, r: 10 },
            { label: "20′×40′ studio", c: 10, r: 20 },
            { label: "40′×80′ gym", c: 20, r: 40 },
          ].map(({ label, c, r }) => (
            <button key={label} onClick={() => applyPreset(r, c)}
              className="text-xs px-2 py-1 rounded-lg border border-gray-200 font-semibold hover:border-gray-400 transition-colors whitespace-nowrap">
              {label}
            </button>
          ))}
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
        <p className="text-xs text-gray-400 mb-2">Click or drag to paint tiles · Large grids: use presets above</p>
        <div className="overflow-auto max-w-full">
          <div
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
                    style={{
                      width: tilePx,
                      height: tilePx,
                      backgroundColor: color,
                      borderRight: c < cols - 1 ? '1px solid rgba(0,0,0,0.12)' : undefined,
                      borderBottom: r < rows - 1 ? '1px solid rgba(0,0,0,0.12)' : undefined,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: `${tierColor}40`, backgroundColor: `${tierColor}08` }}>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>{totalTiles} tiles × ${totalTiles <= 4 ? '25' : totalTiles <= 10 ? '20' : '17.50'}/tile</span>
              <span>${totalTiles <= 4 ? totalTiles * 25 : totalTiles <= 10 ? totalTiles * 20 : (totalTiles * 17.5).toFixed(2)}</span>
            </div>
            {numPaintColors > 0 && (
              <div className="flex justify-between">
                <span>{numPaintColors} paint color{numPaintColors > 1 ? 's' : ''} × $2.50 × {totalTiles} tiles</span>
                <span>${(numPaintColors * 2.5 * totalTiles).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm pt-1" style={{ color: tierColor, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <span>Total</span>
              <span>${price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}