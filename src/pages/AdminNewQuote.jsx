import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminProtected from '@/components/AdminProtected';
import DesignUploader from '@/components/builder/DesignUploader';
import RugPreviewGenerator from '@/components/custom/RugPreviewGenerator';
import SquaresTileGrid from '@/components/builder/SquaresTileGrid';
import SquaresPreviewGenerator from '@/components/builder/SquaresPreviewGenerator';
import StepConnector from '@/components/builder/StepConnector';
import BuilderStep from '@/components/builder/BuilderStep';
import { ArrowLeft, Sparkles, Send, Loader2, CreditCard } from 'lucide-react';

// ── color/tier data (mirrors CustomBuilder) ──────────────────────────────────
const BASE_COLORS_CRUGLY = [
  { name: 'White', hex: '#F5F5F5' }, { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1A2A4A' }, { name: 'Ivory', hex: '#E8E4DC' },
  { name: 'Gray', hex: '#A0A0A0' },
  { name: 'Snowsand', hex: '#D8D4C8', imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/b0a28ee97_generated_image.png' },
];
const BASE_COLORS_RUGLY = [
  { name: 'White', hex: '#F5F5F5' }, { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1A2A4A' }, { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Light Gray', hex: '#C8C8C8' }, { name: 'Medium Gray', hex: '#8A8A8A' },
  { name: 'Tan', hex: '#B8A080' }, { name: 'Sage', hex: '#8A9A7A' },
  { name: 'Lavender', hex: '#9A8AB0' }, { name: 'Dusty Rose', hex: '#C09090' },
  { name: 'Snow Grey', hex: '#E8E8E4', imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/bb7173294_generated_image.png', availableSizes: ['4x6','5x7','6x9','9x12'] },
  { name: 'Stormy Dan', hex: '#7A7A7A', imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/4c8bb707d_generated_image.png', availableSizes: ['4x6','5x7','6x9','9x12'] },
  { name: 'Wicker', hex: '#8B6347', imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/25563b160_generated_image.png', availableSizes: ['4x6','5x7','6x9','9x12'] },
  { name: 'Neptune', hex: '#5A6A7A', imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/12f287ff4_generated_image.png', availableSizes: ['4x6','5x7','6x9','9x12'] },
  { name: 'Tusk', hex: '#EDE8DC', imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/609befe57_generated_image.png', availableSizes: ['4x6','5x7','6x9','9x12'] },
];
const BASE_COLORS_RUGLY_LX = [
  { name: 'White', hex: '#F5F5F5' }, { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1A2A4A' }, { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Light Gray', hex: '#C8C8C8' }, { name: 'Tan', hex: '#B8A080' },
  { name: 'Wicked', hex: '#B0B0AA', imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/b29ecd00e_generated_image.png', availableSizes: ['4x6','5x7','9x12'] },
  { name: 'Storm', hex: '#7A7A7A', imageUrl: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/e1b8a0838_generated_image.png', availableSizes: ['4x6','5x7','9x12'] },
];
const PAINT_COLORS = [
  { name: 'Black', hex: '#1A1A1A' }, { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#CC2200' }, { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Gold', hex: '#C9A84C' }, { name: 'Forest Green', hex: '#2D5A27' },
  { name: 'Burgundy', hex: '#7A1B2A' }, { name: 'Royal Blue', hex: '#2850A0' },
  { name: 'Orange', hex: '#D4581A' }, { name: 'Purple', hex: '#5C2D7A' },
  { name: 'Teal', hex: '#1A6B6B' }, { name: 'Brown', hex: '#5C3A1E' },
  { name: 'Custom', hex: null },
];
const QUALITY_TIERS = [
  { id: 'squares', label: 'Squares', tagline: 'Custom tile installation', description: 'Custom-painted carpet or smooth squares.', color: '#f04624', shipping: 'FREE shipping', eta: '14–21 business days' },
  { id: 'crugly', label: 'Crugly', tagline: 'Best value · Most popular', description: 'Hand-painted on a quality base rug.', color: '#24f0a0', prices: {'2x3':79,'3x5':119,'4x6':149,'5x7':189,'6x9':239}, shipping: 'FREE shipping', eta: '10–14 business days' },
  { id: 'rugly', label: 'Rugly', tagline: 'Premium quality', description: 'Thicker pile, richer colors, premium base rug.', color: '#4075ff', prices: {'2x3':129,'3x5':199,'4x6':259,'5x7':329,'6x9':419,'9x12':599}, shipping: '$15–$50 shipping', eta: '14–21 business days' },
  { id: 'rugly_lx', label: 'Rugly LX', tagline: 'Luxury · Commission', description: 'Top-of-line materials, artist-level detail.', color: '#343634', prices: {'2x3':249,'3x5':399,'4x6':549,'5x7':699,'6x9':899,'9x12':1299}, shipping: 'Shipping quoted at completion', eta: '3–6 weeks' },
];
const SIZES = [
  { id: '2x3', label: "2' × 3'", measurement: "2' × 3'" },
  { id: '3x5', label: "3' × 5'", measurement: "3' × 5'" },
  { id: '4x6', label: "4' × 6'", measurement: "4' × 6'" },
  { id: '5x7', label: "5' × 7'", measurement: "5' × 7'" },
  { id: '6x9', label: "6' × 9'", measurement: "6' × 9'" },
  { id: '9x12', label: "9' × 12'", measurement: "9' × 12'" },
];

export default function AdminNewQuote() {
  const navigate = useNavigate();

  // Design state (mirrors CustomBuilder)
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
  const [squaresGridData, setSquaresGridData] = useState(null);
  const generatePreviewRef = useRef(null);

  // Billing state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [sendMode, setSendMode] = useState('save'); // 'save' | 'send'

  const isSquares = tier?.id === 'squares';
  const baseColorOptions = tier?.id === 'rugly_lx' ? BASE_COLORS_RUGLY_LX : tier?.id === 'rugly' ? BASE_COLORS_RUGLY : BASE_COLORS_CRUGLY;
  const availableSizes = baseColor?.availableSizes
    ? SIZES.filter(s => baseColor.availableSizes.includes(s.id))
    : SIZES.filter(s => tier?.id !== 'crugly' || s.id !== '9x12');
  const paintHex = paintColor?.name === 'Custom' ? customPaintHex : (paintColor?.hex || null);
  const secondHex = secondPaintColor?.name === 'Custom' ? customSecondHex : (secondPaintColor?.hex || null);
  const tierColor = tier?.color || '#4075ff';
  const squaresPrice = squaresGridData?.price || 0;
  const squaresGridPainted = !!(squaresGridData?.grid?.some(row => row.some(c => c !== '#F5F5F5')));
  const estimatedPrice = isSquares ? squaresPrice : (tier && size ? (tier.prices?.[size.id] || 0) : 0);
  const canGenerate = isSquares ? (!!stencilDataUrl && !!squaresGridData) : (!!stencilDataUrl && !!baseColor && !!paintColor);
  const designReady = isSquares
    ? (!!squaresGridData && !!imageUrl)
    : (!!tier && !!size && !!baseColor && !!paintColor && !!imageUrl);

  const previewConfig = { imageUrl, stencilDataUrl, stencilMode, baseColor: baseColor?.name || null, paintColorHex: paintHex, hasSecondColor, secondPaintColorHex: hasSecondColor ? secondHex : null };

  const handleSubmit = async (mode) => {
    if (!customerName || !customerEmail) return alert('Customer name and email are required.');
    setSubmitting(true);
    setSendMode(mode);

    const quoteData = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      design_type: isSquares ? 'squares' : 'rug',
      tier_id: tier?.id || '',
      tier_label: tier?.label || '',
      size_label: isSquares ? `${squaresGridData?.cols}×${squaresGridData?.rows} tiles` : (size?.label || ''),
      size_measurement: isSquares ? `${(squaresGridData?.cols || 0) * 2}'×${(squaresGridData?.rows || 0) * 2}'` : (size?.measurement || ''),
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
      estimated_price: estimatedPrice,
      quoted_price: quotedPrice ? parseFloat(quotedPrice) : undefined,
      admin_notes: adminNotes,
      status: quotedPrice ? 'quoted' : 'pending',
    };

    try {
      const created = await base44.entities.DesignQuote.create(quoteData);

      if (mode === 'send' && quotedPrice && parseFloat(quotedPrice) > 0) {
        const res = await base44.functions.invoke('sendQuoteWithPayment', { quote_id: created.id });
        if (res.data?.success) {
          alert(`✅ Quote created & sent to ${customerEmail} with Stripe Pay Now link!`);
        } else {
          alert('Quote created but email failed: ' + (res.data?.error || 'Unknown error'));
        }
      } else {
        alert('✅ Quote saved successfully!');
      }
      navigate('/AdminQuotes');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-40">
          <button onClick={() => navigate('/AdminQuotes')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <h1 className="text-2xl font-black" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#343634' }}>
            Create New Quote
          </h1>
          <span className="text-xs text-gray-400 ml-1">(Admin)</span>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

          {/* ── STEP 1: Quality ── */}
          <section>
            <h2 className="text-2xl font-black mb-4" style={{ color: '#343634' }}>1. Choose Quality</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {QUALITY_TIERS.map(t => {
                const isSelected = tier?.id === t.id;
                const isKnockedOut = !!tier && !isSelected;
                return (
                  <button key={t.id} onClick={() => { setTier(t); setBaseColor(null); setSize(null); setPaintColor(null); }}
                    className="text-left rounded-2xl border-4 w-full overflow-hidden"
                    style={{ borderColor: isSelected ? t.color : '#e5e7eb', backgroundColor: isSelected ? `${t.color}15` : '#fff', boxShadow: isSelected ? `0 6px 28px ${t.color}50` : undefined, opacity: isKnockedOut ? 0.38 : 1, transform: isSelected ? 'scale(1.04)' : isKnockedOut ? 'scale(0.95)' : 'scale(1)', transition: 'all 0.35s ease', padding: isSelected ? '20px' : '16px 20px' }}>
                    <div style={{ height: isSelected ? 5 : 3, backgroundColor: t.color, borderRadius: 3, marginBottom: 10, width: isSelected ? '100%' : '40%', transition: 'all 0.35s ease' }} />
                    <div className="font-black text-xl mb-0.5" style={{ color: t.color }}>{t.label}</div>
                    <div className="text-xs font-bold mb-1.5 text-gray-500">{t.tagline}</div>
                    <div className="text-sm text-gray-600 mb-2">{t.description}</div>
                    <div className="text-xs text-gray-500">{t.shipping} · {t.eta}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <StepConnector color={tierColor} active={!!tier} />

          {/* ── STEP 2: Size / Grid ── */}
          <BuilderStep visible={!!tier} color={tierColor} scrollOnAppear>
            <section>
              {isSquares ? (
                <>
                  <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>2. Design Your Tile Grid</h2>
                  <p className="text-sm text-gray-500 mb-4">Each tile is 24″×24″.</p>
                  <SquaresTileGrid tierColor={tierColor} onChange={setSquaresGridData} />
                  {squaresGridData && <div className="mt-3 text-sm font-bold" style={{ color: tierColor }}>{squaresGridData.totalTiles} tiles · {squaresGridData.totalSqFt} sq ft · ${squaresPrice}</div>}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black mb-4" style={{ color: '#343634' }}>2. Choose Size</h2>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map(s => (
                      <button key={s.id} onClick={() => setSize(s)}
                        className="px-5 py-3 rounded-xl font-bold transition-all"
                        style={{ border: `3px solid ${size?.id === s.id ? tierColor : '#e5e7eb'}`, backgroundColor: size?.id === s.id ? `${tierColor}15` : '#fff', color: size?.id === s.id ? tierColor : '#343634' }}>
                        <div className="text-lg">{s.label}</div>
                        {tier && <div className="text-sm font-black">${tier.prices?.[s.id] || '—'}</div>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>
          </BuilderStep>

          <StepConnector color={tierColor} active={isSquares ? !!squaresGridData?.surfaceType : !!size} />

          {/* ── STEP 3: Base Color (non-Squares) ── */}
          {!isSquares && (
            <BuilderStep visible={!!size} color={tierColor} scrollOnAppear>
              <section>
                <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>3. Rug Base Color</h2>
                <p className="text-sm text-gray-500 mb-4">The background color of the rug itself</p>
                <div className="flex flex-wrap gap-3">
                  {baseColorOptions.map(c => (
                    <button key={c.name} onClick={() => { setBaseColor(c); if (c.availableSizes && size && !c.availableSizes.includes(size.id)) setSize(null); }}
                      className="flex flex-col items-center gap-2 p-2 rounded-xl font-semibold transition-all"
                      style={{ border: `3px solid ${baseColor?.name === c.name ? tierColor : '#e5e7eb'}`, backgroundColor: baseColor?.name === c.name ? `${tierColor}10` : '#fff', minWidth: '72px' }}>
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-200" style={{ backgroundColor: c.hex }}>
                        {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-xs text-center leading-tight">{c.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            </BuilderStep>
          )}

          <StepConnector color={tierColor} active={isSquares ? !!squaresGridData : !!baseColor} />

          {/* ── STEP 4: Paint Color (rug only) ── */}
          <BuilderStep visible={!isSquares && !!baseColor} color={tierColor} scrollOnAppear>
            <section>
              <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>4. Paint Color</h2>
              <p className="text-sm text-gray-500 mb-4">The color your design will be painted in</p>
              <div className="flex flex-wrap gap-3 mb-4">
                {PAINT_COLORS.map(c => (
                  <button key={c.name} onClick={() => setPaintColor(c)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl font-semibold transition-all"
                    style={{ border: `3px solid ${paintColor?.name === c.name ? tierColor : '#e5e7eb'}`, backgroundColor: paintColor?.name === c.name ? `${tierColor}10` : '#fff', minWidth: '60px' }}>
                    <div className="w-8 h-8 rounded-full border border-gray-200" style={{ backgroundColor: c.hex || '#ccc' }} />
                    <span className="text-xs text-center leading-tight">{c.name}</span>
                  </button>
                ))}
              </div>
              {paintColor?.name === 'Custom' && (
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm font-semibold">Custom:</label>
                  <input type="color" value={customPaintHex} onChange={e => setCustomPaintHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
                  <span className="text-sm font-mono text-gray-600">{customPaintHex}</span>
                </div>
              )}
              {!isSquares && (
                <>
                  <button onClick={() => { setHasSecondColor(v => !v); if (hasSecondColor) setSecondPaintColor(null); }}
                    className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all"
                    style={{ borderColor: hasSecondColor ? tierColor : '#e5e7eb', backgroundColor: hasSecondColor ? `${tierColor}10` : '#f9fafb', color: hasSecondColor ? tierColor : '#6b7280' }}>
                    🎨 {hasSecondColor ? '✓ 2nd Color Added' : 'Add 2nd Paint Color (optional)'}
                  </button>
                  {hasSecondColor && (
                    <div className="mt-4 pl-4 border-l-4" style={{ borderColor: tierColor }}>
                      <p className="text-sm font-semibold mb-3 text-gray-600">2nd Paint Color:</p>
                      <div className="flex flex-wrap gap-3">
                        {PAINT_COLORS.map(c => (
                          <button key={c.name} onClick={() => setSecondPaintColor(c)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl font-semibold transition-all"
                            style={{ border: `2px solid ${secondPaintColor?.name === c.name ? tierColor : '#e5e7eb'}`, backgroundColor: secondPaintColor?.name === c.name ? `${tierColor}10` : '#fff', minWidth: '56px' }}>
                            <div className="w-7 h-7 rounded-full border border-gray-200" style={{ backgroundColor: c.hex || '#ccc' }} />
                            <span className="text-xs text-center leading-tight">{c.name}</span>
                          </button>
                        ))}
                      </div>
                      {secondPaintColor?.name === 'Custom' && (
                        <div className="flex items-center gap-3 mt-3">
                          <label className="text-sm font-semibold">Custom:</label>
                          <input type="color" value={customSecondHex} onChange={e => setCustomSecondHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
                          <span className="text-sm font-mono text-gray-600">{customSecondHex}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </BuilderStep>

          <StepConnector color={tierColor} active={isSquares ? !!squaresGridData : !!paintColor} />

          {/* ── STEP 5: Upload Design ── */}
          <BuilderStep visible={isSquares ? !!squaresGridData : !!paintColor} color={tierColor} scrollOnAppear>
            <section>
              <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>{isSquares ? '4' : '5'}. Upload Design</h2>
              <p className="text-sm text-gray-500 mb-4">Upload the customer's photo, logo, or artwork.</p>
              <DesignUploader
                tierColor={tierColor}
                onImageReady={url => setImageUrl(url)}
                onProcessedImageReady={(dataUrl, mode) => { setStencilDataUrl(dataUrl); setStencilMode(mode); setPreviewUrl(null); }}
                onClear={() => { setImageUrl(null); setStencilDataUrl(null); setStencilMode(null); setPreviewUrl(null); }}
              />
            </section>
          </BuilderStep>

          <StepConnector color={tierColor} active={!!imageUrl} />

          {/* ── STEP 6: Instructions ── */}
          <BuilderStep visible={!!imageUrl} color={tierColor} scrollOnAppear>
            <section>
              <h2 className="text-2xl font-black mb-1" style={{ color: '#343634' }}>{isSquares ? '5' : '6'}. Design Instructions (Optional)</h2>
              <textarea value={designInstructions} onChange={e => setDesignInstructions(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-gray-400 resize-none"
                rows={3} placeholder="e.g. 'Keep all text exactly as shown', 'Gold border only', 'Logo 80% of rug'" />
            </section>
          </BuilderStep>

          <StepConnector color={tierColor} active={!!imageUrl} />

          {/* ── GENERATE BUTTON ── */}
          <BuilderStep visible={!!imageUrl} color={tierColor}>
            <section>
              <button onClick={() => generatePreviewRef.current?.()} disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-3 font-black text-white py-5 rounded-2xl text-2xl transition-all"
                style={{ backgroundColor: canGenerate ? tierColor : '#d1d5db', cursor: canGenerate ? 'pointer' : 'not-allowed', fontFamily: 'Barlow Condensed, sans-serif', opacity: canGenerate ? 1 : 0.6 }}>
                <Sparkles className="w-6 h-6" /> Generate AI Preview
              </button>
            </section>
          </BuilderStep>

          {/* ── AI PREVIEW ── */}
          <section>
            <h2 className="text-2xl font-black mb-3" style={{ color: '#343634' }}>AI Preview</h2>
            {isSquares ? (
              <SquaresPreviewGenerator gridData={squaresGridData} stencilDataUrl={stencilDataUrl} designInstructions={designInstructions} tierColor={tierColor} generateRef={generatePreviewRef} onPreviewGenerated={setPreviewUrl} />
            ) : (
              <RugPreviewGenerator config={previewConfig} tier={tier} sizeObj={size} BASE_COLORS={BASE_COLORS_CRUGLY} onPreviewGenerated={setPreviewUrl} designInstructions={designInstructions} generateRef={generatePreviewRef} />
            )}
          </section>

          <StepConnector color={tierColor} active={designReady} />

          {/* ── STEP 7: Customer & Billing ── */}
          <BuilderStep visible={designReady} color={tierColor} scrollOnAppear>
            <section>
              <h2 className="text-2xl font-black mb-4" style={{ color: '#343634' }}>{isSquares ? '6' : '7'}. Customer & Billing</h2>
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-4">
                {/* Customer info */}
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Customer Name *</label>
                    <input value={customerName} onChange={e => setCustomerName(e.target.value)} required
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Email *</label>
                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder="jane@email.com" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Phone</label>
                    <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder="(555) 000-0000" />
                  </div>
                </div>

                {/* Price & notes */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">
                      Quoted Price ($)
                      {estimatedPrice > 0 && <span className="ml-2 font-normal text-gray-400">Est. ${estimatedPrice}</span>}
                    </label>
                    <input type="number" value={quotedPrice} onChange={e => setQuotedPrice(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder={estimatedPrice > 0 ? `e.g. ${estimatedPrice}` : 'e.g. 349'} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Admin Notes (included in email)</label>
                    <input value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder="e.g. Colors may vary slightly..." />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button onClick={() => handleSubmit('save')} disabled={submitting || !customerEmail}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                    {submitting && sendMode === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Quote Only
                  </button>
                  <button onClick={() => handleSubmit('send')} disabled={submitting || !customerEmail || !quotedPrice}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-white text-sm disabled:opacity-50 transition-all hover:opacity-90"
                    style={{ backgroundColor: '#f04624', fontFamily: 'Barlow Condensed, sans-serif' }}>
                    {submitting && sendMode === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {submitting && sendMode === 'send' ? 'Sending...' : 'Save & Send Quote + Pay Link'}
                  </button>
                </div>
                {!quotedPrice && <p className="text-xs text-gray-400">Add a quoted price to enable "Send Quote + Pay Link"</p>}
              </div>
            </section>
          </BuilderStep>

        </div>
      </div>
    </AdminProtected>
  );
}