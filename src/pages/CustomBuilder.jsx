import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ShoppingCart, Sparkles, RefreshCw } from 'lucide-react';
import DesignUploader from '../components/builder/DesignUploader';
import RugPreviewGenerator from '../components/custom/RugPreviewGenerator';
import SquaresTileGrid from '../components/builder/SquaresTileGrid';
import SquaresPreviewGenerator from '../components/builder/SquaresPreviewGenerator';
import QuoteRequestForm from '../components/builder/QuoteRequestForm';
import StepConnector from '../components/builder/StepConnector';
import BuilderStep from '../components/builder/BuilderStep';
import SEOHead from '../components/seo/SEOHead';

const BASE_COLORS_CRUGLY = [
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1A2A4A' },
  { name: 'Ivory', hex: '#E8E4DC' },
  { name: 'Gray', hex: '#A0A0A0' },
  {
    name: 'Snowsand',
    hex: '#D8D4C8',
    imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/b0a28ee97_generated_image.png',
  },
];

const BASE_COLORS_RUGLY = [
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1A2A4A' },
  { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Light Gray', hex: '#C8C8C8' },
  { name: 'Medium Gray', hex: '#8A8A8A' },
  { name: 'Tan', hex: '#B8A080' },
  { name: 'Sage', hex: '#8A9A7A' },
  { name: 'Lavender', hex: '#9A8AB0' },
  { name: 'Dusty Rose', hex: '#C09090' },
  {
    name: 'Snow Grey',
    hex: '#E8E8E4',
    imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/bb7173294_generated_image.png',
    availableSizes: ['4x6', '5x7', '6x9', '9x12'],
  },
  {
    name: 'Stormy Dan',
    hex: '#7A7A7A',
    imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/4c8bb707d_generated_image.png',
    availableSizes: ['4x6', '5x7', '6x9', '9x12'],
  },
  {
    name: 'Wicker',
    hex: '#8B6347',
    imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/25563b160_generated_image.png',
    availableSizes: ['4x6', '5x7', '6x9', '9x12'],
  },
  {
    name: 'Neptune',
    hex: '#5A6A7A',
    imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/12f287ff4_generated_image.png',
    availableSizes: ['4x6', '5x7', '6x9', '9x12'],
  },
  {
    name: 'Tusk',
    hex: '#EDE8DC',
    imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/609befe57_generated_image.png',
    availableSizes: ['4x6', '5x7', '6x9', '9x12'],
  },
];

const BASE_COLORS_RUGLY_LX = [
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1A2A4A' },
  { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Light Gray', hex: '#C8C8C8' },
  { name: 'Tan', hex: '#B8A080' },
  {
    name: 'Wicked',
    hex: '#B0B0AA',
    imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/b29ecd00e_generated_image.png',
    availableSizes: ['4x6', '5x7', '9x12'],
  },
  {
    name: 'Storm',
    hex: '#7A7A7A',
    imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/e1b8a0838_generated_image.png',
    availableSizes: ['4x6', '5x7', '9x12'],
  },
];

// Default (fallback)
const BASE_COLORS = BASE_COLORS_CRUGLY;

const PAINT_COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#FFFFFF' },
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
  { name: 'Custom', hex: null },
];

const QUALITY_TIERS = [
  {
    id: 'squares',
    label: 'Squares',
    tagline: 'Custom tile installation',
    description: 'Custom-painted carpet or smooth squares. From a single runner to a full gym floor. $17.50–$25/tile + $2.50/paint color/tile.',
    color: '#f04624',
    shipping: 'FREE shipping on all Squares orders',
    eta: '14–21 business days',
  },
  {
    id: 'crugly',
    label: 'Crugly',
    tagline: 'Best value · Most popular',
    description: 'Hand-painted on a quality base rug. Perfect for bedrooms, dorms, offices.',
    color: '#24f0a0',
    prices: { '2x3': 79, '3x5': 119, '4x6': 149, '5x7': 189, '6x9': 239 },
    shipping: 'FREE shipping',
    eta: '10–14 business days',
  },
  {
    id: 'rugly',
    label: 'Rugly',
    tagline: 'Premium quality',
    description: 'Thicker pile, richer colors, premium base rug. Living room worthy.',
    color: '#4075ff',
    prices: { '2x3': 129, '3x5': 199, '4x6': 259, '5x7': 329, '6x9': 419, '9x12': 599 },
    shipping: '$15–$50 shipping',
    eta: '14–21 business days',
  },
  {
    id: 'rugly_lx',
    label: 'Rugly LX',
    tagline: 'Luxury · Commission',
    description: 'Top-of-line materials, artist-level detail, certificate of authenticity.',
    color: '#343634',
    prices: { '2x3': 249, '3x5': 399, '4x6': 549, '5x7': 699, '6x9': 899, '9x12': 1299 },
    shipping: 'Shipping quoted at completion',
    eta: '3–6 weeks',
    depositOnly: true,
  },
];

const SIZES = [
  { id: '2x3', label: "2' × 3'", measurement: "2' × 3'" },
  { id: '3x5', label: "3' × 5'", measurement: "3' × 5'" },
  { id: '4x6', label: "4' × 6'", measurement: "4' × 6'" },
  { id: '5x7', label: "5' × 7'", measurement: "5' × 7'" },
  { id: '6x9', label: "6' × 9'", measurement: "6' × 9'" },
  { id: '9x12', label: "9' × 12'", measurement: "9' × 12'" },
];

export default function CustomBuilder() {
  const navigate = useNavigate();

  const [tier, setTier] = useState(null);
  const [size, setSize] = useState(null);
  const [baseColor, setBaseColor] = useState(null);
  const [paintColor, setPaintColor] = useState(null);
  const [customPaintHex, setCustomPaintHex] = useState('#000000');
  const [hasSecondColor, setHasSecondColor] = useState(false);
  const [secondPaintColor, setSecondPaintColor] = useState(null);
  const [customSecondHex, setCustomSecondHex] = useState('#ffffff');
  const [imageUrl, setImageUrl] = useState(null);
  const [stencilDataUrl, setStencilDataUrl] = useState(null);
  const [stencilMode, setStencilMode] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [designInstructions, setDesignInstructions] = useState('');
  const generatePreviewRef = useRef(null);

  // Squares-specific state
  const [squaresGridData, setSquaresGridData] = useState(null);

  const isSquares = tier?.id === 'squares';
  const baseColorOptions = tier?.id === 'rugly_lx' ? BASE_COLORS_RUGLY_LX : tier?.id === 'rugly' ? BASE_COLORS_RUGLY : BASE_COLORS_CRUGLY;
  const availableSizes = baseColor?.availableSizes
    ? SIZES.filter(s => baseColor.availableSizes.includes(s.id))
    : SIZES.filter(s => tier?.id !== 'crugly' || s.id !== '9x12');
  const paintHex = paintColor?.name === 'Custom' ? customPaintHex : (paintColor?.hex || null);
  const secondHex = secondPaintColor?.name === 'Custom' ? customSecondHex : (secondPaintColor?.hex || null);
  const squaresPrice = squaresGridData?.price || 0;
  const squaresGridPainted = !!(squaresGridData && squaresGridData.grid && squaresGridData.grid.some(row => row.some(c => c !== '#F5F5F5')));
  const price = isSquares ? squaresPrice : (tier && size ? (tier.prices[size.id] || 0) : 0);
  const isComplete = isSquares
    ? !!squaresGridData && squaresGridPainted && !!imageUrl && squaresGridData.totalTiles > 0
    : !!tier && !!size && !!baseColor && !!paintColor && !!imageUrl;
  const tierColor = tier?.color || '#4075ff';
  const canGenerate = isSquares
    ? !!stencilDataUrl && squaresGridPainted
    : !!stencilDataUrl && !!baseColor && !!paintColor;



  const handleAddToCart = () => {
    if (!isComplete) return;
    const cartItem = isSquares ? {
      type: 'squares',
      qualityTier: 'squares',
      qualityLabel: 'Squares',
      size: `${squaresGridData.cols}×${squaresGridData.rows} tiles (${squaresGridData.totalSqFt} sq ft)`,
      sizeMeasurement: `${squaresGridData.cols * 2}'×${squaresGridData.rows * 2}'`,
      surfaceType: squaresGridData.surfaceType,
      tileCount: squaresGridData.totalTiles,
      numPaintColors: squaresGridData.numPaintColors,
      imageUrl: imageUrl || null,
      previewUrl: previewUrl || imageUrl,
      aiPreviewUrl: previewUrl || null,
      designInstructions,
      price,
      name: `Custom Squares — ${squaresGridData.cols}×${squaresGridData.rows} tiles`,
    } : {
      type: 'custom',
      qualityTier: tier.id,
      qualityLabel: tier.label,
      size: size.label,
      sizeMeasurement: size.measurement,
      baseColor: baseColor.name,
      baseColorHex: baseColor.hex,
      paintColor: paintColor.name,
      paintColorHex: paintHex,
      hasSecondColor,
      secondPaintColor: hasSecondColor ? (secondPaintColor?.name || null) : null,
      secondPaintColorHex: hasSecondColor ? secondHex : null,
      imageUrl: imageUrl || null,
      originalUploadUrl: imageUrl,
      previewUrl: previewUrl || imageUrl,
      aiPreviewUrl: previewUrl || null,
      designInstructions,
      price,
      name: `Custom ${tier.label} Rug — ${size.label}`,
    };
    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    navigate(createPageUrl('Cart'));
  };

  const previewConfig = {
    imageUrl,
    stencilDataUrl,
    stencilMode,
    baseColor: baseColor?.name || null,
    paintColorHex: paintHex,
    hasSecondColor,
    secondPaintColorHex: hasSecondColor ? secondHex : null,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <SEOHead
        title="Build Your Custom Rug — Rugly Floor"
        description="Design your own hand-painted rug. Choose quality, size, colors, upload your design, and get an AI preview instantly."
        url="/CustomBuilder"
      />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#343634' }}>
            Build Your Rug
          </h1>
          <p className="text-gray-500 text-lg">Fill in each step — your AI preview generates automatically</p>
        </div>

        {/* STEP 1: Quality */}
        <section>
          <h2 className="text-2xl font-black mb-4" style={{ color: '#343634' }}>1. Choose Quality</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {QUALITY_TIERS.map(t => {
              const isSelected = tier?.id === t.id;
              const isKnockedOut = !!tier && !isSelected;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTier(t); setBaseColor(null); setSize(null); setPaintColor(null); }}
                  className="text-left rounded-2xl border-4 w-full overflow-hidden"
                  style={{
                    borderColor: isSelected ? t.color : '#e5e7eb',
                    backgroundColor: isSelected ? `${t.color}15` : '#ffffff',
                    boxShadow: isSelected ? `0 6px 28px ${t.color}50` : undefined,
                    opacity: isKnockedOut ? 0.38 : 1,
                    transform: isSelected ? 'scale(1.04)' : isKnockedOut ? 'scale(0.95)' : 'scale(1)',
                    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                    padding: isSelected ? '20px' : '16px 20px',
                    filter: isKnockedOut ? 'grayscale(60%)' : 'none',
                  }}
                >
                  {/* Color accent top bar */}
                  <div style={{
                    height: isSelected ? 5 : 3,
                    backgroundColor: t.color,
                    borderRadius: 3,
                    marginBottom: 10,
                    width: isSelected ? '100%' : '40%',
                    transition: 'all 0.35s ease',
                  }} />
                  <div className="font-black text-xl mb-0.5" style={{ color: t.color }}>{t.label}</div>
                  <div className="text-xs font-bold mb-1.5 text-gray-500">{t.tagline}</div>
                  <div
                    className="text-sm text-gray-600 mb-2 overflow-hidden"
                    style={{
                      maxHeight: isKnockedOut ? 0 : '5em',
                      opacity: isKnockedOut ? 0 : 1,
                      transition: 'max-height 0.3s ease, opacity 0.25s ease',
                    }}
                  >{t.description}</div>
                  <div className="text-xs text-gray-500">{t.shipping} · {t.eta}</div>
                  {t.depositOnly && isSelected && (
                    <div className="mt-2 text-xs font-bold px-2 py-1 rounded-full inline-block" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                      $100 deposit to start
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <StepConnector color={tierColor} active={!!tier} />

        {/* STEP 2: Size / Grid */}
        <BuilderStep visible={!!tier} color={tierColor} scrollOnAppear>
        <section>
          {isSquares ? (
            <>
              <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>2. Design Your Tile Grid</h2>
              <p className="text-sm text-gray-500 mb-4">Each tile is 24″×24″. Paint any shape — runner to full gym. $17.50–$25/tile + $2.50/paint color/tile.</p>
              <SquaresTileGrid
                tierColor={tierColor}
                onChange={(data) => setSquaresGridData(data)}
              />
              {squaresGridData && (
                <div className="mt-3 text-sm font-bold" style={{ color: tierColor }}>
                  {squaresGridData.totalTiles} tiles · {squaresGridData.totalSqFt} sq ft · ${squaresPrice}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black mb-4" style={{ color: '#343634' }}>2. Choose Size</h2>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s)}
                    className="px-5 py-3 rounded-xl font-bold transition-all"
                    style={{
                      border: `3px solid ${size?.id === s.id ? tierColor : '#e5e7eb'}`,
                      backgroundColor: size?.id === s.id ? `${tierColor}15` : '#ffffff',
                      color: size?.id === s.id ? tierColor : '#343634',
                    }}
                  >
                    <div className="text-lg">{s.label}</div>
                    {tier && <div className="text-sm font-black">${tier.prices[s.id] || '—'}</div>}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
        </BuilderStep>

        <StepConnector color={tierColor} active={isSquares ? !!(squaresGridData?.surfaceType) : !!size} />

        {/* STEP 3: Base Color (hidden for Squares — colors are per-tile in the grid) */}
        {!isSquares && <BuilderStep visible={!!size} color={tierColor} scrollOnAppear><section>
          <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>3. Rug Base Color</h2>
          <p className="text-sm text-gray-500 mb-4">The background color of the rug itself</p>
          <div className="flex flex-wrap gap-3">
            {baseColorOptions.map(c => {
              const isCrugly = tier?.id === 'crugly' || !tier;
              const patId = `tex-${c.name.replace(/\s/g,'')}`;
              return (
                <button
                  key={c.name}
                  onClick={() => { setBaseColor(c); if (c.availableSizes && size && !c.availableSizes.includes(size.id)) setSize(null); }}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl font-semibold transition-all"
                  style={{
                    border: `3px solid ${baseColor?.name === c.name ? tierColor : '#e5e7eb'}`,
                    backgroundColor: baseColor?.name === c.name ? `${tierColor}10` : '#ffffff',
                    minWidth: '72px',
                  }}
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 relative border border-gray-200" style={{ backgroundColor: c.hex }}>
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
                        <defs>
                          {isCrugly ? (
                            <pattern id={patId} x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
                              <circle cx="3.5" cy="3.5" r="2.2" fill="rgba(255,255,255,0.13)" />
                              <circle cx="3.5" cy="3.5" r="1.4" fill="rgba(0,0,0,0.12)" />
                            </pattern>
                          ) : (
                            <pattern id={patId} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
                              <ellipse cx="1.5" cy="2" rx="1.2" ry="0.7" fill="rgba(255,255,255,0.15)" />
                              <ellipse cx="3.8" cy="3.5" rx="1.2" ry="0.7" fill="rgba(0,0,0,0.12)" />
                            </pattern>
                          )}
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#${patId})`} />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-center leading-tight">{c.name}</span>
                </button>
              );
            })}
          </div>
        </section></BuilderStep>}

        <StepConnector color={tierColor} active={isSquares ? squaresGridPainted : !!baseColor} />

        {/* STEP 4: Paint Color (hidden for Squares — colors are per-tile in the grid) */}
        {isSquares && <BuilderStep visible={squaresGridPainted} color={tierColor} scrollOnAppear><section>
          <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>3. Paint Color</h2>
          <p className="text-sm text-gray-500 mb-2">The color your design will be painted on top of the tiles</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {PAINT_COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setPaintColor(c)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl font-semibold transition-all"
                style={{
                  border: `3px solid ${paintColor?.name === c.name ? tierColor : '#e5e7eb'}`,
                  backgroundColor: paintColor?.name === c.name ? `${tierColor}10` : '#ffffff',
                  minWidth: '60px',
                }}
              >
                <div className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: c.hex || '#ccc' }} />
                <span className="text-xs text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
          {paintColor?.name === 'Custom' && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold">Custom color:</label>
              <input type="color" value={customPaintHex} onChange={e => setCustomPaintHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
              <span className="text-sm font-mono text-gray-600">{customPaintHex}</span>
            </div>
          )}
        </section></BuilderStep>}

        {!isSquares && <BuilderStep visible={!!baseColor} color={tierColor} scrollOnAppear><section>
          <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>4. Paint Color</h2>
          <p className="text-sm text-gray-500 mb-4">The color your design will be painted in</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {PAINT_COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setPaintColor(c)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl font-semibold transition-all"
                style={{
                  border: `3px solid ${paintColor?.name === c.name ? tierColor : '#e5e7eb'}`,
                  backgroundColor: paintColor?.name === c.name ? `${tierColor}10` : '#ffffff',
                  minWidth: '60px',
                }}
              >
                <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <path d="M14 2 C14 2, 2 16, 2 24 C2 30.627 7.373 36 14 36 C20.627 36 26 30.627 26 24 C26 16, 14 2 14 2 Z"
                    fill={c.hex || 'url(#paintGrad)'}
                    stroke="rgba(0,0,0,0.15)"
                    strokeWidth="1"
                  />
                  {!c.hex && (
                    <defs>
                      <linearGradient id="paintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="50%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                  )}
                  <ellipse cx="10" cy="22" rx="3" ry="2" fill="rgba(255,255,255,0.25)" transform="rotate(-20 10 22)" />
                </svg>
                <span className="text-xs text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
          {paintColor?.name === 'Custom' && (
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-semibold">Custom color:</label>
              <input type="color" value={customPaintHex} onChange={e => setCustomPaintHex(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
              <span className="text-sm font-mono text-gray-600">{customPaintHex}</span>
            </div>
          )}

          <button
            onClick={() => { setHasSecondColor(v => !v); if (hasSecondColor) setSecondPaintColor(null); }}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all"
            style={{
              borderColor: hasSecondColor ? tierColor : '#e5e7eb',
              backgroundColor: hasSecondColor ? `${tierColor}10` : '#f9fafb',
              color: hasSecondColor ? tierColor : '#6b7280',
            }}
          >
            🎨 {hasSecondColor ? '✓ 2nd Paint Color Added' : 'Add a 2nd Paint Color (optional)'}
          </button>

          {hasSecondColor && (
            <div className="mt-4 pl-4 border-l-4" style={{ borderColor: tierColor }}>
              <p className="text-sm font-semibold mb-3 text-gray-600">2nd Paint Color:</p>
              <div className="flex flex-wrap gap-3 mb-3">
                {PAINT_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSecondPaintColor(c)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl font-semibold transition-all"
                    style={{
                      border: `2px solid ${secondPaintColor?.name === c.name ? tierColor : '#e5e7eb'}`,
                      backgroundColor: secondPaintColor?.name === c.name ? `${tierColor}10` : '#ffffff',
                      minWidth: '56px',
                    }}
                  >
                    <svg width="24" height="30" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                      <path d="M14 2 C14 2, 2 16, 2 24 C2 30.627 7.373 36 14 36 C20.627 36 26 30.627 26 24 C26 16, 14 2 14 2 Z"
                        fill={c.hex || 'url(#paintGrad2)'}
                        stroke="rgba(0,0,0,0.15)"
                        strokeWidth="1"
                      />
                      {!c.hex && (
                        <defs>
                          <linearGradient id="paintGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="50%" stopColor="#4ade80" />
                            <stop offset="100%" stopColor="#60a5fa" />
                          </linearGradient>
                        </defs>
                      )}
                      <ellipse cx="10" cy="22" rx="3" ry="2" fill="rgba(255,255,255,0.25)" transform="rotate(-20 10 22)" />
                    </svg>
                    <span className="text-xs text-center leading-tight">{c.name}</span>
                  </button>
                ))}
              </div>
              {secondPaintColor?.name === 'Custom' && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold">Custom color:</label>
                  <input type="color" value={customSecondHex} onChange={e => setCustomSecondHex(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
                  <span className="text-sm font-mono text-gray-600">{customSecondHex}</span>
                </div>
              )}
            </div>
          )}
        </section></BuilderStep>}

        <StepConnector color={tierColor} active={isSquares ? !!paintColor : !!paintColor} />

        {/* STEP 5: Upload Design */}
        <BuilderStep visible={isSquares ? !!paintColor : !!paintColor} color={tierColor} scrollOnAppear>
        <section>
          <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>{isSquares ? '4' : '5'}. Upload Your Design</h2>
          <p className="text-sm text-gray-500 mb-4">
            {isSquares
              ? 'Upload a photo, logo, or artwork — it will be traced and painted across your tile grid.'
              : 'Upload a photo, logo, or artwork — use the filter tabs to trace it into a clean line drawing.'}
          </p>
          <DesignUploader
            tierColor={tierColor}
            onImageReady={(url) => { setImageUrl(url); }}
            onProcessedImageReady={(dataUrl, mode) => { setStencilDataUrl(dataUrl); setStencilMode(mode); setPreviewUrl(null); }}
            onClear={() => { setImageUrl(null); setStencilDataUrl(null); setStencilMode(null); setPreviewUrl(null); }}
          />
        </section>
        </BuilderStep>

        <StepConnector color={tierColor} active={!!imageUrl} />

        {/* STEP 6: Design Notes */}
        <BuilderStep visible={!!imageUrl} color={tierColor} scrollOnAppear>
        <section>
          <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>{isSquares ? '5' : '6'}. Additional Instructions (Optional)</h2>
          <p className="text-sm text-gray-500 mb-4">These go directly to the AI preview and to our artists — be as specific as you like.</p>
          <textarea
            value={designInstructions}
            onChange={e => setDesignInstructions(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-gray-400 resize-none"
            rows={4}
            placeholder="e.g. 'Keep all text exactly as shown', 'The logo should take up 80% of the rug', 'Use gold only for the border', 'Make the background black not gray'"
          />
        </section>
        </BuilderStep>

        <StepConnector color={tierColor} active={!!imageUrl} />

        {/* GENERATE BUTTON */}
        <BuilderStep visible={!!imageUrl} color={tierColor}>
        <section>
          <button
            onClick={() => generatePreviewRef.current?.()}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-3 font-black text-white py-5 rounded-2xl text-2xl transition-all"
            style={{
              backgroundColor: canGenerate ? tierColor : '#d1d5db',
              cursor: canGenerate ? 'pointer' : 'not-allowed',
              fontFamily: 'Barlow Condensed, sans-serif',
              opacity: canGenerate ? 1 : 0.6,
            }}
          >
            <Sparkles className="w-6 h-6" />
            Generate Image
          </button>
          {!canGenerate && (
            <p className="text-center text-sm text-gray-400 mt-2">
              Complete steps 1–5 above to generate your AI preview
            </p>
          )}
        </section>
        </BuilderStep>

        {/* AI PREVIEW */}
        <section>
          <h2 className="text-2xl font-black mb-3" style={{ color: '#343634' }}>Your AI Preview</h2>
          {isSquares ? (
            <SquaresPreviewGenerator
              gridData={squaresGridData}
              stencilDataUrl={stencilDataUrl}
              designInstructions={designInstructions}
              tierColor={tierColor}
              generateRef={generatePreviewRef}
              onPreviewGenerated={setPreviewUrl}
            />
          ) : (
            <RugPreviewGenerator
              config={previewConfig}
              tier={tier}
              sizeObj={size}
              BASE_COLORS={BASE_COLORS}
              onPreviewGenerated={setPreviewUrl}
              designInstructions={designInstructions}
              generateRef={generatePreviewRef}
            />
          )}

          {/* Inline CTA */}
          {isComplete && tier?.id !== 'rugly_lx' && (
            <div className="mt-6 rounded-2xl p-6 text-center" style={{ backgroundColor: `${tierColor}12`, border: `2px solid ${tierColor}` }}>
              <div className="text-lg font-black mb-1" style={{ color: tierColor, fontFamily: 'Barlow Condensed, sans-serif' }}>
                ✓ {isSquares ? 'Your tile order is ready!' : 'Your rug is ready to order!'}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {isSquares
                  ? `${squaresGridData.totalTiles} tiles · ${squaresGridData.totalSqFt} sq ft · $${price} · ${tier.shipping}`
                  : `${tier.label} · ${size.label} · $${price} · ${tier.shipping}`}
              </div>
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-3 mx-auto font-black text-white px-10 py-4 rounded-2xl text-xl transition-all hover:opacity-90"
                style={{ backgroundColor: tierColor, fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart — ${price}
              </button>
            </div>
          )}

          {/* Quote Request Form for Rugly LX and Squares */}
          {isComplete && (tier?.id === 'rugly_lx' || isSquares) && (
            <div className="mt-6">
              <QuoteRequestForm
                tierColor={tierColor}
                quoteData={{
                  design_type: isSquares ? 'squares' : 'rug',
                  tier_id: tier.id,
                  tier_label: tier.label,
                  size_label: isSquares ? `${squaresGridData.cols}×${squaresGridData.rows} tiles` : (size?.label || ''),
                  size_measurement: isSquares ? `${squaresGridData.cols * 2}'×${squaresGridData.rows * 2}'` : (size?.measurement || ''),
                  base_color_name: baseColor?.name || '',
                  base_color_hex: baseColor?.hex || '',
                  paint_color_name: paintColor?.name || '',
                  paint_color_hex: paintHex || '',
                  has_second_color: hasSecondColor,
                  second_paint_color_name: hasSecondColor ? (secondPaintColor?.name || '') : '',
                  second_paint_color_hex: hasSecondColor ? secondHex : '',
                  image_url: imageUrl || '',
                  ai_preview_url: previewUrl || '',
                  design_instructions: designInstructions,
                  squares_grid_data: isSquares ? squaresGridData : null,
                  estimated_price: price,
                }}
              />
            </div>
          )}
        </section>

      </div>

      {/* Sticky CTA bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 px-4 py-3 flex items-center justify-between gap-4"
        style={{ borderColor: isComplete ? tierColor : '#e5e7eb' }}
      >
        <div className="flex-shrink-0">
          {tier && (isSquares ? squaresGridData : size) ? (
            <div>
              <div className="text-2xl font-black" style={{ color: tierColor }}>${price}</div>
              <div className="text-xs text-gray-500">
                {isSquares
                  ? `${squaresGridData?.totalTiles || 0} tiles · ${squaresGridData?.totalSqFt || 0} sq ft`
                  : `${tier.label} · ${size.label}${tier.depositOnly ? ' · $100 deposit' : ''}`}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Select options above</div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 flex-1 justify-center">
          {!tier && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Category</span>}
          {isSquares ? (
            <>
              {(!squaresGridData || squaresGridData.totalTiles === 0) && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Grid</span>}
              {!imageUrl && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Design</span>}
            </>
          ) : (
            <>
              {!size && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Size</span>}
              {!baseColor && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Base Color</span>}
              {!paintColor && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Paint Color</span>}
              {!imageUrl && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Design</span>}
            </>
          )}
          {isComplete && <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ backgroundColor: `${tierColor}20`, color: tierColor }}>✓ Ready!</span>}
        </div>

        {(tier?.id === 'rugly_lx' || isSquares) ? (
          <button
            disabled={!isComplete}
            onClick={() => document.querySelector('[data-quote-form]')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 font-black text-white px-8 py-4 rounded-2xl text-lg transition-all flex-shrink-0"
            style={{
              backgroundColor: isComplete ? tierColor : '#d1d5db',
              cursor: isComplete ? 'pointer' : 'not-allowed',
              fontFamily: 'Barlow Condensed, sans-serif',
            }}
          >
            {isComplete ? '↓ Request Quote' : 'Complete Above'}
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!isComplete}
            className="flex items-center gap-2 font-black text-white px-8 py-4 rounded-2xl text-lg transition-all flex-shrink-0"
            style={{
              backgroundColor: isComplete ? tierColor : '#d1d5db',
              cursor: isComplete ? 'pointer' : 'not-allowed',
              fontFamily: 'Barlow Condensed, sans-serif',
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            {isComplete ? 'Add to Cart' : 'Complete Above'}
          </button>
        )}
      </div>
    </div>
  );
}