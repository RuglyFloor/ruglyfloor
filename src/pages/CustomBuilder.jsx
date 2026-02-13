import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CheckCircle, Pencil, FileText, Lightbulb } from 'lucide-react';
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
    label: 'Rugly', 
    description: 'Expect the same life-span as any ordinary rug, available in a variety of sizes.',
    priceMultiplier: 1.0,
    materialDetail: 'Standard rug construction',
    lifespan: 'Standard rug lifespan',
    washable: true,
    customization: 'Standard',
    priceRange: '$$$'
  },
  { 
    id: 'highend', 
    label: 'Rugly Lux', 
    description: 'Rugly Lux is the cat\'s meow—you tell us what you\'re thinking and we make it happen with no limits',
    priceMultiplier: 1.25,
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

// Fee calculation functions moved inside component where getPricingData is available

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
  
  // Debug: Log component mount
  useEffect(() => {
    console.log('CustomBuilder mounted successfully');
  }, []);
  
  const [step, setStep] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [designMode, setDesignMode] = useState('draw'); // 'library', 'upload', or 'draw'
  const [selectedItem, setSelectedItem] = useState(null);
  const [floatingSelections, setFloatingSelections] = useState([]);

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
  const [showHelpModal, setShowHelpModal] = useState(false);
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

  return (
    <div className="min-h-screen py-12 px-6 bg-white">
      <SEOHead
        title={seoData?.seo_title || "Custom Rug Builder | Perfect Mother's Day & Father's Day Gifts"}
        description={typeof seoData?.seo_description === 'string' ? seoData.seo_description : "Design custom hand-painted rugs online - unique mothers day gifts, fathers day gifts, and personalized gifts for anyone. Create personalized floor art rugs with our builder. Customizable stencil rug designs, washable custom painted rugs for any space. Perfect for interior designers and homeowners."}
        keywords={Array.isArray(seoData?.seo_keywords) ? seoData.seo_keywords : ['mothers day gifts unique', 'fathers day gifts personalized', 'gifts for hard to buy for people', 'custom hand-painted rugs for interior designers', 'personalized floor art rugs', 'customizable stencil rug designs', 'custom painted washable rugs', 'hand-painted low-pile rugs for high traffic', 'personalized rugs for nursery hand-painted', 'custom painted rugs for Airbnb decor']}
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
              <button 
                key={s.num} 
                onClick={() => setStep(s.num)}
                className="flex flex-col items-center flex-1 cursor-pointer hover:opacity-80 transition-opacity"
              >
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
              </button>
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
            {/* Step 1: Quality Tier Selection - Modern Cards */}
            {step === 1 && (
              <div className={`space-y-6 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 text-gray-900">
                    Choose Your Quality Level
                  </h2>
                  <p className="text-gray-600 text-xl">Three tiers. One vision. Your perfect rug.</p>
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
                              ? 'border-2' 
                              : 'bg-gray-50'
                          }`}
                          style={{
                            backgroundColor: tier.id === 'budget' || tier.id === 'good' ? '#F7F1DA' : undefined,
                            borderColor: tier.id === 'budget' ? '#24f0a0' : tier.id === 'good' ? '#4075ff' : undefined
                          }}>
                            {(tier.id === 'budget' || tier.id === 'good') && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg" style={{backgroundColor: '#4075ff'}}>
                                Create Your Own & See It Now!
                              </div>
                            )}
                            <button
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
                              disabled={transitioning}
                              className="font-bold text-xl mt-2 transition-colors cursor-pointer"
                              style={{color: '#343634'}}
                              onMouseEnter={(e) => e.target.style.color = '#4075ff'}
                              onMouseLeave={(e) => e.target.style.color = '#343634'}
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
                              <span className="text-red-600 font-semibold">✕ Dry Clean Only</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Maximum Paint Colors</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.id === 'budget' && '2'}
                            {tier.id === 'good' && '4'}
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
                            {tier.id === 'budget' && 'None, rug folded and shipped one length'}
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
                            {tier.id === 'budget' ? 'Limited' : tier.customization}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Texture/ 3D / Bevel</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center text-sm text-gray-600 ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.id === 'budget' && 'None, rug folded and shipped one length'}
                            {tier.id === 'good' && 'Standard'}
                            {tier.id === 'highend' && 'Unlimited'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-4 font-medium text-gray-700">Visual Details</td>
                        {QUALITY_TIERS.map((tier) => (
                          <td key={tier.id} className={`p-4 text-center ${
                            tier.id === 'budget' || tier.id === 'good' ? 'bg-blue-50' : ''
                          }`}>
                            {tier.id === 'budget' && (
                              <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/fe7898922_image.png" 
                                alt="Crugly material details"
                                className="w-full h-auto rounded-lg"
                              />
                            )}
                            {tier.id === 'good' && (
                              <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/701415d98_image.png" 
                                alt="Rugly material details"
                                className="w-full h-auto rounded-lg"
                              />
                            )}
                            {tier.id === 'highend' && (
                              <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/4d348899c_image.png" 
                                alt="Rugly Lux material details"
                                className="w-full h-auto rounded-lg"
                              />
                            )}
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
                                  setSelectedItem(tier.id);
                                  setTransitioning(true);
                                  setConfig(prev => ({ ...prev, qualityTier: tier.id }));
                                  setTimeout(() => {
                                    setStep(2);
                                    setTransitioning(false);
                                    setSelectedItem(null);
                                  }, 700);
                                }}
                                disabled={transitioning}
                                className="w-full text-white"
                                style={{
                                  border: config.qualityTier === tier.id ? '4px solid #343634' : '2px solid',
                                  borderColor: config.qualityTier === tier.id ? '#343634' : tier.id === 'budget' ? '#24f0a0' : tier.id === 'good' ? '#4075ff' : '#f04624',
                                  backgroundColor: config.qualityTier === tier.id ? '#343634' : tier.id === 'budget' ? '#24f0a0' : tier.id === 'good' ? '#4075ff' : '#f04624'
                                }}
                              >
                                {config.qualityTier === tier.id ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Selected
                                  </>
                                ) : (
                                  tier.id === 'budget' ? 'Budget Friendly Option' :
                                  tier.id === 'good' ? 'The OG Crugly' :
                                  'Premium Lux with AI'
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

            {/* Custom Size Input for Rugly and Rugly Lux */}
            {(config.qualityTier === 'good' || config.qualityTier === 'highend') && (
              <Card className="bg-white" style={{border: `4px solid ${config.qualityTier === 'good' ? '#4075ff' : '#f04624'}`}}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📏 Have a specific size in mind?
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
                      >
                        Feet/Inches
                      </Button>
                      <Button
                        size="sm"
                        variant={measurementSystem === 'metric' ? 'default' : 'outline'}
                        onClick={() => setMeasurementSystem('metric')}
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
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
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
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
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
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
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
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
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
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
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
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
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
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
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
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
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
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-500">
                        <div className="text-sm font-semibold text-green-700 mb-3">✓ Recommended Size Match:</div>
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
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Select This Size
                            </Button>
                          </div>
                          <div className="text-xs bg-green-50 p-3 rounded">
                            <div className="font-semibold text-green-800 mb-1">Your custom dimensions:</div>
                            <div className="text-green-700">
                              {suggestedSize.customDimensions.system === 'imperial' ? (
                                <>
                                  {suggestedSize.customDimensions.lengthFeet}ft {suggestedSize.customDimensions.lengthInches}in × {suggestedSize.customDimensions.widthFeet}ft {suggestedSize.customDimensions.widthInches}in 
                                  <span className="ml-2">({suggestedSize.customDimensions.squareFootage} sq ft)</span>
                                </>
                              ) : (
                                <>
                                  {suggestedSize.customDimensions.lengthMeters}m {suggestedSize.customDimensions.lengthCm}cm × {suggestedSize.customDimensions.widthMeters}m {suggestedSize.customDimensions.widthCm}cm 
                                  <span className="ml-2">({suggestedSize.customDimensions.squareFootage} sq ft)</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      We'll match your dimensions to the closest standard size category (±2 sq ft tolerance). Your exact dimensions will be saved for production.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center text-gray-500 text-sm my-4">
              {config.qualityTier === 'good' || config.qualityTier === 'highend' ? 'Or choose from standard sizes below:' : 'Choose from our standard sizes:'}
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



          {/* Step 3: All Color Selections */}
          {step === 3 && (
            <Card className="bg-white" style={{border: `4px solid ${config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'}`}}>
              <CardHeader>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900">Choose Your Colors</h2>
                  <p className="text-gray-600 text-lg">Select base rug color, paint colors, and optional add-ons</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Base Color */}
                <div>
                  <Label className="text-xl font-bold mb-2 block">1. Rug Base Color</Label>
                  <p className="text-sm text-gray-600 mb-4">This is the color of the actual rug. You'll choose your paint color next.</p>
                  {getAvailableBaseColors().length === 0 ? (
                    <div className="text-sm text-gray-500 p-4 border border-gray-200 rounded-lg">
                      No base rug colors available. Please check catalog inventory.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {getAvailableBaseColors().map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setConfig(prev => ({ ...prev, baseColor: color.name }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            config.baseColor === color.name ? 'bg-white ring-2' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={config.baseColor === color.name ? {
                            borderColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624',
                            ringColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'
                          } : {}}
                        >
                          <div className="w-full aspect-square rounded-lg mb-2 border-2 border-white shadow-md" style={{ backgroundColor: color.hex }} />
                          <div className="text-xs text-center font-medium">{color.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* First Paint Color */}
                <div>
                  <Label className="text-xl font-bold mb-2 block">2. First Paint Color</Label>
                  <p className="text-sm text-gray-600 mb-4">The colors below are available for your FIRST color. Shades and secondary colors are below!</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Group 1</p>
                      <div className="grid grid-cols-4 gap-3">
                        {PAINT_COLORS_GROUP_1.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                              config.paintColor === color.name ? 'bg-white ring-2' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={config.paintColor === color.name ? {
                              borderColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624',
                              ringColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'
                            } : {}}
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
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Group 2</p>
                      <div className="grid grid-cols-4 gap-3">
                        {PAINT_COLORS_GROUP_2.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setConfig(prev => ({ ...prev, paintColor: color.name }))}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                              config.paintColor === color.name ? 'bg-white ring-2' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={config.paintColor === color.name ? {
                              borderColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624',
                              ringColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'
                            } : {}}
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
                </div>

                {/* Optional Add-ons */}
                <div>
                  <Label className="text-xl font-bold mb-4 block">3. Optional Add-ons</Label>
                  <div className="space-y-3">
                    {/* Shading */}
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, hasShading: !prev.hasShading }))}
                      className="w-full p-4 rounded-lg border-2 transition-all text-left bg-white"
                      style={{
                        borderColor: config.hasShading ? (config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624') : '#d1d5db'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">Shading</div>
                          <div className="text-xs text-gray-600">Adds depth and dimension</div>
                        </div>
                        <div className={`font-bold ${config.hasShading ? 'text-purple-600' : 'text-gray-900'}`}>
                          {config.hasShading ? '✓' : '+'} ${config.size ? getShadingFee(config.size) : 30}
                        </div>
                      </div>
                    </button>

                    {/* Second Color */}
                    <div className="border-2 rounded-lg transition-all bg-white"
                      style={{
                        borderColor: config.hasSecondColor ? (config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624') : '#d1d5db'
                      }}>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, hasSecondColor: !prev.hasSecondColor, secondPaintColor: !prev.hasSecondColor ? prev.secondPaintColor : '' }))}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">2nd Paint Color</div>
                            <div className="text-xs text-gray-600">{config.hasSecondColor && config.secondPaintColor ? `Selected: ${config.secondPaintColor}` : 'Add another color to your design'}</div>
                          </div>
                          <div className={`font-bold ${config.hasSecondColor ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {config.hasSecondColor ? '✓' : '+'} ${config.size ? getSecondColorFee(config.size) : 30}
                          </div>
                        </div>
                      </button>

                      {config.hasSecondColor && (
                        <div className="px-4 pb-4 space-y-3">
                          <div className="grid grid-cols-4 gap-2">
                            {PAINT_COLORS_GROUP_1.map((color) => (
                              <button
                                key={color.name}
                                onClick={() => setConfig(prev => ({ ...prev, secondPaintColor: color.name }))}
                                className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                                  config.secondPaintColor === color.name ? 'bg-white ring-2' : 'border-gray-300'
                                }`}
                                style={config.secondPaintColor === color.name ? {
                                  borderColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624',
                                  ringColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'
                                } : {}}
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
                                className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                                  config.secondPaintColor === color.name ? 'bg-white ring-2' : 'border-gray-300'
                                }`}
                                style={config.secondPaintColor === color.name ? {
                                  borderColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624',
                                  ringColor: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'
                                } : {}}
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
                    className="flex-1 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    Now for the fun part →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Create Design & Confirm */}
          {step === 4 && (
            <Card className="bg-white" style={{border: `4px solid ${config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'}`}}>
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
              
              {/* Production Timeline */}
              <div className="mt-4 bg-white rounded-lg p-4" style={{border: `2px solid ${config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'}`}}>
                <div className="font-semibold text-sm text-gray-900 mb-2">📅 Production Timeline</div>
                <div className="grid grid-cols-3 gap-3 text-xs text-gray-700">
                  <div>
                    <div className="font-bold text-blue-600">Design</div>
                    <div>1-2 hours</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">Production</div>
                    <div>{config.qualityTier === 'budget' ? '10-14 days' : config.qualityTier === 'good' ? '10-20 days' : '2-4 weeks'}</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">Delivery</div>
                    <div>3-5 days</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Help Button */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
                  >
                    💡 Need design help?
                  </button>
                </div>

                {/* Mode Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {(config.qualityTier === 'good' || config.qualityTier === 'highend') && (
                    <button
                      onClick={() => setDesignMode('ai')}
                      className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center min-h-[160px] relative ${
                        designMode === 'ai' ? 'bg-white' : 'bg-white'
                      }`}
                      style={{
                        borderColor: designMode === 'ai' ? (config.qualityTier === 'good' ? '#4075ff' : '#f04624') : '#d1d5db'
                      }}
                    >
                      {config.qualityTier === 'highend' && (
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">LUX PREMIUM</div>
                      )}
                      <Lightbulb className="w-8 h-8 mb-3 text-purple-600" />
                      <div className="font-semibold text-lg mb-1">AI Design Studio</div>
                      <div className="text-sm text-gray-600 text-center">{config.qualityTier === 'highend' ? 'Generate complete designs with AI' : 'Get AI design suggestions'}</div>
                    </button>
                  )}
                  <button
                    onClick={() => setDesignMode('library')}
                    className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                      designMode === 'library' ? 'bg-white' : 'bg-white hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: designMode === 'library' ? (config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624') : '#e5e7eb'
                    }}
                  >
                    <FileText className="w-8 h-8 mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Design Library</div>
                    <div className="text-sm text-gray-600 text-center">Choose from our collection</div>
                  </button>
                  <button
                    onClick={() => setDesignMode('draw')}
                    className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                      designMode === 'draw' ? 'bg-white' : 'bg-white hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: designMode === 'draw' ? (config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624') : '#e5e7eb'
                    }}
                  >
                    <Pencil className="w-8 h-8 mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Draw Your Own</div>
                    <div className="text-sm text-gray-600 text-center">Create with our drawing tools</div>
                  </button>
                  <button
                    onClick={() => setDesignMode('upload')}
                    className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                      designMode === 'upload' ? 'bg-white' : 'bg-white hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: designMode === 'upload' ? (config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624') : '#e5e7eb'
                    }}
                  >
                    <Upload className="w-8 h-8 mb-3 text-blue-600" />
                    <div className="font-semibold text-lg mb-1">Upload & Convert</div>
                    <div className="text-sm text-gray-600 text-center">Upload an image and convert to stencil</div>
                  </button>
                </div>

                {/* AI Assistant Mode */}
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
                  <div className="bg-white rounded-lg p-6 mt-6" style={{border: `4px solid ${config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'}`}}>
                    <Label className="block mb-4 font-bold text-xl text-center" style={{color: '#343634'}}>✨ Your Custom Rug Preview</Label>
                    
                    {/* Final Summary */}
                    <div className="bg-white rounded-lg p-4 mb-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality:</span>
                        <span className="font-semibold">{QUALITY_TIERS.find(t => t.id === config.qualityTier)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-semibold">{SIZES.find(s => s.value === config.size)?.label} ({SIZES.find(s => s.value === config.size)?.measurement})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Rug Color:</span>
                        <span className="font-semibold flex items-center gap-2">
                          <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getColorHex(config.baseColor) }}></span>
                          {config.baseColor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paint Color{config.secondPaintColor ? 's' : ''}:</span>
                        <span className="font-semibold flex items-center gap-2">
                          <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getAvailablePaintColors().find(c => c.name === config.paintColor)?.hex }}></span>
                          {config.paintColor}
                          {config.secondPaintColor && (
                            <>
                              <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getAvailablePaintColors().find(c => c.name === config.secondPaintColor)?.hex }}></span>
                              {config.secondPaintColor}
                            </>
                          )}
                        </span>
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

                <div className="bg-white rounded-lg p-4" style={{border: `2px solid ${config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'}`}}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Total Price:</span>
                    <span className="text-3xl font-bold" style={{color: config.qualityTier === 'budget' ? '#24f0a0' : config.qualityTier === 'good' ? '#4075ff' : '#f04624'}}>${currentPrice()}</span>
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

        <DesignHelpModal 
          isOpen={showHelpModal} 
          onClose={() => setShowHelpModal(false)} 
        />

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
              qualityTier={config.qualityTier}
              key={`${config.baseColor}-${config.paintColor}-${config.imageUrl}`}
            />
          </div>
        )}
        </div>
        </div>
        </div>
        );
        }