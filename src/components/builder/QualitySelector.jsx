import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

const TIER_LOGOS = {
  crugly:  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/f2be319ca_Crugly.png',
  rugly:   'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/2de838992_Rugly.png',
  ruglux:  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/ef40fa09f_RugLux.png',
  square:  'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/d1ef7ba65_Square.png',
  squares: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/d1ef7ba65_Square.png',
};

const TIER_LOGO_BG = {
  crugly:  '#24f0a0',
  rugly:   '#4075ff',
  ruglux:  '#3a3a3a',
  square:  '#f04624',
  squares: '#f04624',
};

function getTierLogo(tierId) {
  const key = tierId?.toLowerCase();
  return TIER_LOGOS[key] || null;
}

function getTierBg(tierId) {
  const key = tierId?.toLowerCase();
  return TIER_LOGO_BG[key] || '#e5e7eb';
}

export default function QualitySelector({ tiers, selected, onSelect }) {
  return (
    <Card className="p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        Quality Tier
      </h3>

      <div className="space-y-3">
        {tiers.filter(t => t.active).map((tier) => {
          const logo = getTierLogo(tier.id);
          const logoBg = getTierBg(tier.id);
          const isSelected = selected === tier.id;

          return (
            <motion.button
              key={tier.id}
              onClick={() => onSelect(tier.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full rounded-lg border-2 transition-all text-left relative overflow-hidden ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 z-10"
                >
                  <div className="bg-blue-600 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              )}

              {/* Mobile/Tablet: logo banner */}
              {logo && (
                <div
                  className="md:hidden w-full h-20 flex items-center justify-center"
                  style={{ backgroundColor: logoBg }}
                >
                  <img
                    src={logo}
                    alt={tier.name}
                    className="h-14 object-contain"
                  />
                </div>
              )}

              {/* Desktop: original text layout */}
              <div className="hidden md:block p-4">
                <div className="font-bold text-gray-900 mb-1">{tier.name}</div>
                <div className="text-sm text-gray-600">{tier.description}</div>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 pt-2 border-t border-blue-200"
                  >
                    <div className="text-xs text-blue-700 font-medium">
                      Multiplier: {tier.multiplier}x
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Mobile/Tablet: minimal label below logo */}
              {logo && (
                <div className="md:hidden px-4 py-2">
                  <div className="text-xs text-gray-500">{tier.description}</div>
                </div>
              )}

              {/* Mobile fallback if no logo */}
              {!logo && (
                <div className="p-4">
                  <div className="font-bold text-gray-900 mb-1">{tier.name}</div>
                  <div className="text-sm text-gray-600">{tier.description}</div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}