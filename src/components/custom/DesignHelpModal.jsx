import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DesignHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="text-4xl mb-4">💡</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Your Design?</h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            If you can't convey your vision using our builder, no worries! You can use words to describe your ideas before checkout and we'll listen.
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Your uploaded image and design work will be saved with your order.
          </p>

          <Button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold"
          >
            Got it, let me continue
          </Button>
        </div>
      </div>
    </div>
  );
}