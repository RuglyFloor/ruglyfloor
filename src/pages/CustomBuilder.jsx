import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CheckCircle, Pencil, FileText, Lightbulb, Clock, Palette, Sparkles, Package } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StencilCreator from '../components/custom/StencilCreator';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import DrawingCanvas from '../components/custom/DrawingCanvas';
import DesignLibrary from '../components/custom/DesignLibrary';
import InteractiveRugPreview from '../components/custom/InteractiveRugPreview';
import BuilderSidebar from '../components/custom/BuilderSidebar';
import AIAssistant from '../components/custom/AIAssistant';
import DesignHelpModal from '../components/custom/DesignHelpModal';
import SEOHead from '../components/seo/SEOHead';
import { useSEO } from '../components/seo/useSEO';

const QUALITY_TIERS = [
  { 
    id: 'budget', 
    label: 'Crugly', 
    description: 'Perfect for dorms, kids rooms, and budget-conscious spaces',
    priceMultiplier: 0.7,
    materialDetail: 'Synthetic non-slip floor covering',
    lifespan: '2-20+ years',
    washable: true,
    customization: 'Standard',
    priceRange: '$$',
    color: '#24f0a0',
    maxColors: 2
  },
  { 
    id: 'good', 
    label: 'Rugly', 
    description: 'Premium quality with standard rug lifespan',
    priceMultiplier: 1.0,
    materialDetail: 'Durable Cotton, Synthetic Rabbit Fur',
    lifespan: 'Standard rug lifespan',
    washable: true,
    customization: 'Standard',
    priceRange: '$$$',
    color: '#4075ff',
    maxColors: 4
  },
  { 
    id: 'highend', 
    label: 'Rugly Lux', 
    description: 'No limits—tell us your vision and we make it happen',
    priceMultiplier: 1.25,
    materialDetail: 'Shag, jute, or luxury materials',
    lifespan: 'Premium durability',
    washable: false,
    customization: 'Unlimited',
    priceRange: '$$$$',
    color: '#f04624',
    maxColors: 999
  }
];

const SIZES = [
  { id: 'tiny', label: 'Tiny', value: 'tiny', price: 79, step: 0, measurement: '2x3' },
  { id: 'sm', label: 'Small', value: 'small', price: 139, step: 1, measurement: '4x6' },
  { id: 'md', label: 'Medium', value: 'medium', price: 199, step: 2, measurement: '5x7' },
  { id: 'lg', label: 'Large', value: 'large', price: 259, step: 3, measurement: '8x10' },
  { id: 'hg', label: 'Huge', value: 'huge', price: 319, step: 4, measurement: '9x11' },
  { id: 'rd', label: '3.14', value: '4ft round', price: 159, step: 1, measurement: '4 foot round' }
];

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

export default function CustomBuilder() {
  const navigate = useNavigate();
  const seoData = useSEO('custom-builder');

  // Fetch catalog data
  const { data: catalogListings = [] } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => base44.entities.Catalog.list()
  });

  const { data: catalogVariants = [] } = useQuery({
    queryKey: ['catalog-variants'],
    queryFn: () => base44.entities.CatalogVariant.list()
  });

  // Fetch pricing config
  const { data: pricingConfigs = [] } = useQuery({
    queryKey: ['pricing-config'],
    queryFn: () => base44.entities.PricingConfig.list()
  });

  const getPricingData = () => {
    const shadeConfig = pricingConfigs.find(c => c.config_name === 'shade_fees');
    const qualityConfig = pricingConfigs.find(c => c.config_name === 'quality_multipliers');
    
    return {
      shade_base: shadeConfig?.pricing_data?.base_fee || 15,
      shade_step: shadeConfig?.pricing_data?.per_step_fee || 5,
      catalog_markup: qualityConfig?.pricing_data?.catalog_markup || 1.10,
      quality_multipliers: {
        budget: qualityConfig?.pricing_data?.budget || 0.7,
        good: qualityConfig?.pricing_data?.good || 1.0,
        highend: qualityConfig?.pricing_data?.highend || 2.5
      }
    };
  };

  const getShadingFee = (size) => {
    const sizeData = SIZES.find(s => s.value === size);
    if (!sizeData) return 0;
    const pricing = getPricingData();
    return pricing.shade_base + (pricing.shade_step * sizeData.step);
  };

  const getSecondColorFee = (size) => {
    const sizeData = SIZES.find(s => s.value === size);
    if (!sizeData) return 0;
    const pricing = getPricingData();
    return pricing.shade_base + (pricing.shade_step * sizeData.step);
  };

  // Get available base colors from catalog
  const getAvailableBaseColors = () => {
    const activeListings = catalogListings.filter(l => l.active);
    const uniqueColors = [...new Set(activeListings.map(l => l.color).filter(Boolean))];
    
    // If no colors from catalog, use default base colors
    if (uniqueColors.length === 0) {
      return BASE_COLORS;
    }
    
    return uniqueColors.map(color => ({
      name: color,
      hex: getColorHex(color),
      type: 'light'
    }));
  };

  // Helper to convert color names to hex (basic mapping)
  const getColorHex = (colorName) => {
    const colorMap = {
      'Ivory': '#fffff0',
      'Gray': '#9ca3af',
      'Grey': '#9ca3af',
      'Beige': '#f5f5dc',
      'Tan': '#d2b48c',
      'White': '#ffffff',
      'Black': '#000000',
      'Brown': '#8b4513',
      'Blue': '#4169e1',
      'Navy': '#000080',
      'Charcoal': '#36454f'
    };
    return colorMap[colorName] || '#d2b48c';
  };
  
  const [step, setStep] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [designMode, setDesignMode] = useState('draw'); // 'library', 'upload', or 'draw'
  const [selectedItem, setSelectedItem] = useState(null);

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    // Auto-select AI mode for Rugly Lux
    if (step === 4 && config.qualityTier === 'highend') {
      setDesignMode('ai');
    }
  }, [step, config.qualityTier]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const [uploading, setUploading] = useState(false);
  const [isRush, setIsRush] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(!localStorage.getItem('rugly_lead_email'));
  const [measurementSystem, setMeasurementSystem] = useState('imperial'); // 'imperial' or 'metric'
  const [customDimensions, setCustomDimensions] = useState({
    lengthFeet: '',
    lengthInches: '',
    widthFeet: '',
    widthInches: ''
  });
  const [customDimensionsMetric, setCustomDimensionsMetric] = useState({
    lengthMeters: '',
    lengthCm: '',
    widthMeters: '',
    widthCm: ''
  });
  const [suggestedSize, setSuggestedSize] = useState(null);

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

  // Calculate square footage for each size
  const getSizeSquareFeet = (size) => {
    const sizeData = SIZES.find(s => s.value === size);
    if (!sizeData) return 0;
    
    if (size === '4ft round') {
      return Math.PI * 2 * 2; // π * r²
    }
    
    const [width, height] = sizeData.measurement.split('x').map(n => parseInt(n));
    return width * height;
  };

  // Match square footage to size category
  const matchSizeBySquareFeet = (sqFt) => {
    const tolerance = 2; // ±2 sq ft
    
    const sizeRanges = SIZES.map(size => ({
      size: size.value,
      sqFt: getSizeSquareFeet(size.value),
      label: size.label,
      measurement: size.measurement
    })).sort((a, b) => a.sqFt - b.sqFt);

    // Find closest match within tolerance
    for (let range of sizeRanges) {
      if (sqFt >= range.sqFt - tolerance && sqFt <= range.sqFt + tolerance) {
        return range;
      }
    }

    // If no exact match, find closest size
    let closest = sizeRanges[0];
    let minDiff = Math.abs(sqFt - closest.sqFt);
    
    for (let range of sizeRanges) {
      const diff = Math.abs(sqFt - range.sqFt);
      if (diff < minDiff) {
        minDiff = diff;
        closest = range;
      }
    }
    
    return closest;
  };

  // Calculate square footage from feet and inches
  const calculateSquareFootage = (lengthFeet, lengthInches, widthFeet, widthInches) => {
    const totalLengthFeet = parseFloat(lengthFeet || 0) + (parseFloat(lengthInches || 0) / 12);
    const totalWidthFeet = parseFloat(widthFeet || 0) + (parseFloat(widthInches || 0) / 12);
    return totalLengthFeet * totalWidthFeet;
  };

  // Calculate square footage from meters and cm
  const calculateSquareFootageMetric = (lengthMeters, lengthCm, widthMeters, widthCm) => {
    const totalLengthMeters = parseFloat(lengthMeters || 0) + (parseFloat(lengthCm || 0) / 100);
    const totalWidthMeters = parseFloat(widthMeters || 0) + (parseFloat(widthCm || 0) / 100);
    const totalLengthFeet = totalLengthMeters * 3.28084;
    const totalWidthFeet = totalWidthMeters * 3.28084;
    return totalLengthFeet * totalWidthFeet;
  };

  const handleCustomDimensionsChange = (field, value) => {
    const newDimensions = { ...customDimensions, [field]: value };
    setCustomDimensions(newDimensions);

    const { lengthFeet, lengthInches, widthFeet, widthInches } = newDimensions;
    
    // Check if we have at least some valid input
    if ((lengthFeet || lengthInches) && (widthFeet || widthInches)) {
      const totalLengthFeet = parseFloat(lengthFeet || 0) + (parseFloat(lengthInches || 0) / 12);
      const totalWidthFeet = parseFloat(widthFeet || 0) + (parseFloat(widthInches || 0) / 12);
      
      // Minimum 2x2 feet
      if (totalLengthFeet >= 2 && totalWidthFeet >= 2) {
        const sqFt = calculateSquareFootage(lengthFeet, lengthInches, widthFeet, widthInches);
        const suggested = matchSizeBySquareFeet(sqFt);
        setSuggestedSize({
          ...suggested,
          customDimensions: {
            system: 'imperial',
            lengthFeet: lengthFeet || '0',
            lengthInches: lengthInches || '0',
            widthFeet: widthFeet || '0',
            widthInches: widthInches || '0',
            totalLength: totalLengthFeet.toFixed(2),
            totalWidth: totalWidthFeet.toFixed(2),
            squareFootage: sqFt.toFixed(2)
          }
        });
      } else {
        setSuggestedSize(null);
      }
    } else {
      setSuggestedSize(null);
    }
  };

  const handleCustomDimensionsChangeMetric = (field, value) => {
    const newDimensions = { ...customDimensionsMetric, [field]: value };
    setCustomDimensionsMetric(newDimensions);

    const { lengthMeters, lengthCm, widthMeters, widthCm } = newDimensions;
    
    // Check if we have at least some valid input
    if ((lengthMeters || lengthCm) && (widthMeters || widthCm)) {
      const totalLengthMeters = parseFloat(lengthMeters || 0) + (parseFloat(lengthCm || 0) / 100);
      const totalWidthMeters = parseFloat(widthMeters || 0) + (parseFloat(widthCm || 0) / 100);
      const totalLengthFeet = totalLengthMeters * 3.28084;
      const totalWidthFeet = totalWidthMeters * 3.28084;
      
      // Minimum 2x2 feet (0.61m x 0.61m)
      if (totalLengthMeters >= 0.61 && totalWidthMeters >= 0.61) {
        const sqFt = calculateSquareFootageMetric(lengthMeters, lengthCm, widthMeters, widthCm);
        const suggested = matchSizeBySquareFeet(sqFt);
        setSuggestedSize({
          ...suggested,
          customDimensions: {
            system: 'metric',
            lengthMeters: lengthMeters || '0',
            lengthCm: lengthCm || '0',
            widthMeters: widthMeters || '0',
            widthCm: widthCm || '0',
            totalLength: totalLengthMeters.toFixed(2),
            totalWidth: totalWidthMeters.toFixed(2),
            squareFootage: sqFt.toFixed(2)
          }
        });
      } else {
        setSuggestedSize(null);
      }
    } else {
      setSuggestedSize(null);
    }
  };


  const handleApplyAIColors = (colors) => {
    if (colors && colors.length > 0) {
      const firstColorHex = colors[0];
      const secondColorHex = colors[1];
      
      const paintColorMatch = PAINT_COLORS.find(c => c.hex.toLowerCase() === firstColorHex.toLowerCase());
      const secondPaintColorMatch = secondColorHex ? PAINT_COLORS.find(c => c.hex.toLowerCase() === secondColorHex.toLowerCase()) : null;
      
      setConfig(prev => ({
        ...prev,
        paintColor: paintColorMatch?.name || prev.paintColor,
        secondPaintColor: secondPaintColorMatch?.name || '',
        hasSecondColor: !!secondPaintColorMatch
      }));
    }
  };

  const handleCopyAISuggestion = (suggestion, type) => {
    setConfig(prev => ({ 
      ...prev, 
      designInstructions: (prev.designInstructions ? prev.designInstructions + '\n\n' : '') + `AI ${type}: ${suggestion}` 
    }));
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
      isRush: isRush,
      customDimensions: config.customDimensions || null
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

  const getTierColor = () => {
    const selectedTier = QUALITY_TIERS.find(t => t.id === config.qualityTier);
    return selectedTier ? selectedTier.color : '#d1d5db'; // Default color if no tier selected
  };

  return (
    <div className="min-h-screen py-6 lg:py-12 px-4 lg:px-6 bg-white">
      <SEOHead
        title={seoData?.seo_title || "Custom Rug Builder | Perfect Mother's Day & Father's Day Gifts"}
        description={typeof seoData?.seo_description === 'string' ? seoData.seo_description : "Design custom hand-painted rugs online - unique mothers day gifts, fathers day gifts, and personalized gifts for anyone. Create personalized floor art rugs with our builder. Customizable stencil rug designs, washable custom painted rugs for any space. Perfect for interior designers and homeowners."}
        keywords={Array.isArray(seoData?.seo_keywords) ? seoData.seo_keywords : ['mothers day gifts unique', 'fathers day gifts personalized', 'gifts for hard to buy for people', 'custom hand-painted rugs for interior designers', 'personalized floor art rugs', 'customizable stencil rug designs', 'custom painted washable rugs', 'hand-painted low-pile rugs for high traffic', 'personalized rugs for nursery hand-painted', 'custom painted rugs for Airbnb decor']}
        url="/custom-builder"
      />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Design Your Custom Rug</h1>
        <p className="text-center text-gray-600 mb-8">Create a one-of-a-kind piece in four simple steps</p>

        {/* Email capture bar */}
        {showEmailCapture && (
          <div className="mb-8 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3" style={{backgroundColor:'#eff6ff', border:'2px solid #4075ff'}}>
            <div className="flex-1 text-sm font-medium" style={{color:'#343634'}}>
              💌 Get a preview before we paint — enter your email to save your design as you go.
            </div>
            <form className="flex gap-2 w-full sm:w-auto" onSubmit={e => {
              e.preventDefault();
              const val = e.target.email.value.trim();
              if (val) { localStorage.setItem('rugly_lead_email', val); setShowEmailCapture(false); }
            }}>
              <input name="email" type="email" placeholder="your@email.com" required
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 sm:w-52 focus:outline-none focus:border-blue-500" />
              <button type="submit" className="px-4 py-2 rounded-lg text-white text-sm font-bold" style={{backgroundColor:'#4075ff'}}>
                Save
              </button>
            </form>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="relative mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Quality' },
              { num: 2, label: 'Size' },
              { num: 3, label: 'Colors' },
              { num: 4, label: 'Design' }
            ].map((s, idx) => {
              const tierColor = getTierColor();
              return (
                <button 
                  key={s.num} 
                  onClick={() => setStep(s.num)}
                  className="flex flex-col items-center flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all border-4"
                    style={{
                      borderColor: step >= s.num && config.qualityTier ? tierColor : '#d1d5db',
                      backgroundColor: 'white',
                      color: step >= s.num && config.qualityTier ? tierColor : '#9ca3af',
                      transform: step >= s.num ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                  </div>
                  <span 
                    className="text-xs mt-2 font-medium"
                    style={{ color: step >= s.num ? '#343634' : '#9ca3af' }}
                  >
                    {s.label}
                  </span>
                  {idx < 3 && (
                    <div 
                      className="absolute top-6 left-0 right-0 h-0.5 -z-10" 
                      style={{ 
                        left: `${(idx * 33.33) + 16.66}%`, 
                        width: '33.33%',
                        background: step > s.num && config.qualityTier ? tierColor : '#e5e7eb'
                      }} 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {step === 4 && config.imageUrl && (
          <div className="fixed bottom-6 right-6 z-50 lg:hidden">
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="font-bold shadow-2xl text-white"
              style={{ backgroundColor: getTierColor(), border: 'none' }}
            >
              Add to Cart - ${currentPrice()}
            </Button>
          </div>
        )}

        <div className={step === 4 ? "grid lg:grid-cols-3 gap-8 items-start" : "max-w-7xl mx-auto"}>
          <div className={step === 4 ? "lg:col-span-2 space-y-6" : "space-y-6"}>
            
            {/* Step 1: Quality Tier Selection */}
            {step === 1 && (
              <div className={`space-y-8 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4" style={{ color: '#343634' }}>
                    Choose Your Quality Level
                  </h2>
                  <p className="text-gray-600 text-xl">Three tiers. One vision. Your perfect rug.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {QUALITY_TIERS.map((tier) => (
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 1, scale: 1 }}
                      animate={
                        transitioning && selectedItem === tier.id
                          ? { scale: 1.1, z: 50, opacity: 1 }
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
                      className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                      style={{ border: `4px solid ${tier.color}` }}
                      onClick={() => {
                        setSelectedItem(tier.id);
                        setTransitioning(true);
                        setConfig(prev => ({ ...prev, qualityTier: tier.id }));
                        setTimeout(() => {
                          setStep(2);
                          setTransitioning(false);
                          setSelectedItem(null);
                        }, 700);
                      }}
                    >
                      {/* Colored Header */}
                      <div className="p-6 text-center text-white" style={{ backgroundColor: tier.color }}>
                        <h3 className="text-3xl font-black mb-2">{tier.label}</h3>
                        <p className="text-sm opacity-90">{tier.id === 'budget' ? 'Budget-Friendly' : tier.id === 'good' ? 'Most Popular' : 'Luxury and Commercial Use'}</p>
                      </div>

                      <div className="p-6">
                        {/* Price */}
                        <div className="text-center mb-6 pb-6 border-b-2" style={{ borderColor: tier.color }}>
                          <div className="text-5xl font-black mb-1" style={{ color: tier.color }}>
                            {tier.id === 'budget' ? '$55+' : tier.id === 'good' ? '$79+' : '$110+'}
                          </div>
                          <div className="text-xs text-gray-500">Starting at (Tiny 2x3)</div>
                        </div>

                        {/* Visual Detail Image */}
                        <div className="mb-6 rounded-xl overflow-hidden" style={{ border: `2px solid ${tier.color}` }}>
                          {tier.id === 'budget' ? (
                            <img 
                              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/fe7898922_image.png"
                              alt="Crugly material"
                              className="w-full h-40 object-cover"
                            />
                          ) : tier.id === 'good' ? (
                            <div className="flex h-40">
                              <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/701415d98_image.png"
                                alt="Rugly material left"
                                className="w-1/2 object-cover"
                              />
                              <div className="w-0.5 bg-white"></div>
                              <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/5c6bbc6d6_Screenshot2026-02-14at113505.png"
                                alt="Rugly material right"
                                className="w-1/2 object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-40">
                              <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/4d348899c_image.png"
                                alt="Rugly Lux material left"
                                className="w-1/2 object-cover"
                              />
                              <div className="w-0.5 bg-white"></div>
                              <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/5074422ce_JPEGimage-4993-99AB-1A-0.jpg"
                                alt="Rugly Lux material right"
                                className="w-1/2 object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Infographic Features */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                              {tier.id === 'budget' ? (
                                <svg className="w-6 h-6" style={{ color: tier.color }} fill="currentColor" viewBox="0 0 24 24">
                                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <path d="M8 12 L12 8 L16 12 L12 16 Z" />
                                </svg>
                              ) : tier.id === 'good' ? (
                                <svg className="w-6 h-6" style={{ color: tier.color }} fill="currentColor" viewBox="0 0 24 24">
                                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <path d="M6 8 Q12 6 18 8 Q18 12 12 18 Q6 12 6 8 Z" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6" style={{ color: tier.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                                  <path d="M8 12 C8 10, 10 10, 10 12 C10 14, 8 14, 8 12 M14 12 C14 10, 16 10, 16 12 C16 14, 14 14, 14 12"/>
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-900">Customization</div>
                              <div className="text-xs text-gray-600">
                                {tier.id === 'budget' && 'Limited to Stencil Design, Fixed Sizes, Most Rugs Under $200!'}
                                {tier.id === 'good' && 'Custom Size & Hand Painted'}
                                {tier.id === 'highend' && 'Unlimited'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                              <Palette className="w-5 h-5" style={{ color: tier.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-900">Colors</div>
                              <div className="text-xs text-gray-600">{tier.maxColors === 999 ? 'Unlimited' : `Up to ${tier.maxColors}`}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                              <Package className="w-5 h-5" style={{ color: tier.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-900">Material</div>
                              <div className="text-xs text-gray-600">{tier.materialDetail}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                              <Clock className="w-5 h-5" style={{ color: tier.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-900">Timeline</div>
                              <div className="text-xs text-gray-600">
                                {tier.id === 'budget' && '10-14 days + FREE ship'}
                                {tier.id === 'good' && '10-20 days'}
                                {tier.id === 'highend' && '2-4 weeks'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                              <Sparkles className="w-5 h-5" style={{ color: tier.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-900">Care</div>
                              <div className="text-xs text-gray-600">{tier.washable ? 'Machine washable' : 'Dry clean'}</div>
                            </div>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                          className="w-full text-white font-bold py-6 text-lg"
                          style={{ backgroundColor: tier.color, border: 'none' }}
                        >
                          Select {tier.label}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Size Selection */}
            {step === 2 && (
              <div className={`space-y-6 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold mb-3" style={{ color: '#343634' }}>
                    Pick Your Perfect Size
                  </h2>
                  <p className="text-gray-600 text-lg">All sizes come with our signature hand-painted quality</p>
                </div>

                {/* Custom Size Input for Rugly and Rugly Lux */}
                {(config.qualityTier === 'good' || config.qualityTier === 'highend') && (
                  <Card className="bg-white" style={{ border: `4px solid ${getTierColor()}` }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">📏</span> Custom Dimensions
                      </CardTitle>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm text-gray-600">
                          Enter your ideal dimensions (minimum 2ft x 2ft / 0.61m x 0.61m)
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={measurementSystem === 'imperial' ? 'default' : 'outline'}
                            onClick={() => setMeasurementSystem('imperial')}
                            style={measurementSystem === 'imperial' ? { backgroundColor: getTierColor(), borderColor: getTierColor(), color: 'white' } : {}}
                          >
                            Feet/Inches
                          </Button>
                          <Button
                            size="sm"
                            variant={measurementSystem === 'metric' ? 'default' : 'outline'}
                            onClick={() => setMeasurementSystem('metric')}
                            style={measurementSystem === 'metric' ? { backgroundColor: getTierColor(), borderColor: getTierColor(), color: 'white' } : {}}
                          >
                            Meters/CM
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {measurementSystem === 'imperial' ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">Length</Label>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={customDimensions.lengthFeet}
                                    onChange={(e) => handleCustomDimensionsChange('lengthFeet', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                                    style={{ focusBorderColor: getTierColor() }}
                                    min="0"
                                    max="50"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">feet</div>
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={customDimensions.lengthInches}
                                    onChange={(e) => handleCustomDimensionsChange('lengthInches', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                                    min="0"
                                    max="11"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">inches</div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-semibold mb-2 block">Width</Label>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={customDimensions.widthFeet}
                                    onChange={(e) => handleCustomDimensionsChange('widthFeet', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                                    min="0"
                                    max="50"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">feet</div>
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={customDimensions.widthInches}
                                    onChange={(e) => handleCustomDimensionsChange('widthInches', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                                    min="0"
                                    max="11"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">inches</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">Length</Label>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={customDimensionsMetric.lengthMeters}
                                    onChange={(e) => handleCustomDimensionsChangeMetric('lengthMeters', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                                    min="0"
                                    max="15"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">meters</div>
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={customDimensionsMetric.lengthCm}
                                    onChange={(e) => handleCustomDimensionsChangeMetric('lengthCm', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                                    min="0"
                                    max="99"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">cm</div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-semibold mb-2 block">Width</Label>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={customDimensionsMetric.widthMeters}
                                    onChange={(e) => handleCustomDimensionsChangeMetric('widthMeters', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                                    min="0"
                                    max="15"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">meters</div>
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={customDimensionsMetric.widthCm}
                                    onChange={(e) => handleCustomDimensionsChangeMetric('widthCm', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                                    min="0"
                                    max="99"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">cm</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {suggestedSize && (
                          <div className="mt-4 p-4 bg-white rounded-lg border-2" style={{ borderColor: getTierColor() }}>
                            <div className="text-sm font-semibold mb-3" style={{ color: getTierColor() }}>✓ Recommended Size Match:</div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-lg">{suggestedSize.label}</div>
                                  <div className="text-sm text-gray-600">{suggestedSize.measurement} (≈{Math.round(suggestedSize.sqFt)} sq ft)</div>
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedItem(SIZES.find(s => s.value === suggestedSize.size).id);
                                    setTransitioning(true);
                                    setConfig(prev => ({ 
                                      ...prev, 
                                      size: suggestedSize.size,
                                      customDimensions: suggestedSize.customDimensions
                                    }));
                                    setTimeout(() => {
                                      setStep(3);
                                      setTransitioning(false);
                                      setSelectedItem(null);
                                      setCustomDimensions({ lengthFeet: '', lengthInches: '', widthFeet: '', widthInches: '' });
                                      setCustomDimensionsMetric({ lengthMeters: '', lengthCm: '', widthMeters: '', widthCm: '' });
                                      setSuggestedSize(null);
                                    }, 800);
                                  }}
                                  className="text-white"
                                  style={{ backgroundColor: getTierColor() }}
                                >
                                  Select This Size
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-3">
                          We'll match your dimensions to the closest standard size category. Your exact dimensions will be saved for production.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="text-center text-gray-500 text-sm my-6">
                  {config.qualityTier === 'good' || config.qualityTier === 'highend' ? 'Or choose from standard sizes:' : 'Choose your standard size:'}
                </div>

                {/* Size Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SIZES.map((size) => (
                    <motion.button
                      key={size.id}
                      initial={{ opacity: 1, scale: 1 }}
                      animate={
                        transitioning && selectedItem === size.id
                          ? { scale: 1.2, z: 100, opacity: 1 }
                          : transitioning && selectedItem && selectedItem !== size.id
                          ? { 
                              y: Math.random() > 0.5 ? -300 : 300,
                              x: (Math.random() - 0.5) * 500,
                              rotate: (Math.random() - 0.5) * 180,
                              opacity: 0,
                              scale: 0.3
                            }
                          : { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }
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
                      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all relative"
                      style={{ 
                        border: config.size === size.value ? `4px solid ${getTierColor()}` : '2px solid #e5e7eb'
                      }}
                    >
                      {config.size === size.value && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getTierColor() }}>
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="text-6xl font-black mb-4" style={{ color: getTierColor() }}>
                        {size.id === 'rd' ? 'π' : size.label.charAt(0)}
                      </div>

                      <div className="font-bold text-2xl mb-2 text-gray-900">
                        {size.label}
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        {size.measurement}
                      </div>

                      <div className="text-3xl font-black" style={{ color: getTierColor() }}>
                        ${config.qualityTier ? Math.round(size.price * QUALITY_TIERS.find(t => t.id === config.qualityTier).priceMultiplier) : size.price}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-center mt-8">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    ← Back to Quality
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Color Selection */}
            {step === 3 && (
              <Card className="bg-white" style={{ border: `4px solid ${getTierColor()}` }}>
                <CardHeader>
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-3" style={{ color: '#343634' }}>Choose Your Colors</h2>
                    <p className="text-gray-600 text-lg">Base rug + paint colors + optional add-ons</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Base Color */}
                  <div className="p-6 rounded-xl bg-white" style={{ border: `2px solid ${getTierColor()}` }}>
                    <Label className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getTierColor()}20` }}>
                        1
                      </span>
                      Rug Base Color
                    </Label>
                    <p className="text-sm text-gray-600 mb-4">The color of the actual rug material</p>
                    <div className="grid grid-cols-4 gap-3">
                      {getAvailableBaseColors().map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setConfig(prev => ({ ...prev, baseColor: color.name }))}
                          className="p-3 rounded-lg border-2 transition-all bg-white"
                          style={{
                            borderColor: config.baseColor === color.name ? getTierColor() : '#e5e7eb',
                            boxShadow: config.baseColor === color.name ? `0 0 0 3px ${getTierColor()}20` : 'none'
                          }}
                        >
                          <div className="w-full aspect-square rounded-lg mb-2 border-2 border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }} />
                          <div className="text-xs text-center font-medium">{color.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* First Paint Color */}
                  <div className="p-6 rounded-xl bg-white" style={{ border: `2px solid ${getTierColor()}` }}>
                    <Label className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getTierColor()}20` }}>
                        2
                      </span>
                      First Paint Color
                    </Label>
                    <p className="text-sm text-gray-600 mb-4">Main design color</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-3">
                        {PAINT_COLORS_GROUP_1.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                            className="p-3 rounded-lg border-2 transition-all flex flex-col items-center bg-white"
                            style={{
                              borderColor: config.paintColor === color.name ? getTierColor() : '#e5e7eb',
                              boxShadow: config.paintColor === color.name ? `0 0 0 3px ${getTierColor()}20` : 'none'
                            }}
                          >
                            <div 
                              className="w-12 h-16 mb-2 border-2 border-white shadow-md relative"
                              style={{ 
                                backgroundColor: color.hex,
                                borderRadius: '50% 50% 50% 0',
                                transform: 'rotate(-45deg)'
                              }}
                            >
                              <div 
                                className="absolute bg-white rounded-full opacity-30"
                                style={{ top: '20%', left: '20%', width: '30%', height: '30%' }}
                              />
                            </div>
                            <div className="text-xs text-center font-medium">{color.name}</div>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {PAINT_COLORS_GROUP_2.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                            className="p-3 rounded-lg border-2 transition-all flex flex-col items-center bg-white"
                            style={{
                              borderColor: config.paintColor === color.name ? getTierColor() : '#e5e7eb',
                              boxShadow: config.paintColor === color.name ? `0 0 0 3px ${getTierColor()}20` : 'none'
                            }}
                          >
                            <div 
                              className="w-12 h-16 mb-2 border-2 border-white shadow-md relative"
                              style={{ 
                                backgroundColor: color.hex,
                                borderRadius: '50% 50% 50% 0',
                                transform: 'rotate(-45deg)'
                              }}
                            >
                              <div 
                                className="absolute bg-white rounded-full opacity-30"
                                style={{ top: '20%', left: '20%', width: '30%', height: '30%' }}
                              />
                            </div>
                            <div className="text-xs text-center font-medium">{color.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Optional Add-ons */}
                  <div className="p-6 rounded-xl bg-white" style={{ border: `2px solid ${getTierColor()}` }}>
                    <Label className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getTierColor()}20` }}>
                        3
                      </span>
                      Optional Add-ons
                    </Label>
                    <div className="space-y-3">
                      {/* Shading */}
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, hasShading: !prev.hasShading }))}
                        className="w-full p-4 rounded-lg border-2 transition-all text-left bg-white"
                        style={{
                          borderColor: config.hasShading ? getTierColor() : '#d1d5db',
                          boxShadow: config.hasShading ? `0 0 0 3px ${getTierColor()}20` : 'none'
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: config.hasShading ? getTierColor() : '#f3f4f6' }}>
                              <Sparkles className="w-5 h-5" style={{ color: config.hasShading ? 'white' : '#9ca3af' }} />
                            </div>
                            <div>
                              <div className="font-semibold">Shading Effect</div>
                              <div className="text-xs text-gray-600">Adds depth and dimension</div>
                            </div>
                          </div>
                          <div className="font-bold text-lg" style={{ color: getTierColor() }}>
                            {config.hasShading ? '✓' : '+'} ${config.size ? getShadingFee(config.size) : 30}
                          </div>
                        </div>
                      </button>

                      {/* Second Color */}
                      <div className="border-2 rounded-lg transition-all bg-white"
                        style={{
                          borderColor: config.hasSecondColor ? getTierColor() : '#d1d5db',
                          boxShadow: config.hasSecondColor ? `0 0 0 3px ${getTierColor()}20` : 'none'
                        }}>
                        <button
                          onClick={() => setConfig(prev => ({ ...prev, hasSecondColor: !prev.hasSecondColor, secondPaintColor: !prev.hasSecondColor ? prev.secondPaintColor : '' }))}
                          className="w-full p-4 text-left"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: config.hasSecondColor ? getTierColor() : '#f3f4f6' }}>
                                <Palette className="w-5 h-5" style={{ color: config.hasSecondColor ? 'white' : '#9ca3af' }} />
                              </div>
                              <div>
                                <div className="font-semibold">2nd Paint Color</div>
                                <div className="text-xs text-gray-600">{config.hasSecondColor && config.secondPaintColor ? `Selected: ${config.secondPaintColor}` : 'Add another color'}</div>
                              </div>
                            </div>
                            <div className="font-bold text-lg" style={{ color: getTierColor() }}>
                              {config.hasSecondColor ? '✓' : '+'} ${config.size ? getSecondColorFee(config.size) : 30}
                            </div>
                          </div>
                        </button>

                        {config.hasSecondColor && (
                          <div className="px-4 pb-4 space-y-3 border-t pt-4" style={{ borderColor: `${getTierColor()}20` }}>
                            <div className="grid grid-cols-4 gap-2">
                              {PAINT_COLORS_GROUP_1.map((color) => (
                                <button
                                  key={color.name}
                                  onClick={() => setConfig(prev => ({ ...prev, secondPaintColor: color.name }))}
                                  className="p-2 rounded-lg border-2 transition-all flex flex-col items-center bg-white"
                                  style={{
                                    borderColor: config.secondPaintColor === color.name ? getTierColor() : '#e5e7eb',
                                    boxShadow: config.secondPaintColor === color.name ? `0 0 0 2px ${getTierColor()}20` : 'none'
                                  }}
                                >
                                  <div 
                                    className="w-10 h-14 mb-1 border-2 border-white shadow-md relative"
                                    style={{ 
                                      backgroundColor: color.hex,
                                      borderRadius: '50% 50% 50% 0',
                                      transform: 'rotate(-45deg)'
                                    }}
                                  >
                                    <div 
                                      className="absolute bg-white rounded-full opacity-30"
                                      style={{ top: '20%', left: '20%', width: '30%', height: '30%' }}
                                    />
                                  </div>
                                  <div className="text-xs text-center font-medium">{color.name}</div>
                                </button>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {PAINT_COLORS_GROUP_2.map((color) => (
                                <button
                                  key={color.name}
                                  onClick={() => setConfig(prev => ({ ...prev, secondPaintColor: color.name }))}
                                  className="p-2 rounded-lg border-2 transition-all flex flex-col items-center bg-white"
                                  style={{
                                    borderColor: config.secondPaintColor === color.name ? getTierColor() : '#e5e7eb',
                                    boxShadow: config.secondPaintColor === color.name ? `0 0 0 2px ${getTierColor()}20` : 'none'
                                  }}
                                >
                                  <div 
                                    className="w-10 h-14 mb-1 border-2 border-white shadow-md relative"
                                    style={{ 
                                      backgroundColor: color.hex,
                                      borderRadius: '50% 50% 50% 0',
                                      transform: 'rotate(-45deg)'
                                    }}
                                  >
                                    <div 
                                      className="absolute bg-white rounded-full opacity-30"
                                      style={{ top: '20%', left: '20%', width: '30%', height: '30%' }}
                                    />
                                  </div>
                                  <div className="text-xs text-center font-medium">{color.name}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                    <Button 
                      onClick={() => setStep(4)} 
                      disabled={!config.baseColor || !config.paintColor || (config.hasSecondColor && !config.secondPaintColor)}
                      className="flex-1 text-white font-bold"
                      style={{ backgroundColor: getTierColor() }}
                    >
                      Create Design →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Design & Confirm */}
            {step === 4 && (
              <Card className="bg-white" style={{ border: `4px solid ${getTierColor()}` }}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                      ← Back
                    </Button>
                    <CardTitle className="flex-1">Create Your Design</CardTitle>
                  </div>
                  
                  {/* Production Timeline Infographic */}
                  <div className="mt-6 bg-white rounded-xl p-6" style={{ border: `2px solid ${getTierColor()}` }}>
                    <div className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" style={{ color: getTierColor() }} />
                      Production Timeline
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl" style={{ backgroundColor: `${getTierColor()}20`, color: getTierColor() }}>
                          ✏️
                        </div>
                        <div className="font-bold text-sm mb-1">Design</div>
                        <div className="text-xs text-gray-600">1-2 hours</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl" style={{ backgroundColor: `${getTierColor()}20`, color: getTierColor() }}>
                          🎨
                        </div>
                        <div className="font-bold text-sm mb-1">Production</div>
                        <div className="text-xs text-gray-600">{config.qualityTier === 'budget' ? '10-14 days' : config.qualityTier === 'good' ? '10-20 days' : '2-4 weeks'}</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl" style={{ backgroundColor: `${getTierColor()}20`, color: getTierColor() }}>
                          📦
                        </div>
                        <div className="font-bold text-sm mb-1">Delivery</div>
                        <div className="text-xs text-gray-600">3-5 days</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Help Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowHelpModal(true)}
                        className="text-sm hover:opacity-80 underline transition-opacity"
                        style={{ color: getTierColor() }}
                      >
                        💡 Need design help?
                      </button>
                    </div>

                    {/* Mode Selection */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {(config.qualityTier === 'good' || config.qualityTier === 'highend') && (
                        <button
                          onClick={() => setDesignMode('ai')}
                          className="p-6 rounded-xl transition-all flex flex-col items-center justify-center min-h-[140px] relative bg-white"
                          style={{
                            border: designMode === 'ai' ? `3px solid ${getTierColor()}` : '2px solid #e5e7eb',
                            boxShadow: designMode === 'ai' ? `0 0 0 3px ${getTierColor()}20` : 'none'
                          }}
                        >
                          <Lightbulb className="w-10 h-10 mb-3" style={{ color: getTierColor() }} />
                          <div className="font-semibold text-base mb-1">AI Studio</div>
                          <div className="text-xs text-gray-600 text-center">{config.qualityTier === 'highend' ? 'Full AI design' : 'AI suggestions'}</div>
                        </button>
                      )}
                      <button
                        onClick={() => setDesignMode('library')}
                        className="p-6 rounded-xl transition-all flex flex-col items-center justify-center min-h-[140px] bg-white"
                        style={{
                          border: designMode === 'library' ? `3px solid ${getTierColor()}` : '2px solid #e5e7eb',
                          boxShadow: designMode === 'library' ? `0 0 0 3px ${getTierColor()}20` : 'none'
                        }}
                      >
                        <FileText className="w-10 h-10 mb-3" style={{ color: getTierColor() }} />
                        <div className="font-semibold text-base mb-1">Library</div>
                        <div className="text-xs text-gray-600 text-center">Browse designs</div>
                      </button>
                      <button
                        onClick={() => setDesignMode('draw')}
                        className="p-6 rounded-xl transition-all flex flex-col items-center justify-center min-h-[140px] bg-white"
                        style={{
                          border: designMode === 'draw' ? `3px solid ${getTierColor()}` : '2px solid #e5e7eb',
                          boxShadow: designMode === 'draw' ? `0 0 0 3px ${getTierColor()}20` : 'none'
                        }}
                      >
                        <Pencil className="w-10 h-10 mb-3" style={{ color: getTierColor() }} />
                        <div className="font-semibold text-base mb-1">Draw</div>
                        <div className="text-xs text-gray-600 text-center">Free-hand</div>
                      </button>
                      <button
                        onClick={() => setDesignMode('upload')}
                        className="p-6 rounded-xl transition-all flex flex-col items-center justify-center min-h-[140px] bg-white"
                        style={{
                          border: designMode === 'upload' ? `3px solid ${getTierColor()}` : '2px solid #e5e7eb',
                          boxShadow: designMode === 'upload' ? `0 0 0 3px ${getTierColor()}20` : 'none'
                        }}
                      >
                        <Upload className="w-10 h-10 mb-3" style={{ color: getTierColor() }} />
                        <div className="font-semibold text-base mb-1">Upload</div>
                        <div className="text-xs text-gray-600 text-center">Convert image</div>
                      </button>
                    </div>

                    {/* Design Tools */}
                    {designMode === 'ai' && (
                      <AIAssistant
                        currentImageUrl={config.imageUrl}
                        rugSize={config.size}
                        qualityTier={config.qualityTier}
                        baseColor={config.baseColor}
                        paintColor={config.paintColor}
                        secondPaintColor={config.secondPaintColor}
                        onApplyColors={handleApplyAIColors}
                        onCopySuggestion={handleCopyAISuggestion}
                        onGenerateDesign={(designUrl) => {
                          setConfig(prev => ({ ...prev, imageUrl: designUrl, previewUrl: designUrl }));
                        }}
                      />
                    )}

                    {designMode === 'library' && (
                      <DesignLibrary
                        onSelectDesign={(url) => {
                          setConfig(prev => ({ ...prev, imageUrl: url, previewUrl: url }));
                        }}
                      />
                    )}

                    {designMode === 'upload' && (
                      <StencilCreator
                        paintColor={getAvailablePaintColors().find(c => c.name === config.paintColor)?.hex || '#000000'}
                        baseColor={BASE_COLORS.find(c => c.name === config.baseColor)?.hex || '#86cb92'}
                        rugSize={config.size}
                        onSaveStencil={(stencilUrl) => {
                          setConfig(prev => ({ ...prev, imageUrl: stencilUrl, previewUrl: stencilUrl }));
                        }}
                        onConfigChange={({ colors }) => {
                          setConfig(prev => ({ ...prev, numColors: colors }));
                        }}
                      />
                    )}

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

                    {/* Preview & Checkout */}
                    {config.imageUrl && (
                      <div className="bg-white rounded-xl p-6 mt-6" style={{ border: `4px solid ${getTierColor()}` }}>
                        <Label className="block mb-4 font-bold text-2xl text-center" style={{ color: getTierColor() }}>
                          ✨ Your Custom Rug
                        </Label>
                        
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-lg" style={{ border: `2px solid ${getTierColor()}20` }}>
                          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${getTierColor()}10` }}>
                            <div className="text-xs text-gray-600 mb-1">Quality</div>
                            <div className="font-bold" style={{ color: getTierColor() }}>{QUALITY_TIERS.find(t => t.id === config.qualityTier)?.label}</div>
                          </div>
                          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${getTierColor()}10` }}>
                            <div className="text-xs text-gray-600 mb-1">Size</div>
                            <div className="font-bold" style={{ color: getTierColor() }}>{SIZES.find(s => s.value === config.size)?.label}</div>
                          </div>
                          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${getTierColor()}10` }}>
                            <div className="text-xs text-gray-600 mb-1">Base</div>
                            <div className="font-bold flex items-center justify-center gap-2">
                              <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getColorHex(config.baseColor) }}></span>
                              <span className="text-xs">{config.baseColor}</span>
                            </div>
                          </div>
                          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${getTierColor()}10` }}>
                            <div className="text-xs text-gray-600 mb-1">Paint</div>
                            <div className="font-bold flex items-center justify-center gap-1">
                              <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getAvailablePaintColors().find(c => c.name === config.paintColor)?.hex }}></span>
                              {config.secondPaintColor && (
                                <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getAvailablePaintColors().find(c => c.name === config.secondPaintColor)?.hex }}></span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleAddToCart}
                          className="w-full text-white font-black text-xl py-8"
                          style={{ backgroundColor: getTierColor(), border: 'none' }}
                        >
                          Add to Cart - ${currentPrice()}
                        </Button>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl p-6" style={{ border: `2px solid ${getTierColor()}` }}>
                      <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: `2px solid ${getTierColor()}20` }}>
                        <span className="font-bold text-lg">Total Price</span>
                        <span className="text-4xl font-black" style={{ color: getTierColor() }}>${currentPrice()}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base ({QUALITY_TIERS.find(t => t.id === config.qualityTier)?.label}):</span>
                          <span className="font-semibold">${config.qualityTier && config.size ? Math.round(SIZES.find(s => s.value === config.size)?.price * QUALITY_TIERS.find(t => t.id === config.qualityTier)?.priceMultiplier) : 0}</span>
                        </div>
                        {config.hasShading && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">+ Shading:</span>
                            <span className="font-semibold">${getShadingFee(config.size)}</span>
                          </div>
                        )}
                        {config.hasSecondColor && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">+ 2nd Color:</span>
                            <span className="font-semibold">${getSecondColorFee(config.size)}</span>
                          </div>
                        )}
                        {isRush && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">+ Rush:</span>
                            <span className="font-semibold">$100</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {step === 4 && (
            <div className="hidden lg:block sticky top-6 self-start">
              <BuilderSidebar
                step={step}
                config={config}
                currentPrice={currentPrice()}
                isRush={isRush}
                onToggleRush={() => setIsRush(!isRush)}
                qualityTier={config.qualityTier}
                onConfigChange={(changes) => setConfig(prev => ({ ...prev, ...changes }))}
              />
            </div>
          )}
        </div>

        <DesignHelpModal 
          isOpen={showHelpModal} 
          onClose={() => setShowHelpModal(false)} 
        />
      </div>
    </div>
  );
}