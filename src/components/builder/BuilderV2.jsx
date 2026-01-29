import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Zap, Check } from 'lucide-react';
import LiveRugPreview from './LiveRugPreview';
import QualitySelector from './QualitySelector';
import SizeSelector from './SizeSelector';
import ColorWheel from './ColorWheel';
import DesignTools from './DesignTools';
import PriceCalculator from './PriceCalculator';

export default function BuilderV2() {
  const [config, setConfig] = useState({
    qualityTier: null,
    size: null,
    baseColor: null,
    paintColor: null,
    secondPaintColor: null,
    designUrl: null,
    hasShading: false,
    hasSecondColor: false
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch pricing from PricingConfig entity (synced from Notion)
  const { data: pricingData, isLoading } = useQuery({
    queryKey: ['pricing-config'],
    queryFn: async () => {
      const configs = await base44.entities.PricingConfig.filter({ 
        config_name: 'main_pricing' 
      });
      return configs[0]?.pricing_data || null;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Calculate completion percentage
  useEffect(() => {
    let percentage = 0;
    if (config.qualityTier) percentage += 25;
    if (config.size) percentage += 25;
    if (config.baseColor && config.paintColor) percentage += 25;
    if (config.designUrl) percentage += 25;
    
    setCompletionPercentage(percentage);

    // Fire confetti at 100%
    if (percentage === 100 && !showConfetti) {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [config]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-xl text-gray-600">Loading builder...</p>
        </div>
      </div>
    );
  }

  if (!pricingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Pricing data not available</p>
          <p className="text-gray-600 mt-2">Please contact support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">
                  {completionPercentage}% Complete
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            <QualitySelector
              tiers={pricingData.qualityTiers}
              selected={config.qualityTier}
              onSelect={(tier) => handleConfigChange('qualityTier', tier)}
            />
            
            <ColorWheel
              baseColors={pricingData.baseColors}
              paintColors={pricingData.paintColors}
              selectedBase={config.baseColor}
              selectedPaint={config.paintColor}
              selectedSecond={config.secondPaintColor}
              onSelectBase={(color) => handleConfigChange('baseColor', color)}
              onSelectPaint={(color) => handleConfigChange('paintColor', color)}
              onSelectSecond={(color) => handleConfigChange('secondPaintColor', color)}
            />
          </motion.div>

          {/* Center - Live Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-6"
          >
            <LiveRugPreview
              config={config}
              pricingData={pricingData}
            />
            
            <DesignTools
              onDesignSelect={(url) => handleConfigChange('designUrl', url)}
            />
          </motion.div>

          {/* Right Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            <SizeSelector
              sizes={pricingData.sizes}
              selected={config.size}
              qualityTier={config.qualityTier}
              onSelect={(size) => handleConfigChange('size', size)}
            />
            
            <PriceCalculator
              config={config}
              pricingData={pricingData}
              completionPercentage={completionPercentage}
            />
          </motion.div>
        </div>

        {/* Confetti Celebration */}
        <AnimatePresence>
          {showConfetti && completionPercentage === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Perfect!</h2>
                <p className="text-gray-600">Your custom rug is ready to order</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}