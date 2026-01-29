import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Ruler, Check } from 'lucide-react';

export default function SizeSelector({ sizes, selected, qualityTier, onSelect }) {
  return (
    <Card className="p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Ruler className="w-5 h-5 text-purple-600" />
        Select Size
      </h3>
      
      <div className="space-y-3">
        {sizes.filter(s => s.active).map((size) => (
          <motion.button
            key={size.id}
            onClick={() => onSelect(size.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left relative ${
              selected === size.id
                ? 'border-purple-600 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            {selected === size.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <div className="bg-purple-600 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}
            
            <div className="font-bold text-gray-900 mb-1">{size.name}</div>
            <div className="text-sm text-gray-600">{size.measurement}</div>
            
            <div className="text-lg font-bold text-purple-600 mt-2">
              ${size.basePrice}
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}