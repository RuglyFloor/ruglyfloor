import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

export default function ColorWheel({ 
  baseColors, 
  paintColors, 
  selectedBase, 
  selectedPaint, 
  selectedSecond,
  onSelectBase, 
  onSelectPaint,
  onSelectSecond 
}) {
  const paintGroup1 = paintColors.filter(c => c.group === 'Group 1' && c.active);
  const paintGroup2 = paintColors.filter(c => c.group === 'Group 2' && c.active);

  const handleColorClick = (color, type) => {
    // Paint splash animation
    const splash = document.createElement('div');
    splash.className = 'paint-splash';
    splash.style.background = color.hex;
    document.body.appendChild(splash);
    setTimeout(() => splash.remove(), 600);

    if (type === 'base') {
      onSelectBase(color.name);
    } else if (type === 'paint') {
      onSelectPaint(color.name);
    } else if (type === 'second') {
      onSelectSecond(color.name);
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-pink-600" />
        Colors
      </h3>

      {/* Base Colors */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">Base Rug Color</p>
        <div className="grid grid-cols-4 gap-2">
          {baseColors.filter(c => c.active).map((color) => (
            <motion.button
              key={color.name}
              onClick={() => handleColorClick(color, 'base')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`relative aspect-square rounded-lg border-2 transition-all ${
                selectedBase === color.name 
                  ? 'border-pink-600 ring-2 ring-pink-300' 
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {selectedBase === color.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-pink-600 rounded-full" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Paint Color Group 1 */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">Paint Color</p>
        <div className="grid grid-cols-4 gap-2">
          {paintGroup1.map((color) => (
            <motion.button
              key={color.name}
              onClick={() => handleColorClick(color, 'paint')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`relative aspect-square rounded-lg border-2 transition-all ${
                selectedPaint === color.name 
                  ? 'border-blue-600 ring-2 ring-blue-300' 
                  : 'border-gray-200'
              }`}
            >
              <div 
                className="w-full h-full rounded-lg"
                style={{ 
                  backgroundColor: color.hex,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                }}
              />
              {selectedPaint === color.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Paint Color Group 2 */}
      {paintGroup2.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Additional Colors</p>
          <div className="grid grid-cols-4 gap-2">
            {paintGroup2.map((color) => (
              <motion.button
                key={color.name}
                onClick={() => handleColorClick(color, 'paint')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`relative aspect-square rounded-lg border-2 transition-all ${
                  selectedPaint === color.name 
                    ? 'border-blue-600 ring-2 ring-blue-300' 
                    : 'border-gray-200'
                }`}
              >
                <div 
                  className="w-full h-full rounded-lg"
                  style={{ 
                    backgroundColor: color.hex,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                  }}
                />
                {selectedPaint === color.name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    </div>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes splash {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(3) rotate(180deg); opacity: 0; }
        }
        .paint-splash {
          position: fixed;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          animation: splash 0.6s ease-out forwards;
          transform-origin: center;
        }
      `}</style>
    </Card>
  );
}