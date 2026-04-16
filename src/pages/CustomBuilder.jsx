import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Palette, Package, Clock, Sparkles, ShoppingCart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import DesignLibrary from '../components/custom/DesignLibrary';
import SEOHead from '../components/seo/SEOHead';

const QUALITY_TIERS = [
  {
    id: 'budget',
    label: 'Crugly',
    subtitle: 'Budget-Friendly',
    priceMultiplier: 0.7,
    materialDetail: 'Synthetic non-slip floor covering',
    timeline: '10-14 days + FREE ship',
    maxColors: 2,
    color: '#24f0a0',
    images: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/fe7898922_image.png'
    ]
  },
  {
    id: 'good',
    label: 'Rugly',
    subtitle: 'Most Popular',
    priceMultiplier: 1.0,
    materialDetail: 'Durable Cotton, Synthetic Rabbit Fur',
    timeline: '10-20 days',
    maxColors: 4,
    color: '#4075ff',
    images: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/701415d98_image.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/5c6bbc6d6_Screenshot2026-02-14at113505.png'
    ]
  },
  {
    id: 'highend',
    label: 'Rugly Lux',
    subtitle: 'Luxury & Commercial',
    priceMultiplier: 1.25,
    materialDetail: 'Shag, jute, or luxury materials',
    timeline: '2-4 weeks',
    maxColors: 999,
    color: '#f04624',
    images: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/4d348899c_image.png',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/5074422ce_JPEGimage-4993-99AB-1A-0.jpg'
    ]
  }
];

const SIZES = [
  { id: 'tiny', label: 'Tiny', value: 'tiny', price: 79, measurement: '2×3 ft' },
  { id: 'sm', label: 'Small', value: 'small', price: 139, measurement: '4×6 ft' },
  { id: 'md', label: 'Medium', value: 'medium', price: 199, measurement: '5×7 ft' },
  { id: 'lg', label: 'Large', value: 'large', price: 259, measurement: '8×10 ft' },
  { id: 'hg', label: 'Huge', value: 'huge', price: 319, measurement: '9×11 ft' },
  { id: 'rd', label: 'Round', value: '4ft round', price: 159, measurement: '4 ft round' }
];

const BASE_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Yellow', hex: '#f4d03f' },
  { name: 'Pink', hex: '#f8c9d4' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Green', hex: '#86cb92' },
  { name: 'Burnt Orange', hex: '#cc5500' },
  { name: 'Khaki', hex: '#c3b091' }
];

const PAINT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Red', hex: '#dc143c' },
  { name: 'Blue', hex: '#2e5090' },
  { name: 'Bright Green', hex: '#00a651' },
  { name: 'Sun Yellow', hex: '#ffd700' },
  { name: 'Bright Orange', hex: '#ff4500' },
  { name: 'Violet', hex: '#7851a9' },
  { name: 'Emerald', hex: '#046307' },
  { name: 'Crimson', hex: '#c8102e' },
  { name: 'Purple', hex: '#5b3a70' },
  { name: 'Vermillion', hex: '#ff4500' }
];

const STEPS = ['Quality', 'Size', 'Colors', 'Design'];

export default function CustomBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    qualityTier: '',
    size: '',
    baseColor: '',
    paintColor: '',
    secondPaintColor: '',
    imageUrl: '',
    hasSecondColor: false
  });
  const [uploading, setUploading] = useState(false);
  const [designSource, setDesignSource] = useState('upload'); // 'upload' | 'library'

  const tier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
  const sizeObj = SIZES.find(s => s.value === config.size);
  const tierColor = tier?.color || '#4075ff';

  const currentPrice = () => {
    if (!sizeObj || !tier) return 0;
    return Math.round(sizeObj.price * tier.priceMultiplier);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setConfig(prev => ({ ...prev, imageUrl: file_url }));
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      type: 'custom',
      qualityTier: config.qualityTier,
      qualityLabel: tier.label,
      materialDetail: tier.materialDetail,
      size: sizeObj.label,
      baseColor: config.baseColor,
      paintColor: config.paintColor,
      secondPaintColor: config.secondPaintColor || null,
      imageUrl: config.imageUrl,
      previewUrl: config.imageUrl,
      hasSecondColor: config.hasSecondColor,
      designInstructions: '',
      price: currentPrice(),
      name: `Custom ${tier.label} Rug — ${sizeObj.label}`
    };
    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    navigate(createPageUrl('Cart'));
  };

  const canProceed = () => {
    if (step === 1) return !!config.qualityTier;
    if (step === 2) return !!config.size;
    if (step === 3) return !!config.baseColor && !!config.paintColor;
    if (step === 4) return !!config.imageUrl;
    return false;
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Custom Rug Builder | Design Your Own Hand-Painted Rug | Rugly Floor"
        description="Design your own custom hand-painted rug in 4 steps. Choose quality, size, colors, and upload your design. Preview before you pay."
        url="/CustomBuilder"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => i + 1 < step && setStep(i + 1)}
                  className="flex items-center gap-1"
                  disabled={i + 1 >= step}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      backgroundColor: step > i + 1 ? tierColor : step === i + 1 ? tierColor : '#e5e7eb',
                      color: step >= i + 1 ? '#fff' : '#9ca3af'
                    }}
                  >
                    {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium" style={{ color: step === i + 1 ? tierColor : '#9ca3af' }}>
                    {s}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="w-4 h-px mx-1" style={{ backgroundColor: step > i + 1 ? tierColor : '#e5e7eb' }} />
                )}
              </React.Fragment>
            ))}
          </div>
          {config.qualityTier && config.size && (
            <div className="text-right">
              <div className="text-xs text-gray-500">{tier?.label} · {sizeObj?.measurement}</div>
              <div className="text-lg font-black" style={{ color: tierColor }}>${currentPrice()}</div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* STEP 1: Quality */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-black text-center mb-2">Choose Your Quality</h1>
            <p className="text-center text-gray-500 mb-8 text-sm">Tap a tier to continue</p>
            <div className="grid gap-4">
              {QUALITY_TIERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setConfig(prev => ({ ...prev, qualityTier: t.id })); setStep(2); }}
                  className="w-full text-left rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2"
                  style={{ borderColor: t.color }}
                >
                  <div className="p-4 text-white flex items-center justify-between" style={{ backgroundColor: t.color }}>
                    <div>
                      <div className="text-2xl font-black">{t.label}</div>
                      <div className="text-sm opacity-90">{t.subtitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black">
                        {t.id === 'budget' ? '$55+' : t.id === 'good' ? '$79+' : '$110+'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-3 flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600"><Palette className="w-4 h-4" />{t.maxColors === 999 ? 'Unlimited colors' : `Up to ${t.maxColors} colors`}</span>
                    <span className="flex items-center gap-1 text-gray-600"><Package className="w-4 h-4" />{t.materialDetail}</span>
                    <span className="flex items-center gap-1 text-gray-600"><Clock className="w-4 h-4" />{t.timeline}</span>
                  </div>
                  {/* Material images */}
                  <div className="flex h-24">
                    {t.images.map((img, i) => (
                      <img key={i} src={img} alt={t.label} className="flex-1 object-cover" style={{ width: `${100 / t.images.length}%` }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Size */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-black text-center mb-2">Pick Your Size</h2>
            <p className="text-center text-gray-500 mb-8 text-sm">Price shown for <strong>{tier?.label}</strong></p>

            {/* Size reference diagram */}
            <div className="mb-6 p-4 rounded-xl bg-gray-50 border text-center text-xs text-gray-500">
              <div className="flex justify-center gap-8 mb-2">
                <div>🛋️ Sofa: 5×7 or 8×10</div>
                <div>🛏️ Bed (queen): 8×10 or 9×11</div>
              </div>
              <div>Entry / accent: Tiny 2×3</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SIZES.map(s => {
                const price = Math.round(s.price * (tier?.priceMultiplier || 1));
                return (
                  <button
                    key={s.id}
                    onClick={() => { setConfig(prev => ({ ...prev, size: s.value })); setStep(3); }}
                    className="rounded-2xl p-5 text-center border-2 hover:shadow-lg transition-all bg-white"
                    style={{ borderColor: config.size === s.value ? tierColor : '#e5e7eb' }}
                  >
                    <div className="text-4xl font-black mb-1" style={{ color: tierColor }}>{s.id === 'rd' ? 'π' : s.label[0]}</div>
                    <div className="font-bold text-lg">{s.label}</div>
                    <div className="text-xs text-gray-500 mb-2">{s.measurement}</div>
                    <div className="text-2xl font-black" style={{ color: tierColor }}>${price}</div>
                  </button>
                );
              })}
            </div>

            <button onClick={() => setStep(1)} className="mt-6 text-sm text-gray-400 hover:text-gray-600 block mx-auto">← Back</button>
          </div>
        )}

        {/* STEP 3: Colors */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl font-black text-center mb-2">Choose Colors</h2>
            <p className="text-center text-gray-500 mb-8 text-sm">Base rug color + paint color</p>

            {/* Base Color */}
            <div className="mb-6">
              <div className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-black" style={{ backgroundColor: tierColor }}>1</span>
                Rug Base Color
              </div>
              <div className="grid grid-cols-4 gap-3">
                {BASE_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setConfig(prev => ({ ...prev, baseColor: c.name }))}
                    className="p-2 rounded-xl border-2 transition-all"
                    style={{ borderColor: config.baseColor === c.name ? tierColor : '#e5e7eb' }}
                  >
                    <div className="w-full aspect-square rounded-lg border border-gray-200 mb-1" style={{ backgroundColor: c.hex }} />
                    <div className="text-xs text-center font-medium">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paint Color */}
            <div className="mb-6">
              <div className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-black" style={{ backgroundColor: tierColor }}>2</span>
                Paint Color
              </div>
              <div className="grid grid-cols-4 gap-3">
                {PAINT_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setConfig(prev => ({ ...prev, paintColor: c.name }))}
                    className="p-2 rounded-xl border-2 transition-all"
                    style={{ borderColor: config.paintColor === c.name ? tierColor : '#e5e7eb' }}
                  >
                    <div
                      className="w-full aspect-square rounded-lg border border-gray-200 mb-1"
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: c.name === 'White' ? 'inset 0 0 0 1px #d1d5db' : 'none'
                      }}
                    />
                    <div className="text-xs text-center font-medium">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional 2nd color */}
            <div className="mb-8">
              <button
                onClick={() => setConfig(prev => ({ ...prev, hasSecondColor: !prev.hasSecondColor, secondPaintColor: '' }))}
                className="w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between"
                style={{ borderColor: config.hasSecondColor ? tierColor : '#e5e7eb', backgroundColor: config.hasSecondColor ? `${tierColor}10` : 'white' }}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" style={{ color: tierColor }} />
                  <div>
                    <div className="font-semibold text-sm">Add 2nd Paint Color</div>
                    <div className="text-xs text-gray-500">Optional +$30</div>
                  </div>
                </div>
                <div className="font-bold text-sm" style={{ color: tierColor }}>{config.hasSecondColor ? '✓ On' : '+ Add'}</div>
              </button>

              {config.hasSecondColor && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {PAINT_COLORS.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setConfig(prev => ({ ...prev, secondPaintColor: c.name }))}
                      className="p-2 rounded-xl border-2 transition-all"
                      style={{ borderColor: config.secondPaintColor === c.name ? tierColor : '#e5e7eb' }}
                    >
                      <div className="w-full aspect-square rounded-lg border border-gray-200 mb-1" style={{ backgroundColor: c.hex }} />
                      <div className="text-xs text-center font-medium">{c.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="text-sm text-gray-400 hover:text-gray-600 px-4 py-3 rounded-xl border">← Back</button>
              <Button
                onClick={() => setStep(4)}
                disabled={!config.baseColor || !config.paintColor || (config.hasSecondColor && !config.secondPaintColor)}
                className="flex-1 text-white font-black text-lg py-6"
                style={{ backgroundColor: tierColor, border: 'none' }}
              >
                Choose Design →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Design + Preview + Cart */}
        {step === 4 && (
          <div>
            <h2 className="text-3xl font-black text-center mb-2">Upload Your Design</h2>
            <p className="text-center text-gray-500 mb-6 text-sm">Upload an image or pick from our library</p>

            {/* Source toggle */}
            <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor: tierColor }}>
              <button
                onClick={() => setDesignSource('upload')}
                className="flex-1 py-3 font-bold text-sm transition-all"
                style={{ backgroundColor: designSource === 'upload' ? tierColor : 'white', color: designSource === 'upload' ? 'white' : tierColor }}
              >
                <Upload className="w-4 h-4 inline mr-2" />Upload Image
              </button>
              <button
                onClick={() => setDesignSource('library')}
                className="flex-1 py-3 font-bold text-sm transition-all"
                style={{ backgroundColor: designSource === 'library' ? tierColor : 'white', color: designSource === 'library' ? 'white' : tierColor }}
              >
                Browse Library
              </button>
            </div>

            {designSource === 'upload' && (
              <label
                className="block w-full border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer hover:opacity-80 transition-all mb-6"
                style={{ borderColor: tierColor, backgroundColor: `${tierColor}08` }}
              >
                <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: tierColor }} />
                <div className="font-bold text-lg mb-1" style={{ color: tierColor }}>
                  {uploading ? 'Uploading...' : config.imageUrl ? 'Change Image' : 'Upload Your Design'}
                </div>
                <div className="text-xs text-gray-500">PNG, JPG, SVG — any design works</div>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            )}

            {designSource === 'library' && (
              <div className="mb-6">
                <DesignLibrary
                  onSelectDesign={(url) => setConfig(prev => ({ ...prev, imageUrl: url }))}
                />
              </div>
            )}

            {/* Preview */}
            {config.imageUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden border-4" style={{ borderColor: tierColor }}>
                <img src={config.imageUrl} alt="Your design" className="w-full max-h-80 object-contain bg-gray-50" />
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${tierColor}10` }}>
                      <div className="text-xs text-gray-500">Quality</div>
                      <div className="font-bold" style={{ color: tierColor }}>{tier?.label}</div>
                    </div>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${tierColor}10` }}>
                      <div className="text-xs text-gray-500">Size</div>
                      <div className="font-bold" style={{ color: tierColor }}>{sizeObj?.measurement}</div>
                    </div>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${tierColor}10` }}>
                      <div className="text-xs text-gray-500">Colors</div>
                      <div className="flex items-center justify-center gap-1">
                        {config.baseColor && <span className="w-4 h-4 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: BASE_COLORS.find(c => c.name === config.baseColor)?.hex }} />}
                        {config.paintColor && <span className="w-4 h-4 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: PAINT_COLORS.find(c => c.name === config.paintColor)?.hex }} />}
                        {config.secondPaintColor && <span className="w-4 h-4 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: PAINT_COLORS.find(c => c.name === config.secondPaintColor)?.hex }} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guarantees */}
            <div className="text-xs text-gray-500 text-center mb-4 space-y-1">
              <div>✓ Digital preview sent before we paint</div>
              <div>✓ Free shipping on Crugly · Flat rate on Rugly</div>
              <div>✓ 30-day satisfaction guarantee</div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!config.imageUrl}
              className="w-full text-white font-black text-xl py-8 rounded-2xl"
              style={{ backgroundColor: tierColor, border: 'none', minHeight: '64px', opacity: config.imageUrl ? 1 : 0.4 }}
            >
              <ShoppingCart className="w-6 h-6 mr-2" />
              Add to Cart — ${currentPrice()}
            </Button>

            <button onClick={() => setStep(3)} className="mt-4 text-sm text-gray-400 hover:text-gray-600 block mx-auto">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}