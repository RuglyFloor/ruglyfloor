import React, { useState, useRef, useCallback, useEffect } from 'react';

const MAX_TILES_PER_SIDE = 200;
const MIN_TILE_PX = 8;
const MAX_TILE_PX = 40;

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

function makGrid(rows, cols, fillColor = '#F5F5F5') {
  return Array.from({ length: rows }, () => Array(cols).fill(fillColor));
}

// Animated step reveal
function SubStep({ visible, children }) {
  const [mounted, setMounted] = useState(visible);
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      const t = setTimeout(() => {
        setShow(true);
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 60);
      return () => clearTimeout(t);
    } else {
      setShow(false);
      const t = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <div style={{ paddingTop: '4px' }}>
        {children}
      </div>
    </div>
  );
}

// Mini connector between sub-steps
function MiniConnector({ active, color }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setDrawn(true), 120);
      return () => clearTimeout(t);
    } else {
      setDrawn(false);
    }
  }, [active]);

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '12px', margin: '6px 0' }} aria-hidden>
      <div style={{
        width: 3,
        height: drawn ? 28 : 0,
        backgroundColor: color,
        borderRadius: 2,
        transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)',
        opacity: drawn ? 1 : 0,
      }} />
    </div>
  );
}

export default function SquaresTileGrid({ tierColor, onChange }) {
  const [surfaceType, setSurfaceType] = useState(null);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [widthInput, setWidthInput] = useState('8');
  const [heightInput, setHeightInput] = useState('8');
  const [widthUnit, setWidthUnit] = useState('feet');
  const [heightUnit, setHeightUnit] = useState('feet');
  const [widthConfirmed, setWidthConfirmed] = useState(false);
  const [heightConfirmed, setHeightConfirmed] = useState(false);
  const [grid, setGrid] = useState(() => makGrid(4, 4));
  const [activeColor, setActiveColor] = useState('#F5F5F5');
  const [isPainting, setIsPainting] = useState(false);

  const totalSqFt = cols * rows * 4;
  const totalTiles = cols * rows;
  const numPaintColors = countPaintColors(grid);
  const price = calcSquaresPrice(totalTiles, numPaintColors);
  const tilePx = Math.max(MIN_TILE_PX, Math.min(MAX_TILE_PX, Math.floor(320 / Math.max(cols, rows))));
  const gridHasNonDefault = grid.some(row => row.some(c => c !== '#F5F5F5'));
  const baseColor = grid[0]?.[0] ?? '#F5F5F5';

  const applyDimensions = (newRows, newCols) => {
    const cr = Math.min(MAX_TILES_PER_SIDE, Math.max(1, newRows));
    const cc = Math.min(MAX_TILES_PER_SIDE, Math.max(1, newCols));
    setGrid(prev => Array.from({ length: cr }, (_, r) =>
      Array.from({ length: cc }, (_, c) => prev[r]?.[c] ?? '#F5F5F5')
    ));
    setRows(cr);
    setCols(cc);
  };

  const handleWidthChange = (val) => {
    setWidthInput(val);
    setWidthConfirmed(false);
    const newCols = toTiles(val, widthUnit);
    applyDimensions(rows, newCols);
  };

  const handleHeightChange = (val) => {
    setHeightInput(val);
    setHeightConfirmed(false);
    const newRows = toTiles(val, heightUnit);
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
  }, [grid, rows, cols, surfaceType, totalSqFt, totalTiles, numPaintColors, price]);

  const fillAll = (color) => {
    const c = color ?? activeColor;
    setGrid(Array.from({ length: rows }, () => Array(cols).fill(c)));
  };
  const clearGrid = () => setGrid(makGrid(rows, cols));
  const unitLabel = (unit) => ({ tiles: 'Tiles', feet: 'Feet', meters: 'Meters' }[unit]);

  const confirmWidth = () => setWidthConfirmed(true);
  const confirmHeight = () => setHeightConfirmed(true);

  return (
    <div
      className="space-y-1"
      onMouseUp={() => setIsPainting(false)}
      onMouseLeave={() => setIsPainting(false)}
    >

      {/* SURFACE TYPE */}
      <div>
        <p className="text-sm font-semibold mb-2 text-gray-600">Surface Type</p>
        <div className="flex gap-3">
          {['carpet', 'smooth'].map(type => (
            <button
              key={type}
              onClick={() => { setSurfaceType(type); setWidthConfirmed(false); setHeightConfirmed(false); }}
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

      {/* WIDTH */}
      <MiniConnector active={!!surfaceType} color={tierColor} />
      <SubStep visible={!!surfaceType}>
        <div className="p-4 rounded-2xl bg-white border-2" style={{ borderColor: widthConfirmed ? `${tierColor}60` : '#e5e7eb' }}>
          <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2 block">Width</label>
          <p className="text-xs text-gray-400 mb-3">Each tile is 24″ wide. Enter in tiles, feet, or meters.</p>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => handleWidthChange(String(parseFloat(widthInput || 0) - (widthUnit === 'meters' ? 0.6096 : widthUnit === 'feet' ? 2 : 1)))}
              className="w-9 h-9 rounded-xl bg-gray-100 font-bold text-lg leading-none flex-shrink-0">−</button>
            <input
              type="number" min={0} value={widthInput}
              onChange={e => handleWidthChange(e.target.value)}
              className="w-24 text-center font-black border-2 border-gray-200 rounded-xl py-2 text-lg focus:outline-none"
              style={{ borderColor: widthConfirmed ? tierColor : undefined }}
            />
            <button onClick={() => handleWidthChange(String(parseFloat(widthInput || 0) + (widthUnit === 'meters' ? 0.6096 : widthUnit === 'feet' ? 2 : 1)))}
              className="w-9 h-9 rounded-xl bg-gray-100 font-bold text-lg leading-none flex-shrink-0">+</button>
            <div className="flex gap-1 ml-2">
              {UNITS.map(u => (
                <button key={u} onClick={() => handleWidthUnitChange(u)}
                  className="text-xs px-2 py-1 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: widthUnit === u ? tierColor : '#f3f4f6', color: widthUnit === u ? '#fff' : '#6b7280' }}
                >{unitLabel(u)}</button>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            = {cols} tile{cols !== 1 ? 's' : ''} · {cols * 2}′ · {(cols * 0.6096).toFixed(1)}m wide
          </div>
          {!widthConfirmed && (
            <button
              onClick={confirmWidth}
              className="text-sm font-black px-5 py-2 rounded-xl text-white transition-all"
              style={{ backgroundColor: tierColor }}
            >
              Confirm Width →
            </button>
          )}
          {widthConfirmed && (
            <div className="text-sm font-bold" style={{ color: tierColor }}>✓ {cols * 2}′ wide confirmed</div>
          )}
        </div>
      </SubStep>

      {/* LENGTH */}
      <MiniConnector active={widthConfirmed} color={tierColor} />
      <SubStep visible={widthConfirmed}>
        <div className="p-4 rounded-2xl bg-white border-2" style={{ borderColor: heightConfirmed ? `${tierColor}60` : '#e5e7eb' }}>
          <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2 block">Length</label>
          <p className="text-xs text-gray-400 mb-3">Each tile is 24″ long. Enter in tiles, feet, or meters.</p>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => handleHeightChange(String(parseFloat(heightInput || 0) - (heightUnit === 'meters' ? 0.6096 : heightUnit === 'feet' ? 2 : 1)))}
              className="w-9 h-9 rounded-xl bg-gray-100 font-bold text-lg leading-none flex-shrink-0">−</button>
            <input
              type="number" min={0} value={heightInput}
              onChange={e => handleHeightChange(e.target.value)}
              className="w-24 text-center font-black border-2 border-gray-200 rounded-xl py-2 text-lg focus:outline-none"
              style={{ borderColor: heightConfirmed ? tierColor : undefined }}
            />
            <button onClick={() => handleHeightChange(String(parseFloat(heightInput || 0) + (heightUnit === 'meters' ? 0.6096 : heightUnit === 'feet' ? 2 : 1)))}
              className="w-9 h-9 rounded-xl bg-gray-100 font-bold text-lg leading-none flex-shrink-0">+</button>
            <div className="flex gap-1 ml-2">
              {UNITS.map(u => (
                <button key={u} onClick={() => handleHeightUnitChange(u)}
                  className="text-xs px-2 py-1 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: heightUnit === u ? tierColor : '#f3f4f6', color: heightUnit === u ? '#fff' : '#6b7280' }}
                >{unitLabel(u)}</button>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            = {rows} tile{rows !== 1 ? 's' : ''} · {rows * 2}′ · {(rows * 0.6096).toFixed(1)}m long
          </div>
          {!heightConfirmed && (
            <button
              onClick={confirmHeight}
              className="text-sm font-black px-5 py-2 rounded-xl text-white transition-all"
              style={{ backgroundColor: tierColor }}
            >
              Confirm Length →
            </button>
          )}
          {heightConfirmed && (
            <div className="text-sm font-bold" style={{ color: tierColor }}>✓ {rows * 2}′ long confirmed — {totalTiles} tiles · {totalSqFt} sq ft</div>
          )}
        </div>
      </SubStep>

      {/* UNIFIED COLOR + GRID */}
      <MiniConnector active={heightConfirmed} color={tierColor} />
      <SubStep visible={heightConfirmed}>
        <div className="p-4 rounded-2xl bg-white border-2" style={{ borderColor: gridHasNonDefault ? `${tierColor}60` : '#e5e7eb' }}>
          <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1 block">Design Your Tiles</label>
          <p className="text-xs text-gray-400 mb-3">Pick a color, then click or drag tiles to paint them. Use "Fill All" to set the base color for all tiles at once.</p>

          {/* Color swatches */}
          <div className="flex flex-wrap gap-2 mb-3">
            {DEFAULT_COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setActiveColor(c.hex)}
                title={c.name}
                className="w-9 h-9 rounded-lg border-2 transition-all flex-shrink-0"
                style={{
                  backgroundColor: c.hex,
                  borderColor: activeColor === c.hex ? tierColor : '#e5e7eb',
                  transform: activeColor === c.hex ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: activeColor === c.hex ? `0 0 0 2px white, 0 0 0 4px ${tierColor}` : undefined,
                }}
              />
            ))}
          </div>

          {/* Active color indicator + actions */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <div className="w-5 h-5 rounded border border-gray-200 flex-shrink-0" style={{ backgroundColor: activeColor }} />
              Active color
            </div>
            <button onClick={() => fillAll()} className="text-xs px-3 py-1.5 rounded-lg border-2 font-bold" style={{ borderColor: tierColor, color: tierColor }}>Fill All</button>
            <button onClick={clearGrid} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-semibold text-gray-500">Reset</button>
          </div>

          {/* Grid canvas */}
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

          <div className="mt-3 text-xs text-gray-400">
            {cols} × {rows} tiles · {totalSqFt} sq ft
            {gridHasNonDefault && <span className="ml-2" style={{ color: tierColor }}>· design saved ✓</span>}
          </div>
        </div>
      </SubStep>

    </div>
  );
}