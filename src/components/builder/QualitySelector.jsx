import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

export default function QualitySelector({ tiers, selected, onSelect }) {
  return (
    <Card className="p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        Quality Tier
      </h3>
      
      <div className="space-y-3">
        {tiers.filter(t => t.active).map((tier) => (
          <motion.button
            key={tier.id}
            onClick={() => onSelect(tier.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left relative ${
              selected === tier.id
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            {selected === tier.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <div className="bg-blue-600 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}
            
            <div className="font-bold text-gray-900 mb-1">{tier.name}</div>
            <div className="text-sm text-gray-600">{tier.description}</div>
            
            {selected === tier.id && (
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
          </motion.button>
        ))}
      </div>
    </Card>
  );
}