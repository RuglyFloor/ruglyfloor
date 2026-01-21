import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CheckCircle, Pencil, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StencilCreator from '../components/custom/StencilCreator';
import { motion, AnimatePresence } from 'framer-motion';

import DrawingCanvas from '../components/custom/DrawingCanvas';
import DesignLibrary from '../components/custom/DesignLibrary';
import InteractiveRugPreview from '../components/custom/InteractiveRugPreview';
import BuilderSidebar from '../components/custom/BuilderSidebar';
import SEOHead from '../components/seo/SEOHead';
import { useSEO } from '../components/seo/useSEO';

const QUALITY_TIERS = [
  { 
    id: 'budget', 
    label: 'Budget Crugly', 
    description: 'Synthetic but effective in covering up floors, creating a cool effect, dorm rooms, kids love it.',
    priceMultiplier: 0.7,
    materialDetail: 'Synthetic, thinner non-slip floor covering that looks great',
    lifespan: '2 years with high traffic, 20+ with low',
    washable: true,
    customization: 'standard',
    priceRange: '$$'
  },
  { 
    id: 'good', 
    label: 'Standard Crugly', 
    description: 'Expect the same life-span as any ordinary rug.',
    priceMultiplier: 1.0,
    materialDetail: 'Standard rug construction',
    lifespan: 'Standard rug lifespan',
    washable: true,
    customization: 'Standard',
    priceRange: '$$$'
  },
  { 
    id: 'highend', 
    label: 'Rugly', 
    description: 'Ruglys are the cat\'s meow—you tell us what you\'re thinking and we make it happen with no limits',
    priceMultiplier: 2.5,
    materialDetail: 'Premium materials, custom hand-painted',
    lifespan: 'Premium durability',
    washable: false,
    customization: 'Limitless possibilities',
    priceRange: '$$$$'
  }
];

const SIZES = [
  { id: 'tiny', label: 'Tiny', value: 'tiny', price: 79, step: 0, measurement: '2x3' },
  { id: 'sm', label: 'Small', value: 'small', price: 200, step: 1, measurement: '4x6' },
  { id: 'md', label: 'Medium', value: 'medium', price: 300, step: 2, measurement: '5x7' },
  { id: 'lg', label: 'Large', value: 'large', price: 400, step: 3, measurement: '8x10' },
  { id: 'hg', label: 'Huge', value: 'huge', price: 500, step: 4, measurement: '9x11' },
  { id: 'rd', label: '3.14', value: '4ft round', price: 250, step: 1, measurement: '4 foot round' }
];

const getShadingFee = (size) => {
  const sizeData = SIZES.find(s => s.value === size);
  if (!sizeData) return 0;
  return 30 + (10 * sizeData.step);
};

const getSecondColorFee = (size) => {
  const sizeData = SIZES.find(s => s.value === size);
  if (!sizeData) return 0;
  return 30 + (10 * sizeData.step);
};

const BASE_COLORS = [
  { name: 'Yellow', hex: '#f4d03f', type: 'light' },
  { name: 'Pink', hex: '#f8c9d4', type: 'light' },
  { name: 'White', hex: '#ffffff', type: 'light' },
  { name: 'Burnt Orange', hex: '#cc5500', type: 'dark' },
  { name: 'Grey', hex: '#9ca3af', type: 'light' },
  { name: 'Green', hex: '#86cb92', type: 'light' },
  { name: 'Tan', hex: '#d2b48c', type: 'light' },
  { name: 'Khaki', hex: '#c3b091', type: 'light' }
];

const PAINT_COLORS_GROUP_1 = [
  { name: 'Sun Yellow', hex: '#ffd700', type: 'dark' },
  { name: 'Bright Orange', hex: '#ff4500', type: 'dark' },
  { name: 'Red', hex: '#dc143c', type: 'dark' },
  { name: 'Violet', hex: '#7851a9', type: 'dark' },
  { name: 'Blue', hex: '#2e5090', type: 'dark' },
  { name: 'Bright Green', hex: '#00a651', type: 'dark' },
  { name: 'Black', hex: '#000000', type: 'dark' },
  { name: 'White', hex: '#ffffff', type: 'dark' }
];

const PAINT_COLORS_GROUP_2 = [
  { name: 'Emerald Green', hex: '#046307', type: 'both' },
  { name: 'Crimson', hex: '#c8102e', type: 'both' },
  { name: 'Purple', hex: '#5b3a70', type: 'both' },
  { name: 'Dioxazine Purple', hex: '#1c0d82', type: 'both' },
  { name: 'Hansa Yellow', hex: '#ffd300', type: 'both' },
  { name: 'Vermillion', hex: '#ff4500', type: 'both' }
];

const PAINT_COLORS = [...PAINT_COLORS_GROUP_1, ...PAINT_COLORS_GROUP_2];

// Limited colors for mid-range and high-end tiers
const LIMITED_PAINT_COLORS = [
  { name: 'Tan', hex: '#d2b48c', type: 'both' },
  { name: 'Black', hex: '#000000', type: 'both' },
  { name: 'White', hex: '#ffffff', type: 'both' },
  { name: 'Off-White', hex: '#f5f5dc', type: 'both' }
];

export default function CustomBuilder() {
  const navigate = useNavigate();
  const seoData = useSEO('custom-builder');
  const [step, setStep] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [designMode, setDesignMode] = useState('draw'); // 'library', 'upload', or 'draw'
  const [selectedItem, setSelectedItem] = useState(null);
  const [floatingSelections, setFloatingSelections] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);
  const [config, setConfig] = useState({
    qualityTier: '',
    size: '',
    baseColor: '',
    paintColor: '',
    secondPaintColor: '',
    imageFile: null,
    imageUrl: '',
    previewUrl: '',
    numColors: 2,
    designInstructions: '',
    hasShading: false,
    hasSecondColor: false
  });

  // Debug logger
  useEffect(() => {
    console.log('CONFIG STATE:', {
      paintColor: config.paintColor,
      secondPaintColor: config.secondPaintColor,
      hasSecondColor: config.hasSecondColor
    });
  }, [config.paintColor, config.secondPaintColor, config.hasSecondColor]);
  const [uploading, setUploading] = useState(false);
  const [isRush, setIsRush] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setConfig(prev => ({ ...prev, imageFile: file, imageUrl: file_url, previewUrl: file_url }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrawingSave = async (drawingFile) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: drawingFile });
      // For drawings, use the actual drawing as both the design and preview
      setConfig(prev => ({ ...prev, imageFile: drawingFile, imageUrl: file_url, previewUrl: file_url }));
    } catch (error) {
      alert('Failed to save drawing');
    } finally {
      setUploading(false);
    }
  };



  const handleAddToCart = () => {
    const selectedSize = SIZES.find(s => s.value === config.size);
    const selectedTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
    const basePrice = Math.round(selectedSize.price * selectedTier.priceMultiplier);
    const shadingFee = config.hasShading ? getShadingFee(config.size) : 0;
    const secondColorFee = config.hasSecondColor ? getSecondColorFee(config.size) : 0;
    const rushFee = isRush ? 100 : 0;
    const price = basePrice + shadingFee + secondColorFee + rushFee;
    
    const cartItem = {
      type: 'custom',
      qualityTier: config.qualityTier,
      qualityLabel: selectedTier.label,
      materialDetail: selectedTier.materialDetail,
      size: selectedSize.label,
      baseColor: config.baseColor,
      paintColor: config.paintColor,
      secondPaintColor: config.secondPaintColor || null,
      imageUrl: config.imageUrl,
      previewUrl: config.previewUrl,
      hasShading: config.hasShading,
      hasSecondColor: config.hasSecondColor,
      designInstructions: config.designInstructions || '',
      price: price,
      name: `Custom ${selectedTier.label} Rug - ${selectedSize.label}${isRush ? ' (Rush)' : ''}`,
      isRush: isRush
    };

    const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('rugly_cart', JSON.stringify(cart));
    
    navigate(createPageUrl('Cart'));
  };

  const currentPrice = () => {
    if (!config.size || !config.qualityTier) return 0;
    const selectedSize = SIZES.find(s => s.value === config.size);
    const selectedTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
    const basePrice = Math.round(selectedSize.price * selectedTier.priceMultiplier);
    const shadingFee = config.hasShading ? getShadingFee(config.size) : 0;
    const secondColorFee = config.hasSecondColor ? getSecondColorFee(config.size) : 0;
    const rushFee = isRush ? 100 : 0;
    return basePrice + shadingFee + secondColorFee + rushFee;
  };

  const getAvailablePaintColors = () => {
    // All tiers get all paint colors - only base rug colors are limited for Standard Crugly
    return PAINT_COLORS;
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <SEOHead
        title={seoData?.seo_title || "Custom Rug Builder | Perfect Mother's Day & Father's Day Gifts"}
        description={seoData?.seo_description || "Design custom hand-painted rugs online - unique mothers day gifts, fathers day gifts, and personalized gifts for anyone. Create personalized floor art rugs with our builder. Customizable stencil rug designs, washable custom painted rugs for any space. Perfect for interior designers and homeowners."}
        keywords={seoData?.seo_keywords || ['mothers day gifts unique', 'fathers day gifts personalized', 'gifts for hard to buy for people', 'custom hand-painted rugs for interior designers', 'personalized floor art rugs', 'customizable stencil rug designs', 'custom painted washable rugs', 'hand-painted low-pile rugs for high traffic', 'personalized rugs for nursery hand-painted', 'custom painted rugs for Airbnb decor']}
        url="/custom-builder"
      />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Design Your Custom Rug</h1>
        <p className="text-center text-gray-600 mb-8">Create a one-of-a-kind piece in three simple steps</p>

        {/* Progress Indicator */}
        <div className="relative mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Quality' },
              { num: 2, label: 'Size' },
              { num: 3, label: 'Colors' },
              { num: 4, label: 'Design & Confirm' }
            ].map((s, idx) => (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step >= s.num 
                    ? 'border-4 border-gray-900 bg-white text-gray-900 shadow-lg scale-110' 
                    : 'border-2 border-gray-300 bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                </div>
                <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {idx < 3 && (
                  <div className="absolute top-6 left-0 right-0 h-0.5 -z-10" style={{ 
                    left: `${(idx * 33.33) + 16.66}%`, 
                    width: '33.33%',
                    background: step > s.num ? '#1f2937' : '#e5e7eb'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {config.previewUrl && step === 4 && (
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="border-4 border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-bold shadow-2xl"
          >
            Add to Cart - ${currentPrice()}
          </Button>
        </div>
      )}

      <div className={step >= 4 ? "grid lg:grid-cols-3 gap-8 items-start" : "max-w-7xl mx-auto"}>
          <div className={step >= 4 ? "lg:col-span-2 space-y-6" : "space-y-6"}>
            {/* Step 1: Quality Tier Selection - Comparison Table */}
            {step === 1 && (
              <div className={`space-y-6 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900">
                    Choose Your Quality Level
                  </h2>
                  <p className="text-gray-600 text-lg">Compare our quality tiers side-by-side</p>
                </div>

                {/* Comparison Table */}
                <div className="max-w-6xl mx-auto overflow-x-auto pt-6">
                  <table className="w-full border-collapse table-fixed">
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left p-4 font-semibold text-gray-700 bg-gray-50">Feature</th>
                        {QUALITY_TIERS.map((tier) => (
                          <th key={tier.id} className={`p-4 text-center relative ${
                            tier.id === 'budget' || tier.id === 'good' 
                              ? 'bg-blue-50 border-2 border-blue-500' 
                              : 'bg-gray-50'
                          }`}>
                            {(tier.id === 'budget' || tier.id === 'good') && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                                Create Your Own & See It Now!
                              </div>
                            )}
                            <button
                              onClick={() => {
                                if (tier.id === 'highend') {
                                  navigate(createPageUrl('Commission'));
                                } else {
                                  setSelectedItem(tier.id);
                                  setTransitioning(true);
                                  setConfig(prev => ({ ...prev, qualityTier: tier.id }));
                                  setTimeout(() => {
                                    setStep(2);
                                    setTransitioning(false);
                                    setSelectedItem(null);
                                  }, 700);
                                }
                              }}
                              disabled={transitioning}
                              className="font-bold text-xl text-gray-900 mt-2 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {tier.label}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 font-medium text-gray-700">Description</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.description}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Material</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.materialDetail}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 font-medium text-gray-700">Expected Lifespan</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.lifespan}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Machine Washable</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.washable ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 font-medium text-gray-700">First color included</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">2nd color</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.id === 'budget' && 'Optional'}
                            {tier.id === 'good' && 'Optional'}
                            {tier.id === 'highend' && 'Unlimited'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 font-medium text-gray-700">Backing</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.id === 'budget' && 'Material is already non-slip'}
                            {tier.id === 'good' && 'Crugly-branded non-slip material bound to the floor-facing side'}
                            {tier.id === 'highend' && 'Rugly-branded non-slip material adhered to bottom, center, sides have branded non-slip material'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 font-medium text-gray-700">Customization</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.customization}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Texture/ 3D / Bevel</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.id === 'budget' && '—'}
                            {tier.id === 'good' && 'Standard'}
                            {tier.id === 'highend' && 'Unlimited'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Time before it's on your floor</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.id === 'budget' && (
                              <div>
                                <div className="font-semibold text-gray-900">10-14 days</div>
                                <div className="text-green-600 font-bold mt-1">FREE SHIPPING!</div>
                              </div>
                            )}
                            {tier.id === 'good' && (
                              <div>
                                <div className="font-semibold text-gray-900">10-20 days</div>
                                <div className="text-gray-600 mt-1">Flat rate shipping</div>
                              </div>
                            )}
                            {tier.id === 'highend' && '—'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b-2 border-gray-300 bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Starting Price</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            <div className="text-2xl font-bold text-gray-900">
                              ${Math.round(79 * tier.priceMultiplier)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">(Tiny size)</div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4"></td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            <motion.div
                              initial={{ opacity: 1, scale: 1 }}
                              animate={
                                transitioning && selectedItem === tier.id
                                  ? { scale: 1.2, z: 50, opacity: 1 }
                                  : transitioning && selectedItem && selectedItem !== tier.id
                                  ? { 
                                      y: Math.random() > 0.5 ? -200 : 200,
                                      x: (Math.random() - 0.5) * 400,
                                      rotate: (Math.random() - 0.5) * 90,
                                      opacity: 0,
                                      scale: 0.5
                                    }
                                  : { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }
                              }
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                              <Button
                                onClick={() => {
                                  if (tier.id === 'highend') {
                                    navigate(createPageUrl('Commission'));
                                  } else {
                                    setSelectedItem(tier.id);
                                    setTransitioning(true);
                                    setConfig(prev => ({ ...prev, qualityTier: tier.id }));
                                    setTimeout(() => {
                                      setStep(2);
                                      setTransitioning(false);
                                      setSelectedItem(null);
                                    }, 700);
                                  }
                                }}
                                disabled={transitioning}
                                className={`w-full ${
                                  config.qualityTier === tier.id
                                    ? 'border-4 border-gray-900 bg-gray-900 text-white'
                                    : tier.id === 'budget' || tier.id === 'good'
                                    ? 'border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                                    : 'border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-900'
                                }`}
                              >
                                {config.qualityTier === tier.id ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Selected
                                  </>
                                ) : (
                                  tier.id === 'budget' ? 'Budget Friendly Option' :
                                  tier.id === 'good' ? 'The OG Crugly' :
                                  'GOAT Rugly'
                                )}
                              </Button>
                            </motion.div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 2: Size Selection */}
            {step === 2 && (
           <div className={`space-y-6 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 text-gray-900">
                Pick Your Perfect Size
              </h2>
              <p className="text-gray-600 text-lg">All sizes come with our signature hand-painted quality</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SIZES.map((size) => (
                <motion.button
                  key={size.id}
                  initial={{ opacity: 1, scale: 1 }}
                  animate={
                    transitioning && selectedItem === size.id
                      ? { scale: 1.3, z: 100, opacity: 1, rotateY: 360 }
                      : transitioning && selectedItem && selectedItem !== size.id
                      ? { 
                          y: Math.random() > 0.5 ? -300 : 300,
                          x: (Math.random() - 0.5) * 500,
                          rotate: (Math.random() - 0.5) * 180,
                          opacity: 0,
                          scale: 0.3
                        }
                      : { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0, rotateY: 0 }
                  }
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  onClick={() => {
                    setSelectedItem(size.id);
                    setTransitioning(true);
                    setConfig(prev => ({ ...prev, size: size.value }));
                    setTimeout(() => {
                      setStep(3);
                      setTransitioning(false);
                      setSelectedItem(null);
                    }, 800);
                  }}
                  disabled={transitioning}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    config.size === size.value 
                      ? 'border-4 border-gray-900 shadow-2xl scale-105' 
                      : 'border-2 border-gray-300 hover:border-gray-400 hover:shadow-xl hover:scale-102 shadow-md'
                  }`}
                >
                  <div className={`absolute inset-0 transition-opacity ${
                    config.size === size.value 
                      ? 'bg-white opacity-100' 
                      : 'bg-gray-50 opacity-100 group-hover:bg-white'
                  }`} />

                  <div className="relative p-8 flex flex-col items-center">
                    {config.size === size.value && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    )}

                    <div className={`w-24 h-24 mb-4 rounded-xl flex items-center justify-center transition-all ${
                      config.size === size.value 
                        ? 'border-2 border-gray-900' 
                        : 'border-2 border-gray-300'
                    }`}>
                      <div className={`text-5xl font-black ${
                        config.size === size.value ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {size.id === 'rd' ? 'π' : size.label.charAt(0)}
                      </div>
                    </div>

                    <div className={`font-bold text-2xl mb-2 ${
                      config.size === size.value ? 'text-gray-900' : 'text-gray-900'
                    }`}>
                      {size.label}
                    </div>

                    <div className={`text-sm mb-4 ${
                      config.size === size.value ? 'text-gray-600' : 'text-gray-600'
                    }`}>
                      {size.measurement}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${
                        config.size === size.value ? 'text-gray-900' : 'text-gray-900'
                      }`}>
                        ${config.qualityTier ? Math.round(size.price * QUALITY_TIERS.find(t => t.id === config.qualityTier).priceMultiplier) : size.price}
                      </span>
                    </div>
                    </div>
                    </motion.button>
                    ))}
                    </div>


                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    ← Back to Quality Selection
                  </Button>
                </div>
            </div>
          )}

          {/* Step 3.5: Paint Color Selection */}
          {step === 3.5 && (
            <Card>
              <CardHeader>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900">
                    Choose 1st Paint Color
                  </h2>
                  <p className="text-gray-600 text-lg">Select the paint color for your design</p>
                </div>
              </CardHeader>
              <CardContent>
                {/* Floating Selections Display */}
                <div className="flex justify-center gap-4 mb-8">
                  {floatingSelections.map((sel, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <div 
                        className="w-20 h-20 rounded-lg border-4 border-white shadow-2xl"
                        style={{ backgroundColor: sel.color }}
                      />
                      <div className="text-xs text-center mt-2 font-semibold">{sel.name}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Group 1</p>
                    <div className="grid grid-cols-4 gap-6">
                      {PAINT_COLORS_GROUP_1.filter(color => {
                        if (!config.baseColor) return color.type === 'dark' || color.type === 'both';
                        const selectedBase = BASE_COLORS.find(c => c.name === config.baseColor);
                        if (!selectedBase) return color.type === 'dark' || color.type === 'both';
                        if (color.type === 'both') return true;
                        return selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light';
                      }).map((color) => (
                        <motion.button
                          key={`paint1-g1-${color.name}`}
                          initial={{ opacity: 1, scale: 1 }}
                          animate={
                            transitioning && selectedItem === color.name
                              ? { scale: 1.3, y: -50, z: 100 }
                              : transitioning && selectedItem && selectedItem !== color.name
                              ? { 
                                  y: Math.random() > 0.5 ? -200 : 200,
                                  x: (Math.random() - 0.5) * 300,
                                  rotate: (Math.random() - 0.5) * 90,
                                  opacity: 0,
                                  scale: 0.4
                                }
                              : { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }
                          }
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          onClick={() => {
                            setSelectedItem(color.name);
                            setTransitioning(true);
                            setConfig(prev => ({ ...prev, paintColor: color.name }));
                            setFloatingSelections(prev => [...prev, { type: 'paint', color: color.hex, name: color.name }]);
                            setTimeout(() => {
                              setStep(3.7);
                              setTransitioning(false);
                              setSelectedItem(null);
                            }, 700);
                          }}
                          disabled={transitioning}
                          className="flex flex-col items-center gap-3"
                        >
                          {/* Droplet Shape */}
                          <div 
                            className="relative w-16 h-20 border-2 border-white shadow-lg"
                            style={{ 
                              backgroundColor: color.hex,
                              borderRadius: '50% 50% 50% 0',
                              transform: 'rotate(-45deg)'
                            }}
                          >
                            <div 
                              className="absolute inset-2 bg-white rounded-full opacity-30"
                              style={{ top: '20%', left: '20%', width: '30%', height: '30%' }}
                            />
                          </div>
                          <span className="text-xs text-center font-medium">{color.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Group 2</p>
                    <div className="grid grid-cols-4 gap-6">
                      {PAINT_COLORS_GROUP_2.filter(color => {
                        if (!config.baseColor) return color.type === 'dark' || color.type === 'both';
                        const selectedBase = BASE_COLORS.find(c => c.name === config.baseColor);
                        if (!selectedBase) return color.type === 'dark' || color.type === 'both';
                        if (color.type === 'both') return true;
                        return selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light';
                      }).map((color) => (
                        <motion.button
                          key={`paint1-g2-${color.name}`}
                          initial={{ opacity: 1, scale: 1 }}
                          animate={
                            transitioning && selectedItem === color.name
                              ? { scale: 1.3, y: -50, z: 100 }
                              : transitioning && selectedItem && selectedItem !== color.name
                              ? { 
                                  y: Math.random() > 0.5 ? -200 : 200,
                                  x: (Math.random() - 0.5) * 300,
                                  rotate: (Math.random() - 0.5) * 90,
                                  opacity: 0,
                                  scale: 0.4
                                }
                              : { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }
                          }
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          onClick={() => {
                            setSelectedItem(color.name);
                            setTransitioning(true);
                            setConfig(prev => ({ ...prev, paintColor: color.name }));
                            setFloatingSelections(prev => [...prev, { type: 'paint', color: color.hex, name: color.name }]);
                            setTimeout(() => {
                              setStep(3.7);
                              setTransitioning(false);
                              setSelectedItem(null);
                            }, 700);
                          }}
                          disabled={transitioning}
                          className="flex flex-col items-center gap-3"
                        >
                          {/* Droplet Shape */}
                          <div 
                            className="relative w-16 h-20 border-2 border-white shadow-lg"
                            style={{ 
                              backgroundColor: color.hex,
                              borderRadius: '50% 50% 50% 0',
                              transform: 'rotate(-45deg)'
                            }}
                          >
                            <div 
                              className="absolute inset-2 bg-white rounded-full opacity-30"
                              style={{ top: '20%', left: '20%', width: '30%', height: '30%' }}
                            />
                          </div>
                          <span className="text-xs text-center font-medium">{color.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3.7: Shading & Second Stencil */}
          {step === 3.7 && (
            <Card>
              <CardHeader>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900">
                    Add-ons (Optional)
                  </h2>
                  <p className="text-gray-600 text-lg">Enhance your design with shading or a second stencil</p>
                </div>
              </CardHeader>
              <CardContent>
                {/* Floating Selections Display */}
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                  {floatingSelections.map((sel, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      {sel.type === 'paint' ? (
                        <div 
                          className="w-16 h-20 border-4 border-white shadow-2xl"
                          style={{ 
                            backgroundColor: sel.color,
                            borderRadius: '50% 50% 50% 0',
                            transform: 'rotate(-45deg)'
                          }}
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-lg border-4 border-white shadow-2xl"
                          style={{ backgroundColor: sel.color }}
                        />
                      )}
                      <div className="text-xs text-center mt-2 font-semibold">{sel.name}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      const newHasShading = !config.hasShading;
                      setConfig(prev => ({ ...prev, hasShading: newHasShading }));
                      if (newHasShading) {
                        setFloatingSelections(prev => [...prev, { type: 'shading', color: '#888', name: 'Shading' }]);
                      } else {
                        setFloatingSelections(prev => prev.filter(s => s.type !== 'shading'));
                      }
                    }}
                    className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                      config.hasShading ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">Shading</div>
                        <div className="text-sm text-gray-600">Adds depth and dimension</div>
                      </div>
                      <div className={`text-xl font-bold ${config.hasShading ? 'text-blue-600' : 'text-gray-900'}`}>
                        +${config.size ? getShadingFee(config.size) : 30}
                      </div>
                    </div>
                  </button>

                  {/* Add Second Color */}
                  <div className={`border-2 rounded-lg transition-all ${
                    config.hasSecondColor ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'
                  }`}>
                    <button
                      onClick={() => {
                        setConfig(prev => ({ ...prev, hasSecondColor: !prev.hasSecondColor }));
                      }}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-lg">Add 2nd Color</div>
                          <div className="text-sm text-gray-600">Paint with a second color</div>
                        </div>
                        <div className={`text-xl font-bold ${config.hasSecondColor ? 'text-yellow-600' : 'text-gray-900'}`}>
                          +${config.size ? getSecondColorFee(config.size) : 30}
                        </div>
                      </div>
                    </button>

                    {config.hasSecondColor && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="text-center font-semibold text-sm">
                          {config.secondPaintColor ? `✓ Selected: ${config.secondPaintColor}` : 'Select a second color:'}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-3">
                          {PAINT_COLORS_GROUP_1.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => setConfig(prev => ({ ...prev, secondPaintColor: color.name }))}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                config.secondPaintColor === color.name 
                                  ? 'border-yellow-600 bg-yellow-100 ring-2 ring-yellow-400' 
                                  : 'border-gray-300 hover:border-yellow-400'
                              }`}
                            >
                              <div 
                                className="w-full aspect-square rounded-full border-2 border-white shadow-md mb-1"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="text-xs text-center font-medium">{color.name}</div>
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          {PAINT_COLORS_GROUP_2.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => setConfig(prev => ({ ...prev, secondPaintColor: color.name }))}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                config.secondPaintColor === color.name 
                                  ? 'border-yellow-600 bg-yellow-100 ring-2 ring-yellow-400' 
                                  : 'border-gray-300 hover:border-yellow-400'
                              }`}
                            >
                              <div 
                                className="w-full aspect-square rounded-full border-2 border-white shadow-md mb-1"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="text-xs text-center font-medium">{color.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setStep(4)}
                    disabled={config.hasSecondColor && !config.secondPaintColor}
                    className="w-full p-6 rounded-lg border-2 border-green-600 bg-green-50 hover:bg-green-100 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">Continue to Design</div>
                        <div className="text-sm text-gray-600">Create your rug design</div>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        →
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(3.5)}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(4)}
                    className="flex-1 border-4 border-gray-900 bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg py-6"
                  >
                    Continue to Design →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Color Selection (Original - now just base color) */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900">
                    Choose Colors
                  </h2>
                  <p className="text-gray-600 text-lg">Pick the actual rug color and the paint color for your design</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg mb-3 block">Rug Base Color</Label>
                    <div className="grid grid-cols-4 gap-4">
                      {BASE_COLORS.map((color) => (
                        <motion.button
                          key={color.name}
                          initial={{ opacity: 1, scale: 1 }}
                          animate={
                            transitioning && selectedItem === color.name
                              ? { scale: 1.2, y: -50, z: 100 }
                              : transitioning && selectedItem && selectedItem !== color.name
                              ? { 
                                  y: Math.random() > 0.5 ? -200 : 200,
                                  x: (Math.random() - 0.5) * 300,
                                  rotate: (Math.random() - 0.5) * 90,
                                  opacity: 0,
                                  scale: 0.4
                                }
                              : { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }
                          }
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          onClick={() => {
                            setSelectedItem(color.name);
                            setTransitioning(true);
                            setConfig(prev => ({ ...prev, baseColor: color.name }));
                            setFloatingSelections([{ type: 'base', color: color.hex, name: color.name }]);
                            setTimeout(() => {
                              setStep(3.5);
                              setTransitioning(false);
                              setSelectedItem(null);
                            }, 700);
                          }}
                          disabled={transitioning}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all group relative ${
                            config.baseColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={`Set ${color.name} as your rug's base color`}
                        >
                          <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            Make the base color of your rug {color.name}
                          </span>
                          <div 
                           className="relative w-16 h-12 rounded-sm border-2 border-white shadow-md overflow-hidden"
                           style={{ backgroundColor: color.hex }}
                          >
                           <div 
                             className="absolute inset-0 opacity-30"
                             style={{
                               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
                               backgroundSize: '6px 6px'
                             }}
                           />
                          </div>
                          <span className="text-xs text-center">{color.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-lg mb-3 block">First Paint Color</Label>

                    <div className="space-y-6 mb-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">Group 1</p>
                        <div className="grid grid-cols-4 gap-4">
                          {PAINT_COLORS_GROUP_1.filter(color => {
                            if (!config.baseColor) return color.type === 'dark' || color.type === 'both';
                            const selectedBase = BASE_COLORS.find(c => c.name === config.baseColor);
                            if (!selectedBase) return color.type === 'dark' || color.type === 'both';
                            if (color.type === 'both') return true;
                            return selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light';
                          }).map((color) => (
                            <button
                              key={`primary-g1-${color.name}-${color.hex}`}
                              onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                config.paintColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div 
                                className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-md"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs text-center">{color.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">Group 2</p>
                        <div className="grid grid-cols-4 gap-4">
                          {PAINT_COLORS_GROUP_2.filter(color => {
                            if (!config.baseColor) return color.type === 'dark' || color.type === 'both';
                            const selectedBase = BASE_COLORS.find(c => c.name === config.baseColor);
                            if (!selectedBase) return color.type === 'dark' || color.type === 'both';
                            if (color.type === 'both') return true;
                            return selectedBase.type === 'light' ? color.type === 'dark' : color.type === 'light';
                          }).map((color) => (
                            <button
                              key={`primary-g2-${color.name}-${color.hex}`}
                              onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                config.paintColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div 
                                className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-md"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs text-center">{color.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Shading Add-on */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, hasShading: !prev.hasShading }))}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          config.hasShading ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">Add Shading (Optional)</div>
                            <div className="text-xs text-gray-600">Adds depth and dimension</div>
                          </div>
                          <div className={`text-lg font-bold ${config.hasShading ? 'text-blue-600' : 'text-gray-900'}`}>
                            +${config.size ? getShadingFee(config.size) : 30}
                          </div>
                        </div>
                        {config.hasShading && (
                          <div className="mt-2 text-xs text-blue-600 font-semibold">✓ Added</div>
                        )}
                      </button>
                    </div>

                    {/* Second Paint Color */}
                    <div className="border-t-4 border-gray-900 pt-8 mt-8 bg-yellow-50 p-6 rounded-lg">
                      <div className="mb-6">
                        <Label className="text-2xl font-bold text-gray-900 block mb-4">Want a 2nd Paint Color?</Label>
                        <p className="text-sm text-gray-600 mb-4">Add another color for more detail (+${config.size ? getSecondColorFee(config.size) : 30})</p>
                        
                        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border-2 border-gray-300">
                          <input
                            type="checkbox"
                            id="enable-second-color"
                            checked={config.hasSecondColor}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              console.log('Checkbox changed:', isChecked);
                              setConfig(prev => {
                                const newConfig = { 
                                  ...prev, 
                                  hasSecondColor: isChecked,
                                  secondPaintColor: isChecked ? prev.secondPaintColor : ''
                                };
                                console.log('New config:', newConfig);
                                return newConfig;
                              });
                            }}
                            className="w-6 h-6 cursor-pointer"
                          />
                          <label htmlFor="enable-second-color" className="text-lg font-semibold cursor-pointer">
                            Yes, add a second paint color
                          </label>
                        </div>
                      </div>

                      {config.hasSecondColor && (
                        <div className="space-y-6 p-6 bg-white rounded-lg border-4 border-yellow-500">
                          <div className="bg-yellow-100 p-4 rounded-lg text-center border-2 border-yellow-600">
                            <p className="text-sm text-gray-600 mb-1">First Color: <strong>{config.paintColor || 'None'}</strong></p>
                            <p className="text-xl font-bold text-gray-900">
                              Second Color: {config.secondPaintColor ? <span className="text-green-700">✓ {config.secondPaintColor}</span> : <span className="text-red-600">Not Selected</span>}
                            </p>
                          </div>

                          <div>
                            <p className="font-bold text-gray-900 text-lg mb-3 bg-gray-100 p-2 rounded">Group 1 - Click to Select</p>
                            <div className="grid grid-cols-4 gap-4">
                              {PAINT_COLORS_GROUP_1.map((color) => {
                                const isSelected = config.secondPaintColor === color.name;
                                return (
                                  <button
                                    key={`second-${color.name}-${color.hex}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      console.log('Clicking second color:', color.name);
                                      setConfig(prev => {
                                        const newConfig = { ...prev, secondPaintColor: color.name };
                                        console.log('Setting secondPaintColor to:', color.name, 'Full config:', newConfig);
                                        return newConfig;
                                      });
                                    }}
                                    className={`p-4 rounded-lg border-3 transition-all transform hover:scale-105 ${
                                      isSelected 
                                        ? 'border-green-600 bg-green-100 ring-4 ring-green-400 shadow-2xl scale-110' 
                                        : 'border-gray-400 bg-white hover:border-yellow-500 hover:shadow-lg'
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="text-center text-green-700 font-bold text-sm mb-2 bg-green-200 rounded py-1">
                                        ✓ SELECTED
                                      </div>
                                    )}
                                    <div 
                                      className="w-full aspect-square rounded-full border-4 border-white shadow-lg mx-auto mb-2"
                                      style={{ backgroundColor: color.hex }}
                                    />
                                    <p className="text-sm text-center font-bold">{color.name}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="h-2 bg-gray-300 rounded"></div>

                          <div>
                            <p className="font-bold text-gray-900 text-lg mb-3 bg-gray-100 p-2 rounded">Group 2 - Click to Select</p>
                            <div className="grid grid-cols-4 gap-4">
                              {PAINT_COLORS_GROUP_2.map((color) => {
                                const isSelected = config.secondPaintColor === color.name;
                                return (
                                  <button
                                    key={`second-${color.name}-${color.hex}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      console.log('Clicking second color:', color.name);
                                      setConfig(prev => {
                                        const newConfig = { ...prev, secondPaintColor: color.name };
                                        console.log('Setting secondPaintColor to:', color.name, 'Full config:', newConfig);
                                        return newConfig;
                                      });
                                    }}
                                    className={`p-4 rounded-lg border-3 transition-all transform hover:scale-105 ${
                                      isSelected 
                                        ? 'border-green-600 bg-green-100 ring-4 ring-green-400 shadow-2xl scale-110' 
                                        : 'border-gray-400 bg-white hover:border-yellow-500 hover:shadow-lg'
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="text-center text-green-700 font-bold text-sm mb-2 bg-green-200 rounded py-1">
                                        ✓ SELECTED
                                      </div>
                                    )}
                                    <div 
                                      className="w-full aspect-square rounded-full border-4 border-white shadow-lg mx-auto mb-2"
                                      style={{ backgroundColor: color.hex }}
                                    />
                                    <p className="text-sm text-center font-bold">{color.name}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                   <Button variant="outline" onClick={() => setStep(2)}>
                     Back
                   </Button>
                   <Button 
                     onClick={() => setStep(4)} 
                     disabled={!config.baseColor || !config.paintColor || (config.hasSecondColor && !config.secondPaintColor)}
                     title="Continue to design selection"
                     className="flex-1 border-4 border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-bold text-lg py-6 group relative disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     BUILD MY RUG →
                     <span className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                       Next: Choose or create your design
                     </span>
                   </Button>
                 </div>
                 </CardContent>
                 </Card>
                 )}

          {/* Step 4: Create Design & Confirm */}
          {step === 4 && (
            <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                  ← Back
                </Button>
                <CardTitle className="flex-1">Step 4: Create Your Design & Confirm</CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Design your rug and preview before adding to cart
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mode Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => setDesignMode('library')}
                    className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                      designMode === 'library' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-8 h-8 mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Design Library</div>
                    <div className="text-sm text-gray-600 text-center">Choose from our collection</div>
                  </button>
                  <button
                    onClick={() => setDesignMode('draw')}
                    className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                      designMode === 'draw' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Pencil className="w-8 h-8 mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Draw Your Own</div>
                    <div className="text-sm text-gray-600 text-center">Create with our drawing tools</div>
                  </button>
                  <button
                    onClick={() => setDesignMode('upload')}
                    className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                      designMode === 'upload' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Upload className="w-8 h-8 mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Upload & Convert</div>
                    <div className="text-sm text-gray-600 text-center">Upload an image and convert to stencil</div>
                  </button>
                </div>

                {/* Design Library Mode */}
                {designMode === 'library' && (
                  <>
                    <DesignLibrary
                      onSelectDesign={(url) => {
                        setConfig(prev => ({ ...prev, imageUrl: url, previewUrl: url }));
                      }}
                    />
                  </>
                )}



                {/* Upload Mode */}
                {designMode === 'upload' && (
                  <StencilCreator
                    paintColor={getAvailablePaintColors().find(c => c.name === config.paintColor)?.hex || '#000000'}
                    baseColor={BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#86cb92'}
                    onSaveStencil={(stencilUrl) => {
                      setConfig(prev => ({ ...prev, imageUrl: stencilUrl, previewUrl: stencilUrl }));
                    }}
                    onConfigChange={({ colors }) => {
                      setConfig(prev => ({ ...prev, numColors: colors }));
                    }}
                  />
                )}

                {/* Drawing Mode */}
                {designMode === 'draw' && (
                  <DrawingCanvas 
                    onSaveDrawing={handleDrawingSave}
                    onColorCountChange={(count) => {
                      setConfig(prev => ({ ...prev, numColors: count }));
                    }}
                    availableColors={[
                      { name: config.paintColor, hex: getAvailablePaintColors().find(c => c.name === config.paintColor)?.hex || '#000000' },
                      ...(config.secondPaintColor ? [{ name: config.secondPaintColor, hex: getAvailablePaintColors().find(c => c.name === config.secondPaintColor)?.hex }] : [])
                    ].filter(c => c.hex)}
                    size={config.size}
                  />
                )}

                {config.imageUrl && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mt-6">
                    <Label className="block mb-4 font-bold text-green-900 text-xl text-center">✨ Your Custom Rug Preview</Label>
                    
                    {/* Final Summary */}
                    <div className="bg-white rounded-lg p-4 mb-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality:</span>
                        <span className="font-semibold">{QUALITY_TIERS.find(t => t.id === config.qualityTier)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-semibold">{SIZES.find(s => s.value === config.size)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Color:</span>
                        <span className="font-semibold">{config.baseColor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paint Colors:</span>
                        <span className="font-semibold">{config.paintColor}{config.secondPaintColor ? `, ${config.secondPaintColor}` : ''}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="w-full border-4 border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-bold text-xl py-8"
                    >
                      Add to Cart - ${currentPrice()}
                    </Button>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Total Price:</span>
                    <span className="text-3xl font-bold text-blue-600">${currentPrice()}</span>
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>{SIZES.find(s => s.value === config.size)?.label} ({QUALITY_TIERS.find(t => t.id === config.qualityTier)?.label}):</span>
                      <span className="font-semibold">${config.qualityTier && config.size ? Math.round(SIZES.find(s => s.value === config.size)?.price * QUALITY_TIERS.find(t => t.id === config.qualityTier)?.priceMultiplier) : SIZES.find(s => s.value === config.size)?.price}</span>
                    </div>
                    {config.hasShading && (
                      <div className="flex justify-between">
                        <span>Shading:</span>
                        <span className="font-semibold">+${getShadingFee(config.size)}</span>
                      </div>
                    )}
                    {config.hasSecondColor && (
                      <div className="flex justify-between">
                        <span>Second Color:</span>
                        <span className="font-semibold">+${getSecondColorFee(config.size)}</span>
                      </div>
                    )}
                    {isRush && (
                      <div className="flex justify-between">
                        <span>Rush Processing:</span>
                        <span className="font-semibold">+$100</span>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>
          )}


        </div>

        {step >= 4 && config.imageUrl && (
          <div className="hidden lg:block sticky top-6 self-start">
            <BuilderSidebar
              step={step}
              config={config}
              currentPrice={currentPrice()}
              baseColors={BASE_COLORS}
              paintColors={PAINT_COLORS}
              isRush={isRush}
              onToggleRush={() => setIsRush(!isRush)}
              key={`${config.baseColor}-${config.paintColor}-${config.imageUrl}`}
            />
          </div>
        )}
        </div>
        </div>
        </div>
        );
        }